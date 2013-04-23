Template.sourceFeed.updates = function () {
	var updatesQuery = SourceFeed.find({}, {sort: {timestamp: -1}});
	var wrapedUpdates = Followww.wrap(updatesQuery, 'updateId');
	return wrapedUpdates;
};

Template.sourceFeed.isFollowing = function() {
	if (Following.findOne({sourceId: Session.get('sourceFeedPage')})) {
		return true;
	} else {
		return false;
	}
};

Template.sourceFeed.author = function() {
	var sourceItem = Sources.findOne(Session.get('sourceFeedPage'));

	if (!sourceItem) {
		return;
	}

	return sourceItem.author;
};

Template.sourceFeed.followingAmount = function() {
    return Following.find({owner: Meteor.userId()}).count();
};

Template.sourceFeed.events({
    'click .back-home-btn': function () {
		  Followww.view('homePage');
    },

	'click .list-item-link': function(event) {
		var updateItemId = $(event.target).parents('[data-id]').data('id');

		if (updateItemId) {
			if (!ReadingList.findOne({updateId: updateItemId})) {
				var readItem = Updates.findOne({_id: updateItemId});

				if (readItem) {
					delete readItem._id;
					readItem.owner = Meteor.userId();
					readItem.updateId = updateItemId;
					readItem.readDate = new Date().toISOString();

					ReadingList.insert(readItem);
				}
			}
		}
	},

	'click .readLater-btn': function(event) {
		var updateItemId = $(event.target).parents('[data-id]').data('id');

		if (updateItemId) {
			if (!ReadLater.findOne({updateId: updateItemId})) {
				var readItem = Updates.findOne({_id: updateItemId});

				if (readItem) {
					delete readItem._id;
					readItem.owner = Meteor.userId();
					readItem.updateId = updateItemId;
					readItem.readDate = new Date().toISOString();

					ReadLater.insert(readItem);
				}
			}
		}
	}
});