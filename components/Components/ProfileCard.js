/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

export default function ProfileCard({
	post,
	func,
	text,
	from,
	isTrue,
	setRemoveList,
	list,
	setList,
	active,
}) {
	const router = useRouter();
	const [buttonBlock, setButtonBlock] = useState(false);
	const [buttonText, setButtonText] = useState("");

	useEffect(() => {
		if (list.includes(post.id)) {
			setButtonBlock(true);
		}
	}, [list]);

	useEffect(() => {
		if (from === "follow") {
			setButtonText("Remove");
		} else {
			setButtonText("Message");
		}
	}, [from]);

	return (
		<li className='py-3 border-b mx-2 divide-y divide-gray-200 dark:divide-gray-700 dark:border-gray-700'>
			<div className='flex items-center space-x-4'>
				<div
					className='flex-shrink-0 cursor-pointer'
					onClick={() => router.push(`/Profile?uid=${post.uid}`)}>
					<img
						className='w-10 h-10 rounded-full cusror-pointer'
						src={post?.photoURL}
						alt='profile image'
					/>
				</div>
				<div className='flex-1 min-w-0'>
					<p
						className='text-sm font-medium text-gray-900 truncate dark:text-white cursor-pointer hover:underline hover:text-blue-500 hover:dark:text-blue-500'
						onClick={() => router.push(`/Profile?uid=${post.uid}`)}>
						{post?.name}
					</p>
					<p className='text-xs font-semibold text-gray-500 truncate dark:text-gray-400'>
						@{post?.userName}
					</p>
				</div>
				{active && (
					<div className='flex  space-x-3'>
						<a
							href='#'
							className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700'
							onClick={() => {
								if (from === "follow") {
									setRemoveList((prev) => [...prev, post.id]);
								} else {
									router.push(`/messenger/components/Body?uid=${post.uid}`);
								}
							}}>
							{buttonText}
						</a>
						<a
							href='#'
							className={`inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white rounded-lg  focus:ring-4 focus:outline-none focus:ring-gray-200 dark:text-white dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700 ${
								buttonBlock ? "bg-gray-400" : "bg-blue-500"
							} text-gray-100 dark:text-gray-900 hover:opacity-70 transition-all`}
							onClick={() => {
								setButtonBlock(true);
								func(post, isTrue);
								setList((prev) => [...prev, post.id]);
							}}
							disabled={buttonBlock}
							style={{
								pointerEvents: buttonBlock ? "none" : "auto",
								opacity: buttonBlock ? 0.5 : 1,
								backgroundColor: buttonBlock ? "transparent" : "#ff4522",
							}}>
							{text}
						</a>
					</div>
				)}
			</div>
		</li>
	);
}
