function cleanHTML(html, i, link) {
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

	var commentsContainer = doc.querySelector(".comments-container");
	var comments = commentsContainer.childNodes;

	var numComments = commentsContainer.querySelector(".caption-subject");
	numComments = Number(numComments.textContent.trim().split("(")[1].replace(")", ""));

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
			var chapter = "<hr>" + `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
		} else if (note1 != null) {
			var chapter = "<hr>" + `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML;
		} else if (note2 != null) {
			var chapter = "<hr>" + `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML + note2.outerHTML;
		} else {
			var chapter = "<hr>" + `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML;
		}
	} else {
		// only add the existing notes
		if (note1 != null && note2 != null) {
			var chapter = `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
		} else if (note1 != null) {
			var chapter = `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML;
		} else if (note2 != null) {
			var chapter = `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML + note2.outerHTML;
		} else {
			var chapter = `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML;
		}
	}

	console.log("parsed chapter");
	// turns the html into elements
	var temp = document.createElement("div");
	temp.innerHTML = chapter;
	chapterContents = temp.children;
	return [chapterContents, nextLink, numComments, comments];
}

function processComments(html) {
	var parser = new DOMParser();
	console.log("got comments, parsing");
	var doc = parser.parseFromString(html, "text/html");

	var comments = doc.querySelectorAll(".comment");
	var commentPages = doc.querySelector(".pagination").childNodes;
	commentPages = 
	for (i)
	var nextLink = 
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

function prepPage() {
	// removes all the original elements from the page
	try {
		var rewindContainer = document.querySelector("#rewind-container");
		rewindContainer.remove();
	} catch (e) {
		console.log("not signed in");
	}

	var newTitle = document.title.split(" - ");
	newTitle = newTitle[newTitle.length - 1];
	document.title = newTitle;

	var bod = document.querySelector(".portlet-body");
	var buttons = bod.querySelector(".nav-buttons");
	var buttons2 = bod.querySelectorAll(".margin-left-0")[1];
	var chap = bod.querySelector(".chapter-content");
	var ad = bod.querySelector("h6.text-center");
	var adz = bod.querySelectorAll(".wide");
	var notes = bod.querySelectorAll(".author-note-portlet");
	var comments = document.querySelector(".comment-container");

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
	comments.remove();
	
	console.log("removed initial elements");
}

async function insertNewChapter(link, i, isStartingChapter, numComments) {
	var body = document.querySelector(".portlet-body");
	var hr = body.querySelectorAll("hr");

	// gets the actual chapter text
	console.log("getting chapter");
	
	var response = await fetch(link);
	var html = await response.text();

	var commentsLink = link.split("/");
	commentsLink = commentsLink[0] + "//" + commentsLink[2] + "/" + commentsLink[3] + "/" + commentsLink[6] + "/" + commentsLink[7] + "/" + "comments/1";
	response = await fetch(commentsLink);
	html = await response.text();
	var comments = processAllComments(html);

	var contents = cleanHTML(html, i, link);
	var chapterContents = contents[0];
	var nextLink = contents[1];
	numComments += contents[2];

	// inserts the chapter (you have to do some bs to avoid the removal from the array)
	var lastHr = hr[hr.length - 1];
	var l = chapterContents.length;
	var startChap = null;

	for (var i = 0; i < l; i++) {
		var elem = chapterContents[0];
		// scrolls the the right chapter automatically
		if (isStartingChapter && startChap == null) {
			var startChap = elem;
		}
		lastHr.insertAdjacentElement("beforebegin", elem);
	}

	if (isStartingChapter) {
		startChap.scrollIntoView();
	}
	
	console.log("finished inserting chapter");
	return [nextLink, numComments];
}

async function getFirstChapterLink() {
	// gets the link to the first chapter of the story via the fiction page button and the start reading button
	const storyUrl = "https://www.royalroad.com" + document.querySelector(".margin-bottom-5").getAttribute("href");
	const response = await fetch(storyUrl);
	var html = await response.text();
	var parser = new DOMParser();
	console.log("got homepage");
	var doc = parser.parseFromString(html, "text/html");
	// grabs from chapter link
	var chaps = doc.querySelector("#chapters");
	var firstRow = chaps.children[1].children[0].children[0];
	var firstChapterLink = "https://www.royalroad.com" + firstRow.children[0].getAttribute("href");
	console.log("got first chapter link");
	return firstChapterLink;
}

console.log("loaded chapter.js");
fixButtons();

document.getElementById("runFunction").addEventListener("click", function() {
	insertAllChapters();
}, false);
console.log("attached func");

// this function needs to be below for reasons of attaching the event listener
async function insertAllChapters() {
	// removes all the normal chapter content
	prepPage();

	var nextLink = await getFirstChapterLink();
	var startingLink = window.location.href;

	// loop through until i hit a 404
	var counter = 0;
	var startingChap = false;
	var totalComments = 0;
	while (nextLink != null) {
		counter++;
		if (nextLink == startingLink) {
			startingChap = true;
		} else {
			startingChap = false;
		}
		contents = await insertNewChapter(nextLink, counter, startingChap, totalComments);
		nextLink = contents[0];
		totalComments = contents[1];
	}

	// change the comment number
	var commentNum = document.querySelectorAll(".caption-subject");
	commentNum[commentNum.length - 1].innerHTML = "Comments(" + totalComments + ")";
	console.log("end of story");
}

// https://www.royalroad.com/fiction/chapter/1035863/comments/1 USE FOR COMMENTRS