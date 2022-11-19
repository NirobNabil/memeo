import styled from "styled-components";

export const LoginFormContainer = styled.div`
	padding: 30px;

	.logo {
		max-width: 150px;
		margin-bottom: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: auto;
		margin-bottom: 10px;
	}

	.tagline {
		font-size: 20px;
		text-align: center;
		font-weight: 600;
	}

	#login {
		margin-top: 50px;

		button {
			color: var(--primary-color);
			background-color: transparent;

			svg {
				height: 20px;
				width: 20px;
			}
		}
	}

	.create-new-account-text {
		button {
			border: none;
			background: transparent;
			cursor: pointer;
		}

		a {
			font-weight: 600;
			color: var(--primary-color);
		}
	}

	.another-login-method {
		span {
			font-size: 12px;
			color: var(--primary-color);
			text-align: center;
			display: block;
			width: 100%;
		}
	}
`;