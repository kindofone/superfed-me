Template.readLater.readLaterAmount = function() {
    return ReadLater.find().count();
};

Template.readLater.readLater = function() {
  var readLaterQuery = ReadLater.find({}, {sort: {timestamp: -1}});
  var wrapedReadLater = Followww.wrap(readLaterQuery, 'updateId');
  return wrapedReadLater;
};

Template.readLater.events({
    'click .remove-btn': function (event) {
      var updateItemId = $(event.target).parents('[data-id]').data('id');
      ReadLater.remove({updateId: updateItemId});
    }
});