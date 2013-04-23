Template.favorites.favorites = function() {
    var favoritesQuery = Favorites.find({}, {sort: {timestamp: -1}});
    var wrapedFavorites = Followww.wrap(favoritesQuery, 'updateId');
    return wrapedFavorites;
};

Template.favorites.favoritesAmount = function() {
  return Favorites.find().count();
};

Template.favorites.events({
    'click .remove-btn': function (event) {
    	var updateItemId = $(event.target).parents('[data-id]').data('id');
  		Favorites.remove({updateId: updateItemId});
    }
});