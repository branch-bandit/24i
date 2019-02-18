"use strict";

var key = 'AIzaSyCWna-EvQXjj1zmS6Py68VWspDVawgX2Oo';
var cx = '013472942050254864221:clmdw2kumiq';
var term;
var webSearchURL;
var imgSearchURL;
var imgSearchSecondQueryURL;
var webResults = [];
var amountOfPages;
var requestHadError;
var currentPage = 1;

var clearSection = function(sectionId) {
	document.getElementById(sectionId).innerHTML = '';
}	

var clearSearchInput = function() {
	document.getElementById('google-search').value = '';

}

var runSearch = function() {
	event.preventDefault();

	requestHadError = false;
	term = document.getElementById('google-search').value;
	webSearchURL = 'https://www.googleapis.com/customsearch/v1?key=' + key + '&cx=' + cx + '&q=' + term;
	imgSearchURL = 'https://www.googleapis.com/customsearch/v1?key=' + key + '&cx=' + cx + '&searchType=image' + '&q=' + term;
	imgSearchSecondQueryURL = 'https://www.googleapis.com/customsearch/v1?key=' + key + '&cx=' + cx + '&num=2&start=11&searchType=image' + '&q=' + term;

	if (term !== '' && term !== 'Search...') {
		clearSection('web-results-list');
		clearSection('web-results-pagination');
		clearSection('image-list');
		clearSearchInput();

		// google API has a limit of 10 results per page, so 3 requests are needed to make it look like the mock-up
		googleSearchRequest(webSearchURL, pushWebResults);
		googleSearchRequest(imgSearchURL, renderImgResults);
		googleSearchRequest(imgSearchSecondQueryURL, renderImgResults);
	} else {
		alert('Error: no search term');
	}
}

function googleSearchRequest(searchURL, resultFunction) {
	var req = new XMLHttpRequest();
	var jsonResponse;

	var parseResponse = function() {
		jsonResponse = JSON.parse(req.responseText);
	}

	req.overrideMimeType('application/json');
	req.open('GET', searchURL, true);
	req.send(null);

	req.onreadystatechange = function() {
		if (req.readyState == XMLHttpRequest.DONE) {
			if (req.status == 200) {
				parseResponse();
				resultFunction(jsonResponse);
			} else {
				parseResponse();
				// this is to avoid showing 3 alerts in a row
				if (requestHadError === false) {
					alert('Error: ' + jsonResponse.error.code + ' ' + jsonResponse.error.message);
					requestHadError = true;
				}
			}
		}
	}
	req.open('GET', searchURL, true);
	req.send();
}

var pushWebResults = function(results) {
	amountOfPages = (results.items.length + 1) / 3;
	var i;

	for (i = 0; i < results.items.length; i++) {
		var itemBody = '<li class="web-result-item"><a class="web-result-link" href="' + results.items[i].link + '" target="_blank"><h1 class="web-result-title">' + results.items[i].htmlTitle + '</h1><p class="web-result-url">' + results.items[i].link + '</p><p class="web-result-snippet">' + results.items[i].snippet + '</p></a1></li>';
		webResults.push(itemBody);
	}
	for (i = 1; i <= amountOfPages; i++) {
		document.getElementById('web-results-pagination').innerHTML += '<span class="page-number" id="page-number-' + i + '" onclick="renderPage(' + i + ', webResults)">' + i + '</span>' + ' ';
	}

	renderPage(1, webResults);
}

var renderPage = function(pageNr, resultsInHTML) {
	// to change highlighted page number while rendering new page
	document.getElementById('page-number-' + currentPage).innerHTML = currentPage;
	document.getElementById('page-number-' + pageNr).innerHTML = '<b><u>' + pageNr + '</u></b>';
	currentPage = pageNr;
	
	clearSection('web-results-list');
	var start = 0 + 4 * (pageNr - 1);
	var end = start + 4;
	var pageResults = resultsInHTML.slice(start, end);
	renderWebResults(pageResults);
}

var renderWebResults = function(itemsToRender) {
	var i;
	for (i = 0; i < itemsToRender.length; i++) {
		renderItem(itemsToRender[i], 'web-results-list');
	}
}

var renderImgResults = function(results) {
	var i;
	for(i = 0; i < results.items.length; i++) {
		var itemBody = '<a href="' + results.items[i].image.contextLink + '"><img class="image-item"  src="' + results.items[i].link + '" target="_blank" /></a>';
		renderItem(itemBody, 'image-list');
	}
}

var renderItem = function(itemHTML, divName) {
	document.getElementById(divName).innerHTML += itemHTML;
}
