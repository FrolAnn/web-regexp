document.addEventListener("DOMContentLoaded", function () {
    getPage("menu");
    getPage("compare");
});

window.onpopstate = function () {
    getPage(document.location.hash.replace("#", ""));
}

function getPage(page, example) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/" + page + ".html", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            alert(xhr.status + ": " + xhr.statusText);
        } else {
            if (page == "menu") {
                document.querySelector(".menu").innerHTML = xhr.responseText;
            } else {
                document.querySelector(".flex-container").innerHTML = xhr.responseText;
                if (page == "compare") {
                    comparison();
                } else if (page == "replace") {
                    replace();
                }
                if(example != null){
                    getTasks(example);
                }
            }
        }
    }
}


function getTasks (page) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../tasks/" + page + "Tasks.json", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            alert(xhr.status + ": " + xhr.statusText);
        } else {
            var obj = JSON.parse(xhr.responseText);
            if (page == "compare1" || page == "compare2") {
                fillCompareExample(obj);
            } else if (page == "replace1" || page == "replace2") {
                fillReplaceExample(obj);
            }
        }
    }
}

