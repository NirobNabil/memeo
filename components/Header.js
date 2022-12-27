/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import Image from "next/image";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
	RiHomeFill,
	RiHomeLine,
	RiLayoutMasonryLine,
	RiNotificationLine as RiNotificationFill,
	RiNotificationOffLine as RiNotificationOffFill,
	RiMoonFill,
	RiSunFill,
} from "react-icons/ri";
import { HiOutlineVideoCamera as RiVideoFill } from "react-icons/hi2";
import HeaderLink from "./HeaderLink";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import { Avatar, Modal } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { UserCircleIcon } from "@heroicons/react/outline";
import { CogIcon } from "@heroicons/react/solid";
import { LogoutIcon } from "@heroicons/react/outline";
import { ChatAlt2Icon } from "@heroicons/react/outline";

import { db, auth } from "../firebase";
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
	setDoc,
	updateDoc,
	arrayUnion,
	arrayRemove,
	deleteDoc,
	serverTimestamp,
	onSnapshot,
	orderBy,
	limit,
	startAfter,
	endBefore,
	startAt,
	endAt,
	increment,
	decrement,
	runTransaction,
	writeBatch,
	addDoc,
	getFirestore,
	getDocFromCache,
} from "firebase/firestore";
import {
	FiHeart,
	FiLogOut,
	FiSettings,
	FiUser,
	FiUsers,
	FiMessageCircle,
	FiMessageSquare,
} from "react-icons/fi";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Link from "next/link";
import ReactTimeAgo from "react-time-ago";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import NotificationSkeleton from "./Skeleton/NotificationSkeleton";

import InfiniteScroll from "react-infinite-scroll-component";

import { signOut } from "firebase/auth";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ProfileCard from "./Components/ProfileCard";

const spring = {
	type: "spring",
	stiffness: 700,
	damping: 30,
};

function Header(props) {
	const [mounted, setMounted] = useState(false);
	const { setTheme, resolvedTheme, theme } = useTheme();
	const [text, setText] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [users, setUsers] = useState([]);
	const [list, setList] = useState([]);
	const [modalFollowOpen, setModalFollowOpen] = useState(false);
	const [modalFollowingOpen, setModalFollowingOpen] = useState(false);
	const [modalFollowersOpen, setModalFollowersOpen] = useState(false);
	const [followListRemove, setFollowListRemove] = useState([]);
	const user = useSelector((state) => state.data.currentUser);
	const {
		tab,
		setTab,
		notifications,
		notificationsLength,
		setNotificationsLength,
		fetchMore,
		posts,
		active,
		follow,
		following,
		followers,
		followingUIDs,
		followersUIDs,
		fetchMorePosts,
		fetchFollowing,
		fetchFollow,
		fetchFollowers,
		Isactive,
		fromFavorites,
		profile,
	} = props;

	console.log(follow, following, followers);

	// After mounting, we have access to the theme
	useEffect(() => setMounted(true), []);
	const router = useRouter();

	const handleSearch = (e) => {
		setText(e.target.value);
		console.log(text);
		if (e.target.value.length > 0) {
			setShowSearch(true);

			const q = query(
				collection(db, "users"),
				where("userName", ">=", e.target.value),
				where("userName", "<=", e.target.value.toLowerCase() + "\uf8ff"),
				orderBy("userName", "asc"),
				limit(5)
			);
			getDocs(q).then((querySnapshot) => {
				const users = [];
				querySnapshot.forEach((doc) => {
					users.push(doc.data());
				});
				setUsers(users);
			});
		} else {
			setShowSearch(false);
		}
	};

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

	const imageRegexB = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)/g;

	function determineNotiMsg(msg) {
		if (msg.gif) {
			return "Sent a GIF";
		} else if (msg.file) {
			return "Sent a file";
		} else if (msg.video) {
			return "Sent a video";
		} else if (msg.base64 || msg.notifimsg.match(imageRegexB) != null) {
			return "Sent a photo";
		} else {
			return msg.notifimsg.length > 23
				? msg.notifimsg.substring(0, 23) + "..."
				: msg.notifimsg;
		}
	}

	const notificationsView =
		notifications.length > 0 &&
		notifications?.map((notif) => {
			return (
				<CSSTransition key={notif.docId} timeout={500} classNames='fade'>
					<div
						className={`flex flex-row items-center space-y-5 justify-between w-full h-16 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800  transition duration-300 ease-in-out ${
							notif.read
								? "bg-gray-100 dark:bg-gray-800"
								: "bg-white dark:bg-gray-900"
						}`}
						onClick={() => {
							// setChatuser(notif.senderid)
							updateDoc(
								doc(
									db,
									"notifications",
									user?.uid,
									"notifications",
									notif.docId
								),
								{
									read: true,
								}
							);
							setNotificationsLength(notificationsLength - 1);
							if (notif?.type === "follow") {
								router.push(`/Profile?uid=${notif?.senderid}`);
							} else if (notif?.type === "tag" || notif?.type === "comment") {
								router.push(`/posts?id=${notif.postID}`);
							} else {
								router.push(`/messenger?id=${notif.senderid}`);
							}
						}}>
						<div className='flex flex-row items-center justify-start w-full h-full space-x-4'>
							<div className='flex flex-col items-center justify-center w-12 h-12'>
								{notif?.photoURL && (
									<img
										className='object-cover w-10 h-10 rounded-full'
										src={notif.photoURL}
										alt='profile'
									/>
								)}
							</div>
							<div className='flex flex-col items-start justify-center w-full h-full'>
								<div className='flex flex-row items-center justify-start w-full h-6'>
									<p className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize truncate'>
										{notif?.sender.length > 10
											? notif?.sender.substring(0, 10) + "..."
											: notif?.sender}
									</p>
									<p className='font-normal text-gray-500 ml-2 flex flex-row items-center justify-start'>
										{determineNotiMsg(notif)}
									</p>
								</div>
								<div className='flex flex-row items-center justify-start w-full h-6'>
									<p className='font-normal text-gray-500'>
										<ReactTimeAgo
											date={notif.notifidate?.toDate()}
											locale='en-US'
										/>
									</p>
								</div>
							</div>
						</div>
					</div>
				</CSSTransition>
			);
		});

	return (
		<>
			<header className='fixed w-full top-0 z-40 bg-white dark:bg-slate-800/100 flex items-center justify-around py-1.5 px-3 focus-within:shadow-lg shadow-lg'>
				{/* search bar and logo */}
				<div className='flex items-center sm:space-x-2'>
					<Link href='/' passHref>
						<div>
							<Image
								src={require("../images/memex-icon.png")}
								width={45}
								height={45}
								className='rounded-full cursor-pointer object-contain'
							/>
						</div>
					</Link>
					{/* search bar */}
					<div className='flex items-center space-x-1 dark:md:bg-gray-700 py-2.5 px-4 rounded w-auto'>
						<SearchRoundedIcon />
						<input
							type='text'
							placeholder='Search'
							className='flex  md:inline-flex bg-transparent text-sm focus:outline-none placeholder-black/70  dark:placeholder-white/75 flex-grow pb-[2px] border-0 border-b-2 border-transparent focus:border-gray-300 transition-[border-bottom] text-gray-700 dark:text-gray-300 sm:text-gray-300'
							value={text}
							onChange={handleSearch}
						/>
					</div>
				</div>

				{/* show search user list */}
				{showSearch && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={spring}
						className='absolute top-14 left-20  bg-white dark:bg-[#1D2226] rounded-md shadow-md  w-72 z-50 '>
						{users?.map((user) => (
							<div
								key={user.uid}
								className='flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'>
								<Link href={`/Profile?uid=${user.uid}`} passHref>
									<Avatar src={user.photoURL} />
								</Link>
								<div
									href={`/Profile?uid=${user.uid}`}
									onClick={() => {
										router.push(`/Profile?uid=${user.uid}`);
										setShowSearch(false);
									}}
									className='flex flex-col items-start justify-center space-y-1'>
									<p className='text-sm'>{user.name}</p>
									<p className='text-sm text-gray-500'>{user.userName}</p>
								</div>
							</div>
						))}
					</motion.div>
				)}

				<div className='items-center  xl:w-auto w-full justify-around xl:-ml-12  xl:justify-between xl:space-x-20 transition-all duration-300 hidden sm:flex'>
					<HeaderLink
						Icon={RiHomeLine}
						text='Home'
						feed
						active={tab === "home"}
						handle={() => {
							setTab("home");
							sessionStorage.setItem("tab", "home");
							router.push("/");
							window.scrollTo(0, 0);
							if (window.scrollY > 0) {
								window.location.reload();
							}
						}}
					/>
					<HeaderLink
						Icon={RiVideoFill}
						text='Watch'
						feed
						active={tab === "watch"}
						handle={() => {
							setTab("watch");
							sessionStorage.setItem("tab", "watch");
						}}
					/>

					<HeaderLink
						Icon={RiLayoutMasonryLine}
						text='Templates'
						feed
						active={tab === "templates"}
						handle={() => {
							setTab("templates");
							sessionStorage.setItem("tab", "templates");
						}}
					/>
					<Popover className='relative'>
						{({ open }) => (
							<>
								<Popover.Button>
									<HeaderLink
										Icon={open ? RiNotificationFill : RiNotificationOffFill}
										text='Notifications'
										feed
										active={tab === "notifications"}
										notificationsLength={open ? 0 : notificationsLength}
										open={open}
									/>
								</Popover.Button>
								<Transition
									as={Fragment}
									enter='transition ease-out duration-200'
									enterFrom='opacity-0 translate-y-1'
									enterTo='opacity-100 translate-y-0'
									leave='transition ease-in duration-150'
									leaveFrom='opacity-100 translate-y-0'
									leaveTo='opacity-0 translate-y-1'>
									<Popover.Panel
										className={`
                      absolute z-10  right-0 mt-3 w-[420px]  rounded-md shadow-lg bg-white ring-1 ring-slate-800 ring-opacity-5 focus:outline-none dark:bg-slate-700/100 
                      ${open ? "" : "hidden"}
                    `}>
										<InfiniteScroll
											dataLength={notifications.length}
											next={fetchMore}
											hasMore={notifications.length % 10 === 0 ? true : false}
											loader={
												notifications.length % 10 === 0 && (
													<NotificationSkeleton />
												)
											}
											endMessage={
												<p style={{ textAlign: "center" }}>
													<b>Yay! You have seen it all</b>
												</p>
											}
											height={560}>
											<div className='flex flex-col w-full'>
												<h1 className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize  mb-2 mt-2 ml-2'>
													{notificationsLength} new notifications
												</h1>
												{notificationsLength === 0 ? (
													<div className='flex flex-col items-center justify-center w-full h-full'>
														<div className='flex flex-col items-center justify-center w-full h-full'>
															<div className='flex flex-row items-center justify-center w-full h-6'>
																<p className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize'>
																	No new notifications
																</p>
															</div>
														</div>
													</div>
												) : (
													<div className='flex flex-col items-center justify-center w-full h-full'>
														<div className='flex flex-col items-center justify-center w-full h-full'>
															<div className='flex flex-row items-center justify-end w-full h-6 px-5'>
																<p
																	className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize cursor-pointer px-5 py-2 rounded-md bg-orange-red/50 hover:bg-orange-red transition duration-200 shadow text-sm'
																	onClick={() => {
																		notifications?.map((notif) => {
																			if (notif.read === false) {
																				updateDoc(
																					doc(
																						db,
																						"notifications",
																						user?.uid,
																						"notifications",
																						notif.docId
																					),
																					{
																						read: true,
																					}
																				);
																			}
																		});
																		setNotificationsLength(0);
																	}}>
																	Mark all as read
																</p>
															</div>
														</div>
													</div>
												)}

												<div className='flex flex-col w-full h-full mt-4'>
													<TransitionGroup>{notificationsView}</TransitionGroup>
												</div>
											</div>
										</InfiniteScroll>
									</Popover.Panel>
								</Transition>
							</>
						)}
					</Popover>
				</div>

				<div className='flex items-center space-x-10 sm:mr-20'>
					<Popover className='relative'>
						{({ open }) => (
							<>
								<Popover.Button className='text-gray-700'>
									<HeaderLink Icon={AppsOutlinedIcon} text='Menu' Menu />
								</Popover.Button>
								<Transition
									as={Fragment}
									enter='transition ease-out duration-200'
									enterFrom='opacity-0 translate-y-1'
									enterTo='opacity-100 translate-y-0'
									leave='transition ease-in duration-150'
									leaveFrom='opacity-100 translate-y-0'
									leaveTo='opacity-0 translate-y-1'>
									<Popover.Panel
										className={`
                  absolute z-10 top-full sm:top-auto right-0 sm:right-auto sm:left-0 mt-3 w-64 max-w-[100vw] sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-slate-800 ring-opacity-5 focus:outline-none dark:bg-slate-700/100
                  ${open ? "" : "hidden"}
                `}>
										<div className='py-1'>
											<Popover.Group
												as='nav'
												className='flex flex-col space-y-1'>
												<Popover.Button className='px-4 py-2 sm:text-sm'>
													{mounted && (
														<div
															className={`bg-gray-600 flex items-center ml-auto px-0.5 rounded-full h-6 w-12 cursor-pointer flex-shrink-0 relative ${
																resolvedTheme === "dark"
																	? "justify-end"
																	: "justify-start"
															} sm:hidden`}
															onClick={() =>
																setTheme(
																	resolvedTheme === "dark" ? "light" : "dark"
																)
															}>
															<span className='absolute left-0'>🌜</span>
															<motion.div
																className='w-5 h-5 bg-white rounded-full z-30'
																layout
																transition={spring}
															/>

															<span className='absolute right-0.5'>🌞</span>
														</div>
													)}
												</Popover.Button>
												<Popover.Button
													className='flex items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() =>
														router.push({
															pathname: "/Profile",
															query: { uid: user?.uid },
														})
													}>
													<UserCircleIcon
														className='w-5 h-5 mr-3'
														aria-hidden='true'
													/>
													Profile
												</Popover.Button>

												<Popover.Button
													className='flex sm:hidden items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() => setModalFollowOpen(true)}>
													<FiUser className='w-5 h-5 mr-3' />
													Follow
												</Popover.Button>

												<Popover.Button
													className='flex sm:hidden items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() => setModalFollowingOpen(true)}>
													<FiUsers className='w-5 h-5 mr-3' />
													Following
												</Popover.Button>

												<Popover.Button
													className='flex sm:hidden items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() => setModalFollowersOpen(true)}>
													<FiUsers className='w-5 h-5 mr-3' />
													Followers
												</Popover.Button>

												{active && (
													<Popover.Button
														className='flex sm:hidden items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
														onClick={() => router.push("/messenger")}>
														<FiMessageCircle className='w-5 h-5 mr-3' />
														Messenger
													</Popover.Button>
												)}
												{active && !fromFavorites && (
													<Popover.Button
														className='flex sm:hidden items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
														onClick={() => router.push("/favorites")}>
														<FiHeart className='w-5 h-5 mr-3' />
														Favorites
													</Popover.Button>
												)}
												<Popover.Button
													className='flex items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() => router.push("/settings")}>
													<CogIcon
														className='w-5 h-5 mr-3'
														aria-hidden='true'
													/>
													Settings
												</Popover.Button>
												<Popover.Button
													className='flex items-center px-4 py-2 sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2D333B] dark:hover:text-white'
													onClick={() => {
														updateDoc(
															doc(db, "users", user?.uid),
															{
																online: false,
															},
															{ merge: true }
														).then(() => {
															auth.signOut();
															window.location.reload();
														});
													}}>
													<LogoutIcon
														className='w-5 h-5 mr-3'
														aria-hidden='true'
													/>
													Sign out
												</Popover.Button>
											</Popover.Group>
										</div>
									</Popover.Panel>
								</Transition>
							</>
						)}
					</Popover>

					{/* Dark mode toggle */}
					{mounted && (
						<div
							className={`bg-gray-600 sm:flex items-center px-0.5 rounded-full h-6 w-12 cursor-pointer flex-shrink-0 relative ${
								resolvedTheme === "dark" ? "justify-end" : "justify-start"
							} hidden`}
							onClick={() =>
								setTheme(resolvedTheme === "dark" ? "light" : "dark")
							}>
							<span className='absolute left-0'>🌜</span>
							<motion.div
								className='w-5 h-5 bg-white rounded-full z-30'
								layout
								transition={spring}
							/>

							<span className='absolute right-0.5'>🌞</span>
						</div>
					)}
				</div>
			</header>

			{/* Bottom nav for mobile */}
			<div className='bottom-nav sm:hidden fixed bottom-0 left-0 w-full z-50 bg-white dark:bg-slate-800 py-3 shadow-[0_10px_20px_15px_rgba(0,0,0,0.5)]'>
				<div className='flex items-center xl:w-auto w-full justify-around transition-all duration-300'>
					<HeaderLink
						Icon={RiHomeLine}
						text='Home'
						feed
						active={tab === "home"}
						handle={() => {
							setTab("home");
							sessionStorage.setItem("tab", "home");
							router.push("/");
							window.scrollTo(0, 0);
							if (window.scrollY > 0) {
								window.location.reload();
							}
						}}
					/>
					<HeaderLink
						Icon={RiVideoFill}
						text='Watch'
						feed
						active={tab === "watch"}
						handle={() => {
							setTab("watch");
							sessionStorage.setItem("tab", "watch");
						}}
					/>

					<HeaderLink
						Icon={RiLayoutMasonryLine}
						text='Templates'
						feed
						active={tab === "templates"}
						handle={() => {
							setTab("templates");
							sessionStorage.setItem("tab", "templates");
						}}
					/>
					<Popover className='relative'>
						{({ open }) => (
							<>
								<Popover.Button>
									<HeaderLink
										Icon={open ? RiNotificationFill : RiNotificationOffFill}
										text='Notifications'
										feed
										active={tab === "notifications"}
										notificationsLength={open ? 0 : notificationsLength}
										open={open}
									/>
								</Popover.Button>
								<Transition
									as={Fragment}
									enter='transition ease-out duration-200'
									enterFrom='opacity-0 translate-y-1'
									enterTo='opacity-100 translate-y-0'
									leave='transition ease-in duration-150'
									leaveFrom='opacity-100 translate-y-0'
									leaveTo='opacity-0 translate-y-1'>
									<Popover.Panel
										className={`
                      absolute z-10  bottom-16 right-0 mt-3 w-[calc(100vw-100px)] mx-auto  rounded-md shadow-lg bg-white ring-1 ring-slate-800 ring-opacity-5 focus:outline-none dark:bg-slate-700/100 max-h-[70vh] overflow-y-auto 
                      ${open ? "" : "hidden"}
                    `}>
										<InfiniteScroll
											dataLength={notifications.length}
											next={fetchMore}
											hasMore={notifications.length % 10 === 0 ? true : false}
											loader={
												notifications.length % 10 === 0 && (
													<NotificationSkeleton />
												)
											}
											endMessage={
												<p style={{ textAlign: "center" }}>
													<b>Yay! You have seen it all</b>
												</p>
											}
											height={360}>
											<div className='flex flex-col w-full'>
												<h1 className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize  mb-2 mt-2 ml-2'>
													{notificationsLength} new notifications
												</h1>
												{notificationsLength === 0 ? (
													<div className='flex flex-col items-center justify-center w-full h-full'>
														<div className='flex flex-col items-center justify-center w-full h-full'>
															<div className='flex flex-row items-center justify-center w-full h-6'>
																<p className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize'>
																	No new notifications
																</p>
															</div>
														</div>
													</div>
												) : (
													<div className='flex flex-col items-center justify-center w-full h-full'>
														<div className='flex flex-col items-center justify-center w-full h-full'>
															<div className='flex flex-row items-center justify-end w-full h-6 px-5'>
																<p
																	className='font-semibold text-gray-900 dark:text-gray-100 first-letter:capitalize cursor-pointer px-5 py-2 rounded-md bg-orange-red/50 hover:bg-orange-red transition duration-200 shadow text-sm'
																	onClick={() => {
																		notifications?.map((notif) => {
																			if (notif.read === false) {
																				updateDoc(
																					doc(
																						db,
																						"notifications",
																						user?.uid,
																						"notifications",
																						notif.docId
																					),
																					{
																						read: true,
																					}
																				);
																			}
																		});
																		setNotificationsLength(0);
																	}}>
																	Mark all as read
																</p>
															</div>
														</div>
													</div>
												)}

												<div className='flex flex-col w-full h-full mt-3'>
													<TransitionGroup>{notificationsView}</TransitionGroup>
												</div>
											</div>
										</InfiniteScroll>
									</Popover.Panel>
								</Transition>
							</>
						)}
					</Popover>
				</div>
			</div>

			{/* modals for follow followers  */}
			{/* <Modal
				isOpen={modalFollowingOpen}
				onRequestClose={() => setModalFollowingOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
					content: {
						backgroundColor: "transparent",
						border: "none",
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						padding: 0,
						width: "100%",
						maxWidth: "550px",
						height: "100%",
						maxHeight: "550px",
						overflow: "scroll",
					},
				}}
				contentLabel='Follow List'
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

			<Modal
				isOpen={modalFollowersOpen}
				onRequestClose={() => setModalFollowersOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1000,
					},
					content: {
						backgroundColor: "transparent",
						border: "none",
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						padding: 0,
						width: "100%",
						maxWidth: "550px",
						height: "100%",
						maxHeight: "550px",
						overflow: "scroll",
					},
				}}
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
							backgroundColor: "transparent",
							border: "none",
							top: "50%",
							left: "50%",
							right: "auto",
							bottom: "auto",
							marginRight: "-50%",
							transform: "translate(-50%, -50%)",
							padding: 0,
							width: "100%",
							maxWidth: "550px",
							height: "100%",
							maxHeight: "550px",
							overflow: "scroll",
						},
					}}
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
			)} */}
		</>
	);
}

export default Header;
