import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

  :root {
    --primary-color: #ff4522;
    --purple-color: #8f00ff;
    --radius: 5px;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    transition: all .1s;
    caret-color: var(--primary-color);
  }

  html {
    scroll-behavior: smooth;
    overflow-x: hidden;
  }

  body {
    margin: 0;
    font-family: 'Lato', sans-serif;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style-type: none;
    margin-bottom: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0;
  }
`;

export const Flex = styled.div`
	display: flex;
	justify-content: ${(props) => props.horizontal || "flex-start"};
	align-items: ${(props) => props.vertical || "stretch"};
	flex-grow: ${(props) => props.grow || "0"};
	flex-direction: ${(props) => props.direction || "row"};
	flex-wrap: ${(props) => props.wrap || "wrap"};
	gap: ${(props) => props.gap || "10px"};
`;

export const Content = styled.div`
	width: 85%;
	margin: auto;
`;

export const Grid = styled.div`
	display: grid;
	justify-content: ${(props) => props.horizontal || "flex-start"};
	align-items: ${(props) => props.vertical || "stretch"};
	grid-template-columns: ${(props) => props.columns || ""};
	grid-gap: ${(props) => props.gap || "10px"};
`;

export const BrandBox = styled.button`
	background: ${(props) => props.bg || "var(--primary-color)"};
	color: white;
	height: 45px;
	width: 45px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 20px;
	font-weight: 600;
	border: none;
	border-radius: 3px;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		opacity: 0.8;
	}
`;

export const GoBackButton = styled.button`
	background: var(--primary-color);
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 3px;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		padding-right: 30px;
	}
`;