<script>
	import { Router, Route } from "svelte-routing";
	import Playground from "./routes/Playground.svelte";
	import Walk from "./routes/Walk.svelte";
	import Terrain from "./routes/Terrain.svelte";

</script>

<Router>
	<!-- <nav>
		<Link to="/">Home</Link>
		<Link to="/playground">Playground</Link>
		<Link to="/blog">Blog</Link>
	</nav> -->

	<!-- <Route path="/blog/:id" component={BlogPost} /> -->
	<Route path="/playground" component={Playground} />
	<Route path="/walk" component={Walk} />
	<Route path="/terrain"><Terrain /></Route>
</Router>
