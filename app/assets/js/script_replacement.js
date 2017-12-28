var regex;
var replacement;
var text_before = [], text_after = [], text_expected = [], matches = [];

function replace(){   
    regex = document.querySelector("#regex");
    replacement = document.querySelector("#replacement");
    read_cases_replacement();

    regex.oninput = function(){ getResultOfReplacementForAll() };
    replacement.oninput = function(){ getResultOfReplacementForAll() };
    addEvents();
}

function addEvents(){
    for (var i = 0; i < text_before.length; i++) {
        //console.log(text_before[i]);
        text_before[i].oninput = function(){ getResultOfReplacement(this); determineMatch(this.nextElementSibling.nextElementSibling)};
        text_expected[i].oninput = function(){ determineMatch(this) };
    }
}

function getResultOfReplacementForAll(){
    for (var i = 0; i < text_before.length; i++) {
        getResultOfReplacement(text_before[i]);
        determineMatch(text_expected[i]);
    }
}

function getResultOfReplacement(input){
    var result = input.nextElementSibling;
    var regex_value = convert_to_regex_replacement(regex.value);
    if(regex_value){
        console.log(true);
        var replacement_value = replacement.value;
        var input_value = input.value;

        result.value = input_value.replace(regex_value, replacement_value);
    }
}

function determineMatch(expected){
    var match = expected.nextElementSibling;
    var result = expected.previousElementSibling;
    if(expected.value == result.value){
        add_match(match);
    }
    else{
        remove_match(match);
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

function convert_to_regex_replacement() {
    var regex_templ = /^\/.*\/(?:([igmy])(?!\1)){0,4}$/;
    var value = regex.value;
    if (regex_templ.test(value)) {
        regex_templ = /\/(.*)\/(.*)$/;
        var found = value.match(regex_templ);
        regex_templ = new RegExp(found[1], found[2]);
        return regex_templ;
    } 
    else {
        return false;
    }
}

function read_cases_replacement() {
    var cases = document.querySelectorAll(".my-case-block")
    text_before.length = 0;
    text_after.length = 0;
    text_expected.length = 0;
    matches.length = 0;
    for (var i = 0; i < cases.length; i++) {
        text_before[i] = cases[i].children[0];
        text_after[i] = cases[i].children[1];
        text_expected[i] = cases[i].children[2];
        matches[i] = cases[i].children[3];
    }
}

function add_replacement_field(){
    var div = document.createElement("div");
    div.className = "my-case-block";
    div.innerHTML = "<textarea class=\"text_before\" placeholder=\"original text\"></textarea><textarea class=\"text_after\" placeholder=\"result of replacement\" disabled></textarea><textarea class=\"text_expected\" placeholder=\"expected result\"></textarea><div class=\"answer no-match increase\">&#xf00d</div> <input type=\"button\" value=\"&#xf068\" id=\"remove\" onclick=\"return remove_replacement_field(this)\">";
    document.getElementById("block-cases").appendChild(div);
    // Обвновляем список всех полей
    read_cases_replacement();
    // Добавляем события
    addEvents();
    // Добавляем анимацию появления
    div.classList.add("add-case-block");
    return false;
}

function remove_replacement_field(field){
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
            read_cases_replacement();
            addEvents();
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

function fillReplaceExample(input){
    regex.value = input.regex;
    replacement.value = input.replace;
    for(var i = 0; i < input.values.length; i++){
        text_before[i].value = input.values[i].value;
        text_expected[i].value = input.values[i].answer;
    }
    read_cases_replacement();
    getResultOfReplacementForAll();
    console.log(input);
}