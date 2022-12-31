/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import React, {
	useState,
	useEffect,
	useRef,
	useContext,
	useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Users from "./Users";
import firebase from "firebase/app";
import { db, auth, storage } from "../../../firebase";
import Contextmenu from "./Contextmenu";
import { FilePond, File, registerPlugin } from "react-filepond";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ElapsedTime from "./Elapsedtime";
import { ContextApp } from "../ContextAPI";
import Hoverableicondiv from "./Hoverableiconsdiv";
import InnerImageZoom from "react-inner-image-zoom";
import Iframe from "./msgcomponents/Iframe";
import Img from "./msgcomponents/Img";
import Filemsg from "./msgcomponents/File";
import P from "./msgcomponents/P";
import Recording from "./msgcomponents/Recording";
import Gif from "./Gifs.js/Gif";
import ReactTimeAgo from "react-time-ago";
import Contextoptions from "./msgcomponents/Contextoptions";
import Threedots from "./msgcomponents/Threedots";
import ScrollContainer from "react-indiana-drag-scroll";
import dynamic from "next/dynamic";
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

import { v4 as uuidv4 } from "uuid";
import Switches from "./Switches";

import { MinusIcon, PlusIcon } from "@heroicons/react/outline";
import { connect } from "react-redux";
import {
	uploadBytes,
	getDownloadURL,
	ref,
	getStorage,
	deleteObject,
	listAll,
	list,
	listRef,
	getMetadata,
	updateMetadata,
	UploadTask,
	UploadTaskSnapshot,
	uploadBytesResumable,
	getUploadTask,
	getUploadTaskSnapshot,
	getBytes,
	getBytesResumable,
	dataURLtoFile,
} from "firebase/storage";

const Picker = dynamic(() => import("emoji-picker-react"), {
	ssr: false,
});

import Modal from "react-modal";
import Hoverablebutton from "./Hoverablebutton";

import Grid from "@material-ui/core/Grid";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/Info";
import SaveIcon from "@material-ui/icons/SaveAlt";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import ListSubheader from "@material-ui/core/ListSubheader";
import InfiniteScroll from "react-infinite-scroll-component";

function Dialogue(props) {
	const { notifi, setNotifi, notificont, setNotificont } = useContext(
		ContextApp
	);

	const [gif, setGif] = useState(false);
	const [msgstring, setMsgstring] = useState("");
	const [typing, setTyping] = useState(false);
	const [userimg, setUserimg] = useState("");
	const [visible, setVisible] = useState(false);
	const [contextmenu, setContextmenu] = useState(false);
	const [contextstyle, setContextstyle] = useState({
		top: 0,
		left: 0,
	});
	const [notifibool, setNotifibool] = useState(true);
	const [emojitype, setEmojitype] = useState("");
	const [loader, setLoader] = useState(true);
	const [loading, setLoading] = useState(true);
	const [chatcolor, setChatcolor] = useState("");
	const [userChatcolor, setUserchatcolor] = useState("");
	const [showinput, setShowinput] = useState(false);
	const [emojilist, setEmojilist] = useState(false);
	const [theme, setTheme] = useState("");
	const [msgid, setMsgid] = useState("");
	const [chatname, setChatname] = useState("");
	const [chatimg, setChatimg] = useState("");
	const [chatcity, setChatcity] = useState("");
	const [chatcountry, setChatcountry] = useState("");
	const [chatactive, setChatactive] = useState("");
	const [nickname, setNickname] = useState([]);
	const [emojipicker, setEmojipicker] = useState(false);
	const [messages, setMessages] = useState([]);
	const { chatuser, setState, icon, type } = props;
	const [convoid, setConvoid] = useState("");
	const [recipientid, setRecipientid] = useState("");
	const [user, setUser] = useState(null);
	const [settings, setSettings] = useState(false);
	const [showloadmore, setShowloadmore] = useState(true);
	const [startVideoCall, setStartVideoCall] = useState(false);
	const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
	const [changeNickname, setChangeNickname] = useState("");
	const [chatUsers, setChatUsers] = useState([]);
	const [myNotify, setMyNotify] = useState(false);

	const [selectedFile, setSelectedFile] = useState(null);
	const [error, setError] = useState(null);
	const [open, setOpen] = useState(false);

	const [keyword, setKeyword] = useState("");
	const pattern = new RegExp("\\b" + keyword.replace(/[\W_]+/g, ""), "i");

	const [emojiTypePicker, setEmojiTypePicker] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	function contextMenux(e) {
		let customcontext = document.querySelector(".contextmenu");
		const bounding = customcontext.getBoundingClientRect();
		e.preventDefault();
		setContextmenu(true);
		customcontext.style.top = `${e.pageY - customcontext.clientHeight}px`;
		customcontext.style.left = `${e.pageX - customcontext.clientWidth}px`;
	}

	const typerRef = useRef();
	const scrollto = useRef();
	const progressbar = useRef();
	const progresswidth = useRef();
	const inputref = useRef();

	const reg = /((?:(?!(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)).)+)|((?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?)/gm;
	const imageRegexB = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)/g;
	var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
	var ureg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

	useEffect(() => {
		if (props?.data) {
			setUser(props?.data.currentUser);
			setChatcolor(props?.data?.currentUser?.customization?.color || "gray");
			setUserimg(props?.data?.currentUser?.photoURL);
		}
	}, [props?.data]);

	useEffect(() => {
		if (chatuser && user) {
			setRecipientid(chatuser);
			let uid = [user.uid, chatuser].sort().join("");
			setConvoid(uid);
		}
	}, [chatuser, user]);

	useEffect(() => {
		if (convoid) {
			const unsubscribe = onSnapshot(
				query(
					collection(db, "conversations", convoid, "messages"),
					orderBy("msgdate", "desc"),
					limit(100)
				),
				(snapshot) => {
					setMessages(
						snapshot.docs.map((doc) => {
							return { ...doc.data(), id: doc.id };
						})
					);
				}
			);
			return unsubscribe;
		}
	}, [convoid]);

	useEffect(() => {
		if (chatuser && user) {
			let uid = [user.uid, chatuser].sort().join("");
			const unsubscribe = onSnapshot(doc(db, "conversations", uid), (Doc) => {
				if (Doc.exists()) {
					setLoader(false);
					const data = Doc.data();
					if (data?.customizedconvo?.theme) {
						setTheme(data.customizedconvo.theme);
					}
					setEmojitype(data.customizedconvo.emoji);
					setChatUsers(data.users);
					if (user.uid === data?.users[0]?.uid) {
						setNotifibool(data.notifications2);
						setMyNotify(data.notifications1);
						setNickname(data.nickname1);
					} else {
						setNotifibool(data.notifications1);
						setMyNotify(data.notifications2);
						setNickname(data.nickname2);
					}
				} else {
					let id = [user.uid, chatuser].sort().join("");
					getDoc(doc(db, "users", chatuser))
						.then((doc) => {
							if (doc.exists()) {
								const data = doc.data();
								setDoc(doc(db, "conversations", id), {
									customizedconvo: {
										theme: "https://i.imgur.com/4hzNTTq.png",
										emoji: "🤗",
									},
									uid: id,
									uids: [user.uid, chatuser],
									users: [
										{
											uid: user?.uid,
											name: user?.name,
											photoURL: user?.photoURL,
										},
										{
											uid: data?.uid,
											name: data?.name,
											photoURL: data?.photoURL,
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

								addDoc(
									collection(db, "notifications", chatuser, "notifications"),
									{
										notifimsg: `${user?.name} started a conversation with you!`,
										notifidate: serverTimestamp(),
										read: false,
										sender: user.name,
										senderid: user.uid,
										photoURL: user.photoURL,
										type: "conversation",
									}
								);
								window.location.reload();
							} else {
								console.log("No such document!");
							}
						})
						.catch((error) => {
							console.log("Error getting document:", error);
						});
				}
			});
			return () => unsubscribe();
		}
	}, [chatuser, user?.uid]);

	useEffect(() => {
		if (convoid) {
			const unsubscribe = onSnapshot(
				query(
					collection(db, "conversations", convoid, "messages"),
					orderBy("msgdate", "desc"),
					limit(100)
				),
				(querySnapshot) => {
					const changes = querySnapshot.docChanges();
					const messages = changes.map((change) => {
						if (change.type === "added") {
							return {
								...change.doc.data(),
								id: change.doc.id,
							};
						}
					});
					appendMessages(messages);
				}
			);
			return unsubscribe;
		}
	}, [convoid]);

	const appendMessages = (messages) => {
		if (messages?.id) {
			const newMessages = messages.filter(
				(message) => !messages.find((m) => m?.id === message?.id)
			);
			setMessages((prevMessages) => [...prevMessages, ...newMessages]);
		}
	};

	const ytVidId = (url) => {
		var p = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
		return url.match(p) ? RegExp.$1 : false;
	};

	const determineMsgtype = (msg) => {
		if (msg.base64) {
			return <Img src={msg.message} link={true} />;
		} else if (msg?.file) {
			return <Filemsg name={msg.name} link={msg.message} />;
		} else if (msg.audio) {
			return <Recording src={msg.message} />;
		} else if (msg?.video) {
			return <Iframe type='video' link={msg.message} />;
		} else if (ytVidId(msg?.message)) {
			return (
				<Iframe
					link={"https://www.youtube.com/embed/" + ytVidId(msg.message)}
				/>
			);
		} else {
			const sm = msg.message.replace(reg, (_, text, img) =>
				text ? `<p>${text.trim()}</p>` : `<img src="${img}"/>`
			);
			return <div dangerouslySetInnerHTML={{ __html: sm }}></div>;
		}
	};

	const determineClass = (msg) => {
		var urreg = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
		if (user.uid === msg.senderid) {
			if (msg.file) {
				return "msg file";
			} else if (msg.video) {
				return "msg video";
			} else if (msg.audio) {
				return "msg audio";
			} else if (msg.emoji) {
				return "msg emojimsg";
			} else if (msg.nobackground) {
				return "no-bg msg";
			} else if (ytVidId(msg.message)) {
				return `msg youtube`;
			} else {
				return "msg";
			}
		} else {
			if (msg.file) {
				return "msg file trans";
			} else if (msg.video) {
				return "msg video trans";
			} else if (msg.audio) {
				return "msg audio trans";
			} else if (msg.emoji) {
				return "msg emojimsg ";
			} else if (msg.nobackground) {
				return "no-bg msg trans";
			} else if (ytVidId(msg.message)) {
				return `msg youtube trans`;
			} else {
				return "msg trans";
			}
		}
	};

	const msgOptions = (msg) => {
		const allel = document.querySelectorAll(".optionsEdit");
		allel.forEach((el) => {
			el.style.display = "none";
		});
		const el = document.querySelector(`div[data-id="${msg.id}"]`);
		el.style.display = "flex";
	};
	const [modal, setModal] = useState(false);
	const imgsrc = useRef();
	const [imgSrcModal, setImgSrcModal] = useState("");

	function clickHandler(e) {
		const audio = e.target.querySelector(".controls");
		const video = e.target.closest("VIDEO");

		const play = e.target.querySelector(".fa-play");
		const el = e.target.closest("IMG");
		if (el && e.currentTarget.contains(el)) {
			setModal(true);
			const imgsrc = document.querySelector(".modal img");
			setImgSrcModal(el.getAttribute("src"));
			imgsrc.setAttribute("src", el.getAttribute("src"));
		}
		if (video && e.currentTarget.contains(video)) {
		}
	}

	const contextMenu = (e) => {
		let customcontext = document.querySelector(".contextmenu");
		// const bounding = customcontext.getBoundingClientRect();
		e.preventDefault();
		setMsgid(e.currentTarget.getAttribute("id"));
		setContextmenu(true);
		if (type === "small") {
			setContextstyle({ top: `${e.pageY - 501}`, left: `${80}` });
		} else {
			// const bounding = customcontext.getBoundingClientRect()
			customcontext.style.top = `${e.pageY - 200}px`;
			customcontext.style.left = `${e.pageX - 150}px`;
			setContextstyle({ top: 0, left: 0 });
		}
	};

	const showMessages = messages
		?.sort((a, b) => b.msgdate - a.msgdate)
		?.map((msg, index) => {
			return (
				<div
					key={index}
					id={"u" + msg.id}
					className={msg.senderid === user.uid ? "right m" : "left m"}
					onContextMenu={(e) => contextMenu(e)}>
					<div className='flex text-slate-500 dark:text-white'>
						<span
							className={determineClass(msg)}
							contentEditable={false}
							style={
								msg.nobackground
									? { backgroundColor: "transparent" }
									: msg.emoji
									? { backgroundColor: "transparent" }
									: ytVidId(msg.message)
									? { backgroundColor: "transparent" }
									: msg.senderid === user.uid
									? { backgroundColor: "#e6e6e6" }
									: null
							}
							onClick={(e) => {
								clickHandler(e);
								if (msg?.base64 || msg?.video) {
									setSelectedFile(msg);
									handleOpen();
								}
							}}>
							{" "}
							{determineMsgtype(msg)}
							{msg.editing && (
								<span className='text-xs text-gray-500'>edited</span>
							)}
						</span>
						<Threedots
							msgs={messages}
							user={user}
							msg={msg}
							convoid={convoid}
						/>
						<small
							className={
								msg.senderid === user?.uid
									? "alignRight elapsedtime"
									: "alignLeft elapsedtime"
							}>
							<ReactTimeAgo
								date={msg.msgdate.toDate()}
								className='text-slate-500 dark:text-white/50'
							/>
						</small>
						<div
							className='reaction'
							style={{
								display: msg.reaction1 || msg.reaction2 ? "flex" : "none",
								width:
									msg.reaction1 === "" || msg.reaction2 === ""
										? "22px"
										: "42px",
								backgroundColor: "transparent",
							}}>
							<i
								style={{
									fontWeight: "bold",
									fontSize: "20px",
								}}
								className={"emoj fas fa-" + msg.reaction1}></i>
							<i
								style={{ marginLeft: msg.reaction2 === "" ? "" : "5px" }}
								className={"emoj fas fa-" + msg.reaction2}></i>
						</div>
					</div>
					{userimg && chatimg && (
						<img src={msg.senderid === user.uid ? userimg : chatimg} alt='' />
					)}
				</div>
			);
		});

	const sendFile = (type) => {
		let file = document.querySelector(`.${type}file`).files[0];
		if (file) {
			var idxDot = file.name.lastIndexOf(".") + 1;
			var extFile = file.name.substr(idxDot, file.name.length).toLowerCase();

			const childPath = `conversations/${convoid}/${
				user.uid
			}/${uuidv4()}.${extFile}`;
			const storageRef = ref(storage, childPath);
			const uploadTask = uploadBytesResumable(storageRef, file);
			uploadTask.on(
				"state_changed",
				(snapshot) => {
					progressbar.current.style.display = "flex";
					const percentage =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					progresswidth.current.style.height = `${percentage}%`;
				},
				(error) => {
					console.log(error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						if (type === "image") {
							if (
								extFile === "jpg" ||
								extFile === "jpeg" ||
								extFile === "png"
							) {
								let msgobject = {
									message: downloadURL,
									reaction1: "",
									reaction2: "",
									msgdate: new Date(),
									read: false,
									senderid: user.uid,
									editing: false,
									nobackground: true,
									emoji: true,
									base64: true,
								};
								let notificationobj = {
									notifimsg: downloadURL,
									notifidate: new Date(),
									read: false,
									sender: user.name,
									base64: true,
									id: convoid,
									senderid: user.uid,
									photoURL: user.photoURL,
								};
								if (notifibool && chatuser) {
									addDoc(
										collection(db, "notifications", chatuser, "notifications"),
										notificationobj
									);
								}
								updateDoc(
									doc(db, "conversations", convoid),
									{
										lastmsgdate: serverTimestamp(),
									},
									{ merge: true }
								);
								addDoc(
									collection(db, "conversations", convoid, "messages"),
									msgobject
								);
							} else {
								setNotifi(true);
								setNotificont({
									emoji: "fal fa-exclamation-circle",
									msg: "Only Images are allowed!",
								});
								setTimeout(() => {
									setNotifi(false);
								}, 300500);
							}
						} else if (type === "paperclip") {
							let msgobject = {
								message: downloadURL,
								reaction1: "",
								reaction2: "",
								msgdate: new Date(),
								read: false,
								senderid: user.uid,
								editing: false,
								nobackground: true,
								emoji: true,
								file: true,
								name: file.name,
								base64: false,
							};
							if (notifibool && chatuser) {
								const notificationobj = {
									notifimsg: downloadURL,
									notifidate: new Date(),
									read: false,
									sender: user.name,
									file: true,
									id: convoid,
									senderid: user.uid,
									photoURL: user.photoURL,
								};
								addDoc(
									collection(db, "notifications", chatuser, "notifications"),
									notificationobj
								);
							}

							updateDoc(
								doc(db, "conversations", convoid),
								{
									lastmsgdate: serverTimestamp(),
								},
								{ merge: true }
							);
							addDoc(
								collection(db, "conversations", convoid, "messages"),
								msgobject
							);
						} else if (type === "microphone") {
							alert("Audio is not supported yet!");
						} else if (type === "film") {
							if (extFile === "mp4" || "gif" || "avi") {
								let msgobject = {
									message: downloadURL,
									reaction1: "",
									reaction2: "",
									msgdate: new Date(),
									read: false,
									senderid: user.uid,
									editing: false,
									nobackground: true,
									emoji: true,
									video: true,
								};
								let notificationobj = {
									notifimsg: downloadURL,
									notifidate: new Date(),
									read: false,
									sender: user.name,
									video: true,
									id: convoid,
									senderid: user.uid,
									photoURL: user.photoURL,
								};
								if (notifibool) {
									addDoc(
										collection(db, "notifications", chatuser, "notifications"),
										notificationobj
									);
								}
								updateDoc(
									doc(db, "conversations", convoid),
									{
										lastmsgdate: serverTimestamp(),
									},
									{ merge: true }
								);
								addDoc(
									collection(db, "conversations", convoid, "messages"),
									msgobject
								);
							}
						}
					});

					progressbar.current.style.display = "none";
				}
			);
		}
	};

	const icons = [
		{ icon: "image", type: "file" },
		{ icon: "film", type: "file" },
		{ icon: "paperclip", type: "file" },
		{ icon: "microphone", type: "microphone" },
	];

	let iconsrow = icons.map((icon, index) => {
		return (
			<Hoverableicondiv
				progressbar={progressbar}
				progresswidth={progresswidth}
				classNames=''
				icon={icon.icon}
				type={icon.type}
				special={true}
				sendFile={sendFile}
				convoid={convoid}
				inputref={inputref}
				key={index}
			/>
		);
	});

	const sendEmoji = (emoji) => {
		let msgobject = {
			message: emoji,
			reaction1: "",
			reaction2: "",
			msgdate: new Date(),
			read: false,
			senderid: user.uid,
			editing: false,
			nobackground: false,
			emoji: true,
		};
		updateDoc(doc(db, "conversations", convoid), {
			lastmsgdate: serverTimestamp(),
		});
		addDoc(collection(db, "conversations", convoid, "messages"), msgobject);

		let notificationobj = {
			notifimsg: emoji,
			notifidate: new Date(),
			read: false,
			sender: user.name,
			id: convoid,
			senderid: user.uid,
			photoURL: user.photoURL,
		};
		if (notifibool && chatuser) {
			addDoc(
				collection(db, "notifications", chatuser, "notifications"),
				notificationobj
			);
		}
		setMsgstring("");
		typerRef.current.setAttribute("style", "height: 50px");
	};

	const sendMessage = () => {
		scrollto.current.scrollIntoView({ behavior: "smooth", block: "start" });
		const imageRegex = /(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)/g;
		if (msgstring.match(imageRegexB) != null) {
			let msgobject = {
				message: msgstring,
				reaction1: "",
				reaction2: "",
				msgdate: new Date(),
				read: false,
				senderid: user.uid,
				editing: false,
				nobackground: true,
				emoji: false,
			};
			updateDoc(
				doc(db, "conversations", convoid),
				{
					lastmsgdate: serverTimestamp(),
				},
				{ merge: true }
			);
			addDoc(collection(db, "conversations", convoid, "messages"), msgobject);

			let notificationobj = {
				notifimsg: msgstring,
				notifidate: new Date(),
				read: false,
				sender: user.name,
				id: convoid,
				senderid: user.uid,
				photoURL: user.photoURL,
			};
			if (notifibool) {
				addDoc(
					collection(db, "notifications", chatuser, "notifications"),
					notificationobj
				);
			}
			setMsgstring("");
			typerRef.current.setAttribute("style", "height: 50px");
		} else if (msgstring.replace(/\s/g, "").length) {
			if (notifibool) {
				const notificationobj = {
					notifimsg: msgstring,
					notifidate: new Date(),
					read: false,
					sender: user.name,
					id: convoid,
					senderid: user.uid,
					photoURL: user.photoURL,
				};
				addDoc(
					collection(db, "notifications", chatuser, "notifications"),
					notificationobj
				);
			}

			updateDoc(
				doc(db, "conversations", convoid),
				{
					lastmsgdate: serverTimestamp(),
				},
				{ merge: true }
			);

			addDoc(collection(db, "conversations", convoid, "messages"), {
				message: msgstring,
				reaction1: "",
				reaction2: "",
				msgdate: new Date(),
				read: false,
				senderid: user.uid,
				editing: false,
				nobackground: false,
				emoji: false,
			});

			setMsgstring("");
			typerRef.current.setAttribute("style", "height: 50px");
		}
	};

	const triggerSend = (e) => {
		if (e.keyCode === 13 && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};
	function formatTextarea() {
		// setTyping(true)
		// showTypingAnim()
	}

	const emojipickerref = useRef();

	function inputFunc() {
		typerRef.current.focus();
		setEmojipicker(!emojipicker);
	}

	function showTypingAnim() {
		let infoobj = {
			convoid,
			recipientid,
			usertyping: typing,
		};
		db.collection("conversations")
			.doc(convoid)
			.update({
				// convoinfo: infoobj
			})
			.then(() => {
				db.collection("conversations")
					.doc(convoid)
					.onSnapshot((snap) => {});
			});
	}

	const [zoomamount, setZoomamount] = useState(1);

	const zoom = (el) => {
		if (el.type === "in") {
			setZoomamount((prev) => prev + 0.1);
		} else {
			if (zoomamount > 1) {
				setZoomamount((prev) => prev - 0.1);
			}
		}
	};
	const onEmojiClick = (event, emojiobject) => {
		setMsgstring(msgstring + emojiobject.emoji);
	};

	useEffect(() => {
		let timer = setInterval(() => {
			setTyping(false);
		}, 4000);
		// showTypingAnim()
		return () => {
			clearInterval(timer);
		};
	}, [typing]);

	useEffect(() => {
		if (chatuser) {
			getDoc(doc(db, "users", chatuser)).then((doc) => {
				if (doc.exists()) {
					setChatactive(doc.data()?.online || false);
				}
			});
		}
	}, [chatuser]);

	useEffect(() => {
		if (chatuser) {
			getDoc(doc(db, "users", chatuser)).then((doc) => {
				if (doc.exists()) {
					console.log(doc.data(), "DOC DATA");
					setChatname(doc.data()?.name || "user");
					setChatimg(
						doc.data()?.photoURL ||
							"https://firebasestorage.googleapis.com/v0/b/instaclone-1c8c7.appspot.com/o/blank-profile-picture-973460_1280.png?alt=media&token=0b0f5b0f-0f5d-4b1f-8b1f-1b0f5d4b1f8b"
					);
					setUserchatcolor(doc.data()?.customization?.color || "blue");
					setLoading(false);
				} else {
					// doc.data() will be undefined in this case
					console.log("No such document!");
				}
			});
		}
	}, [chatuser]);

	const LoadMoreMessages = () => {
		setShowloadmore(false);
		getDocs(collection(db, "conversations", convoid, "messages")).then(
			(docs) => {
				let messages = docs.docs
					.map((doc) => {
						return { id: doc.id, ...doc.data() };
					})
					.sort((a, b) => b.msgdate - a.msgdate);
				setMessages(messages);
			}
		);
	};

	useEffect(() => {
		scrollto.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<>
			<div className='top border-b borfer-gray-300 dark:border-gray-500 basis-[50px] flex items-center justify-between'>
				{chatimg && (
					<>
						<div className='profilepic'>
							<div className='relative'>
								{chatimg && (
									<img
										className='w-16 h-16 rounded-full'
										src={chatimg}
										alt=''
									/>
								)}
								<span
									className={`bottom-0 left-6 absolute  w-3.5 h-3.5 ${
										chatactive ? "bg-green-400" : "bg-red-400"
									} border-2 border-white dark:border-gray-800 rounded-full`}></span>
							</div>
							<div>
								{nickname === "" ? (
									<p className='username'>
										{chatname.length > 15
											? chatname.slice(0, 15) + "..."
											: chatname}
									</p>
								) : (
									<p className='username'>{nickname}</p>
								)}
								<small>{chatactive ? "Online" : "Offline"}</small>
							</div>
						</div>
						<div className='controls text-slate-800'>
							{icon && icon === "fal fa-times" ? (
								<i
									className={icon}
									style={{ padding: "0 5px", color: "gray" }}
									onClick={() => setState(false)}></i>
							) : (
								<i
									style={{ padding: "0 5px", color: "gray" }}
									className='fal fa-ellipsis-v'
									onClick={() => setIsSettingModalOpen(true)}></i>
							)}
						</div>
					</>
				)}
			</div>

			<div
				className={`msgs flex-grow my-1 overflow-y-scroll  ${
					type === "small" ? "h-96" : "h-auto"
				} dark:bg-gray-800 dark:text-white bg-slate-300 text-slate-800`}
				style={
					urlRegex.test(theme)
						? {
								backgroundImage: `url(${theme})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								backgroundRepeat: "no-repeat",
						  }
						: {
								backgroundColor: theme,
						  }
				}>
				<div className='grid'>
					<div className='scrollto chat' ref={scrollto}></div>
					{showMessages}
					{messages.length >= 100 && showloadmore && (
						<button
							className='relative mb-auto mx-auto top-0 dark:bg-slate-800 text-sm text-white-500 dark:text-slate-500 border-1 border-spacing-1 rounded-full p-2 border-white  bg-gray-200 text-gray-500  dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white-500 hover:bg-gray-300 hover:text-gray-600'
							onClick={() => LoadMoreMessages()}>
							See More
						</button>
					)}
				</div>
			</div>

			<div className='search whiteb flex h-20 basis-[50px]  items-center justify-between border-t border-gray-200 dark:border-gray-500 bg-white dark:bg-slate-800'>
				<div className='plus font-bold'>
					{!visible ? (
						<PlusIcon
							className='plusicon text-gray-700 dark:text-white'
							width={20}
							height={20}
							style={{
								margin: "8px",
								cursor: "pointer",
								fontWeight: "bold",
							}}
							onClick={() => setVisible(!visible)}
						/>
					) : (
						<MinusIcon
							className='plusicon dark:text-white text-gray-700'
							width={20}
							height={20}
							style={{
								margin: "8px",
								cursor: "pointer",
							}}
							onClick={() => setVisible(!visible)}
						/>
					)}

					<CSSTransition
						in={visible}
						timeout={300}
						classNames='iconshover'
						unmountOnExit>
						<div className={"icons"}>
							{iconsrow}
							<span className='uploader bs' ref={progressbar}>
								<span className='percent' ref={progresswidth}></span>
							</span>
						</div>
					</CSSTransition>
				</div>
				<div className='w-full flex flex-col relative '>
					<textarea
						type='text'
						placeholder='Send a message...'
						onKeyUp={(e) => triggerSend(e)}
						ref={typerRef}
						value={msgstring}
						onChange={(e) => {
							setMsgstring(e.target.value);
						}}
						onInput={() => formatTextarea()}
						className={`${
							type === "small" ? "" : "focus:p-1"
						} placeholder:p-1 text-slate-600 placeholder:text-slate-600 mt-0.5 px-4 py-1`}></textarea>
					<div className='gif_emoji  right-5 absolute space-x-2 top-4 '>
						<i
							className='fal fa-laugh'
							onClick={() => {
								inputFunc();
							}}></i>
						<i
							className='fal fa-comment-alt-smile'
							onClick={() => setGif(!gif)}></i>
					</div>
				</div>
				<div className='flexrow'>
					<span
						role='img'
						aria-label='emoji'
						onClick={() => sendEmoji(emojitype)}
						style={{ cursor: "pointer" }}
						className='ml-2'>
						{emojitype}
					</span>
					<i
						className='fal fa-paper-plane'
						onClick={() => {
							sendMessage();
							setEmojipicker(false);
						}}></i>
				</div>
			</div>

			<Contextmenu
				setShowinput={setShowinput}
				convoid={convoid}
				type={"msg"}
				msgid={msgid}
				setMsgid={setMsgid}
				setContextmenu={setContextmenu}
				contextmenu={contextmenu}
				contextstyle={contextstyle}
			/>

			<CSSTransition in={gif} unmountOnExit classNames='gif' timeout={300}>
				<Gif
					chatimg={chatimg}
					setGif={setGif}
					convoid={convoid}
					notifibool={notifibool}
					chatuser={chatuser}
				/>
			</CSSTransition>
			<CSSTransition
				in={notifi}
				timeout={300}
				classNames='displayerror'
				unmountOnExit>
				<div className='errormsg bs diagmsg'>
					<i
						className={notificont.emoji}
						style={{ position: "absolute", left: "20px" }}></i>{" "}
					<p>{notificont.msg}</p>
					<i className='far fa-times' onClick={() => setNotifi(false)}></i>
				</div>
			</CSSTransition>
			<CSSTransition in={modal} classNames='modal' timeout={0}>
				<div className='modal overflowimgcontainer'>
					<div className='buttons'>
						<i
							className='fal fa-search-minus'
							onClick={() => zoom({ type: "out" })}></i>
						<i className='fal fa-redo-alt' onClick={() => setZoomamount(1)}></i>
						<i
							className='fal fa-search-plus'
							onClick={() => zoom({ type: "in" })}></i>
					</div>
					<ScrollContainer className='grabbercontainer' hideScrollbars={true}>
						<img
							src=''
							alt=''
							ref={imgsrc}
							style={{
								width: 100 * zoomamount + "%",
								height: 100 * zoomamount + "%",
							}}
						/>
					</ScrollContainer>
					<i
						className='fal fa-times'
						onClick={() => {
							setModal(false);
							setZoomamount(1);
						}}></i>
				</div>
			</CSSTransition>
			<CSSTransition in={emojipicker} classNames='emojipicker' timeout={300}>
				<div
					className='emojipicker'
					ref={emojipickerref}
					onMouseOver={() => typerRef.current.focus()}
					onClick={() => typerRef.current.focus()}>
					<div className='times'>
						{" "}
						<i
							className='fal fa-times'
							onClick={() => setEmojipicker(false)}></i>
					</div>
					<Picker
						onEmojiClick={onEmojiClick}
						style={{
							width: "100px",
							height: "100px",
						}}
					/>
				</div>
			</CSSTransition>

			<Modal
				isOpen={isSettingModalOpen}
				onRequestClose={() => setIsSettingModalOpen(false)}
				style={{
					overlay: {
						backgroundColor: "#00000080",
						zIndex: 1000,
					},
					content: {
						position: "absolute",
						width: "600px",
						height: "500px",
						top: "50%",
						left: "50%",
						right: "50%",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						border: "none",
						padding: "10px",
						background: "#fff",
						overflow: "scroll",
					},
				}}
				contentLabel='Example Modal'>
				<i
					className='fal fa-times p-2'
					onClick={() => setIsSettingModalOpen(false)}></i>

				<div className='flex flex-row items-center justify-between p-2'>
					<h2 className='text-xl'>Change Emoji</h2>
					<div className='flex flex-row items-center justify-between'>
						<div className='flex flex-row items-center justify-between'>
							<p
								className='text-gray-500 text-sm cursor-pointer'
								onClick={() => setEmojiTypePicker(!emojiTypePicker)}>
								{emojitype}
							</p>
						</div>
					</div>
				</div>
				{emojiTypePicker && (
					<div className='flex flex-row items-center justify-between'>
						<Picker
							onEmojiClick={(e, emojiObject) => setEmojitype(emojiObject.emoji)}
							style={{
								width: "100px",
								height: "100px",
							}}
						/>
					</div>
				)}
				<div className='flex flex-row items-center justify-between p-2'>
					<h2 className='text-xl'>Notifications</h2>
					<div className='flex flex-row items-center justify-between'>
						<div className='flex flex-row items-center justify-between'>
							<Switches checked={myNotify} setChecked={setMyNotify} />
						</div>
					</div>
				</div>

				<div className='flex flex-row items-center justify-between p-2'>
					<h2 className='text-xl'>Change Nickname </h2>
					<div className='flex flex-row items-center justify-between'>
						<div className='flex flex-row items-center justify-between'>
							<input
								type='text'
								className='border border-gray-300 rounded-md px-2 py-1'
								value={changeNickname}
								onChange={(e) => setChangeNickname(e.target.value)}
								placeholder='Enter Nickname'
							/>
						</div>
					</div>
				</div>

				<div className='flex flex-row items-center justify-between p-2'>
					<h2 className='text-xl'>Change Theme</h2>
					<div className='flex flex-row items-center justify-between'>
						<div className='flex flex-row items-center justify-between'>
							{theme ? (
								<img
									src={theme}
									alt='Background Image'
									className='w-16 h-16 rounded-sm cursor-pointer mr-4'
									onClick={() => document.getElementById("file").click()}
								/>
							) : (
								<div className='flex flex-row items-center justify-between'>
									<div
										className='w-16 h-16 rounded-sm cursor-pointer dark:bg-slate-800 bg-gray-200 mr-4'
										onClick={() =>
											document.getElementById("file").click()
										}></div>
								</div>
							)}
							<button
								className='bg-blue-500 text-white px-4 py-2 rounded-md ml-2'
								onClick={() => {
									setTheme("");
									try {
										const storageRef = ref(
											storage,
											`conversations/${convoid}/theme`
										);
										getDownloadURL(storageRef)
											.then((url) => {
												deleteObject(storageRef);
											})
											.catch((error) => {
												console.log(error);
											});
									} catch (error) {
										console.log(error);
									}
								}}>
								Default
							</button>
							<input
								type='file'
								id='file'
								className='hidden'
								onChange={(e) =>
									setTheme(URL.createObjectURL(e.target.files[0]))
								}
							/>
						</div>
					</div>
				</div>

				<div className='flex flex-row items-center justify-between p-2'>
					<h2 className='text-xl'></h2>
					<div className='flex flex-row items-center justify-between'>
						<div className='flex flex-row items-center justify-between'>
							<button
								className='bg-blue-500 text-white px-4 py-2 rounded-md'
								onClick={async () => {
									if (user?.uid === chatUsers[0]?.uid) {
										updateDoc(
											doc(db, "conversations", convoid),
											{
												notifications1: myNotify,
											},
											{ merge: true }
										);
									} else {
										updateDoc(
											doc(db, "conversations", convoid),
											{
												notifications2: myNotify,
											},
											{ merge: true }
										);
									}
									if (changeNickname !== "") {
										if (user?.uid === chatUsers[0]?.uid) {
											updateDoc(
												doc(db, "conversations", convoid),
												{
													nickname1: changeNickname,
												},
												{ merge: true }
											);
										} else {
											updateDoc(
												doc(db, "conversations", convoid),
												{
													nickname2: changeNickname,
												},
												{ merge: true }
											);
										}
									}
									if (document.getElementById("file").files[0]) {
										const storageRef = ref(
											storage,
											`conversations/${convoid}/theme`
										);
										try {
											getDownloadURL(storageRef)
												.then((url) => {
													deleteObject(storageRef);
												})
												.catch((error) => {
													console.log(error);
												});
										} catch (error) {
											console.log(error);
										}

										const response = await fetch(theme);
										const blob = await response.blob();

										const task = uploadBytes(storageRef, blob);
										task.then((snapshot) => {
											getDownloadURL(snapshot.ref).then((url) => {
												updateDoc(
													doc(db, "conversations", convoid),
													{
														customizedconvo: {
															theme: url,
															emoji: emojitype,
														},
													},
													{ merge: true }
												);
											});
										});
									} else {
										updateDoc(
											doc(db, "conversations", convoid),
											{
												customizedconvo: {
													emoji: emojitype,
													theme: theme,
												},
											},
											{ merge: true }
										);
									}

									setIsSettingModalOpen(false);
								}}>
								Save
							</button>
						</div>
					</div>
				</div>
			</Modal>

			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
				style={{
					padding: "0px 0px 0px 0px",
					margin: "0px 0px 0px 0px",
				}}>
				<CloseIcon className='close' onClick={handleClose} />
				{selectedFile?.base64 ? (
					<img src={selectedFile?.message} alt='' className='dialogImage' />
				) : (
					<video
						src={selectedFile?.message}
						className='dialogImage'
						autoPlay
						loop
						muted
						controls
					/>
				)}
			</Dialog>
			{loading && <LinearProgress />}
			{error && (
				<Typography variant='h6' color='error'>
					{error}
				</Typography>
			)}
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		data: state.data,
	};
};

export default connect(mapStateToProps)(Dialogue);
