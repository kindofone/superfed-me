Template.following.followingAmount = function() {
    return Following.find({owner: Meteor.userId()}).count();
};

Template.following.following = function() {
    SourcesFollowedByUser.remove({});
    Following.find().forEach(function(item) {
        var sourceItem = Sources.findOne({_id: item.sourceId});

        if (sourceItem) {
            sourceItem.followId = item._id;
            delete sourceItem._id;
            SourcesFollowedByUser.insert(sourceItem);
        }          
    });
    return SourcesFollowedByUser.find({}, {sort: {author: 1}});
};

Template.following.events({
    'click .remove-btn': function (event) {
        var followItemId = $(event.target).parents('[data-id]').data('id');
        Following.remove({_id: followItemId});
    }
});