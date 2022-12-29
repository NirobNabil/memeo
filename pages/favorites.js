import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
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

import { db, storage, auth } from "../firebase";

import Feed from "../components/Feed";
import Menu from "../components/Menu";
import Widgets from "../components/Widgets";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import Header from "../components/Header";

function Favorites(props) {
	const [user, setUser] = useState(null);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);
	const [followingUIDs, setFollowingUIDs] = useState([]);
	const [followersUIDs, setFollowersUIDs] = useState([]);
	const [thisUser, setThisUser] = useState(null);
	const [userMemes, setUserMemes] = useState([]);
	const [isOpen, setIsOpen] = useState(false);
	const [text, setText] = useState("");
	const [modalFollowOpen, setModalFollowOpen] = useState(false);
	const [modalFollowingOpen, setModalFollowingOpen] = useState(false);
	const [modalFollowersOpen, setModalFollowersOpen] = useState(false);
	const [followListRemove, setFollowListRemove] = useState([]);

	const router = useRouter();

	useEffect(() => {
		const user  = JSON.parse(localStorage.getItem("user"));
		if(user){
			setUser(user);
		}
	}, []);

	useEffect(() => {
		if (user) {
			const q = query(
				collection(db, "posts", user.uid, "userFavorites"),
				orderBy("timestamp", "desc"),
				limit(25)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				querySnapshot.forEach((docData) => {
					getDoc(doc(db, "posts", docData.data().id)).then((docElement) => {
						if (docElement.exists()) {
							setPosts((prev) =>
								prev
									.filter((post) => post.id !== docElement.id)
									.concat({ id: docElement.id, ...docElement.data() })
							);
						} else {
							deleteDoc(
								doc(db, "posts", user.uid, "userFavorites", docData.id)
							);
						}
					});
				});
			});
			return unsubscribe;
		} else {
			auth.onAuthStateChanged((user) => {
				if (user) {
					getDoc(doc(db, "users", user.uid)).then((doc) => {
						if (doc.exists()) {
							setUser({ ...doc.data(), uid: doc.id });
						}
					});
				} else {
					setUser(null);
				}
			});
		}
	}, [user]);

	const fetchMore = () => {
		if (posts.length > 0) {
			const q = query(
				collection(db, "posts", user.uid, "userFavorites"),
				orderBy("timestamp", "desc"),
				startAfter(posts[posts.length - 1].timestamp),
				limit(25)
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				querySnapshot.forEach((docData) => {
					getDoc(doc(db, "posts", docData.data().id)).then((docElement) => {
						if (docElement.exists()) {
							setPosts((prev) =>
								prev
									.filter((post) => post.id !== docElement.id)
									.concat({ id: docElement.id, ...docElement.data() })
							);
						} else {
							deleteDoc(
								doc(db, "posts", user.uid, "userFavorites", docData.id)
							);
						}
					});
				});
			});
			return unsubscribe;
		}
	};

	useEffect(() => {
		if (user?.uid) {
			(async () => {
				await getDoc(doc(db, "users", user?.uid, "following", user?.uid)).then(
					(doc) => {
						if (doc.exists()) {
							setFollowingUIDs(doc.data().following);
						}
					}
				);

				await getDoc(doc(db, "users", user?.uid, "followers", user?.uid)).then(
					(doc) => {
						if (doc.exists()) {
							setFollowersUIDs(doc.data().followers);
						}
					}
				);
			})();
		}
	}, [user?.uid]);

	useEffect(() => {
		if (user?.uid) {
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
	}, [user?.uid, followersUIDs]);

	useEffect(() => {
		if (user?.uid) {
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
	}, [user?.uid, followingUIDs]);

	const fetchMoreFollowers = async () => {
		if (
			user?.uid &&
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
			user?.uid &&
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

	return (
		<div className='bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto md:space-y-6 justify-center pt-[50px]'>
			<div
				className='flex left-4 top-4 fixed items-center justify-center h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 z-50'
				onClick={() => router.back()}>
				<ArrowLeftIcon className='h-6 w-6' />
			</div>
			<div className='hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2 '>
				{/* <Menu follow={follow} following={following} followers={followers} /> */}
				<Menu
					following={following}
					followers={followers}
					profile={true}
					fetchFollowing={fetchMoreFollowing}
					fetchFollowers={fetchMoreFollowers}
					followingUIDs={followingUIDs}
					followersUIDs={followersUIDs}
					active={true}
					fromFavorites={true}
					page={"favorites"}
					modalFollowOpen={modalFollowOpen}
					setModalFollowOpen={setModalFollowOpen}
					modalFollowingOpen={modalFollowingOpen}
					setModalFollowingOpen={setModalFollowingOpen}
					modalFollowersOpen={modalFollowersOpen}
					setModalFollowersOpen={setModalFollowersOpen}
					followListRemove={followListRemove}
					setFollowListRemove={setFollowListRemove}
				/>
			</div>
			<div className='flex-grow border-l border-r border-gray-100 dark:border-gray-700 max-w-xl xl:w-[520px]  space-x-5  my-3 mx-3 md:mx-0'>
				<Feed posts={posts} inactive len={1} fetchMore={fetchMore} />
			</div>
			<div className='hidden  md:inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px]'>
				{/* <Widgets /> */}
				<Widgets
					// fetchUserMemes={fetchUserMemes}
					// userMemes={userMemes}
					fromProfile={false}
				/>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		user: state.data.currentUser,
	};
};

export default connect(mapStateToProps)(Favorites);
