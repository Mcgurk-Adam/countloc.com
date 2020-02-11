var form = document.querySelector("form");
var countButton = document.getElementById("countButton");
var repoUrl = document.getElementById("repoUrl");
var errorContainer = document.getElementById("formError");
repoUrl.addEventListener("input", function () {
    errorContainer.innerHTML = "";
}, false);
form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    countButton.setAttribute("aria-busy", "true");
    GitHub.validateRepo(repoUrl.value);
}, false);
window.addEventListener("reponotfound", function () {
    errorContainer.innerText = "That repository cannot be found.";
    countButton.removeAttribute("aria-busy");
}, false);
window.addEventListener("repofound", function (ev) {
    var repoUrl = ev.detail;
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "http://localhost:5200/api/v1/count/?repo_url=" + repoUrl);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send();
    ajax.onload = function () {
        console.log(ajax);
    };
}, false);
var GitHub = (function () {
    function GitHub() {
    }
    GitHub.validateRepo = function (rawUrl) {
        var apiUrl = GitHub.getApiUrl(rawUrl);
        GitHub.checkRepoExists(apiUrl);
        return rawUrl;
    };
    GitHub.getApiUrl = function (rawUrl) {
        var splitGithubUrl = rawUrl.split("https://");
        var splitGithubName = splitGithubUrl[1].split("/");
        return "https://api.github.com/repos/" + splitGithubName[1] + "/" + splitGithubName[2];
    };
    GitHub.checkRepoExists = function (apiUrl) {
        var ajax = new XMLHttpRequest();
        ajax.open("GET", apiUrl);
        ajax.send();
        ajax.onload = function () {
            if (ajax.status == 404) {
                var notFoundEvent = new Event("reponotfound");
                window.dispatchEvent(notFoundEvent);
            }
            else {
                var githubResponse = JSON.parse(ajax.response);
                var foundEvent = new CustomEvent("repofound", {
                    detail: "https://github.com/" + githubResponse.full_name
                });
                window.dispatchEvent(foundEvent);
            }
        };
    };
    return GitHub;
}());
