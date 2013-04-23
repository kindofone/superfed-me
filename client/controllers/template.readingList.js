Template.readingList.readAmount = function() {
    return ReadingList.find().count();
};

Template.readingList.readingList = function() {
    var readingListQuery = ReadingList.find({}, {sort: {readDate: -1}});
    var wrapedReadingList = Followww.wrap(readingListQuery, 'updateId');
    return wrapedReadingList;
};

Template.readingList.events({
    'click .remove-btn': function (event) {
      var updateItemId = $(event.target).parents('[data-id]').data('id');
      ReadingList.remove({updateId: updateItemId});
    }
});