const form = document.querySelector("#mainRepoForm") as HTMLFormElement;
const countButton = document.getElementById("countButton") as HTMLButtonElement;
const repoUrl = document.getElementById("repoUrl") as HTMLInputElement;
const errorContainer = document.getElementById("formError") as HTMLParagraphElement;
const bodyCopy = document.querySelector(".bodycopy") as HTMLElement;
const redoButton = document.getElementById("redoButton") as HTMLButtonElement;
const countPackagesCheckbox = document.getElementById("countPackages") as HTMLInputElement;
const notFound = document.querySelector(".notfound") as HTMLElement;
const signupFormBackground = document.querySelector(".dark-background");
const selectAllCheckBox = document.getElementById("allSelections") as HTMLInputElement;

countPackagesCheckbox.addEventListener("change", () => {

	const storageValue:string = countPackagesCheckbox.checked ? "1" : "0";
	localStorage.setItem("countPackages", storageValue);

}, false);

signupFormBackground.addEventListener("click", (e:MouseEvent) => {

	if (e.target == signupFormBackground) {
		signupFormBackground.setAttribute("aria-hidden", "true");
	}

}, false);

repoUrl.addEventListener("input", () => {

	errorContainer.innerHTML = "";

}, false);

form.addEventListener("submit", (ev:Event) => {

	ev.preventDefault();
	countButton.setAttribute("aria-busy", "true");

	GitHub.validateRepo(repoUrl.value);

}, false);

window.addEventListener("DOMContentLoaded", () => {

	const countPackagesStorage:string = localStorage.getItem("countPackages");

	if (countPackagesStorage == "1") {
		countPackagesCheckbox.checked = true;
	}

	const urlParams:URLSearchParams = new URLSearchParams(window.location.search);

	if (urlParams.get("repo") != null) {

		repoUrl.value = urlParams.get("repo");

		if (form.checkValidity()) {
			form.requestSubmit();
			window.history.replaceState({}, document.title, "/");
		}

	}

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

			// @ts-ignore This exists...it's in the head morons
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
				languageCheckbox.addEventListener("change", () => updateNumber(languageCheckbox), false);
				languageLabel.insertAdjacentElement("afterbegin", languageCheckbox);

				languageBreakdownContainer.appendChild(languageLabel);

			});

			selectAllCheckBox.addEventListener("change", selectAll, false);

			document.querySelector(".countlines").classList.add("loaded");

		}

	};


}, false);

function updateNumber(checkbox:HTMLInputElement) {

	const totalNumberContainer = document.getElementById("numberOfLines");

	const currentNumber:number = parseInt(totalNumberContainer.innerText.replace(/\D/g,''));

	let newNumber:number;

	if (checkbox.checked) {
		newNumber = currentNumber + parseInt(checkbox.getAttribute("data-total").replace(/\D/g,''));
	} else {
		newNumber = currentNumber - parseInt(checkbox.getAttribute("data-total").replace(/\D/g,''));
	}

	if (newNumber < 0) {
		newNumber = 0;
	}

	totalNumberContainer.innerText = newNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

function selectAll() {
	
	const checkboxes:NodeListOf<HTMLInputElement> = document.querySelectorAll("#languageBreakdown input[type=checkbox]");

	// this is to make sure it doesn't double count code if you click them all off, and then click one back on
	if (this.checked) {

		const checkedCheckboxes:NodeListOf<HTMLInputElement> = document.querySelectorAll("#languageBreakdown input[type=checkbox]:checked");
		checkedCheckboxes.forEach((box:HTMLInputElement) => {
			box.checked = false;
			updateNumber(box);
		});

	}

	checkboxes.forEach((box:HTMLInputElement) => {
		box.checked = this.checked;
		updateNumber(box);
	});

}

redoButton.addEventListener("click", () => {

	document.getElementById("repoName").innerText = "";
	document.getElementById("numberOfLines").innerText = "";
	document.getElementById("languageBreakdown").innerHTML = "";
	repoUrl.value = "";

	selectAllCheckBox.removeEventListener("change", selectAll);
	selectAllCheckBox.checked = true;
	
	form.removeAttribute("aria-hidden");
	bodyCopy.removeAttribute("aria-hidden");
	document.querySelector(".countlines").classList.remove("loaded");

}, false);
