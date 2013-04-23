function toggleNavbar($btn, $navbar, initialValue) {
	if ($btn.hasClass('active')) {
		$navbar.find('.search-query').val('');
		$navbar.find('.search-query').blur();
		$navbar.addClass('hidden-navbar');
		$btn.find('[class^=icon-]').removeClass('icon-white');
		$btn.removeClass('active');
	} else {
		$('.nav li').each(function(index, element) {
			if (element != $btn.get(0)) {
				if ($(element).hasClass('active')) {
					$(element).click();
				}
			}
		});
		$btn.addClass('active');
		$btn.find('[class^=icon-]').addClass('icon-white');
		$navbar.removeClass('hidden-navbar');
		if (initialValue) {
			$navbar.find('.search-query').val(initialValue);
			$navbar.find('.search-query').select();
		}
		$navbar.find('.search-query').focus();
	}
}

function parseOPML(contents, callback) {
	var xmlDoc = $.parseXML(contents);
    var $xml = $(xmlDoc);
    $xml.find('outline').each(function(index, element) {
    	var $element = $(element);
    	Imports.insert({title: $element.attr('title'), htmlUrl: $element.attr('htmlUrl'), xmlUrl: $element.attr('xmlUrl')});
    });

    setTimeout(function() {callback()}, 500);
}

Template.navbar.rendered = function() {
	filepicker.constructWidget(document.getElementById('attachment'));
}

Template.navbar.events({
	'click .import-source-btn' :function(event) {
		toggleNavbar($('.import-source-btn'), $('.import-navbar'));
	},

	'click .add-source-btn' :function(event) {
		toggleNavbar($('.add-source-btn'), $('.add-navbar'), 'http://');
	},

	'click .search-source-btn' :function(event) {
		toggleNavbar($('.search-source-btn'), $('.search-navbar'));
	},

	'input .search-query': function(event) {
		var query = $(event.target).val();
		if (query !== "") {
			Followww.view('searchResultsPage');
			Followww.search(query);
		} else {
			Followww.view('homePage');
		}
	},

	'change #attachment': function(evt){
		toggleNavbar($('.import-source-btn'), $('.import-navbar'));
        filepicker.read(document.getElementById('attachment').value, {asText: true}, 
		  function(contents){
		      parseOPML(contents, function() {
		      	$('#import-modal').modal('show');
		      	$('#import-modal').on('hidden', function () {
				  Imports.remove({});
				  Session.set('importProgress', 0);
				});
		      });
		  }, function(fperror) {
		      console.log(fperror.toString());
		  }
		);
    }
});