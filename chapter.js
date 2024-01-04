function cleanHTML(html, i, link) {
	let parser = new DOMParser();
	console.log("got chapter, parsing");
	let doc = parser.parseFromString(html, "text/html");
	doc = doc.querySelector(".chapter-page");

	let titles = doc.querySelectorAll(".font-white");
	let title = titles[titles.length - 1].textContent;
	console.log("title of next chapter: " + title);
	let note1;
	let note2;
	let note = doc.querySelector(".author-note-portlet");
	if (doc.querySelectorAll(".author-note-portlet").length > 1) {
		console.log("more than one note");
		note1 = doc.querySelectorAll(".author-note-portlet")[0];
		note2 = doc.querySelectorAll(".author-note-portlet")[1];
	} else if (doc.querySelectorAll(".author-note-portlet").length === 0) {
		console.log("no notes");
	} else {
		console.log("only one note");
		if (note.compareDocumentPosition(doc.querySelector(".chapter-content")) & Node.DOCUMENT_POSITION_FOLLOWING) {
			console.log("note is before chapter text");
			note1 = note;
		} else {
			console.log("note is after chapter text");
			note2 = note;
		}
	}
	let chapterText = doc.querySelector(".chapter-content");

	let spoilers = doc.querySelectorAll(".spoiler-new");
	for (const spoiler of spoilers) {
		let parent = spoiler.parentNode;

		let spoilerCopy = document.createElement("div");
		spoilerCopy.setAttribute("class", "spoiler-inner");
		spoilerCopy.setAttribute("data-class", "spoiler-inner");
		spoilerCopy.setAttribute("style", "display: none;");
		spoilerCopy.innerHTML = spoiler.innerHTML;

		let spoilerDisplay = document.createElement("div");
		spoilerDisplay.setAttribute("class", "smalltext");
		spoilerDisplay.setAttribute("style", "margin-bottom: 2px;");
		spoilerDisplay.innerHTML = '<strong>Spoiler</strong> <input class="spoilerButton btn btn-default btn-xs" type="button" value="Show" data-class="spoilerButton">'

		let spoilerWrapper1 = document.createElement("div");
		spoilerWrapper1.setAttribute("class", "spoilerContent");
		spoilerWrapper1.setAttribute("data-class", "spoilerContent");
		spoilerWrapper1.appendChild(spoilerCopy);
		
		let spoilerWrapper2 = document.createElement("div");
		spoilerWrapper2.setAttribute("class", "spoiler");
		spoilerWrapper2.setAttribute("data-class", "spoiler");
		spoilerWrapper2.setAttribute("data-caption", "Spoiler");
		spoilerWrapper2.appendChild(spoilerDisplay);
		spoilerWrapper2.appendChild(spoilerWrapper1);

		parent.replaceChild(spoilerWrapper2, spoiler);
	}

	let poll = doc.querySelector(".portlet .light");
	let next = doc.querySelector(".nav-buttons");

	let commentsContainer = doc.querySelector(".comments-container");
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

	// only add the existing notes
	if ((note1 != null) && (note2 != null) && (poll != null)) {
		chapter += `<h2 class="font-black"><a id="chapter-title" href="${link}">${title}</a></h2><hr>` + note1.outerHTML + chapterText.outerHTML + note2.outerHTML + poll.outerHTML + `<a id='chapter-title' href="${link}"></a>` + `<hr>`;
	} else if (note1 != null) {
		chapter += `<h2 class="font-black"><a id="chapter-title" href="${link}">${title}</a></h2><hr>` + note1.outerHTML + chapterText.outerHTML + `<a id='chapter-title' href="${link}"></a>` + `<hr>`;
	} else if (note2 != null) {
		chapter += `<h2 class="font-black"><a id="chapter-title" href="${link}">${title}</a></h2><hr>` + chapterText.outerHTML + note2.outerHTML + `<a id='chapter-title' href="${link}"></a>` + `<hr>`;
	} else if (poll != null) {
		chapter += `<h2 class="font-black"><a id="chapter-title" href="${link}">${title}</a></h2><hr>` + chapterText.outerHTML + poll.outerHTML + `<a id='chapter-title' href="${link}"></a>` + `<hr>`;
	} else {
		chapter += `<h2 class="font-black"><a id="chapter-title" href="${link}">${title}</a></h2><hr>` + chapterText.outerHTML + `<a id='chapter-title' href="${link}"></a>` + `<hr>`;
	}

	// turns the html into elements
	let temp = document.createElement("div");
	temp.innerHTML = chapter;
	let chapterContents = Array.from(temp.children);
	return [chapterContents, nextLink, numComments, title];
}

function splitArray(array, chunkSize) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

function getComments(html, chapTitle) {
	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");
	let bod = doc.querySelector("body");

	for (const text of bod.querySelectorAll("small")) {
		text.innerHTML = chapTitle + " - " + text.innerHTML;
	}
	// get only the elements with the class "comment"
	return Array.prototype.slice.call(Array.from(bod.childNodes).filter((element) => {
		return element.className === "comment";
	}));
}

async function processComments(html, chapTitle) {
	let parser = new DOMParser();
	console.log("got comments, parsing");
	let doc = parser.parseFromString(html, "text/html");

	let nextLink;
	let nextComments;
	let comments = Array.from(getComments(html, chapTitle));
	try {
		let commentPages = doc.querySelector(".pagination")
			.querySelectorAll("li");
		commentPages = Array.prototype.slice.call(commentPages, 0, commentPages.length - 2);
		for (const page of commentPages) {
			nextLink = "https://www.royalroad.com" + page.firstChild.getAttribute("href");

			let response = await fetch(nextLink);
			let htm = await response.text();

			nextComments = getComments(htm);
			comments = comments.concat(nextComments);
		}
	} catch (e) {
		console.log("less than 10 comments");
	}

	return comments;
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
	console.log("button added");
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
	let adz = bod.querySelectorAll(".t-center");
	let notes = bod.querySelectorAll(".author-note-portlet");
	let comments = document.querySelector(".comment-container").children;

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

	try {
		let poll = bod.querySelector(".portlet .light");
		poll.remove();
	} catch (e) {
		console.log("no poll");
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
	// use l as a variable to get around the removal of things while iterating
	// use 0 instead of i because the first element is the one that is always deleted for some reason
	let l = hrs.length;
	for (let i = 0; i < l; i++) {
		hrs[0].remove();
	}
	title.remove();

	let c = comments.length;
	for (let i = 0; i < c; i++) {
		comments[0].remove();
	}

	console.log("removed initial elements");
}

async function insertNewChapter(link, i, isStartingChapter) {
	let body = document.querySelector(".portlet-body");
	let hr = body.querySelectorAll("hr");

	// gets the actual chapter text
	console.log("getting chapter");

	let response1 = await fetch(link);
	let html1 = await response1.text();

	let contents = cleanHTML(html1, i, link);
	// appends the comments to the chapter contents

	let chapterContents = contents[0];
	let nextLink = contents[1];
	let numComments = contents[2];
	let title = contents[3];

	// inserts the chapter (you have to do some bs to avoid the removal from the array)
	let lastHr = hr[hr.length - 1];
	let l = chapterContents.length;

	let startChap;
	for (let i = 0; i < l; i++) {
		let elem = chapterContents[i];
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

	let commentsLink = link.split("/");
	commentsLink = commentsLink[0] + "//" + commentsLink[2] + "/" + commentsLink[3] + "/" + commentsLink[6] + "/" + commentsLink[7] + "/comments";
	let response2 = await fetch((commentsLink + "/1"));
	let html2 = await response2.text();
	let comments = await processComments(html2, title);

	console.log("finished processing comments");

	return [nextLink, numComments, comments];
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

function fullPaginationGen(fullComments) {
	let pagination = document.createElement("ul");
	pagination.setAttribute("class", "pagination justify-content-center");
	for (let i = 0; i < fullComments.length; i++) {
		// create a <li> element
		let li = document.createElement("li");
		if (i === 0) {
			li.setAttribute("class", "page-active");
		}

		// set the text of the <li> element to the value in the array
		let a = document.createElement("a");
		a.setAttribute("data-page", i+1);
		a.textContent = i+1;
		a.addEventListener("click", function() {
			loadCommentsPage(fullComments, i);
		});
		// append the <li> element to the <ul> element
		li.appendChild(a);

		pagination.appendChild(li);
	}

	return pagination;
}

function createButton(name, fullComments, page) {
	let button = document.createElement("li");
	button.appendChild(document.createElement("a"));
	button.children[0].setAttribute("data-page", page+1);
	button.children[0].textContent = name;
	button.children[0].addEventListener("click", function () {
		console.log("clicked first page");
		loadCommentsPage(fullComments, page);
	});

	return button;
}

function updatePagination(currentPage, fullComments) {
	const fullPagination = fullPaginationGen(fullComments);
	for (const page of fullPagination.childNodes) {
		if (page.hasAttribute("class")) {
			page.removeAttribute("class");
		}
	}

	fullPagination.childNodes[currentPage].setAttribute("class", "page-active");

	let firstButton = createButton("« First", fullComments, 0);

	let last = fullPagination.children.length - 1;

	let lastButton = createButton("Last »", fullComments, last);

	let nextButton = createButton("Next ›", fullComments, currentPage+1);

	let prevButton = createButton("‹ Previous", fullComments, currentPage-1);

	if (currentPage === 0) {
		const children = fullPagination.querySelectorAll("[data-page]");
		children.forEach(child => {
		if (child.getAttribute("data-page") > 5) {
			child.remove();
		}
		});
		
		fullPagination.append(nextButton);
		fullPagination.append(lastButton);

	} else if (currentPage === 1) {
		const children = fullPagination.querySelectorAll("[data-page]");
		children.forEach(child => {
			if (child.getAttribute("data-page") > 5) {
				child.remove();
			}
		});

		fullPagination.prepend(firstButton);
		fullPagination.append(nextButton);
		fullPagination.append(lastButton);

	} else if (currentPage === last-1) {
		console.log("penultimate chapter of the story");
		const children = fullPagination.querySelectorAll("[data-page]");
		children.forEach(child => {
			if (child.getAttribute("data-page") < last-2) {
				child.remove();
			}
		});

		fullPagination.prepend(prevButton);
		fullPagination.prepend(firstButton);
		fullPagination.append(lastButton);

	} else if (currentPage === last) {
		console.log("last chapter of the story");
		const children = fullPagination.querySelectorAll("[data-page]");
		children.forEach(child => {
			if (child.getAttribute("data-page") < last-1) {
				child.remove();
			}
		});

		fullPagination.prepend(prevButton);
		fullPagination.prepend(firstButton);

	} else {
		const children = fullPagination.querySelectorAll("[data-page]");
		children.forEach(child => {
            // deletes every page NOT between the 2 pages either side of the current page
			if (!(currentPage-1 <= child.getAttribute("data-page") && child.getAttribute("data-page") <= currentPage+3)) {
				child.remove();
			}
		});
		fullPagination.prepend(prevButton);
		fullPagination.prepend(firstButton);
		fullPagination.append(nextButton);
		fullPagination.append(lastButton);
	}

	return fullPagination;
}

function loadCommentsPage(splitComments, currentPage) {
	// removes the old comments
	let commentBody = document.querySelector(".comment-container");
	while (commentBody.firstChild) {
		commentBody.removeChild(commentBody.firstChild);
	}

	console.log("current page is " + currentPage);
	let comments = splitComments[currentPage];

	// adds the new comments
	for (const comment of comments) {
		commentBody.appendChild(comment);
	}

	// adds the new pagination
    console.log("new page = " + currentPage);
	let wrapper1 = document.createElement("div");
	wrapper1.setAttribute("class", "text-center");

	let wrapper2 = document.createElement("div");
	wrapper2.setAttribute("class", "text-center chapter-nav");

	let fullPagination = updatePagination(currentPage, splitComments);
	wrapper1.appendChild(fullPagination);
	wrapper2.appendChild(wrapper1);

	comments[comments.length-1].insertAdjacentElement("afterend", wrapper2);
}

async function scrollHandling() {
	// Create a new Intersection Observer instance
	const observer = new IntersectionObserver(handleIntersection);

	// Observe all title tags and the previous hr tag to track the going backward bit
	document.querySelectorAll('#chapter-title').forEach(title => observer.observe(title));
}

async function handleIntersection(entries) {
	// Find the <a> tag that is currently visible
	const visibleLink = entries.find(entry => entry.isIntersecting).target.href;

	// If a visible <a> tag was found, update the URL
	if (visibleLink) {
		history.replaceState(null, null, visibleLink);
		await updateChapterProgress(visibleLink);
	}
}

async function updateChapterProgress(url) {
	let response = await fetch(url);
	let html = await response.text();
	console.log("loaded");
	clickButton(html);
}

function clickButton(html) {
	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");

	const button = doc.querySelector('form.rewind-form');
	console.log("button got");

	button.click();
}

console.log("loaded chapter.js");
window.addEventListener("load", function() {
	console.log("loaded");
	if (localStorage.getItem(window.location.href + "fullTextLoaded") === "true") {
		console.log("preloaded");
		insertAllChapters().then(function () {
			console.log("scrolling to " + localStorage.getItem("previousScrollY"));
			window.scrollTo(0, Number.parseInt(localStorage.getItem("previousScrollY")));
		});
	}
});

window.addEventListener("beforeunload", function() {
	localStorage.setItem("previousScrollY", window.scrollY);
});

fixButtons();

document.getElementById("runFunction").addEventListener("click", function() {
	insertAllChapters();
}, false);


// this function needs to be below for reasons of attaching the event listener
async function insertAllChapters() {
	localStorage.setItem(window.location.href + "fullTextLoaded", true);
	// removes all the normal chapter content
	prepPage();

	// makes the light grey slightly transparent overlay
	let overlay = document.createElement("div");
	overlay.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
	overlay.style.position = "fixed";
	overlay.style.width = "100%";
	overlay.style.height = "100%";
	overlay.style.top = "0%";
	overlay.style.left = "0%";

	let loadingText = document.createElement("h1");
	loadingText.style.position = "fixed";
	loadingText.style.top = "40%";
	loadingText.style.left = "50%";
	loadingText.style.transform = "translate(-50%, -50%)";
	loadingText.style.fontSize = "36px";
	loadingText.style.color = "white";
	loadingText.style.padding = "20px";
	loadingText.style.borderRadius = "10px";
	loadingText.style.textAlign = "center";
	loadingText.textContent = "Loading...";

	let loadingAnimation = document.createElement("div");
	loadingAnimation.style.position = "fixed";
	loadingAnimation.style.top = "48%";
	loadingAnimation.style.left = "49.5%";
	loadingAnimation.style.transform = "translate(-50%)";
	loadingAnimation.setAttribute("class", "sk-spinner sk-spinner-wandering-cubes");

	let cube1 = document.createElement("div");
	cube1.setAttribute("class", "sk-cube1");

	let cube2 = document.createElement("div");
	cube2.setAttribute("class", "sk-cube2");

	loadingAnimation.appendChild(cube1);
	loadingAnimation.appendChild(cube2);
	// get the loading animation from the raw js like the load method.

	document.body.appendChild(overlay);
	document.body.appendChild(loadingText);
	document.body.appendChild(loadingAnimation);

	let nextLink = await getFirstChapterLink();
	let startingLink = window.location.href;

	// loop through until I hit a 404
	let counter = 0;
	let startingChap = false;
	let totalComments = 0;
	let fullComments = [];
	while (nextLink != null) {
		counter++;
		startingChap = nextLink === startingLink;
		let contents = await insertNewChapter(nextLink, counter, startingChap);
		if (startingChap) {
			let parent = document.createElement("div");
			parent.style.display = "flex";
			parent.style.alignItems = "center";
			parent.style.justifyContent = "space-between";

			overlay.style.width = "100%";
			overlay.style.height = "5em";
			overlay.style.top = "3%";
			overlay.style.left = "0%";
			overlay.style.alignSelf = "center";

			loadingText.style.top = "4%";
			loadingText.style.color = "white";
			loadingText.style.fontSize = "36px";
			loadingText.style.textAlign = "center";
			loadingText.style.marginInline = "-1em";
			parent.appendChild(loadingText);

			loadingAnimation.style.top = "4%";
			loadingAnimation.style.marginInline = "5em";

			parent.appendChild(loadingAnimation);
			overlay.appendChild(parent);
			document.body.appendChild(overlay);
		}
		nextLink = contents[0];
		totalComments += contents[1];
		fullComments = fullComments.concat(contents[2]);
	}

	// change the comment number - it's inconsistent with the length of the array bc subcomments are counted
	let commentNum = document.querySelectorAll(".caption-subject");
	commentNum[commentNum.length - 1].innerHTML = "Comments (" + totalComments + ")";

    let splitComments = splitArray(fullComments, 10);
    console.log(fullComments.length + " comments for whole story");

	loadCommentsPage(splitComments, 0);

	console.log("end of story");

	localStorage.setItem(window.location.href + "fullComments", JSON.stringify(fullComments));
	let story = document.querySelector(".portlet-body");
	localStorage.setItem(window.location.href + "story", story);
	// remove the overlay
	overlay.remove();
	loadingText.remove();
	loadingAnimation.remove();

	await scrollHandling();
}
