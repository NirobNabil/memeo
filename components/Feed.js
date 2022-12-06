/* eslint-disable react/no-unescaped-entities */
import { CloseOutlined } from "@mui/icons-material";
import { useEffect, useState, useRef } from "react";
import Input from "./Input";
import Post from "./Post";
import {
	getDocs,
	collection,
	query,
	where,
	onSnapshot,
	orderBy,
	limit,
	timestamp,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	doc,
	getDoc,
	arrayRemove,
	arrayUnion,
	setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import Postskeleton from "./Skeleton/Postskeleton";
import InfiniteScroll from "react-infinite-scroll-component";

import { useSelector } from "react-redux";

function Feed({ posts, inactive, active, len, fetchMore, fromPost }) {
	const [removeList, setRemoveList] = useState([]);
	const user = useSelector((state) => state?.data?.currentUser);
	const [loading, setLoading] = useState(false);

	if (user?.uid === undefined) return <Postskeleton />;

	return (
		<div className='space-y-6 pb-24 max-w-2xl overflow-y-scroll scrollbar-hide'>
			{!inactive && <Input />}

			<InfiniteScroll
				dataLength={posts.length}
				next={() => {
					setLoading(true);
					fetchMore();
					setLoading(false);
				}}
				hasMore={true}
				loader={!fromPost && loading && <Postskeleton />}
				endMessage={
					<p style={{ textAlign: "center" }}>
						<b>Yay! You have seen it all</b>
					</p>
				}>
				{!loading && posts?.length === 0 && (
					<div className='min-h-[300px] flex justify-center items-center'>
						<p className='font-bold text-gray-400 text-center text-2xl'>
							No posts yet!
						</p>
					</div>
				)}
				{posts.map((post) => {
					if (!removeList.includes(post.id)) {
						return (
							<Post
								key={post.id}
								post={post}
								setRemoveList={setRemoveList}
								len={len}
								active={active}
							/>
						);
					} else {
						return (
							<div
								key={post.id}
								className='flex item-center justify-between space-x-2 dark:text-gray-500 text-gray-600 text-sm m-4 border border-gray-300 dark:border-none rounded-lg p-2 dark:bg-slate-800 bg-gray-100 '>
								<p className='dark:text-gray-400 py-2 px-4'>Post Removed</p>
								<button
									className='dark:bg-gray-700 dark:text-gray-400 font-bold py-2 px-4 rounded-md cursor-pointer '
									onClick={() => {
										setRemoveList(removeList.filter((id) => id !== post.id));
									}}>
									Undo
								</button>
							</div>
						);
					}
				})}
			</InfiniteScroll>
		</div>
	);
}

export default Feed;
