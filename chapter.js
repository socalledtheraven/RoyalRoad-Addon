function cleanHTML(html) {
	var parser = new DOMParser();
	console.log("got chapter, parsing");
	var doc = parser.parseFromString(html, "text/html");
	// select all elements between the <hr> tags
	var note1 = doc.querySelectorAll(".author-note-portlet");
	var chapterText = doc.querySelector(".chapter-content");
	var note2 = doc.querySelectorAll(".author-note-portlet");
	var next = doc.querySelector(".nav-buttons");
	var nextLink = "https://www.royalroad.com" + next.children[1].children[0].getAttribute("href");
	// combine the notes and the chapter text
	var chapter = note1[0].outerHTML + note1[1].outerHTML + chapterText.outerHTML + note2[0].outerHTML + note2[1].outerHTML;
	console.log("parsed chapter: " + typeof (chapter) + " " + chapter);
	return [chapter, nextLink];
}

function fixButtons() {
	// grabs the buttons from the bottom of the page and turns the middle one into a "Full Text" button
	console.log("fixing buttons");
	var newButton = document.createElement("div");
	newButton.setAttribute("class", "col-xs-4 col-md-4 col-lg-3 col-lg-offset-2");

    var subButton = document.createElement("a");
    subButton.setAttribute("class", "btn btn-primary col-xs-12");
    subButton.textContent = "Full Text";
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

document.getElementById("runFunction").addEventListener("click", insertNewChapter, false);

async function insertNewChapter() {
	const link = "https://www.royalroad.com/fiction/59918/the-bridge-to-forever-progressionlitrpg/chapter/1073612/chapter-29-the-station";

	var body = document.querySelector(".portlet-body");
	var hr = body.querySelectorAll("hr");

	console.log("getting chapter");
	const response = await fetch(link);
	var html = await response.text();
	var contents = cleanHTML(html);
	var chapter = contents[0];
	var nextLink = contents[1];

	console.log("dsa");
	hr[hr.length - 3].insertAdjacentHTML("afterend", chapter);
}