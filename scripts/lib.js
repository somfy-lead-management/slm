/*Initialise view*/
function initView () {
	if (globalUser.get('ISSALESREP')==true) {
		$(".only-srep").show();
		$(".only-cust").hide();
		/*Particular case*/
		$(".project-enduser").removeClass("hidden");
	}
	else {
		$(".only-srep").hide();
		$(".only-cust").show();
	}
	
	$(".hidden").hide();

	if (currentView === "details") $(".filter-bar").hide();

	// force jquery mobile to place element correctly
	$(window).trigger('resize');
}