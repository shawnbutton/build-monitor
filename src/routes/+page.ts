import settings from '$lib/services/settings.json';
import { getProjects } from '$lib/services/gitlabService';


export async function load() {


	const groups = await getProjects(settings.gitlabUrl, settings.gitlabKey, settings.groupPaths)
	console.log(JSON.stringify(groups))

	return {
		buildResults: {
			title: `Title goes here`,
			content: `Content goes here`
		}
	};
}
