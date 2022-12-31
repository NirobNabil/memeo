import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { ContextApp } from "../ContextAPI";
import styled from "styled-components";
import Recorder from "./Recorder";

const Iconspecial = styled.i`
	color: ${(props) => props.color};
	z-index: 10;
	background-color: white;
	&:hover {
		color: white;
		background-color: ${(props) => props.color};
	}
`;
const Span = styled.span`
	&:hover {
		background-color: ${(props) => props.color};
	}
`;
function Hoverableicondiv(props) {
	const {
		inputref,
		progresswidth,
		progressbar,
		convoid,
		sendFile,
		special,
		icon,
		type,
		classNames,
		setState,
		state,
		setState2,
		handleEvent,
	} = props;
	function chatFuncDisplay() {
		setState2(false);
		setTimeout(() => {
			setState(false);
		}, 400);
	}

	return (
		<>
			{type && type === "link" ? (
				/// theme change and other will added here
				<div
					id='sth'
					onClick={() => {
						chatFuncDisplay();
					}}>
					<Span className={`icondiv ${classNames}`}>
						<i className={" fal fa-" + icon} />
					</Span>
				</div>
			) : special ? (
				<label style={{ zIndex: 4, cursor: "pointer" }}>
					{type === "microphone" ? (
						<Recorder
							convoid={convoid}
							progressbar={progressbar}
							progresswidth={progresswidth}
						/>
					) : (
						<>
							<input
								type={type}
								ref={inputref}
								className={`${icon}file`}
								style={{ display: "none" }}
								onChange={() => sendFile(icon)}
								accept={
									icon === "image"
										? "image/*"
										: icon === "film"
										? '"video/mp4,video/x-m4v,video/*, mp4"'
										: ""
								}
							/>
							<Iconspecial
								className={`${"icondiv fal fa-" +
									icon} bg-slate-50 dark:bg-slate-900`}
							/>
						</>
					)}
				</label>
			) : (
				<div
					className={`icondiv ${classNames} 
        text-slate-900 dark:bg-slate-900 dark:text-white  bg-white dark:hover:bg-slate-900 hover:bg-[#ff4522] hover:text-white cursor-pointer group`}
					onClick={() => {
						setState && setState((prev) => !prev);
						handleEvent && handleEvent();
					}}>
					{icon && (
						<i
							className={`fal fa-${icon} text-[#ff4522] group-hover:text-white`}
						/>
					)}
				</div>
			)}
		</>
	);
}
export default Hoverableicondiv;
