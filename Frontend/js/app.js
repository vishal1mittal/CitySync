        document.getElementById("searchTerm").addEventListener("input", findSimilar);

function placeAndSearch() {
	document.getElementById("searchTerm").value = event.target.innerText;
	findSimilar();
}

function findSimilar() {
	const currentTerm = document.getElementById("searchTerm").value;
	if (currentTerm == "") {
		$("#similar").hide();
		$("#stocksNews").show();
		return;
	}
	$("#similar").show();
	$("#stocksNews").hide();
	const similarStocks = stocks.filter((stock) =>
		stock.Name.includes(currentTerm),
	);
	const similarDiv = document.getElementById("similar");
	similarDiv.innerHTML = "";
	similarStocks.slice(0, 5).forEach((stock) => {
		const a = document.createElement("a");
		a.className =
			"w-1-3 h-48 flex aic jcc p-lg bg-white hover-bg-blue hover-txt-white mb-sm round-sm";
		a.innerText = stock.Name;
		a.onclick = function () {
			document.getElementById("searchTerm").value = stock.Name;
			document.getElementById("triggerSearch").click();
		};
		similarDiv.appendChild(a);
	});
}

function topNews() {
	const apiKey = "d0bf847f5a1c42bc94fabab542d6caf0";
	const topStocks = ["Stock Market"];
	const stocksDiv = $("#stocksNews");
	stocksDiv.html("");
	topStocks.forEach((stock) => {
		if (stock == "") stock = "Stock Market India";
		const query = encodeURIComponent(`${stock} stock India`);
		const apiUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&pageSize=5`;
		fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => {
				const articles = data.articles;
				articles.forEach((article, index) => {
					if (index < 8) {
						const newsContainer = $("<div></div>");
						newsContainer.addClass(
							"flex aifs jcfs fd-column bg-white p-lg round-sm w-256 h-inherit border-2 border-transparent hover-border-blue solid",
						);

						const heading = $("<h4></h4>");
						heading.addClass("fw-700 fs-24 font-primary");
						const headingWords = article.title
							.split(" ")
							.slice(0, 6)
							.join(" ");
						heading.text(`${headingWords}...`);
						newsContainer.append(heading);

						const contentSnippet = $("<p></p>");
						contentSnippet.addClass("fw-400 fs-16 font-primary");
						const words = article.description
							.split(" ")
							.slice(0, 20)
							.join(" ");
						contentSnippet.text(`${words}...`);
						newsContainer.append(contentSnippet);

						const readMoreLink = $("<a></a>");
						readMoreLink.addClass(
							"fw-400 fs-16 font-primary txt-blue",
						);
						readMoreLink.attr("href", article.url);
						readMoreLink.attr("target", "_blank");
						readMoreLink.text("Read more");
						newsContainer.append(readMoreLink);

						stocksDiv.append(newsContainer);

						const spacing = $("<hr>");
						stocksDiv.append(spacing);
					}
				});
			})
			.catch((error) => {
				console.error(`Error fetching news for ${stock}:`, error);
			});
	});
}

topNews();

let searchEnabled = false;

function fetchSymbol() {
	searchEnabled = true;
	const searchTerm = $("#searchTerm").val().trim();
	if (searchTerm == "") return;
	$("#similar").hide();
	$("#stocksNews").hide();
	$("#loader").css("left", "-90%");
	let i = 90;
	const animateLoader = setInterval(() => {
		if (i >= 0) {
			$("#loader").css("left", `-${i}%`);
			i -= 10;
		} else {
			clearInterval(animateLoader);
		}
	}, 650);
	const foundStock = stocks.find((stock) => stock.Name === searchTerm);
	$("#searchSection").css("height", "auto");
	$("#cname").text(foundStock.Name);
	$("#symbol").text(foundStock.Symbol);
	$("#industry").text(foundStock.Industry);
	$("#sector").text(foundStock.Sector);
	$("#ipo").text(foundStock.IPO_Year);

	if (foundStock) {
		const symbol = foundStock.Symbol;
		const apiUrl = `https://vdl888c2-8000.inc1.devtunnels.ms/${symbol}/false?format=json`;
		fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => {
				console.log("Data for", searchTerm, ":", data);
				clearInterval(animateLoader);
				setTimeout(() => {
					$("#loader").css("left", "-100%");
				}, 1000);
				const historyDates = [];
				const historyPrices = [];
				const predictedDates = [];
				const predictedPrices = [];
				const newsTitles = [];
				const newsContents = [];
				const newsLinks = [];
				for (let i = 0; i < Object.keys(data[0]).length; i++) {
					if (Object.keys(data[0]).includes(`HistoryDate-${i}`)) {
						historyDates.unshift(data[0][`HistoryDate-${i}`]);
					}
					if (Object.keys(data[0]).includes(`HistoryPrice-${i}`)) {
						historyPrices.unshift(data[0][`HistoryPrice-${i}`]);
					}
					if (Object.keys(data[0]).includes(`PredictDate-${i}`)) {
						predictedDates.push(data[0][`PredictDate-${i}`]);
					}
					if (Object.keys(data[0]).includes(`PredictPrice-${i}`)) {
						predictedPrices.push(data[0][`PredictPrice-${i}`]);
					}
					if (Object.keys(data[0]).includes(`NewsTitle-${i}`)) {
						newsTitles.unshift(data[0][`NewsTitle-${i}`]);
					}
					if (Object.keys(data[0]).includes(`NewsDescription-${i}`)) {
						newsContents.unshift(data[0][`NewsDescription-${i}`]);
					}
					if (Object.keys(data[0]).includes(`NewsLink-${i}`)) {
						newsLinks.unshift(data[0][`NewsLink-${i}`]);
					}
				}
				$("#previousData").empty();
				const maxPrice = Math.max(...historyPrices);
				historyPrices.forEach((price, index) => {
					const barHeight = (price / maxPrice) * 80 + "%"; // Calculate height percentage
					const date = historyDates[index]; // Get corresponding date
					const roundedPrice = Math.round(price * 100) / 100;

					const chartBar = $("<div>")
						.addClass("chart-bar bg-blue-600 relative")
						.css("height", barHeight)
						.css("width", "40px")
						.attr("data-date", date);
					chartBar.html(`
                        <div style="translate:-50%" class="absolute top--24 left--1-2 bg-black p-lg round-sm txt-white fs-16 fw-700 font-primary none z-10 w-128 tac"><p>${roundedPrice}</p><p>${date}</p></div>`);
					// on hover show the inner div
					chartBar.hover(
						function () {
							$(this).find("div").removeClass("none");
						},
						function () {
							$(this).find("div").addClass("none");
						},
					);

					$("#previousData").append(chartBar);

					$("#stockData").removeClass("none").addClass("flex");
				});
				const previousDataTitle = $("<h3 style='translate:-50%'></h3>");
				previousDataTitle.addClass(
					"fs-24 fw-700 font-primary absolute left-1-2 top-md z-10",
				);
				previousDataTitle.text("Historical Performance (1 Month)");
				$("#previousData").prepend(previousDataTitle);
				$("#predictedData").empty();
				const maxPredictedPrice = Math.max(...predictedPrices);
				predictedPrices.forEach((price, index) => {
					const barHeight = (price / maxPredictedPrice) * 80 + "%"; // Calculate height percentage
					const date = predictedDates[index]; // Get corresponding date
					const roundedPrice = Math.round(price * 100) / 100;

					const chartBar = $("<div>")
						.addClass("chart-bar bg-green-400 relative")
						.css("height", barHeight)
						.css("width", "40px")
						.attr("data-date", date);
					chartBar.html(`
                        <div style="translate:-50%" class="absolute top--24 left--1-2 bg-black p-lg round-sm txt-white fs-16 fw-700 font-primary none z-10 w-128 tac"><p>${roundedPrice}</p><p>${date}</p></div>`);
					// on hover show the inner div
					chartBar.hover(
						function () {
							$(this).find("div").removeClass("none");
						},
						function () {
							$(this).find("div").addClass("none");
						},
					);

					$("#predictedData").append(chartBar);

					$("#stockData").removeClass("none").addClass("flex");
				});
				const predictedDataTitle = $(
					"<h3 style='translate:-50%'></h3>",
				);
				predictedDataTitle.addClass(
					"fs-20 fw-700 font-primary absolute left-1-2 top-md z-10 w-full tac",
				);
				predictedDataTitle.text("Predicted Performance (1 Week)");
				$("#predictedData").prepend(predictedDataTitle);
				$("#newsArticles").empty();
				newsTitles.forEach((title, index) => {
					const newsArticle = $("<div>");
					newsArticle.addClass("hover-bg-white p-lg round-sm mb-md");
					newsArticle.html(`
                        <h4 class="fw-700 fs-20 font-primary">${title}</h4>
                        <p class="fw-400 fs-16 font-primary">${newsContents[index]}</p>
                        <a class="fw-400 fs-12 font-primary txt-blue" href="${newsLinks[index]}" target="_blank">Read more</a>
                    `);
					$("#newsArticles").append(newsArticle);
				});
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
				clearInterval(animateLoader);
				setTimeout(() => {
					$("#loader").css("left", "-100%");
				}, 1000);
			});
	} else {
		console.error("Stock not found:", searchTerm);
		clearInterval(animateLoader);
		setTimeout(() => {
			$("#loader").css("left", "-100%");
		}, 1000);
	}
}
$("#triggerSearch").click(fetchSymbol);
