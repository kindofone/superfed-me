Template.importModal.helpers({
  imports: function () {
    return Imports.find();
  },

  importsCount: function() {
    return Imports.find().count();
  },

  importProgress: function() {
    return Session.get('importProgress');
  }
});

// Template.importModal.rendered = function() {
//     var externalSourceURL = Session.get('externalPage');
//     var domain = Tools.parseURL(externalSourceURL);

//     if (Session.get('externalSourceExists') !== false) {
//         var updateItem = Session.get('externalSourceExists');
//         Session.set('externalSourceTitle', updateItem.title);
//         Session.set('externalSourceDomain', updateItem.host);
//         Session.set('externalSourceURL', updateItem.url);
//         Session.set('externalSourceContentSnippet', updateItem.contentSnippet);
//     } else {
//         Meteor.call("getExternalSource", externalSourceURL, function(error, results) {
//             var source = $(results.content);
//             var sourceTitle = source.filter('title').text();
//             Session.set('externalSourceTitle', sourceTitle);
//             Session.set('externalSourceDomain', domain);
//             Session.set('externalSourceURL', externalSourceURL);
//         });
//     }
// };

// Template.importModal.created = function() {
    
// };

Template.importModal.events({
    'click .import-btn': function (event) {
        Session.set('importTotalAmount', Imports.find().count());
        Imports.find().forEach(function(subscription) {
        	var urlToFollow = subscription.xmlUrl;
    		if (urlToFollow) {
                Followww.addOrGetExistingSource(urlToFollow, function(sourceId) {
                    Followww.followSource(sourceId);
                });

                var progress = Session.get('importProgress') + (100 / Session.get('importTotalAmount'));
                Session.set('importProgress', progress);

                if (progress >= 95) {
                    $('#import-modal').modal('hide');
                }
    		}
        });
    },
    'click .cancel-btn': function(event) {
        $('#import-modal').modal('hide');
    }
});