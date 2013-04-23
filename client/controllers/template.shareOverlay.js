Template.shareOverlay.rendered = function() {
	$('.overlay-close').on('click', function() {
    	var overlayElement = $(this).parents('.list-item-overlay');
		overlayElement.fadeOut();
    });
};