interface GithubRepository {
	full_name:string;
}

class GitHub {

	static validateRepo(rawUrl:string): string {

		const apiUrl:string = GitHub.getApiUrl(rawUrl);
		GitHub.checkRepoExists(apiUrl);
		return rawUrl;

	}

	private static getApiUrl(rawUrl:string): string {

		const splitGithubUrl:Array<string> = rawUrl.split("https://");
		const splitGithubName:Array<string> = splitGithubUrl[1].split("/");
		return "https://api.github.com/repos/" + splitGithubName[1] + "/" + splitGithubName[2];

	}

	private static checkRepoExists(apiUrl:string) {

		const ajax:XMLHttpRequest = new XMLHttpRequest();
		ajax.open("GET", apiUrl);
		ajax.send();
		ajax.onload = () => {

			if (ajax.status == 404) {

				const notFoundEvent:Event = new Event("reponotfound");
				window.dispatchEvent(notFoundEvent);

			} else {

				const githubResponse:GithubRepository = JSON.parse(ajax.response);
				const foundEvent:Event = new CustomEvent("repofound", {
					detail: "https://github.com/" + githubResponse.full_name
				});
				window.dispatchEvent(foundEvent);

			}

		}

	}

}
