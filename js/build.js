var form = document.querySelector("form");
var countButton = document.getElementById("countButton");
var errorContainer = document.getElementById("formError");
form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    countButton.setAttribute("aria-busy", "true");
}, false);
