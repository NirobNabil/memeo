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
				className={`flex flex-row min-h-screen sm:min-h-auto w-[200%] sm:w-full ${
					showChat ? "-translate-x-[50%]" : "translate-x-0"
				} sm:translate-x-0`}>
				<div
					className={`basis-full sm:basis-[400px] min-w-[400px] userrow spanall shadow-indigo-50 flex p-5 h-screen text-slate-700/100 dark:text-white/60 bg-white-50 dark:bg-slate-800`}>
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
							className={`basis-full sm:basis-auto flex-grow dialogue spanall min-w-max h-screen pt-2 bg-white dark:bg-slate-900/50 dark:text-white border-l border-r dark:border-slate-500 border-x-white/50 border-color-white-50`}>
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
							className={`basis-full sm:basis-auto w-full relative bg-slate-100 dark:bg-inherit border-0 border-l border-gray-600`}>
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
