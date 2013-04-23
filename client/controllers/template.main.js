Template.main.homePage = function() {
	return Session.get('homePage');
};

Template.main.sourceFeedPage = function() {
	return Session.get('sourceFeedPage');
};

Template.main.favoritesPage = function() {
	return Session.get('favoritesPage');
};

Template.main.readingListPage = function() {
	return Session.get('readingListPage');
};

Template.main.readLaterPage = function() {
	return Session.get('readLaterPage');
};

Template.main.followingPage = function() {
	return Session.get('followingPage');
};

Template.main.searchResultsPage = function() {
	return Session.get('searchResultsPage');
};

Template.main.externalPage = function() {
	return Session.get('externalPage');
};

Template.main.rendered = function() {
	$('.list-item-date > abbr').each(function() {
		Tools.prettyDate($(this).get(0));
    });

    $('.share-btn').on('click', function() {
    	var overlayElement = $(this).parents('.list-item').find('.list-item-overlay');
    	Socialite.load(overlayElement.get(0));
		overlayElement.fadeIn();
    });

    $('[data-toggle="tooltip"]').tooltip();
};

Template.main.events({
	'click .back-home-btn': function () {
		if ($('.add-source-btn').hasClass('active')) {
			$('.add-source-btn').click();
		} else if ($('.search-source-btn').hasClass('active')) {
			$('.search-source-btn').click();
		}
		Followww.view('homePage');
    },

	'click .list-item-link': function(event) {
		var updateItemId = $(event.target).parents('[data-id]').data('id');

		if (updateItemId) {
			Followww.addUpdateToCollection(updateItemId, ReadingList, false, [
				{key: 'readDate', value: function() {return new Date().toISOString();}}
			]);
		}
	},

	'click .readLater-btn': function(event) {
		var updateItemId = $(event.target).parents('[data-id]').data('id');

		if (updateItemId) {
			Followww.addUpdateToCollection(updateItemId, ReadLater, true);
		}
	},

	'click .favorite-btn': function(event) {
		var updateItemId = $(event.target).parents('[data-id]').data('id');

		if (updateItemId) {
			Followww.addUpdateToCollection(updateItemId, Favorites, true);
		}
	}
});