<script lang="ts">
	export let data: { Groups };
</script>

<div class="pl-3">

	Build monitor
	<div class="display: flex">

		{#each data.group.projects as project}


			<div class="card bg-base-100 w-96 shadow-xl mr-3">
				<figure>
					<img
						src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
						alt="Shoes" />
				</figure>
				<div class="card-body">
					<h2 class="card-title">
						Build!
						<div class="badge badge-success">Passed</div>
					</h2>
					<p>If a dog chews shoes whose shoes does he choose?</p>
					<div class="card-actions justify-end">
						<div class="badge badge-outline">Fashion</div>
						<div class="badge badge-outline">Products</div>
					</div>
				</div>
			</div>

		{/each}

	</div>

</div>
