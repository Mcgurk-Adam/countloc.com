const form = document.querySelector("form") as HTMLFormElement;
const countButton = document.getElementById("countButton") as HTMLButtonElement;
const repoUrl = document.getElementById("repoUrl") as HTMLInputElement;
const errorContainer = document.getElementById("formError") as HTMLParagraphElement;

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

}, false);

window.addEventListener("repofound", (ev:CustomEvent) => {

	const repoUrl:string = ev.detail;
	const ajax:XMLHttpRequest = new XMLHttpRequest();
	ajax.open("GET", "http://localhost:5200/api/v1/count/?repo_url=" + repoUrl);
	ajax.setRequestHeader("Content-Type", "application/json");
	ajax.send();
	ajax.onload = () => {

		console.log(ajax);

	};


}, false);
