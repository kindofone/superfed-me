Template.searchResults.searchResults = function() {
    return SearchResults.find();
};

Template.searchResults.isRSS = function() {
    var query = $('.navbar:not(.hidden-navbar) .search-query').val();
    if ((query.indexOf('http://') > -1) || (query.indexOf('https://') > -1)) {
        return true;
    } else {
        return false;
    }
};

Template.searchResults.searchQuery = function() {
    var query = $('.navbar:not(.hidden-navbar) .search-query').val();
    return query;
};

Template.searchResults.events({
    'click .follow-btn': function (event) {
    	var urlToFollow = $(event.target).parents('[data-feedurl]').data('feedurl');
		if (urlToFollow) {
            $(event.target).addClass('btn-success').addClass('disabled').css('pointer-events','none').html('<i class="icon-ok"></i> Following');

            Followww.addOrGetExistingSource(urlToFollow, function(sourceId) {
                Followww.followSource(sourceId);
            });
		}
    },
    'click .follow-url-btn': function(event) {
        var urlToFollow = $('.navbar:not(.hidden-navbar) .search-query').val();
        if (urlToFollow) {
            $(event.target).addClass('btn-success').addClass('disabled').css('pointer-events','none').html('<i class="icon-ok"></i> Following');
            
            Followww.addOrGetExistingSource(urlToFollow, function(sourceId) {
                Followww.followSource(sourceId);
            });
        }
    }
});