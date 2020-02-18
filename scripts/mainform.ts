const form = document.querySelector("form") as HTMLFormElement;
const countButton = document.getElementById("countButton") as HTMLButtonElement;
const repoUrl = document.getElementById("repoUrl") as HTMLInputElement;
const errorContainer = document.getElementById("formError") as HTMLParagraphElement;
const bodyCopy = document.querySelector(".bodycopy") as HTMLElement;
const redoButton = document.getElementById("redoButton") as HTMLButtonElement;
const countPackagesCheckbox = document.getElementById("countPackages");
const notFound = document.querySelector(".notfound");

window.addEventListener("load", () => {

	const countPackagesStorage:string = localStorage.getItem("countPackages");

	if (countPackagesStorage == "1") {
		countPackagesCheckbox.checked = true;
	}

}, false);

countPackagesCheckbox.addEventListener("change", () => {

	const storageValue:string = countPackagesCheckbox.checked ? "1" : "0";
	localStorage.setItem("countPackages", storageValue);

}, false);

repoUrl.addEventListener("input", () => {

	errorContainer.innerHTML = "";

}, false);

form.addEventListener("submit", (ev:Event) => {

	ev.preventDefault();
	countButton.setAttribute("aria-busy", "true");

	GitHub.validateRepo(repoUrl.value);

}, false);

window.addEventListener("reponotfound", () => {

	errorContainer.innerText = "That repository cannot be found.";
	countButton.removeAttribute("aria-busy");
	form.style.display = "none";
	bodyCopy.style.display = "none";
	notFound.style.display = "flex";

}, false);

window.addEventListener("repofound", (ev:CustomEvent) => {

	const repoUrl:string = ev.detail;
	const countPackageValue:string = countPackagesCheckbox.checked ? "1" : "0";
	const ajax:XMLHttpRequest = new XMLHttpRequest();
	ajax.open("GET", "https://clocapi.mcgurk.app/api/v1/count/?repo_url=" + repoUrl + "&count_packages="+countPackageValue);
	ajax.send();
	ajax.onload = () => {

		countButton.removeAttribute("aria-busy");

		const jsonReturn = JSON.parse(ajax.response);

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

			const languageBreakdownContainer = document.getElementById("languageBreakdown") as HTMLDivElement;

			jsonReturn.data.language_breakdown.forEach((language) => {

				const languageLabel = document.createElement("label") as HTMLLabelElement;
				languageLabel.classList.add("language");
				languageLabel.innerText = `${language.language} (${language.loc})`;
				const languageCheckbox = document.createElement("input");
				languageCheckbox.setAttribute("type", "checkbox");
				languageCheckbox.setAttribute("checked", "true");
				languageCheckbox.setAttribute("data-total", language.loc);
				languageCheckbox.onchange = function() {

					const totalNumberContainer = document.getElementById("numberOfLines");

					const currentNumber:number = parseInt(totalNumberContainer.innerText.replace(/\D/g,''));

					let newNumber:number;

					if (this.checked) {
						newNumber = currentNumber + parseInt(this.getAttribute("data-total"));
					} else {
						newNumber = currentNumber - parseInt(this.getAttribute("data-total"));
					}

					totalNumberContainer.innerText = newNumber.toString();

				};
				languageLabel.insertAdjacentElement("afterbegin", languageCheckbox);

				languageBreakdownContainer.appendChild(languageLabel);

			});

			document.querySelector(".countlines").classList.add("loaded");

		}

	};


}, false);

redoButton.addEventListener("click", () => {

	document.getElementById("repoName").innerText = "";
	document.getElementById("numberOfLines").innerText = "";
	document.getElementById("languageBreakdown").innerHTML = "";
	repoUrl.value = "";
	
	form.removeAttribute("aria-hidden");
	bodyCopy.removeAttribute("aria-hidden");
	document.querySelector(".countlines").classList.remove("loaded");

}, false);
