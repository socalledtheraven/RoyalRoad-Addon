function cleanHTML(html, i, link) {
	let parser = new DOMParser();
	console.log("got chapter, parsing");
	let doc = parser.parseFromString(html, "text/html");

	let titles = doc.querySelectorAll(".font-white");
	let title = titles[titles.length - 1].textContent;
	console.log("title of next chapter: " + title);
	let note1 = doc.querySelectorAll(".author-note-portlet")[0];
	let chapterText = doc.querySelector(".chapter-content");
	let note2 = doc.querySelectorAll(".author-note-portlet")[1];
	let next = doc.querySelector(".nav-buttons");

	let commentsContainer = doc.querySelector(".comments-container");
	let comments = commentsContainer.childNodes;

	let numComments = commentsContainer.querySelector(".caption-subject");
	numComments = Number(numComments.textContent.trim().split("(")[1].replace(")", ""));

	// get the next chapter link if it exists
	let nextLink = null;
	try {
		if (next.children[1].children[0].getAttribute("href") != null) {
			nextLink = "https://www.royalroad.com" + next.children[1].children[0].getAttribute("href");
		}
	} catch (e) {
		console.log("no next chapter");
	}

	// combine the notes and the chapter text
	// if the chapter is the first one, don't add a horizontal rule
	let chapter = "";
	if (i !== 1) {
		chapter = "<hr>";
	}

	if (i !== 1) {
		// only add the existing notes
		if (note1 != null && note2 != null) {
			chapter += `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
		} else if (note1 != null) {
			chapter += `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + note1.outerHTML + chapterText.outerHTML;
		} else if (note2 != null) {
			chapter += `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML + note2.outerHTML;
		} else {
			chapter += `<h2 class="font-black"><a href="${link}">${title}</a></h2>` + "<hr>" + chapterText.outerHTML;
		}
	}

	console.log("parsed chapter");
	// turns the html into elements
	let temp = document.createElement("div");
	temp.innerHTML = chapter;
	let chapterContents = temp.children;
	return [chapterContents, nextLink, numComments, comments];
}

function processComments(html) {
	let parser = new DOMParser();
	console.log("got comments, parsing");
	let doc = parser.parseFromString(html, "text/html");

	let comments = doc.querySelectorAll(".comment");
	let commentPages = doc.querySelector(".pagination").children;
	commentPages = commentPages[commentPages.length - 1].children[0].getAttribute("href");
	commentPages = commentPages[commentPages.length - 1];
	// for ()
	// let nextLink =
}

function fixButtons() {
	// grabs the buttons from the bottom of the page and turns the middle one into a "Full Text" button
	console.log("fixing buttons");

	let buttonGroup = document.querySelector(".nav-buttons");
	let buttons = buttonGroup.querySelectorAll("div");
	buttonGroup.classList.add("margin-bottom-10");
	buttonGroup.classList.add("margin-left-0");
	buttonGroup.classList.add("margin-right-0");

	// fixes both default buttons
	for (const element of buttons) {
		let b = element;
		let link = b.children[0];
		b.insertAdjacentElement("afterend", link);
		b.remove();
		link.classList.remove("col-xs-12");
		link.setAttribute("class", link.className + " col-xs-4");
	}

	// add the new button
	let newButton = document.createElement("a");
	newButton.setAttribute("class", "btn btn-primary col-xs-4");
	newButton.innerHTML = 'Full <br class="visible-xs-block">Text';
	newButton.setAttribute("id", "runFunction");

	// uses the same formatting as the bottom page buttons
	buttons = buttonGroup.children;
	let b1 = buttons[0];
	b1.insertAdjacentElement("afterend", newButton);
	console.log("button addded");
}

function prepPage() {
	// removes all the original elements from the page
	try {
		let rewindContainer = document.querySelector("#rewind-container");
		rewindContainer.remove();
	} catch (e) {
		console.log("not signed in");
	}

	let newTitle = document.title.split(" - ");
	newTitle = newTitle[newTitle.length - 1];
	document.title = newTitle;

	let bod = document.querySelector(".portlet-body");
	let buttons = bod.querySelector(".nav-buttons");
	let buttons2 = bod.querySelectorAll(".margin-left-0")[1];
	let chap = bod.querySelector(".chapter-content");
	let ad = bod.querySelector("h6.text-center");
	let adz = bod.querySelectorAll(".wide");
	let notes = bod.querySelectorAll(".author-note-portlet");
	let comments = document.querySelector(".comment-container");

	try {
		let supportNote = bod.querySelector("#donate");
		supportNote.remove();
	} catch (e) {
		console.log("mobile");
	}

	try {
		let support = bod.querySelector("h5.margin-bottom-20");
		support.remove();
	} catch (e) {
		console.log("mobile");
	}

	try {
		let supportBar = bod.querySelectorAll(".row")[1];
		supportBar.remove();
	} catch (e) {
		console.log("mobile");
	}

	let hrs = bod.querySelectorAll("hr");
	let title = document.querySelector("h1.font-white");


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
	for (let i = 0; i < hrs.length - 1; i++) {
		hrs[i].remove();
	}
	title.remove();
	comments.remove();

	console.log("removed initial elements");
}

async function insertNewChapter(link, i, isStartingChapter, numComments) {
	let body = document.querySelector(".portlet-body");
	let hr = body.querySelectorAll("hr");

	// gets the actual chapter text
	console.log("getting chapter");

	let response = await fetch(link);
	let html = await response.text();

	let contents = cleanHTML(html, i, link);
	let chapterContents = contents[0];
	let nextLink = contents[1];
	numComments += contents[2];

	let commentsLink = link.split("/");
	commentsLink = commentsLink[0] + "//" + commentsLink[2] + "/" + commentsLink[3] + "/" + commentsLink[6] + "/" + commentsLink[7] + "/" + "comments/1";
	response = await fetch(commentsLink);
	html = await response.text();
	processComments(html);

	// inserts the chapter (you have to do some bs to avoid the removal from the array)
	let lastHr = hr[hr.length - 1];
	let l = chapterContents.length;

	let startChap;
	for (let i = 0; i < l; i++) {
		let elem = chapterContents[0];
		// scrolls to the right chapter automatically
		if (isStartingChapter) {
			startChap = elem;
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
	let html = await response.text();
	let parser = new DOMParser();
	console.log("got homepage");
	let doc = parser.parseFromString(html, "text/html");
	// grabs from chapter link
	let chaps = doc.querySelector("#chapters");
	let firstRow = chaps.children[1].children[0].children[0];
	let firstChapterLink = "https://www.royalroad.com" + firstRow.children[0].getAttribute("href");
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

	let nextLink = await getFirstChapterLink();
	let startingLink = window.location.href;

	// loop through until i hit a 404
	let counter = 0;
	let startingChap = false;
	let totalComments = 0;
	while (nextLink != null) {
		counter++;
		startingChap = nextLink === startingLink;
		let contents = await insertNewChapter(nextLink, counter, startingChap, totalComments);
		nextLink = contents[0];
		totalComments = contents[1];
	}

	// change the comment number
	let commentNum = document.querySelectorAll(".caption-subject");
	commentNum[commentNum.length - 1].innerHTML = "Comments(" + totalComments + ")";
	console.log("end of story");
}

// https://www.royalroad.com/fiction/chapter/1035863/comments/1 USE FOR COMMENTRS