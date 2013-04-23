Template.updates.updates = function () {
	var updatesQuery = Updates.find({timestamp: {$lte: Session.get('lastSeenTimestamp')}}, {sort: {timestamp: -1}});
	var wrapedUpdates = Followww.wrap(updatesQuery, '_id');
	return wrapedUpdates;
};

Template.updates.unseenItems = function () {
	return (Updates.find({timestamp: {$gt: Session.get('lastSeenTimestamp')}}, {sort: {timestamp: -1}}).count() > 0 ? true : false);
};

Template.updates.followingAmount = function() {
    return Following.find({owner: Meteor.userId()}).count();
};

Template.updates.unseenAmount = function() {
	var label = "No new updates!";
	var amount = Updates.find({timestamp: {$gt: Session.get('lastSeenTimestamp')}}, {sort: {timestamp: -1}}).count();
	if (amount == 1) {
		label = "1 new update!";
	} else if (amount > 1) {
		label = amount + " new updates!";
	}
	return label;
};

Template.updates.events({
	'mousemove .updates': function() {
		if (!(Updates.find({timestamp: {$gt: Session.get('lastSeenTimestamp')}}).count() > 0 ? true : false)) {
			Followww.updateSeenTimestamp();
		}
	},

	'click .divider a.close': function(event) {
		event.preventDefault();
		Followww.unsetLastSeenUpdate();
	},

	'click #load-unseen': function () {
		Followww.loadUnseen();
	}
});