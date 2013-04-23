Meteor.publish("sources", function () {
  return Sources.find();
});

Meteor.publish("updates", function (scrollLimit, lastSeenTimestamp) {
  var followingArray = [];
  var followingQuery = Following.find({owner: this.userId});

  followingQuery.forEach(function(followItem) {
    followingArray.push(followItem.sourceId);
  });
  
  var updatesQuery = Updates.find({sourceId: {$in: followingArray}}, 
                                  {sort: {timestamp: -1}, 
                                   limit: scrollLimit});

  return updatesQuery;
});

Meteor.publish("sourceFeed", function (sourceId, scrollLimit) {
  SourceFeed.remove({});

  var updatesQuery = Updates.find({sourceId: sourceId}, 
                                  {sort: {timestamp: -1}, 
                                   limit: scrollLimit});

  updatesQuery.forEach(function(updateItem) {
    updateItem.updateId = updateItem._id;
    delete updateItem._id;
    SourceFeed.insert(updateItem);
  });

  return SourceFeed.find({}, {sort: {timestamp: -1}, limit: scrollLimit});
});

Meteor.publish("favorites", function () {
  return Favorites.find({owner: this.userId});
});

Meteor.publish("following", function () {
  return Following.find({owner: this.userId});
});

Meteor.publish("readinglist", function () {
  return ReadingList.find({owner: this.userId});
});

Meteor.publish("readlater", function () {
  return ReadLater.find({owner: this.userId});
});

Meteor.publish("popular", function () {
  return Popular.find({}, {sort: {followers: -1}, limit: 3});
});

Meteor.publish("trends", function () {
  return Trends.find({}, {sort: {favorites: -1}, limit: 3});
});

function cleanDB() {
  Sources.remove({});
  Updates.remove({});
  Favorites.remove({});
  Following.remove({});
  ReadingList.remove({});
  ReadLater.remove({});
  Popular.remove({});
  Trends.remove({});
}

Meteor.startup(function () {
  // cleanDB();

  AppServer.update();

  Sources.find().observe({
    added: AppServer.onSourcesChanged,
    removed: AppServer.onSourcesChanged
  });

  Favorites.find().observe({
    added: AppServer.onFavoritesChanged,
    removed: AppServer.onFavoritesChanged
  });

  Meteor.setInterval(function() {
    AppServer.update();
  }, 1000*30);

  Meteor.setInterval(function() {
    AppServer.updatePopularCollection();
    AppServer.updateTrendsCollection();
  }, 1000*60*10);
});

Meteor.methods({
    getExternalSource: function (url) {
        this.unblock();
        return Meteor.http.call("GET", url);
    }
});

var AppServer = {
  onSourcesChanged: function() {
    AppServer.update();

    Meteor.setTimeout(function() {
      AppServer.updatePopularCollection();
    }, 5000);
  },

  onFavoritesChanged: function() {
    Meteor.setTimeout(function() {
      AppServer.updateTrendsCollection();
    }, 5000);
  },

  onFollowingChanged: function() {
    AppServer.update();
  },

  updateSource: function(sourceId) {
    var feedAPIUrl = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=';
    var item = Sources.findOne({_id: sourceId});
    Meteor.http.get(feedAPIUrl+item.feedUrl, null, (function() {
      return function(error, result) {
        AppServer.pushUpdates(sourceId, result);
      };
    })(sourceId));
  },

  pushUpdates: function(sourceId, response) {
    try {
      if (response.statusCode == 200) {
        var content = JSON.parse(response.content);
        var result = content.responseData;
        var domain = Tools.parseURL(result.feed.link);

        // console.log(sourceId, " ", result.feed.entries.length)
        for (var i = 0; i < result.feed.entries.length; i++) {
          var entry = result.feed.entries[i];
          var exists = Updates.findOne({url: entry.link});

          if (exists == null || exists == undefined) {
            var updateDate = new Date(entry.publishedDate);
            var UTCTimestamp = updateDate.getTime();
            var wordCount = Tools.getWordCount(entry.content);

            Updates.insert({sourceId: sourceId,
                          host: domain,
                          author: result.feed.title,
                          title: entry.title,
                          url: (entry['feedburner:origLink'] ? entry['feedburner:origLink'] : entry.link),
                          content: entry.content,
                          contentSnippet: entry.contentSnippet,
                          wordCount: wordCount,
                          date: updateDate.toUTCString(),
                          timestamp: UTCTimestamp});
          } else {
            // var wordCount = Tools.getWordCount(entry.content);
            // Updates.update({url: entry.link},
            //                {$set: {wordCount: wordCount}});
          }
        }
      }
    } catch (ex) {
      // console.log("sourceId: ", sourceId, "result: ", JSON.parse(response.content).responseData.feed.entries.length, ex);
    }
  },

  update: function() {
    Sources.find().forEach(function (item) {
      AppServer.updateSource(item._id);
    });
  },

  updatePopularCollection: function() {
    Popular.remove({});
    Sources.find().forEach(function (item) {
      var followersCount = Following.find({sourceId: item._id}).count();
      Popular.insert({sourceId: item._id,
                      followers: followersCount, 
                      author: item.author, 
                      source: item.source, 
                      host: item.host});
    });
  },

  updateTrendsCollection: function() {
    Trends.remove({});
    var trendingTimestamp = (new Date().getTime()) - (60*60*24*1000);
    Updates.find({timestamp: {$gt: trendingTimestamp}}).forEach(function (item) {
      var favoritesCount = Favorites.find({updateId: item._id}).count();
      Trends.insert({updateId: item._id,
                      sourceId: item.sourceId,
                      favorites: favoritesCount, 
                      title: item.title,
                      author: item.author,
                      url: item.url, 
                      host: item.host, 
                      date: item.date,
                      readDate: item.readDate});
    });
  }
};