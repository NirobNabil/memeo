import React, { useEffect, useState, Suspense } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { auth, db } from "../firebase";
import Loading from "../components/Loading";

import Header from "../components/Header";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUser, clearData } from "../redux/actions/index";

import Component from "../components/Component";
import Watch from "../components/Watch";
import Templates from "../components/Templates";

import SmallChatBody from "./messenger/components/Body";
import { useBeforeunload } from "react-beforeunload";

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

import moment from "moment";

import { ToastInfo } from "../components/Components/Toast";

function Home(props) {
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("home");
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [notificationsLength, setNotificationsLength] = useState(0);
	const [notifications, setNotifications] = useState([]);
	const [posts, setPosts] = useState([]);
	const [viewedPostID, setViewedPostID] = useState([]);
	const [follow, setFollow] = useState([]);
	const [following, setFollowing] = useState([]);
	const [followers, setFollowers] = useState([]);
	const [videoPosts, setVideoPosts] = useState([]);
	const [followingUIDs, setFollowingUIDs] = useState([]);
	const [followersUIDs, setFollowersUIDs] = useState([]);

	const [toastShow, setToastShow] = useState(false);
	const [toastdata, setToastdata] = useState([]);

	// set initial tab
	const setTabInSession = (tabname) => {
		window.sessionStorage.setItem("currTab", tabname);
		setTab(tabname);
	};

	useEffect(() => {
		const currTab = window.sessionStorage.getItem("currTab");
		const tabname = currTab ? currTab : "home";
		setTab((prevState) => (prevState !== tabname ? tabname : prevState));
	}, []);

	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			if (user) {
				props.fetchUser(user);
				router.push("/");
			} else {
				router.push("/login");
			}
		});
		return () => {
			setLoading(false);
		};
	}, []);

	const authListener = () => {
		auth.onAuthStateChanged((user) => {
			if (user) {
				setUser(user);
				updateDoc(
					doc(db, "users", user?.uid),
					{
						online: true,
					},
					{ merge: true }
				).catch((error) => {
					console.log(error);
				});
			} else {
				setUser(null);
			}
		});
	};

	useBeforeunload(() => {
		if (user) {
			updateDoc(
				doc(db, "users", user?.uid),
				{
					online: false,
				},
				{ merge: true }
			).catch((error) => {
				console.log(error);
			});
		}
	});
	useEffect(() => {
		authListener();
		window.addEventListener("onbeforeunload", removeActiveStatus);
		function removeActiveStatus() {
			if (user) {
				updateDoc(
					doc(db, "users", user?.uid),
					{
						online: false,
					},
					{ merge: true }
				).catch((error) => {
					console.error("Error removing document: ", error);
				});
			}
		}
		if (user) {
			updateDoc(
				doc(db, "users", user?.uid),
				{
					online: true,
				},
				{ merge: true }
			).catch((error) => {
				console.log(error);
			});
		}
	}, []);

	useEffect(() => {
		// set local storage tab value
		if (sessionStorage.getItem("tab")) {
			setTab(sessionStorage.getItem("tab"));
		} else {
			setTab("home");
		}
	}, []);

	useEffect(() => {
		if (user) {
			setLoading(false);
			getDoc(doc(db, "users", user?.uid, "following", user?.uid)).then(
				(doc) => {
					if (doc.exists()) {
						setFollowingUIDs(doc.data()?.following);
					}
				}
			);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			getDoc(doc(db, "users", user?.uid, "followers", user?.uid)).then(
				(Doc) => {
					if (Doc.exists()) {
						setFollowersUIDs(Doc.data().followers);
					}
				}
			);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			const notificationsRef = collection(
				db,
				"notifications",
				user?.uid,
				"notifications"
			);
			const q = query(
				notificationsRef,
				orderBy("notifidate", "desc"),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let notifications = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return { docId: id, ...data };
				});
				setNotifications(notifications);
				notifications?.map((notification) => {
					if (
						moment(notification?.notifidate?.toDate()).fromNow() ===
						"a few seconds ago"
					) {
						setToastdata(notification);
						setToastShow(true);
						setTimeout(() => {
							setToastShow(false);
							setToastdata([]);
						}, 2000);
					}
				});
			});
			return unsubscribe;
		}
	}, [user]);

	useEffect(() => {
		if (notifications) {
			setNotificationsLength(
				notifications?.filter((notif) => !notif?.read).length
			);
		}
	}, [notifications]);

	const fetchNotifications = () => {
		if (user && notifications?.length > 0) {
			const lastNotif = notifications[notifications?.length - 1];
			const notificationsRef = collection(
				db,
				`notifications/${user?.uid}/notifications`
			);
			const q = query(
				notificationsRef,
				orderBy("notifidate", "desc"),
				startAfter(lastNotif?.notifidate),
				limit(10)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let notifications = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return { docId: id, ...data };
				});
				setNotifications((prev) => [...prev, ...notifications]);
			});
			return unsubscribe;
		}
	};

	useEffect(() => {
		//push a random postID to viewedPosts array
		if (user) {
			const postsRef = collection(db, `posts`, user?.uid, "viewedPosts");
			const q = query(postsRef, orderBy("timestamp", "desc"));
			const unsubscribe = onSnapshot(q, (snapshot) => {
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					let oneMonthAgo = new Date();
					let oneDayAgo = new Date();
					oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
					oneDayAgo.setDate(oneDayAgo.getDate() - 1);
					if (data?.timestamp?.toDate() < oneMonthAgo) {
						deleteDoc(doc(db, "posts", user?.uid, "viewedPosts", id));
					} else if (data?.timestamp?.toDate() < oneDayAgo) {
						setViewedPostID((viewedPosts) => [...viewedPosts, id]);
					}
				});
			});
			return unsubscribe;
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			const postsRef = collection(db, `posts`);
			// where("uid", "in", followingUIDs),
			const q = query(postsRef, orderBy("timestamp", "desc"), limit(20));
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let posts = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (!viewedPostID.includes(id)) {
						posts.push({ id: id, ...data });
					}
				});
				setPosts(posts);
			});
			return unsubscribe;
		}
	}, [user]);

	const fetchPosts = () => {
		if (user && posts?.length > 0) {
			const lastPost = posts[posts?.length - 1];
			const postsRef = collection(db, `posts`);
			// where("uid", "in", followingUIDs)
			const q = query(
				postsRef,
				orderBy("timestamp", "desc"),
				startAfter(lastPost?.timestamp),
				limit(20)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let posts = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (!viewedPostID.includes(id)) {
						posts.push({ id: id, ...data });
					}
					setPosts((prev) => [...prev, ...posts]);
				});
			});
			return unsubscribe;
		}
	};

	useEffect(() => {
		if (user) {
			const postsRef = collection(db, `posts`);
			//where("uid", "in", followingUIDs),
			const q = query(
				postsRef,
				where("type", "==", "video"),
				orderBy("timestamp", "desc"),
				limit(20)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let posts = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (!viewedPostID.includes(id)) {
						posts.push({ id: id, ...data });
					}
				});
				setVideoPosts(posts);
			});
			return unsubscribe;
		}
	}, [user]);

	const fetchVideoPosts = () => {
		if (user && videoPosts?.length > 0) {
			const lastPost = videoPosts[videoPosts?.length - 1];
			const postsRef = collection(db, `posts`);
			//where("uid", "in", followingUIDs),
			const q = query(
				postsRef,
				where("type", "==", "video"),
				orderBy("timestamp", "desc"),
				startAfter(lastPost?.timestamp),
				limit(20)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let posts = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (!viewedPostID.includes(id)) {
						posts.push({ id: id, ...data });
					}
				});
				setVideoPosts((prev) => [...prev, ...posts]);
			});
			return unsubscribe;
		}
	};

	useEffect(() => {
		if (user && followingUIDs.length > 0) {
			followingUIDs.slice(0, 10).map((uid) => {
				if (uid !== user?.uid) {
					getDoc(doc(db, "users", uid)).then((doc) => {
						if (doc.exists()) {
							setFollowing((following) => [
								...following,
								{ id: uid, ...doc.data() },
							]);
						}
					});
				}
			});
		}
	}, [user, followingUIDs]);

	const fetchFollowing = () => {
		if (user && followingUIDs.length > 0 && following?.length > 0) {
			const lastFollowing = following[following?.length - 1];
			followingUIDs
				.slice(
					followingUIDs.indexOf(lastFollowing?.id) + 1,
					followingUIDs.indexOf(lastFollowing?.id) + 11
				)
				.map((uid) => {
					if (uid !== user?.uid) {
						getDoc(doc(db, "users", uid)).then((doc) => {
							if (doc.exists()) {
								setFollowing((following) => [
									...following,
									{ id: uid, ...doc.data() },
								]);
							}
						});
					}
				});
		}
	};

	useEffect(() => {
		if (user) {
			//  where("uid", "not-in", followingUIDs),
			const q = query(
				collection(db, "users"),
				orderBy("createdAt", "desc"),
				limit(20)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let users = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (
						followingUIDs.indexOf(id) === -1 &&
						followersUIDs.indexOf(id) === -1 &&
						id !== user?.uid
					) {
						users.push({ id: id, ...data });
					}
				});
				setFollow(users);
			});
			return unsubscribe;
		}
	}, [user, followingUIDs, followersUIDs]);

	const fetchFollow = () => {
		if (user && follow?.length > 0) {
			const lastUser = follow[follow?.length - 1];
			//where("uid", "not-in", followingUIDs),
			const q = query(
				collection(db, "users"),
				orderBy("createdAt", "desc"),
				startAfter(lastUser?.createdAt),
				limit(20)
			);
			const unsubscribe = onSnapshot(q, (snapshot) => {
				let users = [];
				snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					if (
						followingUIDs.indexOf(id) === -1 &&
						followersUIDs.indexOf(id) === -1 &&
						id !== user?.uid
					) {
						users.push({ id: id, ...data });
					}
				});
				setFollow((prev) => [...prev, ...users]);
			});
			return unsubscribe;
		}
	};

	useEffect(() => {
		if (user && followersUIDs.length > 0) {
			followersUIDs.slice(0, 10).map((uid) => {
				getDoc(doc(db, "users", uid)).then((doc) => {
					if (doc.exists()) {
						setFollowers((followers) => [
							...followers,
							{ id: uid, ...doc.data() },
						]);
					}
				});
			});
		}
	}, [user, followersUIDs]);

	const fetchFollowers = () => {
		if (user && followers?.length > 0 && followersUIDs.length > 0) {
			const lastFollower = followers[followers?.length - 1];
			followersUIDs
				.slice(
					followersUIDs.indexOf(lastFollower?.id) + 1,
					followersUIDs.indexOf(lastFollower?.id) + 11
				)
				.map((uid) => {
					getDoc(doc(db, "users", uid)).then((doc) => {
						if (doc.exists()) {
							setFollowers((followers) => [
								...followers,
								{ id: uid, ...doc.data() },
							]);
						}
					});
				});
		}
	};

	// useEffect(() => {
	//   if (user) {
	//     const q = query(collection(db, 'memes', user?.uid, 'userMemes'), where("type", "==", "image"), orderBy("timestamp", "desc"), limit(10));
	//     const unsubscribe = onSnapshot(q, (snapshot) => {
	//         let memes = [];
	//         snapshot.docs.map((doc) => {
	//             const data = doc.data();
	//             const id = doc.id;
	//             memes.push({ id: id, ...data });
	//         });
	//         setUserMemes(memes);
	//     });
	//     return unsubscribe;
	//   }
	// }, [user]);

	// const fetchUserMemes = () => {
	//   if (user && userMemes?.length > 0) {
	//     const lastMeme = userMemes[userMemes?.length - 1];
	//     const q = query(collection(db, 'memes', user?.uid, 'userMemes'), where("type", "==", "image"), orderBy("timestamp", "desc"), startAfter(lastMeme?.timestamp), limit(10));
	//     const unsubscribe = onSnapshot(q, (snapshot) => {
	//         let memes = [];
	//         snapshot.docs.map((doc) => {
	//             const data = doc.data();
	//             const id = doc.id;
	//             memes.push({ id: id, ...data });
	//         });
	//         setUserMemes((prev) => [...prev, ...memes]);
	//     });
	//     return unsubscribe;
	//   }
	// };

	if (loading || !props?.data?.currentUser) {
		return (
			<div className='justify-center items-center flex flex-col h-screen'>
				<Loading />
			</div>
		);
	}

	return (
		<>
			<div className='bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen'>
				<Head>
					<title>Memeo - The meme world</title>
					<meta name='description' content='Generated by create next app' />
					<link rel='icon' href='/favicon.ico' />
				</Head>
				<Header
					tab={tab}
					setTab={setTabInSession}
					notifications={notifications}
					notificationsLength={notificationsLength}
					setNotificationsLength={setNotificationsLength}
					fetchMore={fetchNotifications}
				/>
				<main className='min-h-screen flex  mx-auto  flex-col dark:bg-slate-900 dark:text-white bg-[#F3F2EF] text-black pt-[105px]'>
					<Suspense fallback={<Loading loading={true} />}>
						{tab === "home" ? (
							<Component
								{...props}
								posts={posts}
								active={true}
								following={following}
								follow={follow}
								followers={followers}
								followingUIDs={followingUIDs}
								followersUIDs={followersUIDs}
								fetchMore={fetchPosts}
								fetchFollowing={fetchFollowing}
								fetchFollow={fetchFollow}
								fetchFollowers={fetchFollowers}
								Isactive={true}
								// fetchUserMemes={fetchUserMemes}
								// userMemes={userMemes}
							/>
						) : tab === "watch" ? (
							<Watch
								{...props}
								videoPosts={videoPosts}
								active={true}
								following={following}
								follow={follow}
								followers={followers}
								followingUIDs={followingUIDs}
								followersUIDs={followersUIDs}
								fetchMore={fetchVideoPosts}
								fetchFollowing={fetchFollowing}
								fetchFollow={fetchFollow}
								fetchFollowers={fetchFollowers}
								Isactive={true}
								// userMemes={userMemes}
								// fetchUserMemes={fetchUserMemes}
							/>
						) : (
							<Templates {...props} />
						)}
					</Suspense>
				</main>
			</div>
			<SmallChatBody Home={true} />
			{toastShow && (
				<div className='fixed bottom-0 left-0 m-8'>
					<ToastInfo data={toastdata} />
				</div>
			)}
		</>
	);
}

const mapStateToProps = (store) => {
	return {
		data: store.data,
	};
};

const mapDispatchToProps = (dispatch) =>
	bindActionCreators({ fetchUser, clearData }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Home);
