let breakpoints = {
	mobile: 2,
	sm: 540,
	md: 768,
	lg: 1024,
	xl: 1280,
	xxl: 1536,
};

const classesElements = [];
const classes = [];
const smClasses = [];
const mdClasses = [];
const lgClasses = [];
const xlClasses = [];
const xxlClasses = [];
let currentBreakpoint = null;
let activeBPIndex;
let windowWidth;
let cssFile;
let cssText;
let cssBlocks;
const classPrefixes = ["sm", "md", "lg", "xl", "xxl"];
let containerStyles;

function typewriterOnLoad(element, variationArray) {
	function typeText(index) {
		if (index < variationArray.length) {
			element.text("");
			const variationInLetters = variationArray[index].split("");
			displayLetters(0);
			function displayLetters(j) {
				if (j < variationInLetters.length) {
					setTimeout(() => {
						element.text(element.text() + variationInLetters[j]);
						displayLetters(j + 1);
					}, 100);
				} else {
					setTimeout(
						() => typeText((index + 1) % variationArray.length),
						1000,
					);
				}
			}
		}
	}
	typeText(0);
}
function typewriterOnHover(element, variationArray) {
	let hover = false;
	function typeText(index) {
		if (index < variationArray.length && hover) {
			element.text("");
			const variationInLetters = variationArray[index].split("");
			displayLetters(0);
			function displayLetters(j) {
				if (j < variationInLetters.length && hover) {
					setTimeout(() => {
						element.text(element.text() + variationInLetters[j]);
						displayLetters(j + 1);
					}, 200);
				} else if (hover) {
					setTimeout(
						() => typeText((index + 1) % variationArray.length),
						1000,
					);
				}
			}
		}
	}
	element.mouseenter(function () {
		hover = true;
		typeText(1);
	});
	element.mouseleave(function () {
		hover = false;
		setTimeout(() => {
			element.text("");
			element.text(variationArray[0]);
		}, 200);
	});
}
function typewriterOnClick(element, variationArray) {
	let hover = false;
	function typeText(index) {
		if (index < variationArray.length && hover) {
			element.text("");
			const variationInLetters = variationArray[index].split("");
			displayLetters(0);
			function displayLetters(j) {
				if (j < variationInLetters.length && hover) {
					setTimeout(() => {
						element.text(element.text() + variationInLetters[j]);
						displayLetters(j + 1);
					}, 200);
				} else if (hover) {
					setTimeout(
						() => typeText((index + 1) % variationArray.length),
						1000,
					);
				}
			}
		}
	}
	element.click(function () {
		if (hover) {
			hover = false;
			setTimeout(() => {
				element.text("");
				element.text(variationArray[0]);
			}, 200);
		} else {
			hover = true;
			typeText(1);
			console.log("click");
		}
	});
}
function typewriterOnScroll(element, variationArray) {
	const entryPoint = $(window).height();
	const exitPoint = $("header").outerHeight(true) + element.outerHeight(true);
	const elementHeight = element.outerHeight(true);
	$(window).scroll(function () {
		write();
	});
	function write() {
		const elementTop = element.offset().top - $(window).scrollTop();
		const variationInLetters = variationArray[0].split("");
		const length = variationInLetters.length;
		if (
			elementTop <= entryPoint - elementHeight &&
			elementTop >= exitPoint
		) {
			const percentageInView =
				1 -
				Math.round(
					((elementTop - exitPoint) / (entryPoint - exitPoint)) *
						10000,
				) /
					10000;
			const lettersToShow = Math.round(percentageInView * length);
			element.text("");
			for (let i = 0; i < lettersToShow; i++) {
				element.text(element.text() + variationInLetters[i]);
			}
		}
	}
	write();
}
function typewriterOnVisible(element, variationArray) {}

$(document).ready(async function () {
	AOS.init();
	cssFile = await fetch("getStyles/getStyles.css");
	cssText = await cssFile.text();
	cssBlocks = cssText.split("}");
	// await loadAll();
	await checkBreakpoints();
	await getClasses();
	await getBreakpoint();
	// check if any element has effect attribute
	const effectList = [];
	$("*").each(function () {
		if ($(this).attr("effectJS") !== undefined) {
			effectList.push($(this));
		}
	});
	if (effectList.length !== 0) {
		// console.log(effectList);
		effectList.forEach((element) => {
			const effectName = element.attr("effectJS").toLowerCase();
			element.css("min-height", element.outerHeight(true) + "px");
			if (effectName === "typewriter") {
				const startAt = element.attr("startAt") || "load";
				const variation = element.attr("variation") || element.text();
				const variationArray = [];
				if (variation.includes(";")) {
					variationArray.push(
						...variation.split(";").map((str) => str.trim()),
					);
				} else {
					variationArray.push(element.text());
				}
				if (startAt === "load") {
					typewriterOnLoad(element, variationArray);
				} else if (startAt === "hover") {
					typewriterOnHover(element, variationArray);
				} else if (startAt === "click") {
					typewriterOnClick(element, variationArray);
				} else if (startAt === "scroll") {
					variationArray.length = 0;
					variationArray.push(element.text());
					typewriterOnScroll(element, variationArray);
				} else if (startAt === "visible") {
					typewriterOnVisible(element, variationArray);
				}
			} else if (effectName === "increment") {
				const limitStart = parseInt(element.attr("limitStart")) || 0;
				const limitEnd = parseInt(element.attr("limitEnd"));
				function increment() {
					const duration = 3000;
					const steps = Math.abs(limitEnd - limitStart);
					const interval = duration / steps;
					let currentValue = limitStart;
					if (isNaN(limitEnd)) {
						console.error(
							"Invalid limitEnd:",
							element.attr("limitEnd"),
						);
						return;
					}
					const incrementValue = limitStart < limitEnd ? 1 : -1;
					const intervalId = setInterval(() => {
						currentValue += incrementValue;
						element.text(Math.round(currentValue));
						if (
							(limitStart < limitEnd &&
								currentValue >= limitEnd) ||
							(limitStart > limitEnd && currentValue <= limitEnd)
						) {
							element.text(limitEnd);
							clearInterval(intervalId);
						}
					}, interval);
				}
				increment();
			}
		});
	}
});

async function checkBreakpoints() {
	const metaTag = document.querySelector("meta[name=getStyles]");
	if (metaTag && metaTag.getAttribute("sm") !== "") {
		breakpoints.sm = Number(metaTag.getAttribute("sm"));
	}
	if (metaTag && metaTag.getAttribute("md") !== "") {
		breakpoints.md = Number(metaTag.getAttribute("md"));
	}
	if (metaTag && metaTag.getAttribute("lg") !== "") {
		breakpoints.lg = Number(metaTag.getAttribute("lg"));
	}
	if (metaTag && metaTag.getAttribute("xl") !== "") {
		breakpoints.xl = Number(metaTag.getAttribute("xl"));
	}
	if (metaTag && metaTag.getAttribute("xxl") !== "") {
		breakpoints.xxl = Number(metaTag.getAttribute("xxl"));
	}
	const containerClassStyle = `@media (min-width: ${breakpoints.sm}px) {
		:root {
			font-size: 16px;
		}
		.container {
			margin-inline: calc((100vw - ${breakpoints.sm}px) / 2);
		}
		.container-fluid {
			padding-inline: calc((100vw - ${breakpoints.sm}px) / 2);
		}
	}
	
	@media (min-width: ${breakpoints.md}px) {
		.container, .md-container {
			margin-inline: calc((100vw - ${breakpoints.md}px) / 2);
		}
		.container-fluid, .md-container-fluid {
			padding-inline: calc((100vw - ${breakpoints.md}px) / 2);
		}
	}
	
	@media (min-width: ${breakpoints.lg}px) {
		.container, .md-container, .lg-container {
			margin-inline: calc((100vw - ${breakpoints.lg}px) / 2);
		}
		.container-fluid, .md-container-fluid, .lg-container-fluid {
			padding-inline: calc((100vw - ${breakpoints.lg}px) / 2);
		}
	}
	
	@media (min-width: ${breakpoints.xl}px) {
		.container, .md-container, .lg-container, .xl-container {
			margin-inline: calc((100vw - ${breakpoints.xl}px) / 2);
		}
		.container-fluid, .md-container-fluid, .lg-container-fluid, .xl-container-fluid {
			padding-inline: calc((100vw - ${breakpoints.xl}px) / 2);
		}
	}
	
	@media (min-width: ${breakpoints.xxl}px) {
		.container, .md-container, .lg-container, .xl-container, .xxl-container {
			margin-inline: calc((100vw - ${breakpoints.xxl}px) / 2);
		}
		.container-fluid, .md-container-fluid, .lg-container-fluid, .xl-container-fluid, .xxl-container-fluid {
			padding-inline: calc((100vw - ${breakpoints.xxl}px) / 2);
		}
	}
	`;
	containerStyles = containerClassStyle;
	const containerClass = document.createElement("style");
	containerClass.innerHTML = containerClassStyle;
	document.head.appendChild(containerClass);
}

async function loadAll() {
	const smStyle = [];
	const mdStyle = [];
	const lgStyle = [];
	const xlStyle = [];
	const xxlStyle = [];
	cssBlocks.forEach((block) => {
		block = block.trim();
		block += `}`;
		if (block.startsWith(".")){
			// console.log(block);
			smStyle.push(block.replace(".", ".sm-").replace(".hover", ".sm-hover"));
			mdStyle.push(block.replace(".", ".md-").replace(".hover", ".md-hover"));
			lgStyle.push(block.replace(".", ".lg-").replace(".hover", ".lg-hover"));
			xlStyle.push(block.replace(".", ".xl-").replace(".hover", ".xl-hover"));
			xxlStyle.push(block.replace(".", ".xxl-").replace(".hover", ".xxl-hover"));
		}
	});
	const smStyleTag = document.createElement("style");
	smStyleTag.innerHTML = `@media (min-width: ${breakpoints.sm}px) {\n${smStyle.join("\n")} \n}`;
	document.head.appendChild(smStyleTag);
	const mdStyleTag = document.createElement("style");
	mdStyleTag.innerHTML = `@media (min-width: ${breakpoints.md}px) {\n${mdStyle.join("\n")} \n}`;
	document.head.appendChild(mdStyleTag);
	const lgStyleTag = document.createElement("style");
	lgStyleTag.innerHTML = `@media (min-width: ${breakpoints.lg}px) {\n${lgStyle.join("\n")} \n}`;
	document.head.appendChild(lgStyleTag);
	const xlStyleTag = document.createElement("style");
	xlStyleTag.innerHTML = `@media (min-width: ${breakpoints.xl}px) {\n${xlStyle.join("\n")} \n}`;
	document.head.appendChild(xlStyleTag);
	const xxlStyleTag = document.createElement("style");
	xxlStyleTag.innerHTML = `@media (min-width: ${breakpoints.xxl}px) {\n${xxlStyle.join("\n")} \n}`;
	document.head.appendChild(xxlStyleTag);
}

// // TODO- trigger getBreakpoint() on window resize
// $(window).on(
// 	"resize",
// 	debounce(function () {
// 		getBreakpoint();
// 	}, 250),
// );

// // TODO- Debounce the getBreakpoint() function
// function debounce(func, delay) {
// 	let timeoutId;
// 	return function () {
// 		const context = this;
// 		const args = arguments;
// 		clearTimeout(timeoutId);
// 		timeoutId = setTimeout(() => {
// 			func.apply(context, args);
// 		}, delay);
// 	};
// }

// TODO- List all classes
async function getClasses() {
	classesElements.length = 0;
	classes.length = 0;
	smClasses.length = 0;
	mdClasses.length = 0;
	lgClasses.length = 0;
	xlClasses.length = 0;
	xxlClasses.length = 0;
	$("*").each(function () {
		if (
			$(this).attr("class") !== undefined &&
			$(this).attr("class") !== ""
		) {
			classesElements.push($(this));
		}
	});
	classesElements.forEach((element) => {
		const elementClasses = element.attr("class").split(" ");
		elementClasses.forEach((elementClass) => {
			if (
				!classes.includes(elementClass) &&
				elementClass !== ""
			) {
				elementClass.replace("sm-", "")
				.replace("md-", "")
				.replace("lg-", "")
				.replace("xl-", "")
				.replace("xxl-", "");
				classes.push(elementClass);
			}
			if (elementClass.startsWith("sm-") && elementClass !== "sm-") {
				elementClass = elementClass.replace("sm-", "");
				if (smClasses.includes(elementClass)) {
				} else {
					smClasses.push(elementClass);
				}
			}
			if (elementClass.startsWith("md-") && elementClass !== "md-") {
				elementClass = elementClass.replace("md-", "");
				if (mdClasses.includes(elementClass)) {
				} else {
					mdClasses.push(elementClass);
				}
			}
			if (elementClass.startsWith("lg-") && elementClass !== "lg-") {
				elementClass = elementClass.replace("lg-", "");
				if (lgClasses.includes(elementClass)) {
				} else {
					lgClasses.push(elementClass);
				}
			}
			if (elementClass.startsWith("xl-") && elementClass !== "xl-") {
				elementClass = elementClass.replace("xl-", "");
				if (xlClasses.includes(elementClass)) {
				} else {
					xlClasses.push(elementClass);
				}
			}
			if (elementClass.startsWith("xxl-") && elementClass !== "xxl-") {
				elementClass = elementClass.replace("xxl-", "");
				if (xxlClasses.includes(elementClass)) {
				} else {
					xxlClasses.push(elementClass);
				}
			}
		});
	});
	// console.log("Activated breakpoints-", breakpoints);
	await getCSS();
}

// TODO- Get current breakpoint
async function getBreakpoint() {
	windowWidth = document.documentElement.clientWidth;
	// console.log(`Window width: ${windowWidth}`);
	let newBreakpoint = null;
	if (windowWidth < breakpoints.sm) {
		newBreakpoint = "mobile";
	} else {
		for (const breakpoint in breakpoints) {
			if (windowWidth >= breakpoints[breakpoint]) {
				newBreakpoint = breakpoint;
				currentBreakpoint = newBreakpoint;
			} else {
				break;
			}
		}
	}
	activeBPIndex = classPrefixes.indexOf(newBreakpoint);
}

async function getCSS() {
	if (smClasses.length !== 0) {
		await getStyle(smClasses, "sm");
	}
	if (mdClasses.length !== 0) {
		await getStyle(mdClasses, "md");
	}
	if (lgClasses.length !== 0) {
		await getStyle(lgClasses, "lg");
	}
	if (xlClasses.length !== 0) {
		await getStyle(xlClasses, "xl");
	}
	if (xxlClasses.length !== 0) {
		await getStyle(xxlClasses, "xxl");
	}
}

async function getStyle(array, breakpoint) {
	const styleString = [];
	for (let i = 0; i < array.length; i++) {
		const className = array[i];
		if (className === "container") {
			continue;
		}
		const style = await getStyleFromCSS(className);
		if (style !== null) {
			const newStyle = style.replace(
				`.${className}`,
				`.${breakpoint}-${className}`,
			);
			styleString.push(newStyle);
		}
	}
	const styleTag = document.createElement("style");
	styleTag.innerHTML = `@media (min-width: ${
		breakpoints[breakpoint]
	}px) {\n${styleString.join("\n")} \n}`;
	document.head.appendChild(styleTag);
}

async function getStyleFromCSS(className) {
	return new Promise((resolve, reject) => {
		cssBlocks.forEach((block) => {
			if (block.includes(`.${className}`)) {
				if (className.includes("hover")) {
					const notRequired =
						className.replace(".hover-", "").trim() + ",";
					block = block.replace(notRequired, "");
				} else {
					block = block
						.replace(`.hover-${className}:hover`, "")
						.replace(",", "");
				}
				block += `}`;
				block = block.trim();
				resolve(block);
			}
		});
		reject(null);
	});
}
