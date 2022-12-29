import React, { useState, useEffect, useCallback } from "react";
import TemplateMenu1 from "./Template/TemplateMenu1";

import { useRouter } from "next/router";

import Trending from "./Template/Trending";
import MemeGenerator from "./Template/MemeGenerator";
import InfiniteScroll from "react-infinite-scroll-component";

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
	getDownloadURL,
	ref,
	uploadBytes,
	getStorage,
	uploadBytesResumable,
} from "@firebase/storage";
import { auth, db, storage } from "../firebase";

import { connect } from "react-redux";
import TemplateItem from "./TemplateItem";

function Templates(props) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("memes");
	const [memes, setMemes] = useState([]);
	const [popularMemes, setPopularMemes] = useState([]);
	const [imageMemes, setImageMemes] = useState([]);
	const [videoMemes, setVideoMemes] = useState([]);
	const [myMemes, setMyMemes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [templates, setTemplates] = useState([]);

	const [search, setSearch] = useState("");
	const [searchTags, setSearchTags] = useState([]);

	const [user, setUser] = useState(null);

	useEffect(() => {
		setUser(props.user);
	}, [props.user]);

	useEffect(() => {
		if(!user?.uid) return;
		if (user?.uid && searchTags.length === 0 && search === "") {
			// get memes templates on maximum number of downloads
			if (activeTab === "memes") {
				setLoading(true);
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					orderBy("timestamp", "desc"),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes(memes);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				// get user's memes templates
				setLoading(true);
				getDocs(
					query(collection(db, "memes", user?.uid, "userMemes")),
					orderBy("timestamp", "desc"),
					limit(25)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes(data);
				});
				setLoading(false);
			}
		}
	}, [user, activeTab, search, searchTags]);

	useEffect(() => {
		if(!user?.uid) return;
		if (user && searchTags.length > 0) {
			// get memes templates on maximum number of downloads
			if (activeTab === "memes") {
				setLoading(true);
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("tags", "array-contains-any", searchTags),
					orderBy("timestamp", "desc"),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes(memes);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes(data);
					console.log(data, "video memes");
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				// get user's memes templates
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						where("tags", "array-contains-any", searchTags),
						orderBy("timestamp", "desc")
					),
					limit(25)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes(data);
				});
				setLoading(false);
			}
		}
	}, [searchTags]);

	useEffect(() => {
		if(!user?.uid) return;
		if (user && search.length >= 0) {
			if (activeTab === "memes") {
				setLoading(true);
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("name", ">=", search.toUpperCase()),
					where("name", "<=", search.toLowerCase() + "\uf8ff"),
					orderBy("name", "asc"),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes(memes);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes(data);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes(data);
					console.log(data, "video memes");
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				// get user's memes templates
				setLoading(true);
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes(data);
				});
				setLoading(false);
			}
		}
	}, [search, activeTab, user]);

	const fetchMoreMemes = () => {
		if(!user?.uid) return;
		if (user && search.length === 0 && searchTags.length === 0) {
			if (activeTab === "memes") {
				if (!memes.length) return;
				if (memes.length < 25 || memes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = memes[memes.length - 1];
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					orderBy("timestamp", "desc"),
					startAfter(lastMeme.timestamp),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes((prevMemes) => [...prevMemes, ...memes]);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				if (!popularMemes.length) return;
				if (popularMemes.length < 25 || popularMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = popularMemes[popularMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				if (!imageMemes.length) return;
				if (imageMemes.length < 25 || imageMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = imageMemes[imageMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				if (!videoMemes.length) return;
				if (videoMemes.length < 25 || videoMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = videoMemes[videoMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				if (!myMemes.length) return;
				if (myMemes.length < 25 || myMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = myMemes[myMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						orderBy("timestamp", "desc"),
						startAfter(lastMeme.timestamp),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			}
		} else if (search.length > 0) {
			if (activeTab === "memes") {
				if (!memes.length) return;
				if (memes.length < 25 || memes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = memes[memes.length - 1];
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("name", ">=", search.toUpperCase()),
					where("name", "<=", search.toLowerCase() + "\uf8ff"),
					orderBy("name", "asc"),
					startAfter(lastMeme.name),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes((prevMemes) => [...prevMemes, ...memes]);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				if (!popularMemes.length) return;
				if (popularMemes.length < 25 || popularMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = popularMemes[popularMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						startAfter(lastMeme.name),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				if (!imageMemes.length) return;
				if (imageMemes.length < 25 || imageMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = imageMemes[imageMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						startAfter(lastMeme.name),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				if (!videoMemes.length) return;
				if (videoMemes.length < 25 || videoMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = videoMemes[videoMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						startAfter(lastMeme.name),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				if (!myMemes.length) return;
				if (myMemes.length < 25 || myMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = myMemes[myMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						where("name", ">=", search.toUpperCase()),
						where("name", "<=", search.toLowerCase() + "\uf8ff"),
						orderBy("name", "asc"),
						startAfter(lastMeme.name),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			}
		} else {
			if (searchTags.length) return;

			if (activeTab === "memes") {
				if (!memes.length) return;
				if (memes.length < 25 || memes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = memes[memes.length - 1];
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("tags", "array-contains-any", searchTags),
					orderBy("timestamp", "desc"),
					startAfter(lastMeme.timestamp),
					limit(25)
				);
				onSnapshot(memesQuery, (querySnapshot) => {
					const memes = [];
					querySnapshot.forEach((doc) => {
						memes.push({ ...doc.data(), id: doc.id });
					});
					setMemes((prevMemes) => [...prevMemes, ...memes]);
					setLoading(false);
				});
			} else if (activeTab === "popular") {
				if (!popularMemes.length) return;
				if (popularMemes.length < 25 || popularMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = popularMemes[popularMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setPopularMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "image-memes") {
				if (!imageMemes.length) return;
				if (imageMemes.length < 25 || imageMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = imageMemes[imageMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setImageMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "video-memes") {
				if (!videoMemes.length) return;
				if (videoMemes.length < 25 || videoMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = videoMemes[videoMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						where("tags", "array-contains-any", searchTags),
						orderBy("downloaded", "desc"),
						startAfter(lastMeme.downloaded),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setVideoMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			} else if (activeTab === "meme-generator") {
				if (!myMemes.length) return;
				if (myMemes.length < 25 || myMemes.length % 25 !== 0) return;
				setLoading(true);
				const lastMeme = myMemes[myMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						where("tags", "array-contains-any", searchTags),
						orderBy("timestamp", "desc"),
						startAfter(lastMeme.timestamp),
						limit(25)
					)
				).then((querySnapshot) => {
					const data = querySnapshot.docs.map((doc) => {
						return { ...doc.data(), id: doc.id };
					});
					setMyMemes((prevMemes) => [...prevMemes, ...data]);
					setLoading(false);
				});
			}
		}
	};

	useEffect(() => {
		if (activeTab === "memes") {
			setTemplates(memes);
		} else if (activeTab === "popular") {
			setTemplates(popularMemes);
		} else if (activeTab === "image-memes") {
			setTemplates(imageMemes);
		} else if (activeTab === "video-memes") {
			setTemplates(videoMemes);
		} else if (activeTab === "meme-generator") {
			setTemplates(myMemes);
		}
	}, [activeTab, memes, popularMemes, imageMemes, videoMemes, myMemes]);

	return (
		<div className='w-[90%] sm:w-[80%] mx-auto pb-20 sm:pb-14 sm:px-10'>
			<div style={{ display: "grid" }} className='grid-cols-3 gap-8 sm:gap-14'>
				{/* left side  */}
				<div className='flex flex-col gap-10 col-span-3 sm:col-span-1'>
					{/* menu  */}
					<TemplateMenu1
						setActiveTab={setActiveTab}
						search={search}
						setSearch={setSearch}
						searchTags={searchTags}
						setSearchTags={setSearchTags}
					/>

					{/* earning */}
					<div className='bg-white dark:bg-slate-800 rounded-2xl relative overflow-hidden sm:block hidden'>
						<div className='px-10 py-5 mt-2'>
							<div className='flex justify-between items-center'>
								<div className='item-inner'>
									<div className='item-title'>Total Earning: </div>
								</div>
								<div className='item-media'>$ 0.00</div>
							</div>
						</div>
						<div className='absolute w-full h-full left-0 top-0 bg-black/70'>
							<div className='flex justify-center items-center h-full'>
								<p className='text-white font-semibold'>Coming Soon...</p>
							</div>
						</div>
					</div>
				</div>

				{/* template container  */}
				<div className='col-span-3 sm:col-span-2'>
					{activeTab === "meme-generator" && (
						<MemeGenerator memes={myMemes} setMyMemes={setMyMemes} />
					)}

					{
						<TemplateItem
							memes={templates}
							fetchMoreMemes={fetchMoreMemes}
							loading={loading}
							from={activeTab}
							setMyMemes={setMyMemes}
							activeTab={activeTab}
						/>
					}
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		user: state.data.currentUser,
	};
};

export default connect(mapStateToProps)(Templates);
