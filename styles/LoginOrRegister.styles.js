import { TextField } from "@mui/material";
import styled from "styled-components";
import loginbg from "../images/memeoapp-bg.png";

export const LoginWrapper = styled.div`
	width: 100%;
	min-height: 100vh;
	height: 100vh;

	.loginwrapper_container {
		height: 100%;

		.login-banner {
			background-image: url(${loginbg.src});
			background-size: contain;
			background-position: center;
			object-fit: cover;
			height: 100%;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			color: white;
			background-repeat: no-repeat;
			background-color: #ff3600;
			

			& > div {
				height: 100%;
			}

			.login-banner-title p {
				color: white;
				font-size: 40px;
				font-weight: bolder;
				font-family: "Lemonada", cursive;
				line-height: 1.3;

				span {
					font-size: 50px;
				}
			}

			.login-banner-subtitle p {
				font-size: 18px;
				font-weight: normal;
				color: white;
			}
		}
	}
`;

export const CssTextField = styled(TextField)({
	"&": {
		width: "100%",
	},
	"& label.Mui-focused": {
		color: "var(--primary-color)",
	},
	"& .MuiInput-underline:after": {
		borderBottomColor: "var(--primary-color)",
	},
	"& .MuiOutlinedInput-root": {
		"& fieldset": {
			borderColor: "var(--primary-color)",
		},
		"&:hover fieldset": {
			borderColor: "var(--primary-color)",
		},
		"&.Mui-focused fieldset": {
			borderColor: "var(--primary-color)",
		},
	},
});