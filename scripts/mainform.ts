const form = document.querySelector("form") as HTMLFormElement;
const countButton = document.getElementById("countButton") as HTMLButtonElement;
const errorContainer = document.getElementById("formError") as HTMLParagraphElement;

form.addEventListener("submit", (ev:Event) => {

	ev.preventDefault();

	countButton.setAttribute("aria-busy", "true");

}, false);