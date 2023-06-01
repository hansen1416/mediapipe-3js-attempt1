<script>
	import { Router, Link, Route } from "svelte-routing";
	import Playground from "./routes/Playground.svelte";
	import Walk from "./routes/Walk.svelte";

	// export let url = "/";
</script>

<Router>
	<!-- <nav>
		<Link to="/">Home</Link>
		<Link to="/playground">Playground</Link>
		<Link to="/blog">Blog</Link>
	</nav> -->

	<!-- <Route path="/blog/:id" component={BlogPost} /> -->
	<Route path="/walk" component={Walk} />
	<Route path="/playground" component={Playground} />
	<!-- <Route path="/"><Home /></Route> -->
</Router>
