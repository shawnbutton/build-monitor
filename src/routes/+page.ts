import settings from '$lib/services/settings.json';
import { getProjects } from '$lib/services/gitlabService';


export async function load() {

	const group = await getProjects(settings.gitlabUrl, settings.gitlabKey, settings.groupPaths)
	console.log(JSON.stringify(group))

	return {
		group
	};
}
