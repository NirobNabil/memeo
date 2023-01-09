import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import {
	FiHeart,
	FiLogOut,
	FiSettings,
	FiUser,
	FiUsers,
	FiMessageCircle,
	FiMessageSquare,
} from "react-icons/fi";
import { Flex } from "../../styles/global.styles";
import { Container, LinkContainer } from "./Submenu1.styles";
import Image from "next/image";
import { useRouter } from "next/router";
import { auth } from "../../firebase";
import { db, storage } from "../../firebase";
import {
	collection,
	doc,
	getDoc,
	getDocs,
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
	setDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";

import {
	getDownloadURL,
	ref,
	uploadBytes,
	getStorage,
	listAll,
	list,
	listAllFromRef,
	getDownloadURLFromRef,
} from "firebase/storage";

import { useSelector } from "react-redux";

import Modal from "react-modal";
import ProfileCard from "../Components/ProfileCard";
import InfiniteScroll from "react-infinite-scroll-component";

const Submenu1 = (props) => {
	const {
		profile,
		following,
		followers,
		follow,
		followingUIDs,
		followersUIDs,
		fetchFollowing,
		fetchFollow,
		fetchFollowers,
		active,
		fromFavorites,
		modalFollowOpen,
		setModalFollowOpen,
		modalFollowingOpen,
		setModalFollowingOpen,
		modalFollowersOpen,
		setModalFollowersOpen,
		followListRemove,
		setFollowListRemove,
	} = props;

	const [user, setUser] = useState(null);

	const [list, setList] = useState([]);

	const router = useRouter();

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			setUser(user);
		}
	}, []);

	const followUser = async (post, isTrue) => {
		if (!isTrue) {
			updateDoc(doc(db, "users", post?.uid, "followers", post?.uid), {
				followers: arrayUnion(user?.uid),
			});

			updateDoc(doc(db, "users", user.uid, "following", user?.uid), {
				following: arrayUnion(post?.uid),
			});

			const id = [user.uid, post?.uid].sort().join("");
			getDoc(doc(db, "conversations", id)).then((Doc) => {
				if (!Doc.exists()) {
					setDoc(doc(db, "conversations", id), {
						customizedconvo: {
							theme: "https://i.imgur.com/4hzNTTq.png",
							emoji: "🤗",
						},
						uid: [user.uid, post?.uid].sort().join(""), //sorts the uid's alphabetically and joins them together
						uids: [user.uid, post?.uid],
						users: [
							{
								uid: user?.uid,
								name: user?.name,
								photoURL: user?.photoURL,
							},
							{
								uid: post?.uid,
								name: post?.name,
								photoURL: post?.photoURL,
							},
						],
						nickname1: "",
						nickname2: "",
						notifications1: true,
						notifications2: true,
						lastmsgdate: serverTimestamp(),
					});
					addDoc(collection(db, "conversations", id, "messages"), {
						message: "Welcome to your new conversation!",
						reaction1: "",
						reaction2: "",
						msgdate: serverTimestamp(),
						read: false,
						senderid: user?.uid || "",
						sendername: user?.name || "",
						editing: false,
					});

					addDoc(collection(db, "notifications", post?.uid, "notifications"), {
						notifimsg: `${user?.name} started following you`,
						notifidate: serverTimestamp(),
						read: false,
						sender: user.name,
						senderid: user.uid,
						photoURL: user.photoURL,
						type: "follow",
					});
				}
			});
		} else {
			await updateDoc(doc(db, "users", post?.uid, "followers", post?.uid), {
				followers: arrayRemove(user?.uid),
			});

			await updateDoc(doc(db, "users", user.uid, "following", user?.uid), {
				following: arrayRemove(post?.uid),
			});
		}
	};

	const followerFunction = async (post, isTrue) => {
		const userRef = doc(db, "followers", user.uid, "userFollowers", post?.id);
		await deleteDoc(userRef);
		const userRef2 = doc(db, "following", post?.id, "userFollowing", user.uid);
		await deleteDoc(userRef2);
	};

	return (
		<>
			<div className='container bg-white  dark:bg-slate-800 dark:text-gray-300 border-1 dark:border-white border-solid  rounded-lg flex flex-col space-y-4 p-4  w-64 shadow-md'>
				<div className='card'>
					<div className='card-content mt-2 px-10 py-5'>
						<div className='card-content-inner'>
							<div className='list-block media-list'>
								<ul className='text-gray-600 dark:text-gray-400'>
									{!profile && (
										<li className='mb-4'>
											<div
												className='item-link item-content flex flex-row flex-start cursor-pointer  items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
								             	transform'
												onClick={() => setModalFollowOpen(true)}>
												<div className='item-media'>
													<FiUser className='w-6 h-6 mr-6' />
												</div>
												<div className='item-inner'>
													<div className='item-title'>Follow</div>
												</div>
											</div>
										</li>
									)}
									<li className='mb-4'>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
								         	transform  '
											onClick={() => setModalFollowingOpen(true)}>
											<div className='item-media'>
												<FiUsers className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Following</div>
											</div>
										</div>
									</li>
									<li className='mb-4'>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
									transform  '
											onClick={() => setModalFollowersOpen(true)}>
											<div className='item-media'>
												<FiUsers className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Followers</div>
											</div>
										</div>
									</li>
									{active && (
										<Link href='/messenger'>
											<li className='mb-4'>
												<div
													className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
									transform  '>
													<div className='item-media'>
														<FiMessageCircle className='w-6 h-6 mr-6' />
													</div>
													<div className='item-inner'>
														<div className='item-title'>Messenger</div>
													</div>
												</div>
											</li>
										</Link>
									)}
									{active && !fromFavorites && (
										<li className='mb-4'>
											<div
												className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
									transform  '
												onClick={() => router.push("/favorites")}>
												<div className='item-media'>
													<FiHeart className='w-6 h-6 mr-6' />
												</div>
												<div className='item-inner'>
													<div className='item-title'>Favourites </div>
												</div>
											</div>
										</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{!profile && (
				<Modal
					isOpen={modalFollowOpen}
					onRequestClose={() => setModalFollowOpen(false)}
					style={{
						overlay: {
							backgroundColor: "rgba(0, 0, 0, 0.5)",
							zIndex: 1000,
						},
						content: {
							marginRight: "-50%",
						},
					}}
					className='overflow-x-hidden overflow-y-auto absolute top-1/2 left-1/2 border-0 -translate-x-1/2 -translate-y-1/2 p-0 w-[95%] max-w-[550px] h-full max-h-[550px] bg-transparent focus-visible:outline-none scrollbar-hide'
					contentLabel='Example Modal'
					ariaHideApp={false}>
					<div className='w-full  p-4 bg-white border rounded-lg shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700'>
						<div className='flex items-center justify-between mb-4'>
							<h5 className='text-xl font-bold leading-none text-gray-900 dark:text-white'>
								Follow
							</h5>
							<button
								className='text-gray-600 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:text-gray-500 dark:focus:text-gray-400'
								aria-label='close'
								onClick={() => setModalFollowOpen(false)}>
								<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
									<path
										d='M6 18L18 6M6 6l12 12'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'></path>
								</svg>
							</button>
						</div>
						<div className='flow-root'>
							<ul
								role='list'
								className='divide-y divide-gray-200 dark:divide-gray-700'>
								<InfiniteScroll
									dataLength={follow.length}
									next={fetchFollow}
									hasMore={true}
									loader={<h4>Loading...</h4>}
									endMessage={
										<p style={{ textAlign: "center" }}>
											<b>Yay! You have seen it all</b>
										</p>
									}
									height={400}
									scrollableTarget='scrollableDiv'>
									{follow.length === 0 && (
										<div className='text-center'>No Follow</div>
									)}
									{follow
										.filter((item) => followListRemove.indexOf(item.id) === -1)
										?.map((item) => (
											<ProfileCard
												key={item.id}
												post={item}
												func={followUser}
												text='Start Following'
												from='follow'
												isTrue={false}
												setRemoveList={setFollowListRemove}
												list={list}
												setList={setList}
												active={active}
											/>
										))}
								</InfiniteScroll>
							</ul>
						</div>
					</div>
				</Modal>
			)}

			{/* following  */}
			<Modal
				isOpen={modalFollowingOpen}
				onRequestClose={() => setModalFollowingOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
					content: {
						marginRight: "-50%",
					},
				}}
				className='overflow-x-hidden overflow-y-auto absolute top-1/2 left-1/2 border-0 -translate-x-1/2 -translate-y-1/2 p-0 w-[95%] max-w-[550px] h-full max-h-[550px] bg-transparent focus-visible:outline-none scrollbar-hide'
				contentLabel='Example Modal'
				ariaHideApp={false}>
				<div className='w-full  p-4 bg-white border rounded-lg shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700'>
					<div className='flex items-center justify-between mb-4'>
						<h5 className='text-xl font-bold leading-none text-gray-900 dark:text-white'>
							Following
						</h5>
						<button
							className='text-gray-600 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:text-gray-500 dark:focus:text-gray-400'
							aria-label='close'
							onClick={() => setModalFollowingOpen(false)}>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
								<path
									d='M6 18L18 6M6 6l12 12'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'></path>
							</svg>
						</button>
					</div>
					<div className='flow-root'>
						<ul
							role='list'
							className='divide-y divide-gray-200 dark:divide-gray-700'>
							<InfiniteScroll
								dataLength={following.length}
								next={fetchFollowing}
								hasMore={followingUIDs.length - 1 > following.length}
								loader={<h4>Loading...</h4>}
								endMessage={
									<p style={{ textAlign: "center" }}>
										<b>Yay! You have seen it all</b>
									</p>
								}
								height={400}
								scrollableTarget='scrollableDiv'>
								{following.length === 0 && (
									<div className='text-center'>No Followings</div>
								)}
								{following.map((item) => (
									<ProfileCard
										key={item.id}
										post={item}
										func={followUser}
										text='Unfollow'
										from='following'
										isTrue={true}
										list={list}
										setList={setList}
										active={active}
									/>
								))}
							</InfiniteScroll>
						</ul>
					</div>
				</div>
			</Modal>

			{/* followers  */}
			<Modal
				isOpen={modalFollowersOpen}
				onRequestClose={() => setModalFollowersOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
					content: {
						marginRight: "-50%",
					},
				}}
				className='overflow-x-hidden overflow-y-auto absolute top-1/2 left-1/2 border-0 -translate-x-1/2 -translate-y-1/2 p-0 w-[95%] max-w-[550px] h-full max-h-[550px] bg-transparent focus-visible:outline-none scrollbar-hide'
				contentLabel='Example Modal'
				ariaHideApp={false}>
				<div className='w-full  p-4 bg-white border rounded-lg shadow-md sm:p-8 dark:bg-gray-800 dark:border-gray-700'>
					<div className='flex items-center justify-between mb-4'>
						<h5 className='text-xl font-bold leading-none text-gray-900 dark:text-white'>
							Followers
						</h5>
						<button
							className='text-gray-600 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:text-gray-500 dark:focus:text-gray-400'
							aria-label='close'
							onClick={() => setModalFollowersOpen(false)}>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
								<path
									d='M6 18L18 6M6 6l12 12'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'></path>
							</svg>
						</button>
					</div>
					<div className='flow-root'>
						<ul
							role='list'
							className='divide-y divide-gray-200 dark:divide-gray-700'>
							<InfiniteScroll
								dataLength={followers.length}
								next={fetchFollowers}
								hasMore={followersUIDs.length > followers.length}
								loader={<h4>Loading...</h4>}
								endMessage={
									<p style={{ textAlign: "center" }}>
										<b>Yay! You have seen it all</b>
									</p>
								}
								height={400}
								scrollableTarget='scrollableDiv'>
								{followers.length === 0 && (
									<div className='text-center'>No Followers</div>
								)}
								{followers.map((item) => (
									<ProfileCard
										key={item.id}
										post={item}
										func={followerFunction}
										text='Remove'
										from='followers'
										list={list}
										setList={setList}
										active={active}
									/>
								))}
							</InfiniteScroll>
						</ul>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default Submenu1;
