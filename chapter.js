function cleanHTML(html, i) {
	var parser = new DOMParser();
	console.log("got chapter, parsing");
	var doc = parser.parseFromString(html, "text/html");
	// select all elements between the <hr> tags
	var titles = doc.querySelectorAll(".font-white");
	var title = titles[titles.length - 1].textContent;
	console.log(title);
	var note1 = doc.querySelectorAll(".author-note-portlet")[0];
	var chapterText = doc.querySelector(".chapter-content");
	var note2 = doc.querySelectorAll(".author-note-portlet")[1];
	var next = doc.querySelector(".nav-buttons");
	try {
		if (next.children[1].children[0].getAttribute("href") != null) {
			var nextLink = "https://www.royalroad.com" + next.children[1].children[0].getAttribute("href");
		} else {
			var nextLink = null;
		}
	} catch (e) {
		console.log("no next chapter");
		var nextLink = null;
	}
	// combine the notes and the chapter text
	if (i != 1) {
		if (note1 != null && note2 != null) {
			var chapter = "<hr>" + `<h2 class="font-black">${title}</h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
		} else if (note1 != null) {
			var chapter = "<hr>" + `<h2 class="font-black">${title}</h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML;
		} else if (note2 != null) {
			var chapter = "<hr>" + `<h2 class="font-black">${title}</h2>` + "<hr>" + chapterText.outerHTML + note2.outerHTML;
		} else {
			var chapter = "<hr>" + `<h2 class="font-black">${title}</h2>` + "<hr>" + chapterText.outerHTML;
		}
	} else {
		if (note1 != null && note2 != null) {
			var chapter = `<h2 class="font-black">${title}</h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
		} else if (note1 != null) {
			var chapter = `<h2 class="font-black">${title}</h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML;
		} else if (note2 != null) {
			var chapter = `<h2 class="font-black">${title}</h2>` + "<hr>" + chapterText.outerHTML + note2.outerHTML;
		} else {
			var chapter = `<h2 class="font-black">${title}</h2>` + "<hr>" + chapterText.outerHTML;
		}
	}
	// IMPORTANT: being inserted inside the 'chapter-content', fix
	console.log("parsed chapter:" + chapter);
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
	var chap = document.querySelector(".portlet-body");
	var kids = chap.children;
	console.log(kids);
	console.log(kids[0]);
	for (const el in kids) {
		if (Object.hasOwnProperty.call(kids, el)) {
			kids[el].remove();
		}
	}	
	buttons.remove();
	buttons2.remove();

	console.log(1);
	const storyUrl = "https://www.royalroad.com" + document.querySelector(".margin-bottom-5").getAttribute("href");
	const response = await fetch(storyUrl);
	var html = await response.text();
	var parser = new DOMParser();
	console.log("got homepage");
	var doc = parser.parseFromString(html, "text/html");
	console.log("aaaaaaa")
	var firstChapterLink = "https://www.royalroad.com" + doc.querySelector(".btn-lg").getAttribute("href");
	var nextLink = firstChapterLink;

	// loop through until i hit a 404
	var counter = 0;
	while (nextLink != null && counter < 4) {
		counter++;
		console.log("next link: " + nextLink);
		nextLink = await insertNewChapter(nextLink, counter);
	}
}

async function insertNewChapter(link, i) {
	var body = document.querySelector(".portlet-body");
	var hr = body.querySelectorAll("hr");

	console.log("getting chapter");
	const response = await fetch(link);
	var html = await response.text();
	var contents = cleanHTML(html, i);
	var chapter = contents[0];
	var nextLink = contents[1];

	// console.log(chapter);
	var lastHr = hr[hr.length - 1];
	lastHr.insertAdjacentHTML("beforebegin", chapter);
	console.log("finished inserting chapter");
	return nextLink;
}