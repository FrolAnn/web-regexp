var regex;
var inputs = [], matches = [];
function comparison(){
    regex = document.querySelector("#regex");
    read_cases();

    regex.oninput = function() {
        check_rows();
    };

    inputs.forEach(function(item) {
        item.oninput = function() { handler(item) };
    });
}

function check_rows() {
    if (convert_to_regex()) {
      inputs.forEach(function(input) {
        handler(input);
      });
    } else {
      matches.forEach(function(match) {
        remove_match(match);
      });
    }
}

function handler(input) {
    var div = input.nextElementSibling;
    var tmp = convert_to_regex();
    if (tmp instanceof RegExp) {
      if (tmp.test(input.value)) {
        add_match(div);
      } else {
        remove_match(div);
      }
    }
  }

function add_match(div){
    div.classList.remove("increase");
    div.classList.add("decrease");
    div.addEventListener("webkitAnimationEnd", function() {
        console.log(div);
        div.classList.remove("no-match");
        div.classList.remove("decrease");
        div.classList.add("match"); 
        div.innerHTML = "&#xf00c";
        div.classList.add("increase");
    })
}

function read_cases() {
    var cases = document.querySelectorAll(".my-case-block")
    inputs.length = 0;
    matches.length = 0;
    for (var i = 0; i < cases.length; i++) {
        inputs[i] = cases[i].children[0];
        matches[i] = cases[i].children[1];
    }
}

function convert_to_regex() {
    var regex_templ = /^\/.*\/(?:([igmy])(?!\1)){0,4}$/;
    var value = regex.value;
    if (regex_templ.test(value)) {
        regex_templ = /\/(.*)\/(.*)$/;
        var found = value.match(regex_templ);
        regex_templ = new RegExp("^" + found[1] + "$", found[2]);
        return regex_templ;
    } 
    else {
        return false;
    }
  }

  function remove_match(div) {
    div.classList.remove("increase");
    div.classList.add("decrease");
    div.addEventListener("webkitAnimationEnd", function() {
        console.log(div);
        div.classList.remove("match");
        div.classList.remove("decrease");
        div.classList.add("no-match"); 
        div.innerHTML = "&#xf00d";
        div.classList.add("increase");
    })
}
  
function add_field(){
    var div = document.createElement("div");
    div.className = "my-case-block";
    div.innerHTML = "<input type=\"text\" class=\"case-text\"/> <div class=\"answer no-match\">&#xf00d</div><input type=\"button\" value=\"&#xf068\" id=\"remove\" onclick=\"return remove_field(this)\">";
    document.getElementById("block-cases").appendChild(div);
    // Обвновляем список всех полей
    read_cases();
    // Добавляем проверку поля при вводе текста
    inputs[inputs.length-1].oninput = function() { handler(inputs[inputs.length-1]) };
    handler(inputs[inputs.length-1]);
    // Добавляем анимацию появления
    div.classList.add("add-case-block");
    return false;
}

function remove_field(field){
    // Получаем доступ к ДИВу, содержащему поле
    var contDiv = field.parentNode;
    var next = contDiv.nextElementSibling;
    var first = next;
    
    // Удаляем анимацию появления и добавляем класс исчезновения
    contDiv.classList.remove("add-case-block");
    contDiv.classList.add("remove-case-block");
    // Делаем удаление элемента после окончания анимации
    contDiv.addEventListener("webkitAnimationEnd", function() {    
            contDiv.parentNode.removeChild(contDiv); 
            // Обновляем список всех полей
            read_cases();
        }
    ); 

    // Добавление анимаций
    while(next != null){    
        // Добавляем анимацию перемещения
        next.classList.add("move-up-case");
        next = next.nextElementSibling;
    }

    // Удаление анимации
    setTimeout(deleteMoveUpAnimation, 1000, first);

    // Возвращаем false, чтобы не было перехода по ссылке
    return false;
}

function deleteMoveUpAnimation(first){
    var next = first;
    while(next != null){
        console.log(next);
        next.classList.remove("move-up-case"); 
        next.classList.remove("add-case-block");
        next = next.nextElementSibling;
    } 
}

function fillCompareExample(input) {
    console.log(input);
    regex.value = input.regex;
   for(var i = 0; i < input.values.length; i++){
    inputs[i].value = input.values[i];
   }
   check_rows();
}