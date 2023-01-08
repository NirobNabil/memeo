/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useContext } from "react";
import Hoverablebutton from "./Hoverablebutton";
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
	setDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { connect } from "react-redux";

function Adduser(props) {
	let {
		setRecipientPhotoURL,
		setRecipientname,
		setRecipientid,
		recipientid,
		setMessage,
		sendMessage,
		adduser,
		setAdduser,
		message,
	} = props;

	const [users, setUsers] = useState([]);
	const [searchedUsers, setSearchedUsers] = useState([]);
	const [existingusers, setExistingusers] = useState([]);
	const [searchUID, setSearchUID] = useState([]);

	const [keyword, setKeyword] = useState("");

	useEffect(() => {
		if (props?.data?.chats) {
			let users = props?.data?.chats?.map((el, index) => {
				return el?.uids?.filter((el, index) => {
					return el !== props?.data?.currentUser?.uid;
				})[0];
			});
			setExistingusers(users);
			if (users.length > 0) {
				const q = query(
					collection(db, "users"),
					where("uid", "not-in", users),
					limit(5)
				);
				const unsubscribe = onSnapshot(q, (querySnapshot) => {
					let users = [];
					querySnapshot.forEach((doc) => {
						users.push(doc.data());
					});
					setUsers(users);
					// console.log(users, 'users')
				});
				return unsubscribe;
			}
		}
	}, [props?.data?.chats]);

	useEffect(() => {
		if (keyword.length > 0) {
			const q = query(
				collection(db, "users"),
				where("name", ">=", keyword),
				limit(25)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				let users = [];
				let uid = [];
				querySnapshot.forEach((doc) => {
					users.push(doc.data());
					uid.push(doc.id);
				});
				setSearchedUsers(users);
				setSearchUID(uid);
				console.log(users, "users");
			});
			return unsubscribe;
		} else {
			setSearchedUsers([]);
			setSearchUID([]);
		}
	}, [keyword]);

	function determineDisplay(user) {
		if (existingusers?.includes(user.uid)) {
			return <i className='fal fa-exclamation-circle'></i>;
		} else if (recipientid === user.uid) {
			return <i className='fal fa-check slct'></i>;
		} else {
			return (
				<span
					className='slct !text-gray-600 hover:!text-white'
					style={{ color: "gray", border: "solid 1px" + "blue" }}
					onMouseOver={(e) =>
						(e.target.style.cssText = `background-color: gray; border: solid 1px transparent`)
					}
					onMouseLeave={(e) =>
						(e.target.style.cssText = `background-color: transparent; border: solid 1px blue; color: gray`)
					}>
					Select
				</span>
			);
		}
	}

	const pattern = new RegExp("\\b" + keyword.replace(/[\W_]+/g, ""), "i");

	const showSearchUsers = searchedUsers?.map((user, index) => {
		if (pattern.test(user?.name?.toLowerCase())) {
			return (
				<div
					key={index}
					className={
						existingusers?.includes(user.uid)
							? "profilepic selected"
							: "profilepic"
					}>
					<div>
						<img
							src={
								user?.photoURL
									? user.photoURL
									: "https://www.gettyimages.ca/gi-resources/images/500px/983794168.jpg"
							}
							alt=''
						/>
						<p>{user?.name}</p>
					</div>
					<small
						onClick={
							existingusers?.includes(user.uid)
								? () => {
										setAdduser(!adduser);
								  }
								: () => {
										setRecipientid(user.uid);
										setRecipientname(user?.name);
										setRecipientPhotoURL(user?.photoURL);
								  }
						}
						className={recipientid === user?.uid ? "usersrowselected" : ""}>
						{determineDisplay(user)}
					</small>
				</div>
			);
		}
	});

	const showUsers = users
		?.filter((el, index) => searchUID?.includes(el?.uid) === false)
		?.map((user, index) => {
			if (pattern.test(user?.name?.toLowerCase())) {
				return (
					<div
						key={index}
						className={
							existingusers?.includes(user.uid)
								? "profilepic selected"
								: "profilepic"
						}>
						<div className=' text-slate-500 dark:text-white-50'>
							<img
								src={
									user?.photoURL
										? user.photoURL
										: "https://www.gettyimages.ca/gi-resources/images/500px/983794168.jpg"
								}
								alt=''
							/>
							<p className='text-slate-500  dark:text-white-50'>{user?.name}</p>
						</div>
						<small
							onClick={
								existingusers?.includes(user.uid)
									? () => {
											setAdduser(!adduser);
									  }
									: () => {
											setRecipientid(user.uid);
											setRecipientname(user?.name);
											setRecipientPhotoURL(user?.photoURL);
									  }
							}
							className={recipientid === user?.uid ? "usersrowselected" : ""}>
							{determineDisplay(user)}
						</small>
					</div>
				);
			}
		});

	function actions() {
		alert("You can only send messages to one person at a time");
		setMessage("");
		setAdduser(!adduser);
	}
	return (
		<>
			<div
				className='adduser z-[100]'
				onClick={() => props.setAdduser(false)}></div>
			<div className='userlist bs bg-white dark:bg-slate-800 text-slate-700 dark:text-white-50 z-[101] w-full sm:w-[60%]'>
				<div className='hd'>
					<h2 className='dark:text-white text-slate-600 text-lg mb-4'>
						Add Contact
					</h2>
					<div className='search'>
						<input
							type='text'
							placeholder='Search'
							onChange={(e) => setKeyword(e.target.value)}
							className='bg-gray-100 dark:bg-slate-900 text-slate-400'
						/>
					</div>
				</div>
				<div className='overflow flex'>{showSearchUsers}</div>
				<div className='overflow flex flex-grow'>{showUsers}</div>
				<div className='search'>
					<input
						type='text'
						placeholder='Send a message...'
						onChange={(e) => setMessage(e.target.value)}
						value={message}
						className='bg-gray-100 dark:bg-slate-900 text-slate-400'
					/>
					<button
						className='themeBtn !w-max px-4 py-1 !border-transparent !bg-orange-red/50 dark:!bg-orange-red/20 !text-white'
						onClick={() => {
							recipientid ? sendMessage() : actions();
						}}
						onMouseOver={(e) =>
							(e.target.style.cssText = `background-color: #ff452280 !important; color: white`)
						}
						onMouseLeave={(e) =>
							(e.target.style.cssText = `background-color: #ff452250 !important; color: white`)
						}>
						Send Message
					</button>
				</div>
				<i className='fal fa-times' onClick={() => props.setAdduser()}></i>
			</div>
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		data: state.data,
	};
};

export default connect(mapStateToProps)(Adduser);
