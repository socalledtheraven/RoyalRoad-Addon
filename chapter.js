function cleanHTML(html) {
	var parser = new DOMParser();
	console.log("got chapter, parsing");
	var doc = parser.parseFromString(html, "text/html");
	// select all elements between the <hr> tags
	var titles = doc.querySelectorAll(".font-white");
	var title = titles[titles.length - 1].textContent;
	var note1 = doc.querySelectorAll(".author-note-portlet")[0];
	var chapterText = doc.querySelector(".chapter-content");
	var note2 = doc.querySelectorAll(".author-note-portlet")[1];
	var next = doc.querySelector(".nav-buttons");
	try {
		var nextLink = "https://www.royalroad.com" + next.children[1].children[0].getAttribute("href");
	} catch (e) {
		console.log("no next chapter");
		var nextLink = null;
	}
	// combine the notes and the chapter text
	var chapter = `<h2 class="font-black">${title}</h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
	console.log("parsed chapter");
	return [chapter, nextLink];
}

function fixButtons() {
	// grabs the buttons from the bottom of the page and turns the middle one into a "Full Text" button
	console.log("fixing buttons");
	var newButton = document.createElement("div");
	newButton.setAttribute("class", "col-xs-4 col-md-4 col-lg-3 col-lg-offset-2");

	var subButton = document.createElement("a");
	subButton.setAttribute("class", "btn btn-primary col-xs-12");
	subButton.innerHTML = 'Full <br class="visible-xs-block">Text';
	console.log("button add");
	subButton.setAttribute("id", "runFunction");
	newButton.append(subButton);

	// changes rr's weird button layout to one that's mostly symmetrical
	var b1 = document.querySelector(".col-lg-offset-6");
	b1.classList.remove("col-lg-offset-6");
	b1.classList.remove("col-md-offset-4");
	b1.classList.remove("col-xs-6");
	b1.setAttribute("class", b1.className + " col-lg-offset-1");
	b1.setAttribute("class", b1.className + " col-xs-4");

	var b2 = document.querySelector(".col-xl-2");
	b2.classList.remove("col-xs-6");
	b2.setAttribute("class", b2.className + " col-xs-4");

	b1.insertAdjacentHTML("beforebegin", newButton.outerHTML);
}

console.log("loaded chapter.js");
fixButtons();

console.log("attaching func");
document.getElementById("runFunction").addEventListener("click", function() {
	insertAllChapters();
}, false);

async function insertAllChapters() {
	// get first chapter link
	// grabs from the 'fiction page' button
	var buttons = document.querySelector(".nav-buttons");
	var buttons2 = document.querySelector(".margin-left-0");
	buttons.remove();
	buttons2.remove();
	const storyUrl = document.querySelector(".margin-bottom-5").getAttribute("href");
	const response = await fetch(storyUrl);
	var html = await response.text();
	var parser = new DOMParser();
	console.log("got homepage");
	var doc = parser.parseFromString(html, "text/html");
	var firstChapterLink = doc.querySelector(".btn-lg").getAttribute("href");
	var nextLink = firstChapterLink;

	// loop through until i hit a 404
	while (nextLink != null) {
		nextLink = await insertNewChapter(nextLink);
	}
}

async function insertNewChapter(link) {
	var body = document.querySelector(".portlet-body");
	var hr = body.querySelectorAll("hr");
	var title = document.querySelectorAll(".font-white");
	title = title[title.length - 1].textContent;
	console.log(title);
	hr[0].insertAdjacentHTML("beforebegin", `<h2 class="font-black">${title}</h2>`)

	console.log("getting chapter");
	const response = await fetch(link);
	var html = await response.text();
	var contents = cleanHTML(html);
	var chapter = contents[0];
	var nextLink = contents[1];

	// console.log(chapter);
	var thirdFromLastHr = hr[hr.length - 1];
	console.log(hr);
	thirdFromLastHr.insertAdjacentHTML("afterend", chapter);
	return nextLink;
}