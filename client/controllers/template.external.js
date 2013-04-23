Template.external.helpers({
  sourceTitle: function () {
    return Session.get("externalSourceTitle");
  },

  url: function () {
    return Session.get('externalSourceURL');
  },

  host: function () {
    return Session.get('externalSourceDomain');
  },

  contentSnippet: function () {
    return Session.get('externalSourceContentSnippet');
  },

  searchResults: function () {
    return SearchResults.find();
  }
});

Template.external.rendered = function() {
    var externalSourceURL = Session.get('externalPage');
    var domain = Tools.parseURL(externalSourceURL);

    if (Session.get('externalSourceExists') !== false) {
        var updateItem = Session.get('externalSourceExists');
        Session.set('externalSourceTitle', updateItem.title);
        Session.set('externalSourceDomain', updateItem.host);
        Session.set('externalSourceURL', updateItem.url);
        Session.set('externalSourceContentSnippet', updateItem.contentSnippet);
    } else {
        Meteor.call("getExternalSource", externalSourceURL, function(error, results) {
            var source = $(results.content);
            var sourceTitle = source.filter('title').text();
            Session.set('externalSourceTitle', sourceTitle);
            Session.set('externalSourceDomain', domain);
            Session.set('externalSourceURL', externalSourceURL);
        });
    }
};

Template.external.created = function() {
    Session.set('externalSourceExists', false);

    var externalSourceURL = Session.get('externalPage');
    var domain = Tools.parseURL(externalSourceURL);
    Followww.search('site:'+domain);

    var updateItem = Updates.findOne({url: externalSourceURL});
    if (updateItem) {
        Session.set('externalSourceExists', updateItem);
    }
};

Template.external.events({
    'click .follow-btn': function (event) {
    	var urlToFollow = $(event.target).parents('[data-feedurl]').data('feedurl');
		if (urlToFollow) {
            $(event.target).addClass('btn-success').addClass('disabled').css('pointer-events','none').html('<i class="icon-ok"></i> Following');

            Followww.addOrGetExistingSource(urlToFollow, function(sourceId) {
                Followww.followSource(sourceId);
            });
		}
    },
    'click .back-to-source-btn': function(event) {
        window.location.href = Session.get('externalSourceURL');
    }
});