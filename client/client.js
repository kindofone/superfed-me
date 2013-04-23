Meteor.subscribe("sources");
Deps.autorun(function() {
  Meteor.subscribe("updates", Session.get('scrollLimit'), Session.get('lastSeenTimestamp'));
  Meteor.subscribe("sourceFeed", Session.get('sourceFeedPage'), Session.get('scrollLimit'));
});
Meteor.subscribe("favorites");
Meteor.subscribe("following");
Meteor.subscribe("popular");
Meteor.subscribe("trends");
Meteor.subscribe("readinglist");
Meteor.subscribe("readlater");

Accounts.ui.config({
  requestPermissions: {
    facebook: ['user_likes']
  },
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Meteor.startup(function() {
  Session.set('wrapped-updates-amount', '');
  Session.set('page-title', Followww._views[0].title);

  Meteor.setInterval(function() {
    var date = new Date();
    var hour = Tools.DateTools.padZero(date.getHours());
    var minute = Tools.DateTools.padZero(date.getMinutes());

    var clock = Session.get('clock');
    Session.set('clock', hour + ':' + minute);
  }, 1000);

  Meteor.autorun(function() {
    document.title = Session.get('wrapped-updates-amount') + Followww._siteTitle + ' | ' + Session.get('page-title');
  });

  filepicker.setKey("A7yewbrhTMOYz4hLWCsA7z");  
});

Followww = {
  _siteTitle: 'superfed.me',
  _itemsPerLoad: 20,
  _shouldLoadMoreItems: true,
  _views: [{name: 'homePage', url: '/', title: 'Feed'},
           {name: 'favoritesPage', url: '/favorites/', title: 'Favorites'},
           {name: 'sourceFeedPage', url: '/source/', title: 'Source'},
           {name: 'readingListPage', url: '/reads/', title: 'Reading List'}, 
           {name: 'readLaterPage', url: '/later/', title: 'Read Later'}, 
           {name: 'followingPage', url: '/following/', title: 'Following'}, 
           {name: 'searchResultsPage', url: '/search/', title: 'Search'}, 
           {name: 'externalPage', url: '/external/', title: 'Adding an External Source'}],

  view: function(pageName, param) {
    var pageObj;
    var isOnLoad = false;
    var location = history.location || document.location;

    if (!pageName) {
      isOnLoad = true;
      pageName = 'homePage';

      for (var i = 0; i < Followww._views.length; i++) {
        pageObj = Followww._views[i];
        if (location.pathname.indexOf(pageObj.url) == 0) {
          pageName = pageObj.name;

          var param = decodeURIComponent(location.pathname).replace(pageObj.url, '');
          var removeHashtagRegEx = new RegExp('#([^\\s]*)','g');
          param = param.replace(removeHashtagRegEx, '');
        }
      }
    }

    if (!param || param === '') {
      param = "true";
    }

    pageObj = Followww._views[0];

    for (var i = 0; i < Followww._views.length; i++) {
      if (Followww._views[i].name === pageName) {
        pageObj = Followww._views[i];
      }

      Session.set(Followww._views[i].name, '');
    }

    if (pageName != 'searchResultsPage') {
      $('.search-query').val('');
    }

    Followww.resetScrollLimit();
    Session.set(pageObj.name, param);
    Session.set('page-title', pageObj.title);

    if (!isOnLoad) {
      history.pushState(null, null, pageObj.url);
    }
  },

  wrap: function(collection, updateIdPropName) {
    var Items = new Meteor.Collection(null);
    collection.forEach(function(item) {
      item.itemId = item[updateIdPropName];
      delete item[updateIdPropName];

      if (updateIdPropName != '_id') {
        delete item._id;
      }

      if (item.contentSnippet) {
        item.contentSnippet = Tools.trimWhitespaces(item.contentSnippet);
      }

      var favoritesCount = Favorites.find({updateId: item.itemId}).count();
      item.favorites = favoritesCount;

      if (Favorites.findOne({owner: Meteor.userId(), updateId: item.itemId})) {
        item.isFavorite = true;
      }

      if (ReadLater.findOne({owner: Meteor.userId(), updateId: item.itemId})) {
        item.isLater = true;
      }

      var readingListItem = ReadingList.findOne({owner: Meteor.userId(), updateId: item.itemId});
      if (readingListItem) {
        item.isRead = true;
        item.readDate = readingListItem.readDate;
      }

      if (item.itemId == Session.get('lastSeenUpdateId')) {
        item.isLastSeen = true;
      }

      Items.insert(item);
    });
    return Items.find();
  },

  loadUnseen: function() {
    Followww.setLastSeenUpdate();
    Followww.updateSeenTimestamp();
  },

  setLastSeenUpdate: function() {
    var lastSeenUpdateElement = $('.updates .list-item:not(.notification)').first();
    if (lastSeenUpdateElement) {
      var lastSeenUpdateId = lastSeenUpdateElement.data('id');
      if (lastSeenUpdateId) {
        Session.set('lastSeenUpdateId', lastSeenUpdateId);
      }
    }
  },

  unsetLastSeenUpdate: function() {
    Session.set('lastSeenUpdateId', '');
  },

  updateSeenTimestamp: function() {
    var lastSeenTimestamp;
    var lastSeenUpdateId = $('.updates .list-item:first-child').data('id');
    var lastSeenUpdateItem = Updates.findOne(lastSeenUpdateId);

    if (lastSeenUpdateItem) {
      lastSeenTimestamp = lastSeenUpdateItem.timestamp;
    } else {
      var now = new Date();
      lastSeenTimestamp = now.getTime();
    }
    Session.set('lastSeenTimestamp', lastSeenTimestamp);
  },

  resetScrollLimit: function() {
    Session.set('scrollLimit', Followww._itemsPerLoad);
  },

  increaseScrollLimit: function() {
    var scrollLimit = Session.get('scrollLimit');
    if (!scrollLimit) {
      scrollLimit = Followww._itemsPerLoad;
    }

    scrollLimit += Followww._itemsPerLoad;
    Session.set('scrollLimit', scrollLimit);
  },

  addOrGetExistingSource: function(feedUrl, callback) {
    url = feedUrl.replace('feed://', 'http://');
    var sourceId;

    var sourceItem = Sources.findOne({feedUrl: url});

    if (!sourceItem) {
      var feed = new google.feeds.Feed(url);
      feed.load(function(result) {
        if (!result.error) {
          var domain = Tools.parseURL(result.feed.link);
          
          sourceId = Sources.insert({author: result.feed.title, 
            description: result.feed.subtitle || "",
            url: result.feed.link,
            feedUrl: result.feed.feedUrl, 
            host: domain});

          callback(sourceId);
        }
      });
    } else {
      sourceId = sourceItem._id;
      callback(sourceId);
    }
  },

  followSource: function(sourceId) {
    Following.insert({owner: Meteor.userId(), sourceId: sourceId});
  },

  search: function(query) {
    SearchResults.remove({});
    var feed = new google.feeds.findFeeds(query, function(result) {
      if (!result.error) {
        for (var i = 0; i < result.entries.length; i++) {
          var resultDomain = Tools.parseURL(result.entries[i].link);
          var resultAuthor = Tools.stripHTML(result.entries[i].title);
          var resultUrl = result.entries[i].link;
          var resultFeedUrl = result.entries[i].url.replace('feed://', 'http://');
          var resultIsFollowing = false;

          var followingArray = [];
          var followingQuery = Following.find({owner: Meteor.userId()});

          followingQuery.forEach(function(followItem) {
            followingArray.push(followItem.sourceId);
          });

          if (Sources.find({_id: {$in: followingArray}, feedUrl: resultFeedUrl}).count() > 0) {
            resultIsFollowing = true;
          }

          SearchResults.insert({host: resultDomain,
                                author: resultAuthor,
                                url: resultUrl,
                                feedUrl: resultFeedUrl,
                                isFollowing: resultIsFollowing});
        }
      }
    });
  },

  addUpdateToCollection: function(updateItemId, collection, isToggle, properties) {
    if (!properties)
      properties = [];

    if (!collection.findOne({owner: Meteor.userId(), updateId: updateItemId})) {
      var item = Updates.findOne({_id: updateItemId});

      if (item) {
        delete item._id;
        item.owner = Meteor.userId();
        item.updateId = updateItemId;

        for (var i = 0; i < properties.length; i++) {
          var prop = properties[i];

          if (Tools.isFunction(prop.value)) {
            item[prop.key] = prop.value();
          } else {
            item[prop.key] = prop.value;
          }
        }

        collection.insert(item);
      }
    } else if (isToggle) {
      var itemToRemove = collection.findOne({owner: Meteor.userId(), updateId: updateItemId});
      collection.remove({_id: itemToRemove._id});
    }
  }
};