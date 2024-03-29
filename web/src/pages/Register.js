import { useEffect } from "react";

import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";

import "../styles/css/Auth.css";

export default function Register() {
	useEffect(() => {
		console.info("todo register page. I'm also a marker");
	}, []);

	return (
		<div className="auth">
			<Stack gap={2} className="col-md-5 mx-auto">
				<Button variant="info" size="lg" style={{ marginTop: "20px" }}>
					Login with email
				</Button>
			</Stack>
		</div>
	);
}
