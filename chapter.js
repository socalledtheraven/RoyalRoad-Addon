function cleanHTML(html, i) {
	var parser = new DOMParser();
	console.log("got chapter, parsing");
	var doc = parser.parseFromString(html, "text/html");

	var titles = doc.querySelectorAll(".font-white");
	var title = titles[titles.length - 1].textContent;
	console.log("title of next chapter: " + title);
	var note1 = doc.querySelectorAll(".author-note-portlet")[0];
	var chapterText = doc.querySelector(".chapter-content");
	var note2 = doc.querySelectorAll(".author-note-portlet")[1];
	var next = doc.querySelector(".nav-buttons");

	// get the next chapter link if it exists
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
	// if the chapter is the first one, don't add a horizontal rule
	if (i != 1) {
		// only add the existing notes
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
		// only add the existing notes
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

	console.log("parsed chapter");
	// turns the html into elements
	var temp = document.createElement("div");
	temp.innerHTML = DOMPurify.sanitize(chapter);
	chapterContents = temp.children;
	return [chapterContents, nextLink];
}

function fixButtons() {
	// grabs the buttons from the bottom of the page and turns the middle one into a "Full Text" button
	console.log("fixing buttons");
	
	var buttonGroup = document.querySelector(".nav-buttons");
	var buttons = buttonGroup.querySelectorAll("div");
	buttonGroup.classList.add("margin-bottom-10");
	buttonGroup.classList.add("margin-left-0");
	buttonGroup.classList.add("margin-right-0");

	// fixes both default buttons
	for (var i = 0; i < buttons.length; i++) {
		var b = buttons[i];
		var link = b.children[0];
		b.insertAdjacentElement("afterend", link);
		b.remove();
		link.classList.remove("col-xs-12");
		link.setAttribute("class", link.className + " col-xs-4");
	}

	// add the new button
	var newButton = document.createElement("a");
	newButton.setAttribute("class", "btn btn-primary col-xs-4");
	newButton.innerHTML = 'Full <br class="visible-xs-block">Text';
	newButton.setAttribute("id", "runFunction");

	// uses the same formatting as the bottom page buttons
	var buttons = buttonGroup.children;
	var b1 = buttons[0];
	b1.insertAdjacentElement("afterend", newButton);
	console.log("button addded");
}

function removeInitialElements() {
	// removes all the original elements from the page
	try {
		var rewindContainer = document.querySelector("#rewind-container");
		rewindContainer.remove();
	} catch (e) {
		console.log("not signed in");
	}
	var bod = document.querySelector(".portlet-body");
	var buttons = bod.querySelector(".nav-buttons");
	var buttons2 = bod.querySelectorAll(".margin-left-0")[1];
	console.log(buttons2);
	var chap = bod.querySelector(".chapter-content");
	var ad = bod.querySelector("h6.text-center");
	var adz = bod.querySelectorAll(".wide");
	var notes = bod.querySelectorAll(".author-note-portlet");
	try {
		var supportNote = bod.querySelector("#donate");
		supportNote.remove();
	} catch (e) {
		console.log("mobile");
	}
	
	try {
		var support = bod.querySelector("h5.margin-bottom-20");
		support.remove();
	} catch (e) {
		console.log("mobile");
	}

	try {
		var supportBar = bod.querySelectorAll(".row")[1];
		supportBar.remove();
	} catch (e) {
		console.log("mobile");
	}

	var hrs = bod.querySelectorAll("hr");
	var title = document.querySelector("h1.font-white");

	
	buttons.remove();
	buttons2.remove();
	chap.remove();
	ad.remove();
	adz.forEach(function(e) {
		e.remove();
	});
	notes.forEach(function(e) {
		e.remove();
	});
	// remove all the hr tags except the last one
	for (var i = 0; i < hrs.length - 1; i++) {
		hrs[i].remove();
	}
	title.remove();
	
	console.log("removed initial elements");
}

async function insertNewChapter(link, i) {
	var body = document.querySelector(".portlet-body");
	var hr = body.querySelectorAll("hr");

	// gets the actual chapter text
	console.log("getting chapter");
	const response = await fetch(link);
	var html = await response.text();
	var contents = cleanHTML(html, i);
	var chapterContents = contents[0];
	var nextLink = contents[1];

	// inserts the chapter (you have to do some bs to avoid the removal from the array)
	var lastHr = hr[hr.length - 1];
	var l = chapterContents.length;
	for (var i = 0; i < l; i++) {
		var elem = chapterContents[0];
		lastHr.insertAdjacentElement("beforebegin", elem);
	}

	console.log("finished inserting chapter");
	return nextLink;
}

async function getFirstChapterLink() {
	// gets the link to the first chapter of the story via the fiction page button and the start reading button
	const storyUrl = "https://www.royalroad.com" + document.querySelector(".margin-bottom-5").getAttribute("href");
	const response = await fetch(storyUrl);
	var html = await response.text();
	var parser = new DOMParser();
	console.log("got homepage");
	var doc = parser.parseFromString(html, "text/html");
	// start reading button grab
	var firstChapterLink = "https://www.royalroad.com" + doc.querySelector(".btn-lg").getAttribute("href");
	console.log("got first chapter link");
	return firstChapterLink;
}

console.log("loaded chapter.js");
fixButtons();

console.log("attaching func");
document.getElementById("runFunction").addEventListener("click", function() {
	insertAllChapters();
}, false);
console.log("attached func");

// this function needs to be below for reasons of attaching the event listener
async function insertAllChapters() {
	// removes all the normal chapter content
	removeInitialElements();

	var nextLink = await getFirstChapterLink();

	// loop through until i hit a 404
	var counter = 0;
	while (nextLink != null) {
		counter++;
		nextLink = await insertNewChapter(nextLink, counter);
	}
	
	console.log("end of story");
}