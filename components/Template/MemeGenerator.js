/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";

import Trending from "./Trending";
import { AiOutlinePlus } from "react-icons/ai";

import { auth, db, storage } from "../../firebase";
import ChipInput from "material-ui-chip-input";

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

import Modal from "react-modal";

import { connect } from "react-redux";
import Progress from "../Components/Progress";

function MemeGenerator(props) {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [meme, setMeme] = useState(null);
	const [type, setType] = useState(null);
	const [user, setUser] = useState(null);
	const [name, setName] = useState("");
	const [tag, setTag] = useState([]);
	const [progressbar, setProgressbar] = useState(0);
	const { memes, setMyMemes } = props;
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			setUser(user);
		}
	}, []);

	return (
		<>
			<div className='col-span-4'>
				<div
					className='upload w-full  text-center cursor-pointer bg-white text-gray-700 dark:bg-slate-800 p-3 dark:text-gray-400 dark:hover:text-white hover:text-gray-900 transition duration-200 hover:scale-x-105 mx-auto rounded-2xl mb-14'
					onClick={() => setModalIsOpen(true)}
					style={{
						height: "fit-content",
						width: "fit-content",
						overflow: "hidden",
					}}>
					<p>
						<span className='mr-2'>
							<AiOutlinePlus className='inline' />
						</span>
						Upload Your Meme Template
					</p>
				</div>
			</div>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={() => setModalIsOpen(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: "1000",
					},
					content: {
						backgroundColor: "rgb(15 23 42)",
						border: "none",
						borderRadius: "20px",
						padding: "0",
					},
				}}
				shouldCloseOnEsc={true}
				className='w-[95%] sm:w-[60%] h-[60%] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 absolute'>
				<div className='w-full h-full rounded-2xl overflow-auto'>
					<div className='p-6 sm:p-10'>
						<div className='flex justify-between items-center flex-col-reverse sm:flex-row'>
							<h1 className='text-2xl font-bold dark:text-gray-400'>
								Upload Your Meme Template
							</h1>
							<button
								className='text-2xl font-bold dark:text-gray-400 self-end'
								onClick={() => setModalIsOpen(false)}>
								X
							</button>
						</div>
						<div className='mt-10'>
							<div className='flex justify-center items-center'>
								<div className='w-full sm:w-1/2'>
									<input
										type='file'
										id='file'
										className='hidden'
										onChange={(e) => {
											setMeme(e.target.files[0]);
											setType(e.target.files[0].type);
										}}
									/>
									<label
										htmlFor='file'
										className='w-full flex justify-center items-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-400 rounded-2xl p-3 cursor-pointer'>
										<p className='text-lg font-bold'>Choose a Image/Video</p>
									</label>
								</div>
							</div>
							{meme && (
								<div className='mt-10'>
									<div className='flex justify-center items-center'>
										<div className='w-full sm:w-1/2 flex justify-center items-center'>
											{type.includes("image") ? (
												<img
													src={URL.createObjectURL(meme)}
													alt='meme'
													className='w-52 h-52 object-cover rounded-2xl'
												/>
											) : (
												<video
													src={URL.createObjectURL(meme)}
													alt='meme'
													className='w-full h-56 object-cover rounded-2xl'
													controls
												/>
											)}
										</div>
									</div>
								</div>
							)}

							{meme && (
								<>
									<div className='mt-10'>
										<div className='flex justify-center items-center'>
											<div className='w-full sm:w-1/2'>
												<input
													type='text'
													placeholder='Enter a name for your meme template'
													className='w-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-400 rounded-2xl p-3'
													value={name}
													onChange={(e) => setName(e.target.value)}
													required
												/>
											</div>
										</div>
									</div>
									<div className='mt-10'>
										<div className='flex justify-center items-center'>
											<div className='w-full sm:w-1/2'>
												<ChipInput
													placeholder='Enter tags for your meme template'
													className='w-full bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-400 px-3 py-1 placeholder:text-gray-400 placeholder:dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50'
													value={tag}
													allowDuplicates={false}
													onAdd={(chip) => setTag([...tag, chip])}
													onDelete={(chip, index) => {
														const newTag = [...tag];
														newTag.splice(index, 1);
														setTag(newTag);
													}}
												/>
											</div>
										</div>
									</div>
								</>
							)}

							<div className='mt-10'>
								{loading && <Progress progress={progressbar} />}
							</div>

							<div className='flex justify-center items-center mt-10'>
								<div className='w-full sm:w-1/2'>
									<button
										onClick={async () => {
											setLoading(true);
											if (meme) {
												const storageRef = ref(
													storage,
													`memes/${user.uid}/${meme.name}`
												);
												const response = await fetch(URL.createObjectURL(meme));
												const blob = await response.blob();
												const uploadTask = uploadBytesResumable(
													storageRef,
													blob
												);
												uploadTask.on(
													"state_changed",
													(snapshot) => {
														const progress = Math.round(
															(snapshot.bytesTransferred /
																snapshot.totalBytes) *
																100
														);
														console.log(progress);
														setProgressbar(progress);
													},
													(error) => {
														console.log(error);
													}
												);
												uploadTask.then(async () => {
													const url = await getDownloadURL(storageRef);
													console.log(url);
													addDoc(collection(db, "memes"), {
														name: name || meme.name,
														memeURL: url,
														tags: tag,
														user: {
															uid: user.uid,
															name: user?.name,
															photoURL: user.photoURL,
															userName: user?.userName || "",
														},
														timestamp: serverTimestamp(),
														type: type.includes("image") ? "image" : "video",
														verified: false,
														downloaded: 0,
														isChecked: false,
													}).then((ref) => {
														console.log("Added document with ID: ", ref.id);
														addDoc(
															collection(db, "memes", user.uid, "userMemes"),
															{
																memeURL: url,
																name: name ? name : meme.name,
																timestamp: serverTimestamp(),
																tags: tag ? tag : [],
																type: type.includes("image")
																	? "image"
																	: "video",
																memeId: ref.id,
																verified: false,
															}
														).then(() => {
															getDoc(doc(db, "memes", ref.id)).then((doc) => {
																if (doc.exists()) {
																	console.log("Document data:", doc.data());
																	setMyMemes((prev) => [
																		...prev,
																		{ ...doc.data(), id: doc.id },
																	]);
																} else {
																	// doc.data() will be undefined in this case
																	console.log("No such document!");
																}
															});
															setProgressbar(0);
															setModalIsOpen(false);
															setMeme(null);
															setType("");
															setName("");
															setTag([]);
															setLoading(false);
														});
													});
												});
											}
										}}
										disabled={loading || !meme}
										className={`${(loading || !meme) &&
											"disabled"} w-full flex justify-center items-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-400 rounded-2xl p-3 cursor-pointer`}>
										<p className='text-lg font-bold'>Upload</p>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		user: state.data.currentUser,
	};
};

export default connect(mapStateToProps)(MemeGenerator);
