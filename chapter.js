var buttons = document.querySelector(".margin-bottom-10");
var buttons2 = document.querySelector(".nav-buttons")
var b = buttons.children[1];
b.removeAttribute("href");
b.setAttribute("run", "nex");

buttons2.replaceWith(buttons);

// gets the next chapter with async
function nextChapter(link) {
    fetch(link)
        .then(response => response.text())
        .then(data => {
            var parser = new DOMParser();
            var doc = parser.parseFromString(data, "text/html");
            // select all elements between the <hr> tags
            var note1 = doc.querySelector(".author-note-portlet")[0];
            var chapterText = doc.querySelector(".chapter-content");
            var note2 = doc.querySelector(".author-note-portlet")[1];
            var next = doc.querySelector(".nav-buttons");
            var nextLink = next.children[1].getAttribute("href");
            // combine the notes and the chapter text
            var chapter = note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
        })

    return nextLink, chapter;
}