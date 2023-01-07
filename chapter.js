var link = "https://www.royalroad.com/fiction/59918/the-bridge-to-forever-progressionlitrpg/chapter/1073612/chapter-29-the-station";

function getChapter(link) {
    console.log("getting chapter");
    var chap = fetch(link)
        .then(response => response.text())
        .then(data => {
            var parser = new DOMParser();
            var doc = parser.parseFromString(data, "text/html");
            // select all elements between the <hr> tags
            var note1 = doc.querySelectorAll(".author-note-portlet")[0];
            var chapterText = doc.querySelector(".chapter-content");
            var note2 = doc.querySelectorAll(".author-note-portlet")[1];
            var next = doc.querySelector(".nav-buttons");
            var nextLink = "https://www.royalroad.com" + next.children[1].children[0].getAttribute("href");
            // combine the notes and the chapter text
            var chapter = note1.outerHTML + chapterText.outerHTML + note2.outerHTML;
            console.log("got chapter");
            return chapter;
        })
        .catch(error => console.log(error));
    console.log("done");
    return chap;
}

var buttons = document.querySelector(".margin-bottom-10");
var buttons2 = document.querySelector(".nav-buttons")
var b = buttons.children[1];
b.removeAttribute("href");
b.setAttribute("onclick", "getChapter()");
b.textContent = "Full Text";

buttons2.replaceWith(buttons);

// var chapter = getChapter(link);
var body = document.querySelector(".portlet-body");
var hr = body.querySelectorAll("hr");
console.log(hr);
var chapter = getChapter(link);
var img = document.createElement('img');
img.src = 'https://media.geeksforgeeks.org/wp-content/uploads/20190529122828/bs21.png';
hr[hr.length - 3].insertAdjacentHTML("afterend", chapter);