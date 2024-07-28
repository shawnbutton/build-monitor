<script lang="ts">
	import Sun from "./Sun.svelte";
	import { THEMES } from "$lib/config";

	function set_theme(theme: string) {
		if (!Object.values(THEMES).includes(theme)) return;
		localStorage.setItem("theme", theme);
		document.body.setAttribute("data-theme", theme);
	}

	function toggle_theme(): void {
		let current_theme = document.body.getAttribute("data-theme");
		const theme =
			current_theme === THEMES.LIGHT
				? THEMES.DARK
				: THEMES.LIGHT;
		set_theme(theme);
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">Monte Carlo Forecaster</a>
	</div>
	<div class="flex-none">
		<button aria-label="toggle theme" on:click={toggle_theme}>
			<Sun />
		</button>
	</div>
</div>
