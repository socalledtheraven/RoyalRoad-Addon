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
    console.log("parsed chapter: " + typeof(chapter) + " " + chapter);
    return [chapter, nextLink];
}

function fixButtons() {
    var buttons = document.querySelector(".margin-bottom-10");
    var buttons2 = document.querySelector(".nav-buttons")
    var b = buttons.children[1];
    b.removeAttribute("href");
    b.addEventListener("click", function() {
        insertNewChapter();
    });
    b.textContent = "Full Text";
    buttons2.replaceWith(buttons);
}

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

console.log("loaded chapter.js");
fixButtons();