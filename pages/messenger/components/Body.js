/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useContext } from "react";
import { db, auth, storage } from "../../../firebase";
import Adduser from "./Adduser";
import { CSSTransition } from "react-transition-group";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import Paths from "./Paths";
import Hoverableicondiv from "./Hoverableiconsdiv";
import Chatviewrow from "./Chatviewrow";
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
	arrayRemove,
	arrayUnion,
	startAfter,
} from "firebase/firestore";

import { connect } from "react-redux";
import Dialogue from "./Dialogue";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../../../components/Loading";

function Body(props) {
	const [chatuser, setChatuser] = useState("");
	const [adduser, setAdduser] = useState(false);
	const [message, setMessage] = useState("");
	const [recipientid, setRecipientid] = useState("");
	const [recipientname, setRecipientname] = useState("");
	const [chatstarted, setChatstarted] = useState(false);
	const [user, setUser] = useState(null);
	const [recipientPhotoURL, setRecipientPhotoURL] = useState("");
	const [chatview, setChatview] = useState(false);
	const { Home, id } = props;
	const [loading, setLoading] = useState(false);
	const [convos, setConvos] = useState([]);

	const router = useRouter();

	const { uid } = router.query;

	const [chatopen, setChatopen] = useState(false);

	useEffect(() => {
		if (props?.data?.currentUser) {
			setUser(props.data.currentUser);
		}
	}, [props?.data?.currentUser]);

	useEffect(() => {
		if (id && user?.uid) {
			setChatuser(id);
			setLoading(true);
			const conversationsRef = collection(db, "conversations");
			const q = query(
				conversationsRef,
				where("uids", "array-contains", user?.uid),
				orderBy("lastmsgdate", "desc"),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const conversations = [];
				querySnapshot.forEach((doc) => {
					conversations.push({ ...doc.data(), id: doc.id });
				});
				setConvos(conversations);
				console.log("conversations", conversations);
				setLoading(false);
			});
			return unsubscribe;
		}
	}, [id, user?.uid]);

	useEffect(() => {
		if (uid && user?.uid) {
			setChatuser(uid);
			setLoading(true);
			const conversationsRef = collection(db, "conversations");
			const q = query(
				conversationsRef,
				where("uids", "array-contains", user?.uid),
				orderBy("lastmsgdate", "desc"),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const conversations = [];
				querySnapshot.forEach((doc) => {
					conversations.push({ ...doc.data(), id: doc.id });
				});
				setConvos(conversations);
				console.log("conversations", conversations);
				setLoading(false);
			});
			return unsubscribe;
		}
	}, [uid, user?.uid]);

	useEffect(() => {
		if (props?.data?.chats) {
			setConvos(props.data.chats);
		}
	}, [props?.data?.chats]);

	async function sendMessage() {
		if (message.length) {
			setAdduser(!adduser);
			let uid = [user.uid, recipientid].sort().join("");
			await setDoc(doc(db, "conversations", uid), {}, { merge: true });
			const convoid = uid;

			let customizedconvo = {
				theme: "https://i.imgur.com/4hzNTTq.png",
				emoji: "🤗",
			};
			let messages = {
				message,
				reaction1: "",
				reaction2: "",
				msgdate: new Date(),
				read: false,
				senderid: user?.uid || "",
				sendername: user?.name || "",
				editing: false,
			};
			let notificationobj = {
				notifimsg: message,
				notifidate: new Date(),
				read: false,
				sender: user?.name || "",
				id: convoid,
				senderid: user.uid,
				senderPhotoURL: user?.photoURL,
			};

			addDoc(
				collection(db, "notifications", recipientid, "notifications"),
				notificationobj
			);

			setDoc(
				doc(db, "conversations", convoid),
				{
					customizedconvo,
					uid: convoid,
					uids: [user.uid, recipientid],
					users: [
						{
							uid: user?.uid,
							name: user?.name,
							photoURL: user?.photoURL,
						},
						{
							uid: recipientid,
							name: recipientname,
							photoURL: recipientPhotoURL,
						},
					],
					nickname1: "",
					nickname2: "",
					notifications1: true,
					notifications2: true,
					lastmsgdate: serverTimestamp(),
				},
				{ merge: true }
			);
			addDoc(collection(db, "conversations", convoid, "messages"), messages);
			setMessage("");
		}
	}

	useEffect(() => {
		if (chatuser) {
			for (let i = 0; i < convos?.length; i++) {
				if (convos[i].uids.includes(chatuser)) {
					let convo = convos[i];
					let newConvos = convos.filter((el) => el.id !== convo.id);
					newConvos.unshift(convo);
					setConvos(newConvos);
				}
			}
		}
	}, [chatuser]);

	useEffect(() => {
		if (user?.uid && !chatuser) {
			setLoading(true);
			const conversationsRef = collection(db, "conversations");
			const q = query(
				conversationsRef,
				where("uids", "array-contains", user?.uid),
				orderBy("lastmsgdate", "desc"),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const conversations = [];
				querySnapshot.forEach((doc) => {
					conversations.push({ ...doc.data(), id: doc.id });
				});
				setConvos(conversations);
				console.log("conversations", conversations);
				setLoading(false);
			});
			return unsubscribe;
		}
	}, [user?.uid]);

	const fetchMoreChatsUser = async () => {
		if (user && convos.length > 0) {
			// alert('fetching more chats')
			const lastmsgdate = convos[convos.length - 1].lastmsgdate;
			const conversationsRef = collection(db, "conversations");
			const q = query(
				conversationsRef,
				where("uids", "array-contains", user?.uid),
				orderBy("lastmsgdate", "desc"),
				startAfter(lastmsgdate),
				limit(10)
			);
			const querySnapshot = await getDocs(q);
			const conversations = [];
			querySnapshot.forEach((doc) => {
				conversations.push({ ...doc.data(), id: doc.id });
			});
			setConvos([...convos, ...conversations]);
		}
	};

	if (loading) {
		return (
			<div className='justify-center items-center flex flex-col h-screen'>
				<Loading />
			</div>
		);
	}

	return (
		<>
			{!Home && (
				<div className='bg-white dark:bg-slate-800 flex flex-col h-full fixed w-full'>
					<div className='flex left-1 top-1 absolute items-center justify-center h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 z-50'>
						<ArrowLeftIcon className='h-6 w-6' onClick={() => router.back()} />
					</div>
					<div className='flex flex-row flex-1 bg-slate-50 dark:bg-slate-800 '>
						<Paths
							chatuser={chatuser}
							setChatuser={setChatuser}
							adduser={adduser}
							convos={convos}
							fetchMore={fetchMoreChatsUser}
							setAdduser={() => setAdduser(!adduser)}
						/>
					</div>
					<CSSTransition
						in={adduser}
						classNames={"adduser"}
						unmountOnExit
						timeout={300}>
						<Adduser
							setRecipientname={setRecipientname}
							setRecipientPhotoURL={setRecipientPhotoURL}
							message={message}
							sendMessage={sendMessage}
							setMessage={setMessage}
							setRecipientid={setRecipientid}
							setAdduser={setAdduser}
							recipientid={recipientid}
							adduser={adduser}
						/>
					</CSSTransition>
				</div>
			)}
			{Home && (
				<>
					<Hoverableicondiv
						classNames={"chatdiv fixed flex bs"}
						icon={"comment"}
						state={chatview}
						fetchMore={fetchMoreChatsUser}
						setState={setChatview}
					/>
					<CSSTransition
						in={chatview}
						timeout={300}
						unmountOnExit
						classNames='chatusers'>
						<div className='chatusers bs bg-white dark:bg-slate-800 '>
							<h2>Chat</h2>
							<div className='users  flex-row bg-white dark:bg-slate-800'>
								<i
									className='fal fa-times'
									onClick={() => {
										setChatview(false);
									}}
									style={{
										color: "var(--theme-color)",
										position: "absolute",
										top: "15px",
										right: "20px",
									}}></i>
								<InfiniteScroll
									dataLength={convos?.length || 0}
									next={fetchMoreChatsUser}
									hasMore={true}
									// loader={<h4>Loading...</h4>}
									endMessage={
										<p style={{ textAlign: "center" }}>
											<b>Yay! You have seen it all</b>
										</p>
									}
									height={600}
									// scrollableTarget="scrollableDiv"
								>
									{convos?.map((el, index) => (
										<div key={index} className='profilepic'>
											<Chatviewrow
												el={el}
												setChatopen={setChatopen}
												chatopen={chatopen}
												chatuser={chatuser}
												setChatuser={setChatuser}
												setChatstarted={setChatstarted}
												setChatview={setChatview}
											/>
										</div>
									))}
								</InfiniteScroll>
							</div>
						</div>
					</CSSTransition>

					<CSSTransition
						in={chatstarted}
						classNames='chatview fixed'
						unmountOnExit
						timeout={300}>
						<div
							className='chatview fixed bs bg-white dark:bg-slate-800'
							style={{
								right: chatview ? "330px" : "50px",
								width: chatview ? "calc(77% - 380px)" : "calc(29% - 100px)",
								height: "calc(100% - 170px)",
								bottom: "15px",
								minWidth: "300px",
							}}>
							<div className='dialogue bg-white dark:bg-slate-800'>
								<Dialogue
									type={"small"}
									chatuser={chatuser}
									icon='fal fa-times'
									setState={setChatstarted}
								/>
							</div>
						</div>
					</CSSTransition>
				</>
			)}
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		data: state.data,
	};
};

export default connect(mapStateToProps)(Body);
