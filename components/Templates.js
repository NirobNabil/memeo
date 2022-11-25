import React, { useState, useEffect, useCallback } from "react";
import TemplateMenu1 from "./Template/TemplateMenu1";
import { AiOutlinePlus } from "react-icons/ai";
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
		if (user) {
			// get memes templates on maximum number of downloads
			if (activeTab === "memes" && memes.length === 0) {
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
			} else if (activeTab === "popular" && popularMemes.length === 0) {
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
			} else if (activeTab === "image-memes" && imageMemes.length === 0) {
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
			} else if (activeTab === "video-memes" && videoMemes.length === 0) {
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
			} else if (activeTab === "meme-generator" && myMemes.length === 0) {
				// get user's memes templates
				setLoading(true);
				getDocs(
					query(collection(db, "memes", user.uid, "userMemes")),
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
	}, [user, activeTab]);

	useEffect(() => {
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
		if (user && search.length >= 0) {
			if (activeTab === "memes") {
				setLoading(true);
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("name", ">=", search),
					orderBy("name"),
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
						where("name", ">=", search),
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
						where("name", ">=", search),
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
						where("name", ">=", search),
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
						where("name", ">=", search),
						orderBy("name"),
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
		if (user && search.length === 0 && searchTags.length === 0) {
			if (activeTab === "memes") {
				if (!memes.length) return;
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
				setLoading(true);
				const lastMeme = memes[memes.length - 1];
				const memesRef = collection(db, "memes");
				const memesQuery = query(
					memesRef,
					where("name", ">=", search),
					orderBy("name"),
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
				setLoading(true);
				const lastMeme = popularMemes[popularMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("name", ">=", search),
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
				setLoading(true);
				const lastMeme = imageMemes[imageMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "image"),
						where("name", ">=", search),
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
				setLoading(true);
				const lastMeme = videoMemes[videoMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes"),
						where("type", "==", "video"),
						where("name", ">=", search),
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
				setLoading(true);
				const lastMeme = myMemes[myMemes.length - 1];
				getDocs(
					query(
						collection(db, "memes", user.uid, "userMemes"),
						where("name", ">=", search),
						orderBy("name"),
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
		<div className='w-[80%] mx-auto pb-14 px-10'>
			<div style={{ display: "grid" }} className='grid-cols-3 gap-14'>
				{/* left side  */}
				<div className='flex flex-col gap-10'>
					{/* menu  */}
					<TemplateMenu1
						setActiveTab={setActiveTab}
						search={search}
						setSearch={setSearch}
						searchTags={searchTags}
						setSearchTags={setSearchTags}
					/>

					{/* earning */}
					<div className='bg-white dark:bg-slate-800 rounded-2xl'>
						<div className='px-10 py-5 mt-2'>
							<div className='flex justify-between items-center'>
								<div className='item-inner'>
									<div className='item-title'>Total Earning: </div>
								</div>
								<div className='item-media'>$ 0.00</div>
							</div>
						</div>
					</div>
				</div>
				{/* template container  */}
				<div className='col-span-2'>
					{activeTab === "meme-generator" && (
						<MemeGenerator memes={myMemes} setMyMemes={setMyMemes} />
					)}

					{
						<TemplateItem
							memes={templates}
							fetchMoreMemes={fetchMoreMemes}
							loading={loading}
							from={activeTab}
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
