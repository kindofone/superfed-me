Sources = new Meteor.Collection("sources");
Updates = new Meteor.Collection("updates");
SourceFeed = new Meteor.Collection("sourceFeed");
Favorites = new Meteor.Collection("favorites");
Following = new Meteor.Collection("following");
ReadingList = new Meteor.Collection("readinglist");
ReadLater = new Meteor.Collection("readlater");
Popular = new Meteor.Collection("popular");
Trends = new Meteor.Collection("trends");
SearchResults = new Meteor.Collection(null);
SourcesFollowedByUser = new Meteor.Collection(null);
Imports = new Meteor.Collection(null);

if (Meteor.isClient) {
  Followww.updateSeenTimestamp();
  Followww.view();

  $(window).bind("popstate", function(e) {
    Followww.view();
  });

  $(window).scroll(function(){
    // console.log("shouldLoad: ", Followww._shouldLoadMoreItems," | scrollTop: ", $(window).scrollTop(), " | documentHeight: ", $(document).height(), " | windowHeight: ", $(window).height(), " | scrollTop + windowHeight: ", $(window).scrollTop() + $(window).height(), " | documentHeight-15: ", $(document).height() - 100);
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
      if (Followww._shouldLoadMoreItems) {
        Followww.increaseScrollLimit();
        Followww._shouldLoadMoreItems = false;
      }
  	} else {
      Followww._shouldLoadMoreItems = true;
    }
  });

  Meteor.setTimeout(function() {
    $('.preload').removeClass('preload');
  }, 1000);
}

Tools = {
  parseURL: function(url) {
    // var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    // return matches && matches[1];
    var domainParts = url.match(/^((http[s]?|ftp):\/\/)?\/?([^\/\.]+\.)*?([^\/\.]+\.[^:\/\s\.]{2,3}(\.[^:\/\s\.]‌​{2,3})?(:\d+)?)($|\/)([^#?\s]+)?(.*?)?(#[\w\-]+)?$/);
    var domain = (domainParts[3] != undefined ? domainParts[3]+domainParts[4] : domainParts[4]);
    return domain;
  },

  trimWhitespaces: function(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  },

  /*
   * JavaScript Pretty Date
   * Copyright (c) 2011 John Resig (ejohn.org)
   * Licensed under the MIT and GPL licenses.
   */
  prettyDate: function(dateElement) {
    var originalString = dateElement.title;
    var date = new Date(originalString);
    // var time = Tools.DateTools.dateToISOString(date);
    var time = date.toLocaleString();
    
    var prettyDate = Tools.DateTools.months[date.getMonth()] + ' ' + Tools.DateTools.padZero(date.getDate());
    if (date.getFullYear() < new Date().getFullYear()) {
      prettyDate += ', ' + date.getFullYear();
    }
    prettyDate += ' at ' + Tools.DateTools.padZero(date.getHours()) + ':' + Tools.DateTools.padZero(date.getMinutes());
    dateElement.title = prettyDate;

    var date = new Date((time || "").replace(/-/g,"/")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
        
    if ( isNaN(day_diff) || day_diff < 0 ) {
      return;
    } else if (day_diff < 31) {
      prettyDate = day_diff == 0 && (
          diff < 60 && "just now" ||
          diff < 120 && "1 minute ago" ||
          diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
          diff < 7200 && "1 hour ago" ||
          diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
    }

    dateElement.innerHTML = prettyDate;
  },

  stripHTML: function(html)
  {
    var regex = /(<([^>]+)>)/ig;
    return html.replace(regex, "");
  },

  /* http://stackoverflow.com/questions/4593565/regular-expression-for-accurate-word-count-using-javascript */
  getWordCount: function(text) {
    var value = Tools.stripHTML(text);
    return value.match(/\S+/g).length;
  },

  /* http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type */
  isFunction: function(functionToCheck) {
   var getType = {};
   return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  },

  DateTools: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    padZero: function(n) {
        return n < 10 ? '0' + n : n;
    },
    pad2Zeros: function(n) {
        if (n < 100) {
            n = '0' + n;
        }
        if (n < 10) {
            n = '0' + n;
        }
        return n;     
    },
    dateToISOString: function(d) {
        return d.getUTCFullYear() + '-' +  Tools.DateTools.padZero(d.getUTCMonth() + 1) + '-' + Tools.DateTools.padZero(d.getUTCDate()) + 'T' + Tools.DateTools.padZero(d.getUTCHours()) + ':' +  Tools.DateTools.padZero(d.getUTCMinutes()) + ':' + Tools.DateTools.padZero(d.getUTCSeconds()) + '.' + Tools.DateTools.pad2Zeros(d.getUTCMilliseconds()) + 'Z';
    }
  }
};