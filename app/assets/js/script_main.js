document.addEventListener("DOMContentLoaded", function () {
    getPage("menu");
    getPage("compare");
});

window.onpopstate = function () {
    getPage(document.location.hash.replace("#", ""));
}

/**
 * Получить определенную часть странички(меню, регулярки и тд)
 * @param {string} page - название страницы(без .html)
 */
function getPage(page, example) {
    // Сам запрос
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/" + page + ".html", true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.send();

    xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            alert(xhr.status + ": " + xhr.statusText);
        } else {
            // Вешаем все обработчики событий
            if (page == "menu") {
                document.querySelector(".menu").innerHTML = xhr.responseText;
                //document.querySelector(".menu").onclick = getPageEvent;
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

/*function getPageEvent(event) {
    event.preventDefault();
    history.pushState(null, '', "#" + event.target.name);
    getPage(event.target.name);
}*/

/**
 * Получить задачи 
 * @param {string} page - название страницы(без .html)
 */
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
            // Парсим задачи
            var obj = JSON.parse(xhr.responseText);
            if (page == "compare1" || page == "compare2") {
                fillCompareExample(obj);
            } else if (page == "replace1" || page == "replace2") {
                fillReplaceExample(obj);
            }
        }
    }
}

  