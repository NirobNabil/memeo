import Image from "next/image";
import Link from "next/link";
import React from "react";
import moment from "moment";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
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
import { useState } from "react";
import { useEffect } from "react";
import { db } from "../../firebase";

const ShowCommentItem = ({
	comment,
	truncate,
	user,
	len,
	post,
	comments,
	setComments,
}) => {
	const [showComments, setShowComments] = useState(false);
	const [replyTo, setReplyTo] = useState("");

	const [reply, setReply] = useState("");
	const [subCommentTagUsers, setSubCommentTagUsers] = useState([]);
	const [
		subCommentTagUsersModalIsOpen,
		setSubCommentTagUsersModalIsOpen,
	] = useState(false);
	const [commentlen, setCommentlen] = useState(len);

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
		replyToSend.match(/@(\w+)/g)?.map((tag) => {
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
							comment: replyToSend,
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

	return (
		<div key={comment.id} className='flex justify-start space-x-2'>
			<Link href={`/Profile?uid=${comment?.user?.uid}`}>
				<img
					src={comment?.user?.photoURL}
					alt='profile pic'
					className={`h-7 w-7 rounded-full object-cover cursor-pointer justify-self-start mt-2`}
				/>
			</Link>
			<div className='flex flex-col flex-grow'>
				<div className='flex items-center space-x-1'>
					<Link href={`/Profile?uid=${comment?.user?.uid}`}>
						<h4 className='font-semibold text-sm dark:text-white/75 cursor-pointer'>
							{comment?.user?.name}
						</h4>
					</Link>
				</div>
				<p
					className={`text-sm dark:text-white/50 text-dark break-all sm:break-words max-w-[94%] ${comment
						?.comment.length > 100 && "cursor-pointer"}`}
					onClick={() => {
						setShowComments((prevState) => !prevState);
					}}>
					{showComments
						? comment?.comment
						: truncate(comment?.comment, 100, "")}
					{comment?.comment.length > 100 &&
						(showComments ? (
							<span className='text-white font-bold'> See less...</span>
						) : (
							<span className='text-white font-bold'> See more...</span>
						))}
				</p>
				<div className='flex items-center space-x-2'>
					<p className='text-xs dark:text-white/50'>
						{moment(comment?.timestamp?.toDate()).fromNow()}
					</p>
					<p
						className='text-xs dark:text-white/50 cursor-pointer hover:underline'
						onClick={() => {
							if (comment.liked) {
								updateDoc(doc(db, "posts", post.id, "comments", comment.id), {
									likes: arrayRemove(user?.uid),
								});
								comment.liked = false;
							} else {
								updateDoc(doc(db, "posts", post.id, "comments", comment.id), {
									likes: arrayUnion(user?.uid),
								});
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
								getDoc(doc(db, "posts", post.id, "comments", comment.id)).then(
									(docy) => {
										post.comments -= docy.data().comments.length + 1;
										updateDoc(doc(db, "posts", post.id), {
											comments: increment(-(docy.data().comments.length + 1)),
										});
										deleteDoc(
											doc(db, "posts", post.id, "comments", comment.id)
										);
									}
								);
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
						<div key={reply.id} className='flex mt-2 space-x-2 flex-row '>
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
								<p className='text-sm dark:text-white/50'>{reply?.comment}</p>
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
											<span className='text-blue-500'>Loved</span>
										) : (
											"Love"
										)}
									</p>
									{reply?.user?.uid === user?.uid && (
										<p
											className='text-xs dark:text-white/50 cursor-pointer hover:underline'
											onClick={() => {
												updateDoc(
													doc(db, "posts", post.id, "comments", comment.id),
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
								onChange={(e) => {
									if (e.target.value.match(/@([a-zA-Z0-9_]+)/g)) {
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
											setSubCommentTagUsers(
												querySnapshot.docs.map((doc) => doc.data())
											);
										});
									} else {
										setSubCommentTagUsers([]);
									}
									setReply(e.target.value);
								}}
							/>
							<button
								type='submit'
								className='hidden'
								onClick={(e) => {
									e.preventDefault();
									sendReply(comment);
								}}></button>
							{subCommentTagUsers.length > 0 && (
								<div className='absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-md w-80 mt-10'>
									{subCommentTagUsers.map((user) => (
										<div
											key={user.uid}
											className='flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
											onClick={() => {
												/// replace last taguser with the selected user
												setReply(
													reply.replace(
														/@([a-zA-Z0-9_]+)$/,
														`@${user.userName}`
													)
												);
												setSubCommentTagUsers([]);
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
		</div>
	);
};

export default ShowCommentItem;
