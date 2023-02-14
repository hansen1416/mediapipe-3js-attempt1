import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";

import * as Web3 from "web3";

import "../../styles/css/Auth.css";

export default function Register() {
	const [metamaskAvailable, setmetamaskAvailable] = useState(false);

	useEffect(() => {
		if (typeof window.ethereum !== "undefined") {
			setmetamaskAvailable(true);
		}
	}, []);

	function metamaskLogin() {
		window.ethereum
			.request({
				method: "eth_requestAccounts",
			})
			.then(([publicKey]) => {
				console.log(publicKey);

				window.web3 = new Web3(window.ethereum);
			});
	}

	return (
		<div className="auth">
			<Stack gap={2} className="col-md-5 mx-auto">
				<Button
					variant="warning"
					size="lg"
					disabled={!metamaskAvailable}
					onClick={metamaskLogin}
				>
					Login with Metamask
				</Button>
				<Button variant="info" size="lg" style={{ marginTop: "20px" }}>
					Login with email
				</Button>
			</Stack>
		</div>
	);
}
