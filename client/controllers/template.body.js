Template.body.events({
  'click .back-home-btn': function () {
	  Followww.view('homePage');
  },

  'click [data-source], [data-source-url]': function(event) {
    event.preventDefault();

    var sourceId = $(event.target).data('source');
    if (!sourceId || sourceId === '') {
    	sourceId = $(event.target).parents('[data-source]').data('source');
    }

    if (!sourceId || sourceId === '') {
      var feedUrl = $(event.target).data('source-url');
      if (!feedUrl || feedUrl === '') {
        feedUrl = $(event.target).parents('[data-source-url]').data('source-url');
        sourceId = Followww.addOrGetExistingSource(feedUrl, function(sourceId) {
          Followww.view('sourceFeedPage', sourceId);
        });
      }
    } else {
      Followww.view('sourceFeedPage', sourceId);
    }
  }
});