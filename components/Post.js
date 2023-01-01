/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Avatar, IconButton } from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useState, useRef, useCallback } from "react";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import Image from "next/image";
import TimeAgo from "timeago-react";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import HaHa from "../images/Haha.png";
import HahaInactive from "../images/haha-inactive.png";
import Link from "next/link";
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
	increment,
} from "firebase/firestore";

import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";

import moment from "moment";
import { useRouter } from "next/router";

import { auth, db, storage } from "../firebase";
import { Delete, Share } from "@mui/icons-material";
import { HeartIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";
import { ChatAltIcon } from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";
import Modal from "react-modal";
import Video from "./Video";
import AlertBox from "./Components/AlertBox";
import ShowCommentItem from "./Components/ShowCommentItem";
import Linkify from "react-linkify";
import { AddLinks } from "react-link-text";

function Post({ post, active, modalPost, setRemoveList, len, setIsDeleted }) {
	const [showInput, setShowInput] = useState(false);
	const [liked, setLiked] = useState(false);
	const [comment, setComment] = useState("");
	const [comments, setComments] = useState([]);
	const [showComments, setShowComments] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [reply, setReply] = useState("");
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [modalUsers, setModalUsers] = useState([]);
	const [modalTitle, setModalTitle] = useState("");
	const [showCommentInput, setShowCommentInput] = useState(false);
	const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
	const [sharePostText, setSharePostText] = useState("");
	const [showCaption, setShowCaption] = useState(false);
	const [commentlen, setCommentlen] = useState(len);
	const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
	const [alert, setAlert] = useState(false);

	const [commentTagUsers, setCommentTagUsers] = useState([]);
	const [commentTagUsersModalIsOpen, setCommentTagUsersModalIsOpen] = useState(
		false
	);
	const [user, setUser] = useState(null);

	const postRef = useRef(null);

	const router = useRouter();

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			setUser(user);
		}
	}, []);

	useEffect(() => {
		if (user) {
			getDoc(doc(db, "posts", user?.uid, "userFavorites", post.id)).then(
				(doc) => {
					if (doc.exists()) {
						setIsFavorite(true);
					} else {
						setIsFavorite(false);
					}
				}
			);
		}
	}, [post.id, user?.uid]);

	useEffect(() => {
		if (user) {
			getDoc(doc(db, "posts", post.id, "likes", user?.uid)).then((doc) => {
				if (doc?.data()) {
					setLiked(true);
				} else {
					setLiked(false);
				}
			});
		}
	}, [user?.uid, post.id]);

	useEffect(() => {
		if (!user) return;
		const unsubscribe = onSnapshot(
			query(
				collection(db, "posts", post.id, "comments"),
				orderBy("timestamp", "desc"),
				limit(commentlen)
			),
			(snapshot) => {
				let commentsAll = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				commentsAll.map((comment) => {
					const q = query(
						collection(db, "posts", post.id, "comments", comment.id, "likes"),
						where("likes", "array-contains", user?.uid)
					);
					onSnapshot(q, (snapshot) => {
						if (snapshot.docs.length > 0) {
							comment.liked = true;
						} else {
							comment.liked = false;
						}
					});
				});
				commentsAll.map((comment) => {
					comment.comments.map((doc) => {
						doc.reply = false;
					});
				});
				setComments(commentsAll);
			}
		);
		return unsubscribe;
	}, [post.id, user?.uid, commentlen]);

	useEffect(() => {
		if (!user) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) {
						if (active) {
							getDoc(doc(db, "posts", user?.uid, "viewedPosts", post.id)).then(
								(document) => {
									if (!document.exists()) {
										setDoc(
											doc(db, "posts", user?.uid, "viewedPosts", post.id),
											{
												postID: post.id,
												timestamp: serverTimestamp(),
											}
										);
									}
								}
							);
						}
					}
				});
			},
			{ threshold: 0.5 }
		);

		if (postRef.current) {
			observer.observe(postRef.current);
		}
		return () => {
			if (postRef.current) {
				observer.unobserve(postRef.current);
			}
		};
	}, [postRef, post.id, user?.uid, active]);

	const addComment = async (e) => {
		e.preventDefault();
		if (comment.trim() === "") return;
		const commentToSend = comment;
		setComment("");
		await addDoc(collection(db, "posts", post.id, "comments"), {
			comment: commentToSend,
			user: {
				uid: user?.uid,
				name: user.name,
				photoURL: user.photoURL,
				userName: user.userName,
			},
			comments: [],
			likes: [],
			timestamp: serverTimestamp(),
		});
		getDoc(doc(db, "posts", post.id)).then((docValue) => {
			if (docValue.exists()) {
				updateDoc(doc(db, "posts", post.id), {
					comments: docValue.data().comments + 1,
				});
				post.comments = docValue.data().comments + 1;
			}
		});
		commentToSend.match(/@(\w+)/g)?.map((tag) => {
			const userName = tag.replace("@", "");
			getDocs(
				query(collection(db, "users"), where("userName", "==", userName))
			).then((snapshot) => {
				snapshot.docs.map((doc) => {
					if (doc.exists()) {
						addDoc(collection(db, "notifications", doc.id, "notifications"), {
							notifimsg: `${user.name} mentioned you in a comment`,
							type: "comment",
							postID: post.id,
							comment: commentToSend,
							notifidate: serverTimestamp(),
							read: false,
							userName: user?.userName,
							sender: user?.name,
							senderid: user?.uid,
							photoURL: user?.photoURL,
						});
					}
				});
			});
		});
	};

	const sharePost = async () => {
		const postRef = await addDoc(collection(db, "posts"), {
			caption: sharePostText,
			postURL: post.postURL,
			type: post.type,
			timestamp: serverTimestamp(),
			likes: 0,
			comments: 0,
			shares: 0,
			share: true,
			shareFrom: {
				uid: post.user?.uid,
				name: post.user.name,
				photoURL: post.user.photoURL,
				userName: post.user.userName,
				id: post.id,
				caption: post.caption,
				timestamp: post?.timestamp,
			},
			uid: user?.uid,
			user: {
				uid: user?.uid,
				name: user.name,
				photoURL: user.photoURL,
				userName: user.userName,
			},
		});
		await updateDoc(doc(db, "posts", postRef.id), {
			postId: postRef.id,
		});
		await addDoc(collection(db, "posts", user?.uid, "userPosts"), {
			timestamp: serverTimestamp(),
			postID: postRef.id,
		});

		getDoc(doc(db, "posts", post.id)).then((docValue) => {
			if (docValue.exists()) {
				updateDoc(doc(db, "posts", post.id), {
					shares: docValue.data().shares + 1,
				});
				post.shares = docValue.data().shares + 1;
			}
		});

		await addDoc(collection(db, "posts", post.id, "shares"), {
			user: {
				uid: user?.uid,
				name: user.name,
				photoURL: user.photoURL,
				userName: user?.userName || "",
			},
			timestamp: serverTimestamp(),
		});
		setShareModalIsOpen(false);
	};

	const deletePost = async () => {
		if (
			(post.type === "image" || post.type === "video") &&
			post.share === false &&
			post?.postURL
		) {
			try {
				const storageRef = ref(storage, post.postURL);
				await deleteObject(storageRef);
			} catch (error) {
				console.log(error);
			}
		}

		try {
			if (post.comments > 0) {
				const commentsRef = collection(db, "posts", post.id, "comments");
				const commentsSnapshot = await getDocs(commentsRef);
				commentsSnapshot.forEach(async (docs) => {
					await deleteDoc(doc(db, "posts", post.id, "comments", docs.id));
				});
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (post.likes > 0) {
				const likesRef = collection(db, "posts", post.id, "likes");
				const likesSnapshot = await getDocs(likesRef);
				likesSnapshot.forEach(async (docs) => {
					await deleteDoc(doc(db, "posts", post.id, "likes", docs.id));
				});
			}
		} catch (error) {
			console.log(error);
		}
		try {
			if (post.shares > 0) {
				const sharesRef = collection(db, "posts", post.id, "shares");
				const sharesSnapshot = await getDocs(sharesRef);
				sharesSnapshot.forEach(async (docs) => {
					await deleteDoc(doc(db, "posts", post.id, "shares", docs.id));
				});
			}
		} catch (error) {
			console.log(error);
		}
		try {
			const q = query(
				collection(db, "posts", user?.uid, "userPosts"),
				where("postID", "==", post.id)
			);
			await onSnapshot(q, (snapshot) => {
				snapshot.docs.map(async (document) => {
					await deleteDoc(
						doc(db, "posts", user?.uid, "userPosts", document.id)
					);
				});
			});
		} catch (error) {
			console.log(error);
		}
		try {
			await deleteDoc(doc(db, "posts", post.id));
			console.log("Deleted");
			setIsDeleted(true);
			setTimeout(() => {
				setIsDeleted(false);
			}, 2000);
		} catch (error) {
			console.log(error);
		}
	};

	const minimizeCountLength = (len) => {
		if (len <= 0) return "";
		if (len < 1000) return len;
		if (len >= 1000 && len < 1000000) return `${(len / 1000).toFixed(1)}K`;
		if (len >= 1000000 && len < 1000000000)
			return `${(len / 1000000).toFixed(1)}M`;
		if (len >= 1000000000 && len < 1000000000000)
			return `${(len / 1000000000).toFixed(1)}B`;
		if (len >= 1000000000000 && len < 1000000000000000)
			return `${(len / 1000000000000).toFixed(1)}T`;
	};

	const truncate = (string, n, moreText = "...") => {
		return string.length > n
			? string.substr(0, n - 1) + " " + moreText
			: string;
	};

	useEffect(() => {
		if (isFavorite === true) {
			setTimeout(() => {
				setAlert(false);
			}, 3000);
		}
	}, [isFavorite]);

	const options = {
		className: "text-blue-500 text-underline",
	};

	return (
		<>
			<div
				className={`bg-white dark:bg-slate-800 mx-3 my-3 text-gray-600 dark:text-gray-300 ${
					modalPost ? "rounded-r-lg" : "rounded-lg"
				} space-y-2 py-2.5 border border-gray-300 dark:border-none`}
				ref={postRef}>
				{post.share ? (
					<div className='flex items-center px-2.5 cursor-pointer  '>
						<Link href={`/Profile?uid=${post?.shareFrom.uid}`}>
							<div>
								{post?.shareFrom?.photoURL && (
									<img
										src={post?.shareFrom?.photoURL}
										className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
									/>
								)}
							</div>
						</Link>
						<div className='mr-auto ml-2 leading-none'>
							{console.log(post?.shareFrom?.uid, post?.user?.uid)}
							<Link href={`/Profile?uid=${post?.shareFrom?.uid}`}>
								<h6 className='font-medium hover:text-blue-500 hover:underline'>
									{post?.shareFrom?.name}{" "}
									<span className='text-xs dark:text-white/50 p-y-1 '>
										Shared
									</span>
								</h6>
							</Link>
							<p className='font-semibold text-xs dark:text-white/50 p-y-1 '>
								@{post?.shareFrom?.userName}
							</p>
							<p className='text-sm dark:text-white/50 p-y-1 '>
								{moment(post?.shareFrom?.timestamp?.toDate()).fromNow()}
							</p>
						</div>
						{!isFavorite ? (
							<HeartIcon
								className='h-6 w-6 text-slate-900 dark:text-white cursor-pointer space-x-2 mr-2'
								onClick={() => {
									setIsFavorite(true);
									setAlert(true);
									setDoc(
										doc(db, "posts", user?.uid, "userFavorites", post.id),
										{
											id: post.id,
											timestamp: serverTimestamp(),
										}
									);
								}}
							/>
						) : (
							<HeartIconSolid
								onClick={() => {
									setIsFavorite(false);
									setAlert(false);
									deleteDoc(
										doc(
											db,
											"posts",
											user?.uid,
											"userFavorites",
											post.id
										)
									);
								}}
								className='h-6 w-6 text-red-500 cursor-pointer space-x-2 mr-2 hover:opacity-50 transition'
							/>
						)}
					</div>
				) : (
					<div className='flex items-center px-2.5 cursor-pointer  '>
						<Link href={`/Profile?uid=${post?.user?.uid}`}>
							<div>
								{post?.user?.photoURL && (
									<img
										src={post?.user?.photoURL}
										className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
									/>
								)}
							</div>
						</Link>
						<div className='mr-auto ml-2 leading-none'>
							<Link href={`/Profile?uid=${post?.user?.uid}`}>
								<h6 className='font-medium hover:text-blue-500 hover:underline'>
									{post?.user?.name}
								</h6>
							</Link>
							<p className='text-xs dark:text-white/50 p-y-2 font-bold'>
								@{post?.user?.userName}
							</p>
							<TimeAgo
								datetime={post?.timestamp?.toDate()}
								className='text-xs dark:text-white/50 '
							/>
						</div>
						{!isFavorite ? (
							<HeartIcon
								className='h-6 w-6 text-slate-900 dark:text-white cursor-pointer space-x-2 mr-2'
								onClick={() => {
									setIsFavorite(true);
									setAlert(true);
									setDoc(
										doc(db, "posts", user?.uid, "userFavorites", post.id),
										{
											id: post.id,
											timestamp: serverTimestamp(),
										}
									);
								}}
							/>
						) : (
							<HeartIconSolid
								onClick={() => {
									setIsFavorite(false);
									setAlert(false);
									deleteDoc(
										doc(db, "posts", user?.uid, "userFavorites", post.id)
									);
								}}
								className='h-6 w-6 text-red-500 cursor-pointer space-x-2 mr-2 hover:opacity-50 transition'
							/>
						)}
					</div>
				)}

				{!post?.share && post?.caption && (
					<div className='px-2.5 break-all post-caption'>
						{showInput ? (
							<p onClick={() => setShowInput(false)} className='break-all'>
								<Linkify
									properties={{
										target: "_blank",
										style: {
											color: "#0645AD",
											textDecoration: "underline",
										},
									}}>
									<p>{post?.caption}</p>
								</Linkify>
							</p>
						) : (
							<p onClick={() => setShowInput(true)}>
								<Linkify
									properties={{
										target: "_blank",
										style: {
											color: "#0645AD",
											textDecoration: "underline",
										},
									}}>
									{truncate(post?.caption, 150)}
								</Linkify>
							</p>
						)}
					</div>
				)}

				{post?.share && post?.shareFrom.caption && (
					<div className='px-2.5 break-all post-caption'>
						{showInput ? (
							<p onClick={() => setShowInput(false)} className='break-all'>
								<Linkify
									properties={{
										target: "_blank",
										style: {
											color: "#0645AD",
											textDecoration: "underline",
										},
									}}>
									{post?.shareFrom.caption}
								</Linkify>
							</p>
						) : (
							<p onClick={() => setShowInput(true)}>
								<Linkify
									properties={{
										target: "_blank",
										style: {
											color: "#0645AD",
											textDecoration: "underline",
										},
									}}>
									{truncate(post?.shareFrom.caption, 150)}
								</Linkify>
							</p>
						)}
					</div>
				)}

				{post?.postURL &&
					(post?.type === "image" ? (
						<img
							src={post?.postURL}
							alt='post image'
							className='object-contain w-auto mx-auto max-h-[60vh] sm:max-h-[65vh] min-h-[300px]'
						/>
					) : (
						<Video videoURL={post?.postURL} />
					))}

				{post?.share && (
					<>
						<div className='flex items-center px-2.5 cursor-pointer  '>
							<Link href={`/Profile?uid=${post?.user?.uid}`}>
								<div>
									{post?.user?.photoURL && (
										<img
											src={post?.user?.photoURL}
											className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
										/>
									)}
								</div>
							</Link>
							<div className='mr-auto ml-2 leading-none'>
								<Link href={`/Profile?uid=${post?.user?.uid}`}>
									<h6 className='font-medium hover:text-blue-500 hover:underline'>
										{post?.user?.name}
									</h6>
								</Link>
								<p className='font-semibold text-xs dark:text-white/50 p-y-1 '>
									@{post?.user?.userName}
								</p>
								<TimeAgo
									datetime={post?.timestamp?.toDate()}
									className='text-xs dark:text-white/50 '
								/>
							</div>
						</div>
						<div className='px-2.5 break-all post-caption'>
							{showCaption ? (
								<p onClick={() => setShowCaption(false)} className='break-all'>
									<Linkify
										properties={{
											target: "_blank",
											style: {
												color: "#0645AD",
												textDecoration: "underline",
											},
										}}>
										<p>{post?.caption}</p>
									</Linkify>
								</p>
							) : (
								<p onClick={() => setShowCaption(true)}>
									<Linkify
										properties={{
											target: "_blank",
											style: {
												color: "#0645AD",
												textDecoration: "underline",
											},
										}}>
										{truncate(post?.caption, 150)}
									</Linkify>
								</p>
							)}
						</div>
					</>
				)}

				<div className='flex items-center justify-between px-2.5'>
					<div className='flex items-center space-x-2'>
						<p
							className='text-sm dark:text-white/50 hover:text-blue-500 hover:underline cursor-pointer'
							onClick={() => {
								setModalIsOpen(true);
								setModalTitle("Reacts");
								getDocs(collection(db, "posts", post.id, "likes")).then(
									(snapshot) => {
										setModalUsers(
											snapshot.docs.map((doc) => ({
												id: doc.id,
												...doc.data(),
											}))
										);
									}
								);
							}}>
							{post?.likes > 0
								? `${liked ? "You and " : ""}${minimizeCountLength(
										post?.likes - liked
								  )} others reacts •`
								: null}
						</p>
						<p
							className='text-sm dark:text-white/50 hover:text-blue-500 hover:underline cursor-pointer'
							onClick={() => {
								setModalIsOpen(true);
								setModalTitle("Comments");
								getDocs(
									collection(db, "posts", post.id, "comments"),
									orderBy("timestamp", "desc"),
									limit(commentlen)
								).then((snapshot) => {
									setModalUsers(
										snapshot.docs.map((doc) => ({
											id: doc.id,
											...doc.data(),
											...doc.data().user,
										}))
									);
								});
							}}>
							{post?.comments > 0
								? `${minimizeCountLength(post?.comments)} comments •`
								: null}
						</p>
					</div>
					<div className='flex items-center space-x-2'>
						<p
							className='text-sm dark:text-white/50 cursor-pointer
          hover:text-blue-500 hover:underline'
							onClick={() => {
								setModalIsOpen(true);
								setModalTitle("Shares");
								getDocs(collection(db, "posts", post.id, "shares")).then(
									(snapshot) => {
										setModalUsers(
											snapshot.docs.map((doc) => ({
												id: doc.id,
												photoURL: doc.data().user.photoURL,
												name: doc?.data()?.user.name,
												userName: doc.data().user.userName,
											}))
										);
									}
								);
							}}>
							{post?.shares > 0
								? `${minimizeCountLength(post.shares)} shares`
								: null}
						</p>
					</div>
				</div>

				<div className='flex justify-evenly items-center rounded-full  border-gray-600/80 text-gray-500 dark:text-white/75 bg-gray-100 dark:bg-slate-900 w-[90%] mx-auto'>
					<button
						className={`postButton `}
						onClick={() => {
							if (liked) {
								setLiked(false);
								updateDoc(doc(db, "posts", post.id), {
									likes: increment(-1),
								});
								deleteDoc(doc(db, "posts", post.id, "likes", user?.uid));
								post.likes -= 1;
							} else {
								setLiked(true);
								updateDoc(doc(db, "posts", post.id), {
									likes: increment(1),
								});
								setDoc(doc(db, "posts", post.id, "likes", user?.uid), {
									uid: user?.uid,
									name: user.name,
									photoURL: user.photoURL,
									userName: user.userName || user.email.split("@")[0],
								});
								post.likes += 1;
							}
						}}>
						{liked ? (
							<i className='fas fa-laugh-squint text-2xl sm:text-xl text-[#ff4522]'></i>
						) : (
							<i className='fas fa-laugh-beam text-2xl sm:text-xl text-gray-200'></i>
						)}

						<p className='text-sm font-medium hidden sm:block'>HaHa</p>
					</button>

					<button
						className='postButton'
						onClick={() => {
							setShowCommentInput(!showCommentInput);
						}}>
						<ChatAltIcon className='h-7 sm:h-5' />
						<p className='text-xs sm:text-base hidden sm:block'>Comment</p>
					</button>

					{user?.userName === post?.user?.userName ? (
						<button
							className='postButton'
							onClick={() => {
								setDeleteModalIsOpen(true);
							}}>
							<Delete className='h-8 w-8 sm:h-6 sm:w-6' />
							<h4 className='hidden sm:block'>Delete</h4>
						</button>
					) : (
						<button
							className='postButton'
							onClick={() => {
								setShareModalIsOpen(true);
							}}>
							<Share width={28} height={28} />
							<h4 className='hidden sm:block'>Share</h4>
						</button>
					)}
				</div>

				{post?.comments > 0 && post?.comments !== commentlen && (
					<div className='flex items-center space-x-2 p-2.5 cursor-pointer'>
						<span
							className='flex items-center space-x-2'
							onClick={() => {
								if (commentlen + 3 < post?.comments) {
									setCommentlen(commentlen + 3);
								} else {
									setCommentlen(post?.comments);
								}
							}}>
							see all {post?.comments} comments
						</span>
					</div>
				)}

				{comments && (
					<div className='flex flex-col space-y-2 px-2.5'>
						{comments?.map((comment) => (
							<ShowCommentItem
								comment={comment}
								key={comment.id}
								truncate={truncate}
								user={user}
								len={len}
								post={post}
								comments={comments}
								setComments={setComments}
							/>
						))}
					</div>
				)}

				{!showCommentInput && (
					<div className='flex items-center space-x-2 px-2.5 py-2'>
						<img
							src={user?.photoURL}
							alt=''
							className='h-8 w-8 rounded-full object-cover mb-5 cursor-pointer'
							onClick={() => {
								router.push(`/Profile?uid=${user?.uid}`);
							}}
						/>
						<form className='flex flex-1'>
							<input
								type='text'
								placeholder='Add a comment...'
								className='focus:outline-none flex-1 dark:bg-gray-700 bg-gray-100 dark:text-white/75 text-gray-500 rounded-full py-1.5 px-4'
								value={comment}
								onChange={(e) => {
									if (e.target.value.match(/@([a-zA-Z0-9_]+)/g)) {
										setCommentTagUsersModalIsOpen(true);
										let text = e.target.value
											.match(/@([a-zA-Z0-9_]+)/g)
											[
												e.target.value.match(/@([a-zA-Z0-9_]+)/g).length - 1
											].replace("@", "");
										getDocs(
											query(
												collection(db, "users"),
												where("userName", ">=", text),
												where(
													"userName",
													"<=",
													text.toLocaleLowerCase() + "\uf8ff"
												),
												limit(5)
											)
										).then((querySnapshot) => {
											setCommentTagUsers(
												querySnapshot.docs.map((doc) => doc.data())
											);
										});
									} else {
										setCommentTagUsersModalIsOpen(false);
										setCommentTagUsers([]);
									}
									setComment(e.target.value);
								}}
							/>
							<button
								type='submit'
								className='hidden'
								onClick={addComment}></button>
							{commentTagUsers.length > 0 && (
								<div className='absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-md w-80 mt-10'>
									{commentTagUsers.map((user) => (
										<div
											key={user.uid}
											className='flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
											onClick={() => {
												/// replace last taguser with the selected user
												setComment(
													comment.replace(
														/@([a-zA-Z0-9_]+)$/,
														`@${user.userName}`
													)
												);
												setCommentTagUsers([]);
											}}>
											<img
												src={user.photoURL}
												alt=''
												className='h-8 w-8 rounded-full object-cover mb-5 cursor-pointer'
											/>
											<div className='flex flex-col'>
												<p className='font-semibold'>{user.name}</p>
												<p className='text-gray-500 text-xs font-semibold'>
													@{user.userName}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</form>
					</div>
				)}
			</div>

			{/* make custom Modal */}
			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				className='bg-white text-slate-800 dark:text-gray-300 dark:bg-slate-900 rounded-lg shadow-lg p-4'
				overlayClassName='fixed inset-0 bg-black/50 flex items-center justify-center'
				style={{
					overlay: {
						zIndex: 9999,
					},
					content: {
						width: "540px",
						height: "auto",
						margin: "auto",
						padding: "0px",
						border: "none",
						borderRadius: "10px",
					},
				}}>
				<div className='flex flex-col p-2'>
					<div className='flex items-center justify-between'>
						<h1 className='text-lg  font-semibold dark:text-white/75'>
							{modalTitle}
						</h1>
						<button
							className='focus:outline-none'
							onClick={() => setModalIsOpen(false)}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 text-gray-500 dark:text-white/75'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>
					<div className='flex flex-col space-y-3'>
						{modalUsers?.map((doc) => (
							<div key={doc.id} className='flex space-x-2 flex-inline mt-3 '>
								<Link href={`/Profile?uid=${doc?.uid}`}>
									<img
										src={doc?.photoURL}
										alt=''
										className='h-7 w-7 rounded-full object-cover mt-2 cursor-pointer'
									/>
								</Link>
								<div className='flex flex-col'>
									<div className='flex items-start flex-col'>
										<Link href={`/Profile?uid=${doc?.uid}`}>
											<p className='font-semibold dark:text-white/75 cursor-pointer hover:underline'>
												{doc?.name}
											</p>
										</Link>
										<p className='text-xs font-semibold dark:text-white/50'>
											@{doc?.userName}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</Modal>

			{/* Share Post Modal */}
			<Modal
				isOpen={shareModalIsOpen}
				onRequestClose={() => setShareModalIsOpen(false)}
				className='bg-white text-slate-800 dark:text-gray-300 dark:bg-slate-900 rounded-lg shadow-lg p-4 overflow-y-scroll scrollbar-hide max-h-[600px]'
				overlayClassName='fixed inset-0 bg-black/50 flex items-center justify-center'
				style={{
					overlay: {
						zIndex: 9999,
					},
					content: {
						width: "540px",
						height: "auto",
						margin: "auto",
						padding: "0px",
						border: "none",
						borderRadius: "10px",
					},
				}}>
				<div className='flex flex-col p-4 '>
					<div className='flex items-center justify-between'>
						<h1 className='text-lg  font-semibold dark:text-white/75'>
							Share Post
						</h1>
						<button
							className='focus:outline-none'
							onClick={() => setShareModalIsOpen(false)}>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6 text-gray-500 dark:text-white/75'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>
					<div className='flex flex-col space-y-3'>
						<div className='flex space-x-2 flex-inline mt-3 '>
							<Link href={`/Profile?uid=${user?.uid}`}>
								<img
									src={user?.photoURL}
									alt=''
									className='h-7 w-7 rounded-full object-cover mt-2 cursor-pointer'
								/>
							</Link>
							<div className='flex flex-col'>
								<div className='flex flex-col'>
									<Link href={`/Profile?uid=${user?.uid}`}>
										<p className='dark:text-white/75 cursor-pointer hover:underline'>
											{user?.name}
										</p>
									</Link>
									<p className='text-xs dark:text-white/50 p-y-2 font-bold'>
										@{user?.userName}
									</p>
								</div>
							</div>
						</div>
						<div className='flex flex-col space-y-3'>
							<textarea
								className='w-full h-24 px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white/75 dark:focus:bg-slate-700'
								placeholder="What's on your mind?"
								value={sharePostText}
								onChange={(e) => setSharePostText(e.target.value)}></textarea>
							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-2'>
									<div className='flex items-center space-x-2'></div>
								</div>
								<button
									className='text-white font-semibold px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] focus:outline-none'
									onClick={sharePost}>
									Share
								</button>
							</div>
						</div>

						{post.share ? (
							<div className='flex items-center px-2.5 cursor-pointer  '>
								<Link href={`/Profile?uid=${post?.shareFrom.uid}`}>
									<div>
										{post?.shareFrom?.photoURL && (
											<img
												src={post?.shareFrom?.photoURL}
												className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
											/>
										)}
									</div>
								</Link>
								<div className='mr-auto ml-2 leading-none'>
									<Link href={`/Profile?uid=${post?.shareFrom?.uid}`}>
										<h6 className='font-medium hover:text-blue-500 hover:underline'>
											{post?.shareFrom?.name}{" "}
											<span className='text-xs dark:text-white/50 p-y-1 '>
												Shared
											</span>
										</h6>
									</Link>
									<p className='text-xs font-semibold dark:text-white/50 p-y-1'>
										@{post?.shareFrom?.userName}
									</p>
									<p className='text-sm dark:text-white/50 p-y-1 '>
										{moment(post?.timestamp?.toDate()).fromNow()}
									</p>
								</div>
							</div>
						) : (
							<div className='flex items-center px-2.5 cursor-pointer  '>
								<Link href={`/Profile?uid=${post?.user?.uid}`}>
									<div>
										{post?.user?.photoURL && (
											<img
												src={post?.user?.photoURL}
												className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
											/>
										)}
									</div>
								</Link>
								<div className='mr-auto ml-2 leading-none'>
									<Link href={`/Profile?uid=${post?.user?.uid}`}>
										<h6 className='font-medium hover:text-blue-500 hover:underline'>
											{post?.user?.name}
										</h6>
									</Link>
									<p className='font-semibold text-xs dark:text-white/50 p-y-2 '>
										@{post?.user?.userName}
									</p>
									<TimeAgo
										datetime={post?.timestamp?.toDate()}
										className='text-xs dark:text-white/50 '
									/>
								</div>
							</div>
						)}
						{post?.caption && (
							<div className='px-2.5 break-all post-caption'>
								{showInput ? (
									<p onClick={() => setShowInput(false)}>
										<Linkify
											properties={{
												target: "_blank",
												style: {
													color: "#0645AD",
													textDecoration: "underline",
												},
											}}>
											<p>{post?.caption}</p>
										</Linkify>
									</p>
								) : (
									<p onClick={() => setShowInput(true)}>
										<Linkify
											properties={{
												target: "_blank",
												style: {
													color: "#0645AD",
													textDecoration: "underline",
												},
											}}>
											{truncate(post?.caption, 150)}
										</Linkify>
									</p>
								)}
							</div>
						)}

						{post?.postURL &&
							(post?.type === "image" ? (
								<img
									src={post?.postURL}
									alt=''
									className='object-contain w-full cursor-pointer max-h-screen  min-h-72'
									// onClick={() => {
									// 	router.push(`/posts?id=${post.id}`);
									// }}
								/>
							) : (
								<Video videoURL={post?.postURL} />
							))}

						{post?.share && (
							<div className='flex items-center px-2.5 cursor-pointer  '>
								<Link href={`/Profile?uid=${post?.user?.uid}`}>
									<div>
										{post?.user?.photoURL && (
											<img
												src={post?.user?.photoURL}
												className='!h-10 !w-10 cursor-pointer rounded-full object-cover'
											/>
										)}
									</div>
								</Link>
								<div className='mr-auto ml-2 leading-none'>
									<Link href={`/Profile?uid=${post?.shareFrom?.uid}`}>
										<h6 className='font-medium hover:text-blue-500 hover:underline'>
											{post?.user?.name}
										</h6>
									</Link>
									<p className='font-semibold text-xs dark:text-white/50 p-y-1 '>
										@{post?.user?.userName}
									</p>
									<TimeAgo
										datetime={post?.timestamp?.toDate()}
										className='text-xs dark:text-white/50 '
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={deleteModalIsOpen}
				onRequestClose={() => setDeleteModalIsOpen(false)}
				className='bg-white text-slate-800 dark:text-gray-300 dark:bg-slate-900 rounded-lg shadow-lg p-4 overflow-y-scroll scrollbar-hide max-h-[600px]'
				overlayClassName='fixed inset-0 bg-black/50 flex items-center justify-center'
				style={{
					overlay: {
						zIndex: 9999,
					},
					content: {
						width: "540px",
						height: "100px",
						margin: "auto",
						padding: "0px",
						border: "none",
						borderRadius: "10px",
					},
				}}>
				<div className='flex flex-col items-center justify-center p-2'>
					Are you sure you want to delete this post?
					<div className='flex items-center justify-center space-x-4 mt-4'>
						<button
							className='text-white font-semibold px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] focus:outline-none'
							onClick={() => setDeleteModalIsOpen(false)}>
							Cancel
						</button>
						<button
							className='text-white font-semibold px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] focus:outline-none'
							onClick={deletePost}>
							Delete
						</button>
					</div>
				</div>
			</Modal>

			<AlertBox
				show={alert}
				text='Added to favorite successfully.'
				severity='success'
				setShow={setAlert}
			/>
		</>
	);
}

export default Post;
