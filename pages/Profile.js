/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "../components/Header";
import { auth, db } from "../firebase";
import {
	collection,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	doc,
	setDoc,
	updateDoc,
	serverTimestamp,
	deleteDoc,
	getDoc,
	arrayUnion,
	arrayRemove,
	onSnapshot,
	addDoc,
} from "firebase/firestore";
import Head from "next/head";
import Feed from "../components/Feed";
import Post from "../components/Post";
import Menu from "../components/Menu";
import Widgets from "../components/Widgets";
import { storage } from "../firebase";
import { useSelector, useDispatch } from "react-redux";

import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
	putString,
	putFile,
	getStorage,
	uploadBytes,
} from "firebase/storage";
import Loading from "../components/Loading";

import { BiLeftArrow as ArrowBack } from "react-icons/bi";

import { fetchUserAgain } from "../redux/actions";
import Modal from "react-modal";

export default function Profile(props) {
	const [User, setUser] = useState(null);
	const [userPost, setUserPost] = useState([]);
	const [backgroundURL, setBackgroundURL] = useState(null);
	const [photoURL, setPhotoURL] = useState(null);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");
	const [loading, setLoading] = useState(false);
	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);
	const [followingUIDs, setFollowingUIDs] = useState([]);
	const [followersUIDs, setFollowersUIDs] = useState([]);
	const [thisUser, setThisUser] = useState(null);
	const [userMemes, setUserMemes] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [text, setText] = useState("");
	const [tab, setTab] = useState("feed");
	const [user, setuser] = useState(null);
	const dispatch = useDispatch();

	const backgroundURLRef = useRef(null);
	const photoURLRef = useRef(null);

	const router = useRouter();
	const { uid } = router.query;

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			setuser(user);
		}
	}, []);

	useEffect(() => {
		if (uid) {
			getDoc(doc(db, "users", uid)).then((doc) => {
				if (doc.exists()) {
					setThisUser(doc.data());
				}
			});
		}
	}, [uid]);

	useEffect(() => {
		if (uid) {
			(async () => {
				const q = query(collection(db, "users"), where("uid", "==", uid));
				const querySnapshot = await getDocs(q);
				querySnapshot.forEach((docx) => {
					const user = docx.data();
					setUser(docx.data());
					setBackgroundURL(docx.data()?.backgroundURL);
					setPhotoURL(docx.data()?.photoURL);
					setName(docx.data()?.name || "");
					setBio(docx.data()?.bio || "");
					getDocs(
						collection(db, "posts", uid, "userPosts"),
						orderBy("timestamp", "desc"),
						limit(10)
					).then((querySnapshot) => {
						const posts = [];
						querySnapshot.forEach((Doc) => {
							if (Doc.exists()) {
								getDoc(doc(db, "posts", Doc.data().postID)).then((doc) => {
									if (doc.exists()) {
										posts.push({ id: doc.id, ...doc.data() });
									}
								});
							}
						});
						setUserPost(posts);
					});
				});
			})();
		}
	}, [uid, router]);

	const fetchMorePosts = async () => {
		if (userPost.length > 0 && uid) {
			const last = userPost[userPost.length - 1];
			const q = query(
				collection(db, "posts", uid, "userPosts"),
				orderBy("timestamp", "asc"),
				startAfter(last.timestamp),
				limit(10)
			);
			const querySnapshot = await getDocs(q);
			const posts = [];
			querySnapshot.forEach((Doc) => {
				getDoc(doc(db, "posts", Doc.data().postID)).then((doc) => {
					if (doc.exists()) {
						posts.push({ id: doc.id, ...doc.data() });
					}
				});
			});
			setUserPost([...userPost, ...posts]);
		}
	};

	useEffect(() => {
		if (uid) {
			(async () => {
				await getDoc(doc(db, "users", uid, "following", uid)).then((doc) => {
					if (doc.exists()) {
						setFollowingUIDs(doc.data().following);
					}
				});

				await getDoc(doc(db, "users", uid, "followers", uid)).then((doc) => {
					if (doc.exists()) {
						setFollowersUIDs(doc.data().followers);
					}
				});
			})();
		}
	}, [uid]);

	useEffect(() => {
		if (uid) {
			(async () => {
				let users = [];
				followersUIDs.slice(0, 10).map(async (id) => {
					await getDoc(doc(db, "users", id)).then((doc) => {
						if (doc.exists()) {
							users.push({ id: doc.id, ...doc.data() });
						}
					});
				});
				setFollowers(users);
			})();
		}
	}, [uid, followersUIDs]);

	useEffect(() => {
		if (uid) {
			(async () => {
				let users = [];
				followingUIDs.slice(0, 10).map(async (id) => {
					await getDoc(doc(db, "users", id)).then((doc) => {
						if (doc.exists()) {
							users.push({ id: doc.id, ...doc.data() });
						}
					});
				});
				setFollowing(users);
			})();
		}
	}, [uid, followingUIDs]);

	const fetchMoreFollowers = async () => {
		if (
			uid &&
			followers?.length > 0 &&
			followersUIDs.length > followers.length
		) {
			let users = [];
			followersUIDs
				.slice(followers.length, followers.length + 10)
				.map(async (id) => {
					await getDoc(doc(db, "users", id)).then((doc) => {
						if (doc.exists()) {
							users.push({ id: id, ...doc.data() });
						}
					});
				});
			setFollowers([...followers, ...users]);
		}
	};

	const fetchMoreFollowing = async () => {
		if (
			uid &&
			following?.length > 0 &&
			followingUIDs.length > following?.length
		) {
			let users = [];
			followingUIDs
				.slice(following.length, following.length + 10)
				.map(async (id) => {
					await getDoc(doc(db, "users", id)).then((doc) => {
						if (doc.exists()) {
							users.push({ id: id, ...doc.data() });
						}
					});
				});
			setFollowing([...following, ...users]);
		}
	};

	useEffect(() => {
		if (uid) {
			const q = query(
				collection(db, "memes", uid, "userMemes"),
				orderBy("timestamp", "asc"),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let memes = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					memes.push({ id: id, ...data });
				});
				setUserMemes(memes);
			});
			return unsubscribe;
		}
	}, [uid]);

	const fetchUserMemes = () => {
		if (uid && userMemes?.length > 0) {
			const lastMeme = userMemes[userMemes?.length - 1];
			const q = query(
				collection(db, "memes", uid, "userMemes"),
				orderBy("timestamp", "asc"),
				startAfter(lastMeme?.timestamp),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let memes = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					memes.push({ id: id, ...data });
				});
				setUserMemes((prev) => [...prev, ...memes]);
			});
			return unsubscribe;
		}
	};

	const handleFileBackgroundURL = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setBackgroundURL(e.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFilePhotoURL = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setPhotoURL(e.target.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpdateProfile = async () => {
		setLoading(true);

		if (backgroundURL !== User.backgroundURL) {
			try {
				const storageRef = ref(storage, `backgroundURL/${User.uid}`);
				await deleteObject(storageRef);
			} catch (error) {
				console.log(error);
			}
			const response = await fetch(backgroundURL);
			const blob = await response.blob();
			const storageRef = ref(storage, `backgroundURL/${User.uid}`);
			const uploadTask = await uploadBytes(storageRef, blob);
			const downloadURL = await getDownloadURL(uploadTask.ref);
			await setDoc(
				doc(db, "users", User.uid),
				{
					backgroundURL: downloadURL,
				},
				{ merge: true }
			);
		}

		if (photoURL !== User.photoURL) {
			try {
				const storageRef = ref(storage, `photoURL/${User.uid}`);
				await deleteObject(storageRef);
			} catch (error) {
				console.log(error);
			}
			const response = await fetch(photoURL);
			const blob = await response.blob();
			const storageRef = ref(storage, `photoURL/${User.uid}`);
			const uploadTask = await uploadBytes(storageRef, blob);
			const downloadURL = await getDownloadURL(uploadTask.ref);
			await setDoc(
				doc(db, "users", User.uid),
				{
					photoURL: downloadURL,
				},
				{ merge: true }
			);
			const q = query(
				collection(db, "conversations"),
				where("uids", "array-contains", User.uid)
			);
			const querySnapshot = await getDocs(q);
			querySnapshot.forEach(async (docdata) => {
				await setDoc(
					doc(db, "conversations", docdata.id),
					{
						users: docdata.data().users.map((user) => {
							if (user.uid === User.uid) {
								return {
									...user,
									photoURL: downloadURL,
								};
							} else {
								return user;
							}
						}),
					},
					{ merge: true }
				);
			});
		}

		if (name !== User.name) {
			await setDoc(
				doc(db, "users", User.uid),
				{
					name: name,
				},
				{ merge: true }
			);
		}

		if (bio !== User.bio) {
			await setDoc(
				doc(db, "users", User.uid),
				{
					bio: bio,
				},
				{ merge: true }
			);
		}

		setLoading(false);
		setIsOpen(false);
		window.location.reload();
	};

	const followToggle = async (uid) => {
		if (text === "Follow") {
			updateDoc(doc(db, "users", uid, "followers", uid), {
				followers: arrayUnion(user.uid),
			});

			updateDoc(doc(db, "users", user.uid, "following", user?.uid), {
				following: arrayUnion(uid),
			});

			const id = [user?.uid, uid].sort().join("");
			getDoc(doc(db, "conversations", id)).then((Doc) => {
				if (!Doc.exists()) {
					setDoc(doc(db, "conversations", id), {
						customizedconvo: {
							theme: "https://i.imgur.com/4hzNTTq.png",
							emoji: "🤗",
						},
						uid: [user.uid, uid].sort().join(""), //sorts the uid's alphabetically and joins them together
						uids: [user.uid, uid],
						users: [
							{
								uid: user?.uid,
								name: user?.name,
								photoURL: user?.photoURL,
							},
							{
								uid: uid,
								name: thisUser?.name,
								photoURL: thisUser?.photoURL,
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
				}
			});
			setFollowersUIDs((followersUIDs) => [...followersUIDs, user.uid]);
		} else {
			await updateDoc(doc(db, "users", uid, "followers", uid), {
				followers: arrayRemove(user?.uid),
			});

			await updateDoc(doc(db, "users", user.uid, "following", user?.uid), {
				following: arrayRemove(uid),
			});
			setFollowersUIDs(followersUIDs.filter((item) => item !== user.uid));
		}
	};

	useEffect(() => {
		if (followersUIDs.findIndex((item) => item === user.uid) !== -1) {
			setText("Following");
		} else {
			setText("Follow");
		}
	}, [followersUIDs, user?.uid]);

	if (loading) {
		<div className='flex justify-center items-center h-screen opacity-50'>
			<Loading />
		</div>;
	}

	return (
		<>
			<div className=' dark:bg-slate-900 dark:text-gray-400 text-gray-600 bg-white min-h-screen'>
				<div
					className='cursor-pointer w-12 h-12 flex justify-center items-center text-2xl text-center rounded-full text-gray-600 dark:text-gray-300 fixed top-4 left-4 hover:shadow-black/30 transition hover:shadow-sm z-50'
					onClick={() => router.back()}
					title='Back'>
					<span>
						<ArrowBack className='' />
					</span>
				</div>
				<div className='flex flex-col items-center justify-center gap-5 pt-20'>
					<div className='flex flex-col items-center bg-opacity-50 bg-white dark:bg-slate-900/50 w-full'>
						{User && (
							<span className=''>
								<Image
									src={User?.photoURL}
									alt='profile pic'
									width={150}
									height={150}
									className='rounded-full border-4 border-white cursor-pointer absolute'
								/>
							</span>
						)}
					</div>

					<div className=' bg-white dark:bg-slate-900/50  '>
						<div className='flex flex-col items-center justify-center'>
							<div className='flex flex-col items-center'>
								{console.log(user?.uid, User?.uid)}
								<h1 className='text-xl font-bold'>{User?.name}</h1>
								<p className='text-gray-500 text-sm font-semibold'>
									@{User?.userName}
								</p>
								<div className='text-gray-500 text-sm'>
									{uid === user?.uid &&
										(User?.bio ? (
											<p className='mt-4'>Bio: {User?.bio}</p>
										) : (
											<div className='flex items-center justify-center mt-4'>
												<div className='flex flex-col items-center'>
													<button
														className='text-white  py-2 px-4 rounded-full text-sm font-semibold bg-[#1DA1F2] hover:bg-[#1DA1F2] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:ring-opacity-50'
														onClick={() => setIsOpen(true)}>
														Add Bio
													</button>
												</div>
											</div>
										))}
									{uid !== user?.uid && (
										<p className='mt-4'>Bio: {User?.bio}</p>
									)}
								</div>
							</div>
							{uid !== user?.uid && (
								<div className='flex items-center justify-center mt-4'>
									<div className='flex flex-col items-center'>
										<button
											className='text-white  py-2 px-4 rounded-full text-sm font-semibold bg-[#1DA1F2] hover:bg-[#1DA1F2] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:ring-opacity-50'
											onClick={() => followToggle(User.uid)}>
											{text}
										</button>
									</div>
								</div>
							)}

							{uid === user?.uid && (
								<div className='flex items-center justify-center mt-4'>
									<div className='flex flex-col items-center'>
										<button
											className='text-white  py-2 px-4 rounded-full text-sm font-semibold bg-[#1DA1F2] hover:bg-[#1DA1F2] focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:ring-opacity-50'
											onClick={() => setIsOpen(true)}>
											Edit profile
										</button>
									</div>
								</div>
							)}

							<div className='flex flex-row gap-10 items-center justify-center my-2 '>
								<div className='flex items-center justify-center  space-x-1  bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
									<h1 className='text-md  mx-2'>{followingUIDs.length}</h1>
									<p className='text-gray-500 text-sm'>Following</p>
								</div>
								<div className='flex items-center justify-center  space-x-1   bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
									<h1 className='text-md  mx-2'>{followersUIDs.length}</h1>
									<p className='text-gray-500 text-sm'>Followers</p>
								</div>
								<div className='flex items-center justify-center  space-x-1 bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
									<h1 className='text-md  mx-2'>
										{userPost ? userPost.length : 0}
									</h1>
									<p className='text-gray-500 text-sm'>Posts</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* // tab */}
				<div className='tab flex justify-center gap-8 text-xl mt-10 sm:hidden'>
					<div
						onClick={() => setTab("feed")}
						className={`${tab === "feed" &&
							"text-orange-red underline"} cursor-pointer`}>
						<p>Feed</p>
					</div>
					<div
						onClick={() => setTab("templates")}
						className={`${tab === "templates" &&
							"text-orange-red underline"} cursor-pointer`}>
						<p>Templates</p>
					</div>
				</div>

				<div className='bg-[#F3F2EF] relative top-20  dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto justify-center '>
					<div className='hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2 mt-[34px]'>
						<Menu
							following={following}
							followers={followers}
							profile={true}
							fetchFollowing={fetchMoreFollowing}
							fetchFollowers={fetchMoreFollowers}
							followingUIDs={followingUIDs}
							followersUIDs={followersUIDs}
							active={uid === user?.uid ? true : false}
						/>
					</div>

					{tab === "feed" && (
						<div className='flex-grow border-l border-r border-gray-400 dark:border-gray-700 max-w-xl xl:w-[520px] space-x-5 sm:my-[28px] mx-3 md:mx-0'>
							<Feed
								posts={userPost?.sort((a, b) => b.timestamp - a.timestamp)}
								inactive
								len={1}
								fetchMore={fetchMorePosts}
								active={false}
							/>
						</div>
					)}

					{tab === "templates" && (
						<div className='grow inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px] sm:mt-[34px]'>
							<div className='sm:sticky sm:top-20'>
								<Widgets
									fetchUserMemes={fetchUserMemes}
									userMemes={userMemes}
									fromProfile={true}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			<Modal
				isOpen={isOpen}
				onRequestClose={() => setIsOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0,0,0,0.5)",
						zIndex: 20,
					},
					content: {
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "rgba(0,0,0,0)",
						border: "none",
						zIndex: 1000000,
						width: "100%",
						maxWidth: "500px",
					},
				}}>
				<div className='modal-box w-11/12 dark:bg-slate-800 bg-white scrollbar-hide '>
					<div className='flex flex-col items-center '>
						<div className='flex flex-col items-center'>
							<label htmlFor='photoURL' className='text-gray-500 pt-5 pb-2'>
								Profile Image
							</label>
							<input
								type='file'
								id='filePhoto'
								accept='image/*'
								onChange={handleFilePhotoURL}
								className='hidden'
								ref={photoURLRef}
							/>
							<Image
								src={photoURL}
								alt='profile pic'
								width={150}
								height={150}
								className='rounded-full border-4 border-white cursor-pointer btn object-cover'
								onClick={() => photoURLRef.current.click()}
							/>
						</div>
						<div className='flex flex-col items-center'>
							<label htmlFor='name' className='text-gray-500 pt-5 pb-2'>
								Name
							</label>
							<input
								type='text'
								placeholder='Type here'
								className='input input-bordered w-full max-w-xs bg-gray-100 dark:bg-slate-800 text-gray-500 focus:text-gray-900 dark:text-white'
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className='flex flex-col items-center'>
							<label htmlFor='bio' className='text-gray-500 pt-5 pb-2'>
								Bio
							</label>
							<input
								type='text'
								placeholder='Type here'
								className='input input-bordered w-full max-w-xs bg-gray-100 dark:bg-slate-800 text-gray-500 focus:text-gray-900 dark:text-white'
								value={bio}
								onChange={(e) => setBio(e.target.value)}
							/>
						</div>
						<div className='flex flex-col items-center pt-5'>
							<button
								className='px-5 rounded-full py-3 bg-orange-red/70 hover:bg-orange-red text-white dark:text-white inline-flex items-center justify-center transition-all'
								onClick={handleUpdateProfile}>
								Update Profile
							</button>
						</div>
					</div>

					<div className='modal-action'>
						<a
							href='#'
							className='btn btn-sm hover:bg-transparent bg-transparent dark:bg-slate-800 text-gray-800 dark:text-white'
							disabled={loading}
							onClick={() => setIsOpen(false)}>
							{loading ? "Loading..." : "Close"}
						</a>
					</div>
				</div>
			</Modal>
		</>
	);
}
