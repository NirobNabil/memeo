import React from "react";
import Userrow from "./Userrow";
import Userprofile from "./Userprofile";
import Logo from "../../../images/memex-icon.png";

import Dialogue from "./Dialogue";
import Image from "next/image";
import { useState } from "react";

function Paths(props) {
	const {
		adduser,
		setAdduser,
		chatuser,
		setChatuser,
		convos,
		fetchMore,
		setShowChat,
		showChat,
	} = props;

	return (
		<div
			className={`conversations dark:bg-slate-800 bg-white-50 flex flex-col w-full  h-full overflow-hidden`}>
			<div
				className={`flex flex-row min-h-screen max-h-screen sm:min-h-auto w-full relative`}>
				<div
					className={`absolute h-full sm:h-auto left-0 top-0 sm:static w-full sm:w-auto sm:min-w-[400px] userrow spanall shadow-indigo-50 flex p-5 h-screen text-slate-700/100 dark:text-white/60 bg-white-50 dark:bg-slate-800 z-10 ${
						showChat ? "-left-[120%]" : "left-0"
					} transition duration-300`}>
					<Userrow
						chatuser={chatuser}
						setChatuser={setChatuser}
						convos={convos}
						fetchMore={fetchMore}
						setAdduser={() => setAdduser((prev) => !prev)}
						setShowChat={setShowChat}
					/>
				</div>
				{chatuser ? (
					<>
						<div
							className={`absolute sm:static h-full w-full top-0 left-0 sm:w-auto flex-grow dialogue spanall sm:min-w-max h-screen pt-2 bg-white dark:bg-slate-900/50 dark:text-white border-l border-r dark:border-slate-500 border-x-white/50 border-color-white-50 z-[0]`}>
							<Dialogue chatuser={chatuser} setShowChat={setShowChat} />
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
							className={`absolute sm:static h-full w-full top-0 left-0 sm:w-auto flex-grow relative bg-slate-100 dark:bg-inherit border-0 border-l border-gray-600 -z-[1] sm:z-[0]`}>
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
