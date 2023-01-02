import React from "react";
import Userrow from "./Userrow";
import Userprofile from "./Userprofile";
import Logo from "../../../images/memex-icon.png";

import Dialogue from "./Dialogue";
import Image from "next/image";
import { useState } from "react";

function Paths(props) {
	let { adduser, setAdduser, chatuser, setChatuser, convos, fetchMore } = props;
	const [show, setShow] = useState("chatlist");

	return (
		<div
			className={`conversations dark:bg-slate-800 bg-white-50 flex flex-col w-full  h-full overflow-hidden`}>
			<div className={"chatcontainer min-h-screen sm:min-h-auto"}>
				<div
					className={`${
						show === "chatlist" ? "!block" : "!hidden"
					} col-span-2 sm:col-span-1 userrow spanall shadow-indigo-50 xl:flex hidden p-5 h-screen text-slate-700/100 dark:text-white/60 bg-white-50 dark:bg-slate-800 border-0 border-r border-solid border-gray-400 dark:border-slate-400`}>
					<Userrow
						chatuser={chatuser}
						setChatuser={setChatuser}
						convos={convos}
						fetchMore={fetchMore}
						setAdduser={() => setAdduser(!adduser)}
						setShow={setShow}
					/>
				</div>
				{chatuser ? (
					<>
						<div
							className={`${
								show === "chatbox" ? "!block" : "!hidden"
							} col-span-2 sm:col-span-1 dialogue spanall min-w-max h-screen pt-2 bg-white dark:bg-slate-900/50 dark:text-white border-l border-r dark:border-slate-500 border-x-white/50 border-color-white-50`}>
							<Dialogue chatuser={chatuser} />
						</div>
						{/* <div className='userprofile w-full xl:flex spanall hidden pt-2'>
							<div>
								<Userprofile chatuser={chatuser} />
							</div>
						</div> */}
					</>
				) : (
					<>
						<div
							className={`${
								show === "chatbox" ? "!block" : "!hidden"
							} col-span-2 sm:col-span-1 w-full relative bg-slate-100 dark:bg-inherit`}>
							<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 '>
								{/* logo */}
								<div className='logo-messenger flex flex-col justify-center items-center'>
									<div className='img'>
										<Image src={Logo} alt='logo' className=' opacity-20' />
									</div>
									<div>
										<p className='text-gray-600 dark:text-white/50'>
											Please select someone to chat
										</p>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
export default Paths;
