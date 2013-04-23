Template.sidebar.newUpdatesAmount = function() {
  var amount = Updates.find({timestamp: {$gt: Session.get('lastSeenTimestamp')}}, {sort: {timestamp: -1}}).count();

  if (amount > 0) {
    Session.set('wrapped-updates-amount', '('+amount+') ');
  } else {
    Session.set('wrapped-updates-amount', '');
  }

	return amount;
};

Template.sidebar.favoritesAmount = function() {
  return Favorites.find().count();
};

Template.sidebar.readAmount = function() {
  return ReadingList.find({}, {sort: {timestamp: -1}}).count();
};

Template.sidebar.readLaterAmount = function() {
    return ReadLater.find().count();
};

Template.sidebar.followingAmount = function() {
    return Following.find({owner: Meteor.userId()}).count();
};

Template.sidebar.popular = function() {
  return Popular.find({}, {sort: {followers: -1}});
};

Template.sidebar.trends = function() {
  var trendsQuery = Trends.find({}, {sort: {favorites: -1}});
  var wrapedTrends = Followww.wrap(trendsQuery, 'updateId');
  return wrapedTrends;

  // return Trends.find({}, {sort: {favorites: -1}});
};

Template.sidebar.events({
    'click #homePage-btn': function () {
    	Followww.view('homePage');
      Followww.loadUnseen();
    },

    'click #favoritesPage-btn': function () {
      Followww.view('favoritesPage');
    },

    'click #readingListPage-btn': function () {
      Followww.view('readingListPage');
    },

    'click #readLaterPage-btn': function () {
      Followww.view('readLaterPage');
    },

    'click #followingPage-btn': function () {
  		Followww.view('followingPage');
    }
});