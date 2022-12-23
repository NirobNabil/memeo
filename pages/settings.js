/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";

import { useSelector } from "react-redux";

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

import { db, auth, storage } from "../firebase";

import Trending from "../components/Template/Trending";

import {
	onPasswordReset,
	onEmailUpdate,
	onPasswordUpdate,
	onUserDelete,
	onUserUpdate,
	onUserUpdateEmail,
	onUserUpdatePassword,
	onUserUpdateProfile,
	onUserUpdateUsername,
	onUserUpdatePhotoURL,
	onUserUpdateEmailVerified,
	onUserUpdatePhoneNumber,
	signInAnonymously,
	signInWithCustomToken,
	signInWithEmailAndPassword,
	signInWithEmailLink,
	signInWithPopup,
	signInWithRedirect,
	signInWithPhoneNumber,
	updatePassword,
	deleteUser,
	updateEmail,
	signOut,
} from "firebase/auth";

import moment from "moment";

import { Modal } from "@mui/material";
import { ToastError } from "../components/Components/Toast";
import { ToastSuccess } from "../components/Components/Toast";

import { useRouter } from "next/router";

import { ArrowBack } from "@mui/icons-material";
import {
	deleteObject,
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
	getApps,
} from "firebase/storage";

export default function Settings() {
	const user = useSelector((state) => state.data.currentUser);
	const [trashs, setTrashs] = useState([]);
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [trash, setTrash] = useState([]);

	const [open, setOpen] = useState(false);
	const [open2, setOpen2] = useState(false);

	const [toastShow, setToastShow] = useState(false);
	const [toastShow2, setToastShow2] = useState(false);

	const [toastMessage, setToastMessage] = useState("");
	const [toastMessage2, setToastMessage2] = useState("");

	const [showPassword, setShowPassword] = useState(false);

	const router = useRouter();

	useEffect(() => {
		if (user) {
			const q = query(
				collection(db, "memes", user.uid, "Trash"),
				orderBy("deletedAt", "desc")
			);
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const trashs = [];
				querySnapshot.forEach((doc) => {
					trashs.push({ id: doc.id, ...doc.data() });
				});
				setTrashs(trashs);
			});
			return unsubscribe;
		}
	}, [user]);

	return (
		<>
			<div className='fixed top-0 left-0 z-5  p-2'>
				<button
					onClick={() => router.back()}
					className='p-2  rounded-full shadow-md  focus:outline-none  dark:hover:bg-transparent dark:hover:text-gray-100 hover:bg-gray-100 hover:text-gray-900 bg-gray-100 text-gray-900 dark:bg-transparent dark:text-gray-100 z-40'>
					<ArrowBack />
				</button>
			</div>
			<div className='bg-white dark:bg-slate-800 pt-16 px-5 sm:px-0'>
				<div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						Settings
					</h1>
				</div>
				<div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
					<div className='bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-slate-700'>
						<div className='px-4 py-5 sm:px-6'>
							<h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
								Profile
							</h3>
							<p className='mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400'>
								This information will be displayed publicly so be careful what
								you share.
							</p>
						</div>
						<div className='px-4 py-5 sm:p-0'>
							<dl className='sm:divide-y sm:divide-gray-200 dark:divide-slate-700'>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Username
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										{user?.userName}
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Email address
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										{user?.email}
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Photo
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<img
											src={user?.photoURL}
											alt='user'
											className='w-10 h-10 rounded-full'
										/>
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
				<div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
					<div className='bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-slate-700'>
						<div className='px-4 py-5 sm:px-6'>
							<h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
								Account
							</h3>
							<p className='mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400'>
								Manage how information about you is displayed on this site.
							</p>
						</div>
						<div className='px-4 py-5 sm:p-0'>
							<dl className='sm:divide-y sm:divide-gray-200 dark:divide-slate-700'>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Language
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										English
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Time Zone
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										{Intl.DateTimeFormat().resolvedOptions().timeZone}
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Auto updates
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										On
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>

				<div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
					<div className='bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-slate-700'>
						<div className='px-4 py-5 sm:px-6'>
							<h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
								Update Password
							</h3>
							<p className='mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400'>
								Update your password.
							</p>
						</div>
						<div className='px-4 py-5 sm:p-0'>
							<dl className='sm:divide-y sm:divide-gray-200 dark:divide-slate-700'>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Password
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<input
											type={showPassword ? "text" : "password"}
											className='w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-slate-700 p-2'
											placeholder='Enter your password'
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										New Password
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<input
											type={showPassword ? "text" : "password"}
											className='w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-slate-700 p-2'
											placeholder='Enter your new password'
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
										/>
										<span className='text-xs text-gray-500 dark:text-gray-400'>
											Password must be at least 6 characters
										</span>
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Confirm Password
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<input
											type={showPassword ? "text" : "password"}
											className='w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-slate-700 p-2'
											placeholder='Confirm your new password'
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
										/>
										<span className='text-xs text-gray-500 dark:text-gray-400'>
											Password must be at least 6 characters
										</span>
									</dd>
								</div>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'></dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<input
											type='checkbox'
											value={showPassword}
											onChange={(e) => setShowPassword(e.target.checked)}
											className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
										/>
										<span className='text-xs text-gray-500 dark:text-gray-400 ml-2 '>
											Show password
										</span>
									</dd>
								</div>

								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400' />
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<button
											type='button'
											className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
											onClick={async () => {
												alert("Are you sure you want to update your password?");

												if (newPassword !== confirmPassword) {
													setToastMessage2("Passwords do not match");
													setToastShow2(true);
													setTimeout(() => {
														setToastMessage2("");
														setToastShow2(false);
													}, 3000);
												} else {
													//check old password is correct and update password and sent a link to email to verify firebase
													await signInWithEmailAndPassword(
														auth,
														user.email,
														password
													)
														.then(async (userCredential) => {
															// Signed in
															const user = userCredential.user;
															await updatePassword(user, newPassword)
																.then(() => {
																	// Update successful
																	setToastMessage(
																		"Password updated successfully"
																	);
																	setToastShow(true);
																	setTimeout(() => {
																		setToastMessage("");
																		setToastShow(false);
																	}, 3000);
																})
																.catch((error) => {
																	// An error occurred
																	setToastMessage2(error.message);
																	setToastShow2(true);
																	setTimeout(() => {
																		setToastMessage2("");
																		setToastShow2(false);
																	}, 3000);
																});
														})
														.catch((error) => {
															const errorCode = error.code;
															const errorMessage = error.message;
															setToastMessage2(errorMessage);
															setToastShow2(true);
															setTimeout(() => {
																setToastMessage2("");
																setToastShow2(false);
															}, 3000);
														});
												}
											}}>
											Update Password
										</button>
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>

				<div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
					<div className='bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-slate-700'>
						<div className='px-4 py-5 sm:px-6'>
							<h3 className='text-lg leading-6 font-medium text-gray-900 dark:text-white'>
								Danger Zone
							</h3>
							<p className='mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400'>
								Manage how information about you is displayed on this site.
							</p>
						</div>
						<div className='px-4 py-5 sm:p-0'>
							<dl className='sm:divide-y sm:divide-gray-200 dark:divide-slate-700'>
								<div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4  px-4'>
									<dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Delete Account
									</dt>
									<dd className='mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2'>
										<button
											onClick={() => {
												setOpen2(true);
											}}
											className='text-red-600 hover:text-red-900'>
											Delete Account
										</button>
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>

				<div className='mx-10 my-10 rounded-lg shadow-lg p-10'>
					<h1 className='text-2xl font-bold'>
						Trash Template ({trashs.length})
					</h1>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{trashs?.map((trash) => (
							<div
								key={trash.id}
								className='bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4'>
								{trash?.type === "image" ? (
									<img
										src={trash.memeURL}
										alt={trash.name}
										className='w-full h-64 object-cover rounded-lg'
									/>
								) : (
									<video
										src={trash.memeURL}
										className='w-full h-64 object-cover rounded-lg'
										controls
									/>
								)}
								<div className='flex justify-between items-center mt-4 flex-wrap gap-5'>
									<h1 className='text-xl font-bold basis-[40%] text-ellipsis overflow-hidden whitespace-nowrap'>
										{trash.name}
									</h1>
									<p className='text-red-500 font-bold basis-[40%] sm:basis-auto'>
										{" "}
										{moment(trash.deletedAt.toDate()).fromNow()}
									</p>
									<button
										className='text-red-500 font-bold basis-[40%] sm:basis-auto'
										onClick={() => {
											getDoc(
												doc(db, "memes", user?.uid, "Trash", trash.id)
											).then((Doc) => {
												if (Doc.exists()) {
													deleteObject(ref(storage, Doc.data().memeURL)).then(
														() => {
															deleteDoc(
																doc(db, "memes", user?.uid, "Trash", trash.id)
															).then(() => {
																setToastMessage("Meme deleted successfully");
																setToastShow(true);
																setTimeout(() => {
																	setToastMessage("");
																	setToastShow(false);
																}, 3000);
															});
														}
													);
												} else {
													setToastMessage2("Meme does not exist");
													setToastShow2(true);
													setTimeout(() => {
														setToastMessage2("");
														setToastShow2(false);
													}, 3000);
												}
											});
										}}>
										Delete
									</button>
									<button
										className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:shadow-sm-light transition-colors duration-200 ease-in-out basis-[40%] sm:basis-auto'
										onClick={() => {
											setOpen(true);
											setTrash(trash);
										}}>
										Restore
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<Modal
				open={open}
				onClose={() => {
					setOpen(false);
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<div className='bg-white dark:bg-slate-800 rounded-lg shadow-lg p-10'>
					<h1 className='text-2xl font-bold'>
						Are you sure you want to restore this template?
					</h1>

					<div className='flex justify-end items-center mt-4'>
						<button
							onClick={() => {
								setOpen(false);
							}}
							className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:shadow-sm-light transition-colors duration-200 ease-in-out'>
							Cancel
						</button>
						<button
							onClick={async () => {
								if (trash) {
									const memeRef = await addDoc(collection(db, "memes"), {
										downloaded: 0,
										name: trash.name,
										memeURL: trash.memeURL,
										timestamp: serverTimestamp(),
										user: trash.user,
										tags: trash.tags,
										type: trash.type,
										verified: false,
										isChecked: false,
									});
									await addDoc(collection(db, "memes", user.uid, "userMemes"), {
										downloaded: 0,
										name: trash.name,
										memeURL: trash.memeURL,
										timestamp: serverTimestamp(),
										tags: trash.tags,
										type: trash.type,
										verified: false,
										isChecked: false,
										memeId: memeRef.id,
									});
									await deleteDoc(
										doc(db, "memes", user.uid, "Trash", trash.id)
									);
									setToastMessage("Template restored successfully");
									setToastShow(true);
									setTimeout(() => {
										setToastMessage("");
										setToastShow(false);
									}, 3000);
									setOpen(false);
								}
							}}
							className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 space-x-2 mx-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 dark:shadow-sm-light transition-colors duration-200 ease-in-out'>
							Yes
						</button>
					</div>
				</div>
			</Modal>

			<Modal
				open={open2}
				onClose={() => {
					setOpen2(false);
					setPassword("");
				}}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<div className='bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
					<div className='sm:flex sm:items-start'>
						<div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
							<h3
								className='text-lg leading-6 font-medium text-gray-900 dark:text-white'
								id='modal-modal-title'>
								Delete Account
							</h3>
							<div className='mt-2'>
								<p
									className='text-sm text-gray-500 dark:text-gray-400'
									id='modal-modal-description'>
									Are you sure you want to delete your account? All of your data
									will be permanently removed. This action cannot be undone.
								</p>
							</div>
						</div>
					</div>
					<input
						type='password'
						name='deleteAccount'
						id='deleteAccount'
						className='w-full border mt-3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 dark:bg-slate-700 p-2'
						placeholder='Enter your password to confirm'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<div className='bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4 justify-center items-center rounded-b-lg'>
						<button
							onClick={async () => {
								await signInWithEmailAndPassword(auth, user.email, password)
									.then(async () => {
										await deleteUser(auth.currentUser).then(() => {
											router.push("/");
										});
									})
									.catch((error) => {
										setToastMessage2(error.message);
										setToastShow2(true);
										setPassword("");
									});
							}}
							type='button'
							className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setOpen2(false);
								setPassword("");
							}}
							type='button'
							className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:border-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700'>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
			{toastShow && (
				<div className='fixed bottom-0 right-0 m-8'>
					<ToastSuccess text={toastMessage} />
				</div>
			)}

			{toastShow2 && (
				<div className='fixed bottom-0 right-0 m-8'>
					<ToastError text={toastMessage2} />
				</div>
			)}
		</>
	);
}
