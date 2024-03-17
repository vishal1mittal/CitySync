$(document).ready(function () {
	// load header and footer
	$("header").load("./components/header/index.html", function () {
		$("header").toggleClass("fixed top-0 w-screen h-96 sm-h-96 z-12 overflow-hidden");
		var header = $("header");
		$(window).scroll(function () {
			if ($(this).scrollTop() > 0 && !header.hasClass("box-shadow")) {
				header.addClass(
					"box-shadow shadow-x-0 shadow-y-16 shadow-blur-8 shadow-spread--8 shadow-black",
				);
			} else if (
				$(this).scrollTop() === 0 &&
				header.hasClass("box-shadow")
			) {
				header.removeClass(
					"box-shadow shadow-x-0 shadow-y-16 shadow-blur-8 shadow-spread--8 shadow-black",
				);
			}
		});
		const menu = $("#menu");
		const navbar = $("#navbar");
		const menuToggleButton = $("#menuToggle");
		menuToggleButton.click(function () {
			if (menuToggleButton.hasClass("bx-menu")) {
				menuToggleButton.toggleClass("bx-menu").toggleClass("bx-x");
				// navbar.addClass(
				// 	"box-shadow shadow-x-0 shadow-y-16 shadow-blur-8 shadow-spread--8 shadow-black",
				// );
				header.toggleClass("h-96").toggleClass("h-screen");
			} else {
				menuToggleButton.toggleClass("bx-menu").toggleClass("bx-x");
				// navbar.removeClass(
				// 	"box-shadow shadow-x-0 shadow-y-16 shadow-blur-8 shadow-spread--8 shadow-black",
				// );
				header.toggleClass("h-96").toggleClass("h-screen");
			}
		});
	});
	$("footer").load("./components/footer/index.html");
});
