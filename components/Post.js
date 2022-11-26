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



function Post({ post, active, modalPost,  setRemoveList,  len }) {
  const user = useSelector((state) => state.data.currentUser);
  const [showInput, setShowInput] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyTo, setReplyTo] = useState("");
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

	const postRef = useRef(null);

	const router = useRouter();

	useEffect(() => {
		getDoc(doc(db, "posts", user?.uid, "userFavorites", post.id)).then(
			(doc) => {
				if (doc.exists()) {
					setIsFavorite(true);
				} else {
					setIsFavorite(false);
				}
			}
		);
	}, [post.id, user?.uid]);

	useEffect(() => {
		getDoc(doc(db, "posts", post.id, "likes", user?.uid)).then((doc) => {
			if (doc?.data()) {
				setLiked(true);
			} else {
				setLiked(false);
			}
		});
	}, [user?.uid, post.id]);

	useEffect(() => {
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

  const deletePost = async ( ) => {
    if((post.type === "image" || post.type === "video") && post.share === false && post?.postURL){
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
		} catch (error) {
			console.log(error);
		}
	};

	const sendReply = async (comment) => {
		if (reply.trim() === "") return;
		const replyToSend = reply;
		setReply("");
		const object = {
			comment: replyToSend,
			id: uuidv4(),
			user: {
				uid: user?.uid,
				name: user.name,
				photoURL: user.photoURL,
				userName: user?.userName || user?.email.split("@")[0],
			},
			likes: [],
			timestamp: new Date(),
		};
		await updateDoc(doc(db, "posts", post.id, "comments", comment.id), {
			comments: arrayUnion(object),
		});

		updateDoc(doc(db, "posts", post.id), {
			comments: increment(1),
		});
		post.comments = post.comments + 1;
	};

	const loveComment = async (reply, comment) => {
		if (reply.likes.includes(user?.uid)) {
			let index = comments.map((comment) => comment.id).indexOf(comment.id);
			let index1 = comments[index].comments
				.map((comment) => comment.id)
				.indexOf(reply.id);
			comments[index].comments[index1].likes = comments[index].comments[
				index1
			].likes.filter((like) => like !== user?.uid);
			updateDoc(doc(db, "posts", post.id, "comments", comment.id), {
				comments: comments[index].comments,
			});
		} else {
			let index = comments.map((comment) => comment.id).indexOf(comment.id);
			let index1 = comments[index].comments
				.map((comment) => comment.id)
				.indexOf(reply.id);
			comments[index].comments[index1].likes.push(user?.uid);
			updateDoc(doc(db, "posts", post.id, "comments", comment.id), {
				comments: comments[index].comments,
			});
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

	const truncate = (string, n) => {
		return string?.length > n
			? string.substr(0, n - 1) + "...see more"
			: string;
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
							<Link href={`/Profile?uid=${post?.shareFrom?.uid}`}>
								<h6 className='font-medium hover:text-blue-500 hover:underline'>
									{post?.shareFrom?.name}{" "}
									<span className='text-xs dark:text-white/50 p-y-1 '>
										Shared
									</span>
								</h6>
							</Link>
							<p className='text-sm dark:text-white/50 p-y-1 '>
								{post?.shareFrom?.userName}
							</p>
							<p className='text-sm dark:text-white/50 p-y-1 '>
								{moment(post?.timestamp?.toDate()).fromNow()}
							</p>
						</div>
						{!isFavorite ? (
							<HeartIcon
								className='h-6 w-6 text-slate-900 dark:text-white cursor-pointer space-x-2 mr-2'
								onClick={() => {
									setIsFavorite(true);
									setDoc(
										doc(db, "posts", user?.uid, "userFavorites", post.id),
										{
											id: post.shareFrom.id,
											timestamp: serverTimestamp(),
										}
									);
								}}
							/>
						) : (
							<HeartIconSolid
								onClick={() => {
									setIsFavorite(false);
									deleteDoc(
										doc(
											db,
											"posts",
											user?.uid,
											"userFavorites",
											post.shareFrom.id
										)
									);
								}}
								className='h-6 w-6 text-red-500 cursor-pointer space-x-2 mr-2 hover:opacity-50 transition'
							/>
						)}
						<CloseRoundedIcon
							className='h-6 w-6 dark:text-white  text-black dark:bg-transparent bg-gray-200 space-x-2 rounded-full cursor-pointer hover:dark:opacity-50 transition'
							onClick={() => {
								setRemoveList((prev) => [...prev, post.id]);
							}}
						/>
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
							<p className='text-sm dark:text-white/50 p-y-2 font-bold'>
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
									deleteDoc(
										doc(db, "posts", user?.uid, "userFavorites", post.id)
									);
								}}
								className='h-6 w-6 text-red-500 cursor-pointer space-x-2 mr-2 hover:opacity-50 transition'
							/>
						)}
						<CloseRoundedIcon
							className='h-6 w-6 dark:text-white dark:bg-transparent text-black bg-gray-200 space-x-2 rounded-full cursor-pointer hover:dark:opacity-50 transition'
							onClick={() => {
								setRemoveList((prev) => [...prev, post.id]);
							}}
						/>
					</div>
				)}

				{!post?.share && post?.caption && (
					<div className='px-2.5 break-all md:break-normal'>
						{showInput ? (
							<p onClick={() => setShowInput(false)}>{post?.caption}</p>
						) : (
							<p onClick={() => setShowInput(true)}>
								{truncate(post?.caption, 150)}
							</p>
						)}
					</div>
				)}

				{post?.share && post?.shareFrom.caption && (
					<div className='px-2.5 break-all md:break-normal'>
						{showInput ? (
							<p onClick={() => setShowInput(false)}>
								{post?.shareFrom.caption}
							</p>
						) : (
							<p onClick={() => setShowInput(true)}>
								{truncate(post?.shareFrom.caption, 150)}
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
							onClick={() => {
								router.push(`/posts?id=${post.id}`);
							}}
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
								<Link href={`/Profile?uid=${post?.shareFrom?.uid}`}>
									<h6 className='font-medium hover:text-blue-500 hover:underline'>
										{post?.user?.name}
									</h6>
								</Link>
								<p className='text-sm dark:text-white/50 p-y-1 '>
									{post?.user?.userName}
								</p>
								<TimeAgo
									datetime={post?.timestamp?.toDate()}
									className='text-xs dark:text-white/50 '
								/>
							</div>
						</div>
						<div className='px-2.5 break-all md:break-normal'>
							{showCaption ? (
								<p onClick={() => setShowCaption(false)}>{post?.caption}</p>
							) : (
								<p onClick={() => setShowCaption(true)}>
									{truncate(post?.caption, 150)}
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

				<div className='flex justify-evenly items-center border-t  border-gray-600/80  mx-2.5 pt-2 text-gray-500 dark:text-white/75'>
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
							<i className='fas fa-laugh-squint text-2xl text-[#ff4522]'></i>
						) : (
							<i className='fas fa-laugh-beam text-2xl'></i>
						)}

						<p className='text-sm font-medium'>HaHa</p>
					</button>

					<button
						className='postButton'
						onClick={() => {
							setShowCommentInput(!showCommentInput);
						}}>
						<ChatAltIcon className='h-5' />
						<p className='text-xs sm:text-base'>Comment</p>
					</button>

        {user?.userName === post?.user?.userName ? (
          <button
            className="postButton focus:text-gray-100"
            onClick={() => {
              setDeleteModalIsOpen(true);
            }}
          >
            <Delete className="h-6 w-6" />
            <h4>Delete post</h4>
          </button>
        ) : (
          <button className="postButton"
          onClick={() => {
            setShareModalIsOpen(true);
          }}
          >
            <Share  width={28} height={28} />
            <h4>Share</h4>
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
							<div key={comment.id} className='flex justify-start space-x-2'>
								<Link href={`/Profile?uid=${comment?.user?.uid}`}>
									<img
										src={comment?.user?.photoURL}
										alt=''
										className={`h-7 w-7 rounded-full object-cover cursor-pointer justify-self-start mt-2`}
									/>
								</Link>
								<div className='flex flex-col  '>
									<div className='flex items-center space-x-1'>
										<Link href={`/Profile?uid=${comment?.user?.uid}`}>
											<h4 className='font-semibold text-sm dark:text-white/75'>
												{comment?.user?.name}
											</h4>
										</Link>
									</div>
									<p
										className='text-sm dark:text-white/50 text-dark'
										onClick={() => {
											setShowComments(!showComments);
										}}>
										{showComments
											? comment?.comment
											: truncate(comment?.comment, 100)}
									</p>
									<div className='flex items-center space-x-2'>
										<p className='text-xs dark:text-white/50'>
											{moment(comment?.timestamp?.toDate()).fromNow()}
										</p>
										<p
											className='text-xs dark:text-white/50 cursor-pointer hover:underline'
											onClick={() => {
												if (comment.liked) {
													updateDoc(
														doc(db, "posts", post.id, "comments", comment.id),
														{
															likes: arrayRemove(user?.uid),
														}
													);
													comment.liked = false;
												} else {
													updateDoc(
														doc(db, "posts", post.id, "comments", comment.id),
														{
															likes: arrayUnion(user?.uid),
														}
													);
													comment.liked = true;
												}
											}}>
											{comment?.likes?.includes(user?.uid) ? (
												<span
													className='text-blue-500
                    '>
													Loved
												</span>
											) : (
												"Love"
											)}
										</p>
										<p
											className='text-xs dark:text-white/50 cursor-pointer hover:underline'
											onClick={() => {
												if (comment.reply === false) {
													comment.reply = true;
													setReplyTo(comment?.user?.name);
												} else {
													comment.reply = false;
													setReplyTo(null);
												}
											}}>
											Reply
										</p>
										{comment?.user?.uid === user?.uid && (
											<p
												className='text-xs dark:text-white/50 cursor-pointer hover:underline'
												onClick={() => {
													getDoc(
														doc(db, "posts", post.id, "comments", comment.id)
													).then((docy) => {
														post.comments -= docy.data().comments.length + 1;
														updateDoc(doc(db, "posts", post.id), {
															comments: increment(
																-(docy.data().comments.length + 1)
															),
														});
														deleteDoc(
															doc(db, "posts", post.id, "comments", comment.id)
														);
													});
												}}>
												Delete
											</p>
										)}
										<div className='text-xs dark:text-white/50 cursor-pointer hover:underline  bg-gray-200 dark:bg-gray-700 rounded-full  ml-auto mr-2 mt-1 relative'>
											<span className='text-xs dark:text-white/50 cursor-pointer hover:underline absolute top-2.5 right-0 rounded-full h-2 w-2 flex items-center justify-center text-gray-600'>
												{comment?.likes?.length > 0 && (
													<>
														<i className='fas fa-heart text-red-600 mx-0.5'></i>{" "}
														{minimizeCountLength(comment?.likes?.length)}{" "}
													</>
												)}
											</span>
										</div>
									</div>
									{comment.comments
										?.sort((a, b) => b.timestamp - a.timestamp)
										.slice(0, len)
										.map((reply) => (
											<div
												key={reply.id}
												className='flex mt-2 space-x-2 flex-row '>
												<Link href={`/Profile?uid=${reply?.user?.uid}`}>
													<img
														src={reply?.user?.photoURL}
														alt=''
														className={`h-7 w-7 mt-2 rounded-full object-cover cursor-pointer justify-self-start`}
													/>
												</Link>
												<div className='flex flex-col flex-grow '>
													<div className='flex items-center space-x-1'>
														<Link href={`/Profile?uid=${reply?.user?.uid}`}>
															<h4 className='font-semibold text-sm dark:text-white/75'>
																{reply?.user?.name}
															</h4>
														</Link>
													</div>
													<p className='text-sm dark:text-white/50'>
														{reply?.comment}
													</p>
													<div className='flex items-center space-x-2 '>
														<p className='text-xs dark:text-white/50'>
															{moment(reply?.timestamp?.toDate()).fromNow()}
														</p>
														<p
															className='text-xs dark:text-white/50 cursor-pointer hover:underline'
															onClick={() => {
																loveComment(reply, comment);
															}}>
															{reply?.likes?.includes(user?.uid) ? (
																<span
																	className='text-blue-500
                        '>
																	Loved
																</span>
															) : (
																"Love"
															)}
														</p>
														{reply?.user?.uid === user?.uid && (
															<p
																className='text-xs dark:text-white/50 cursor-pointer hover:underline'
																onClick={() => {
																	updateDoc(
																		doc(
																			db,
																			"posts",
																			post.id,
																			"comments",
																			comment.id
																		),
																		{
																			comments: comment?.comments.filter(
																				(data) => data.id !== reply.id
																			),
																		}
																	);
																	updateDoc(doc(db, "posts", post.id), {
																		comments: increment(-1),
																	});
																	post.comments -= 1;
																}}>
																Delete
															</p>
														)}
														<div className='text-xs dark:text-white/50 cursor-pointer hover:underline  bg-gray-200 dark:bg-gray-700 rounded-full  ml-auto mr-2 mt-1 relative'>
															<span className='text-xs dark:text-white/50 cursor-pointer hover:underline absolute top-2.5 right-0 rounded-full h-2 w-2 flex items-center justify-center text-gray-600'>
																{reply?.likes?.length > 0 && (
																	<>
																		<i className='fas fa-heart text-red-600 mx-0.5'></i>{" "}
																		{minimizeCountLength(reply?.likes?.length)}{" "}
																	</>
																)}
															</span>
														</div>
													</div>
												</div>
											</div>
										))}

									{comment.reply && (
										<div className='flex space-x-2 flex-inline mt-3 '>
											<img
												src={user?.photoURL}
												alt=''
												className='h-7 w-7 rounded-full object-cover'
											/>
											<form className='flex flex-1'>
												<input
													type='text'
													placeholder={`Reply to ${replyTo}`}
													className='rounded-full p-1 text-sm h-3 bg-gray-100 dark:bg-gray-700 flex-grow px-2 focus:outline-none'
													value={reply}
													onChange={(e) => setReply(e.target.value)}
												/>
												<button
													type='submit'
													className='hidden'
													onClick={(e) => {
														e.preventDefault();
														sendReply(comment);
													}}></button>
											</form>
										</div>
									)}
								</div>
							</div>
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
								className='focus:outline-none flex-1 dark:bg-gray-700 bg-gray-100 dark:text-white/75 text-gray-500 rounded-full py-1.5 px-2'
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
							<button
								type='submit'
								className='hidden'
								onClick={addComment}></button>
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
									<div className='flex items-center space-x-2 flex-col'>
										<Link href={`/Profile?uid=${doc?.uid}`}>
											<p className='font-semibold dark:text-white/75 cursor-pointer hover:underline'>
												{doc?.name}
											</p>
										</Link>
										<p className='text-xs dark:text-white/50'>
											{doc?.userName}
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
				<div className='flex flex-col p-2 '>
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
								<div className='flex items-center space-x-2 flex-col'>
									<Link href={`/Profile?uid=${user?.uid}`}>
										<p className='font-semibold dark:text-white/75 cursor-pointer hover:underline'>
											{user?.name}
										</p>
									</Link>
									<p className='text-xs dark:text-white/50'>{user?.userName}</p>
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
									<p className='text-sm dark:text-white/50 p-y-1 '>
										{post?.shareFrom?.userName}
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
									<p className='text-sm dark:text-white/50 p-y-2 '>
										{post?.user?.userName}
									</p>
									<TimeAgo
										datetime={post?.timestamp?.toDate()}
										className='text-xs dark:text-white/50 '
									/>
								</div>
							</div>
						)}

						{post?.caption && (
							<div className='px-2.5 break-all md:break-normal'>
								{showInput ? (
									<p onClick={() => setShowInput(false)}>{post?.caption}</p>
								) : (
									<p onClick={() => setShowInput(true)}>
										{truncate(post?.caption, 150)}
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
									onClick={() => {
										router.push(`/posts?id=${post.id}`);
									}}
								/>
							) : (
								<Video videoURL={post?.postURL} />
							))}

                )
              )}

              {post?.share && (
                <div className="flex items-center px-2.5 cursor-pointer  ">
                  <Link href={`/Profile?uid=${post?.user?.uid}`} >
                    <div>
                      {post?.user?.photoURL && <img src={post?.user?.photoURL} className="!h-10 !w-10 cursor-pointer rounded-full object-cover" />}
                    </div>
                  </Link>
                  <div className="mr-auto ml-2 leading-none">
                    <Link href={`/Profile?uid=${post?.shareFrom?.uid}`} >
                      <h6 className="font-medium hover:text-blue-500 hover:underline">
                        {post?.user?.name}
                      </h6>
                    </Link>
                    <p className="text-sm dark:text-white/50 p-y-1 ">{post?.user?.userName}</p>
                    <TimeAgo
                      datetime={post?.timestamp?.toDate()}
                      className="text-xs dark:text-white/50 "
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
        className="bg-white text-slate-800 dark:text-gray-300 dark:bg-slate-900 rounded-lg shadow-lg p-4 overflow-y-scroll scrollbar-hide max-h-[600px]"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center"
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
        }}
      >
        <div className="flex flex-col items-center justify-center p-2">
              Are you sure you want to delete this post?
          <div className="flex items-center justify-center space-x-4 mt-4">
            <button
              className="text-white font-semibold px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] focus:outline-none"
              onClick={() => setDeleteModalIsOpen(false)}
            >
              Cancel
            </button>
            <button
              className="text-white font-semibold px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] focus:outline-none"
              onClick={deletePost}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
    );
}

export default Post;
