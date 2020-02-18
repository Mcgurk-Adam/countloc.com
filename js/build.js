var form = document.querySelector("form");
var countButton = document.getElementById("countButton");
var repoUrl = document.getElementById("repoUrl");
var errorContainer = document.getElementById("formError");
var bodyCopy = document.querySelector(".bodycopy");
var redoButton = document.getElementById("redoButton");
var countPackagesCheckbox = document.getElementById("countPackages");
var notFound = document.querySelector(".notfound");
window.addEventListener("load", function () {
    var countPackagesStorage = localStorage.getItem("countPackages");
    if (countPackagesStorage == "1") {
        countPackagesCheckbox.checked = true;
    }
}, false);
countPackagesCheckbox.addEventListener("change", function () {
    var storageValue = countPackagesCheckbox.checked ? "1" : "0";
    localStorage.setItem("countPackages", storageValue);
}, false);
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
    form.style.display = "none";
    bodyCopy.style.display = "none";
    notFound.style.display = "flex";
}, false);
window.addEventListener("repofound", function (ev) {
    var repoUrl = ev.detail;
    var countPackageValue = countPackagesCheckbox.checked ? "1" : "0";
    var ajax = new XMLHttpRequest();
    ajax.open("GET", "https://clocapi.mcgurk.app/api/v1/count/?repo_url=" + repoUrl + "&count_packages=" + countPackageValue);
    ajax.send();
    ajax.onload = function () {
        countButton.removeAttribute("aria-busy");
        var jsonReturn = JSON.parse(ajax.response);
        if (jsonReturn.success) {
            sessionStorage.setItem("latestCheck", JSON.stringify(jsonReturn.data));
            gtag('event', 'counted', {
                'event_category': 'code',
                'event_label': 'Counted Code',
                'value': jsonReturn.data.raw_total
            });
            bodyCopy.setAttribute("aria-hidden", "true");
            form.setAttribute("aria-hidden", "true");
            document.getElementById("repoName").innerText = jsonReturn.data.repo_name;
            document.getElementById("numberOfLines").innerText = jsonReturn.data.total;
            var languageBreakdownContainer_1 = document.getElementById("languageBreakdown");
            jsonReturn.data.language_breakdown.forEach(function (language) {
                var languageLabel = document.createElement("label");
                languageLabel.classList.add("language");
                languageLabel.innerText = language.language + " (" + language.loc + ")";
                var languageCheckbox = document.createElement("input");
                languageCheckbox.setAttribute("type", "checkbox");
                languageCheckbox.setAttribute("checked", "true");
                languageCheckbox.setAttribute("data-total", language.loc);
                languageCheckbox.onchange = function () {
                    var totalNumberContainer = document.getElementById("numberOfLines");
                    var currentNumber = parseInt(totalNumberContainer.innerText.replace(/\D/g, ''));
                    var newNumber;
                    if (this.checked) {
                        newNumber = currentNumber + parseInt(this.getAttribute("data-total").replace(/\D/g, ''));
                    }
                    else {
                        newNumber = currentNumber - parseInt(this.getAttribute("data-total").replace(/\D/g, ''));
                    }
                    totalNumberContainer.innerText = newNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                };
                languageLabel.insertAdjacentElement("afterbegin", languageCheckbox);
                languageBreakdownContainer_1.appendChild(languageLabel);
            });
            document.querySelector(".countlines").classList.add("loaded");
        }
    };
}, false);
redoButton.addEventListener("click", function () {
    document.getElementById("repoName").innerText = "";
    document.getElementById("numberOfLines").innerText = "";
    document.getElementById("languageBreakdown").innerHTML = "";
    repoUrl.value = "";
    form.removeAttribute("aria-hidden");
    bodyCopy.removeAttribute("aria-hidden");
    document.querySelector(".countlines").classList.remove("loaded");
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
