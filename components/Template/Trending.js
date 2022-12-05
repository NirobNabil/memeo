/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import { BsDownload } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { FcApproval, FcDisapprove } from "react-icons/fc";
import { MdDeleteOutline } from "react-icons/md";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import { useTheme } from "next-themes";

import { db, auth, storage } from "../../firebase";
import Modal from "react-modal";

import {
	collection,
	addDoc,
	doc,
	setDoc,
	getFirestore,
	arrayUnion,
	getDoc,
	query,
	where,
	getDocs,
	updateDoc,
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
	getDocFromCache,
} from "firebase/firestore";

import {
	ref,
	getDownloadURL,
	uploadBytesResumable,
	getStorage,
	uploadBytes,
} from "firebase/storage";

import { useSelector } from "react-redux";
import GridList from "@material-ui/core/GridList";
import { ImageList } from "@material-ui/core";
import ImageListItem from "@material-ui/core/ImageListItem";
import ImageListItemBar from "@material-ui/core/ImageListItemBar";

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
import { useRouter } from "next/router";

const Trending = ({ data, owner, setMyMemes }) => {
	const [openDownloadMOdal, setOpenDownloadModal] = useState(false);
	const [downloadUrl, setDownloadUrl] = useState("");
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openApproveDeleteModal, setOpenApproveDeleteModal] = useState(false);
	const [openAdModal, setOpenAdModal] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [error, setError] = useState(null);
	const [open, setOpen] = useState(false);

	const user = useSelector((state) => state.data.currentUser);
	const router = useRouter();

	const { theme } = useTheme();
	const [chiplen, setChipLen] = useState(3);

	useEffect(() => {
		if (window.innerWidth < 768) {
			setChipLen(2);
		}
	}, []);

	const handleDownload = async () => {
		getDoc(doc(db, "memes", data.id)).then((Doc) => {
			if (Doc.exists()) {
				updateDoc(doc(db, "memes", data.id), {
					downloaded: increment(1),
				});
			}
		});
		const storageRef = ref(storage, data.memeURL);
		const downloadUrl = await getDownloadURL(storageRef);
		// console.log(downloadUrl, 'downloadUrl');
		const a = document.createElement("a");
		a.href = downloadUrl;
		a.target = "_blank";
		a.download = data.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleOpen = () => {
		setSelectedFile(data);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const deleteTemplate = async () => {
		setDeleteLoading(true);
		getDoc(doc(db, "memes", data.memeId)).then((Doc) => {
			if (Doc.exists()) {
				addDoc(collection(db, "memes", user.uid, "Trash"), {
					...Doc.data(),
					deletedAt: serverTimestamp(),
				}).then(() => {
					deleteDoc(doc(db, "memes", data.memeId)).then(() => {
						deleteDoc(doc(db, "memes", user.uid, "userMemes", data.id)).then(
							() => {
								setMyMemes((prev) => {
									return prev.filter((item) => item.id !== data.id);
								});
								setDeleteLoading(false);
								setOpenApproveDeleteModal(false);
							}
						);
					});
				});
			}
		});
	};

	return (
		<>
			<div className='flex flex-col'>
				<div className='bg-white dark:bg-slate-800 h-[250px] shadow-md rounded-lg overflow-hidden relative group transition-all duration-300'>
					{data?.type === "image" ? (
						<Image
							src={data.memeURL}
							alt={data.name}
							layout='fill'
							objectFit='cover'
							className='rounded-lg'
							onClick={handleOpen}
						/>
					) : (
						<video
							src={data.memeURL}
							alt={data.name}
							layout='fill'
							className='rounded-lg h-full w-full'
							autoPlay
							loop
							muted
							security='restricted'
							style={{ objectFit: "cover" }}
							onClick={handleOpen}
						/>
					)}

					<p className='text-white text-sm text-center absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap py-[28px] bg-gradient-to-t from-black/70 to-black/30'>
						<span className='absolute w-10/12 mx-auto bottom-0 left-1/2 -translate-x-1/2 overflow-hidden leading-[56px]'>
							{data.name}
						</span>
					</p>

					<div className='template-upper-btns absolute left-0 top-0 w-full bg-transparent py-3 px-5 transition-all duration-300'>
						<div className='w-full flex justify-between'>
							<div className='varified_badge cursor-pointer'>
								{!data?.user?.uid && !data?.verified ? (
									<FcApproval className='text-2xl' />
								) : // <FcDisapprove className='text-2xl' />
								null}
							</div>
							{/* <div className='delete_icon cursor-pointer'>
							<MdDeleteOutline className='text-2xl' />
						</div> */}
						</div>
					</div>

					{/* template-buttons lower */}
					{owner ? (
						<div className='template-buttons absolute left-0 -bottom-full group-hover:bottom-0 w-full bg-gray-200  cursor-pointer dark:bg-gray-500 py-4 px-5 transition-all duration-300'>
							<div className='flex justify-end'>
								<MdDeleteOutline
									className='text-2xl'
									onClick={() => setOpenDeleteModal(true)}
								/>
							</div>
						</div>
					) : (
						<div className='template-buttons absolute left-0 -bottom-full group-hover:bottom-0 w-full bg-gray-200   dark:bg-gray-500 py-3 px-5 transition-all duration-300'>
							{/* download icon  */}
							<div className='flex justify-between items-center'>
								<div
									className='flex'
									onClick={() => router.push(`Profile?uid=${data?.user?.uid}`)}>
									<img
										src={data?.user?.photoURL}
										alt='user'
										className='h-8 w-8 rounded-full object-cover'
									/>
									<div className='flex flex-col ml-2 cursor-pointer text-sm hover:underline'>
										<p className='text-sm font-semibold'>{data?.user?.name}</p>
										<p className='text-[11px] font-bold text-gray-700 dark:text-gray-200 overflow-hidden whitespace-nowrap'>
											@{data?.user?.userName}
										</p>
									</div>
								</div>
								<div className='flex cursor-pointer'>
									<BsDownload
										className='text-2xl'
										onClick={() => setOpenDownloadModal(true)}
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className='flex justify-between items-center mt-2'>
					<Stack direction='column' spacing={1}>
						<Stack direction='row' spacing={1} flexWrap='wrap'>
							{data?.tags?.slice(0, chiplen).map((tag, index) => (
								<Chip
									key={index}
									label={tag}
									style={
										theme === "dark"
											? {
													color: "#fff",
													backgroundColor: "#1f2937",
													margin: "0 5px 5px 0",
											  }
											: {
													color: "#000",
													backgroundColor: "#fff",
													margin: "0 5px 5px 0",
											  }
									}
								/>
							))}
							{data?.tags?.length > chiplen && (
								<Chip
									label={`+${data?.tags?.length - chiplen}`}
									style={
										theme === "dark"
											? {
													color: "#fff",
													backgroundColor: "#1f2937",
													margin: "0 5px 5px 0",
											  }
											: {
													color: "#000",
													backgroundColor: "#fff",
													margin: "0 5px 5px 0",
											  }
									}
									onClick={() => setChipLen(data?.tags?.length)}
								/>
							)}
							{data?.tags?.length === 0 && (
								<Chip
									label='No tags'
									style={
										theme === "dark"
											? {
													color: "#fff",
													backgroundColor: "#1f2937",
													margin: "0 5px 5px 0",
											  }
											: {
													color: "#000",
													backgroundColor: "#fff",
													margin: "0 5px 5px 0",
											  }
									}
								/>
							)}
							{data?.tags?.length === chiplen && (
								<Chip
									label='Hide'
									variant='outlined'
									style={
										theme === "dark"
											? {
													color: "#fff",
													backgroundColor: "#",
													margin: "0 5px 5px 0",
											  }
											: {
													color: "#000",
													backgroundColor: "#fff",
													margin: "0 5px 5px 0",
											  }
									}
									onClick={() => setChipLen(3)}
								/>
							)}
						</Stack>
					</Stack>
				</div>

				<div
					className={`download-modal fixed w-full h-full z-10 bg-transparent top-0 left-0 ${
						openDownloadMOdal ? "block" : "hidden"
					}`}>
					<div className='flex flex-col h-full justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full w-[400px] z-20'>
						<div
							className='cross-icon w-full flex justify-end p-3 text-2xl cursor-pointer'
							onClick={() => setOpenDownloadModal(false)}>
							<FaTimes />
						</div>
						<div
							className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-400 px-5 py-5 shadow rounded-2xl border border-[#ff4522] w-full`}
							id='download_modal'>
							<p className='text-center cursor-pointer'>
								Watch Ad for download{" "}
								<BsDownload
									className='text-2xl ml-2 inline font-medium'
									onClick={() => {
										setOpenDownloadModal(false);
										// setOpenAdModal(true);
										handleDownload();
									}}
								/>
							</p>
						</div>
					</div>
				</div>
			</div>

			<Modal
				isOpen={openDeleteModal}
				onRequestClose={() => setOpenDeleteModal(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0,0,0,0.5)",
						zIndex: 1000,
					},
					content: {
						backgroundColor: "transparent",
						border: "none",
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						width: "400px",
						height: "200px",
						zIndex: 1000,
					},
				}}>
				<div className='flex flex-col h-full justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full w-[400px] z-20'>
					<div
						className='cross-icon w-full flex justify-end p-3 text-2xl cursor-pointer'
						onClick={() => setOpenDeleteModal(false)}>
						<FaTimes />
					</div>
					<div
						className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-400 px-5 py-5 shadow rounded-2xl border border-[#ff4522] w-full`}
						id='download_modal'>
						<p className='text-center cursor-pointer'>
							Are you sure you want to delete this template?
						</p>
						<div className='flex justify-center mt-5'>
							<button
								className='bg-[#ff4522] text-white px-5 py-2 rounded-md mr-3'
								onClick={() => {
									setOpenApproveDeleteModal(true);
									setOpenDeleteModal(false);
								}}>
								Yes
							</button>
							<button
								className='bg-[#ff4522] text-white px-5 py-2 rounded-md'
								onClick={() => setOpenDeleteModal(false)}>
								No
							</button>
						</div>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={openApproveDeleteModal}
				onRequestClose={() => setOpenApproveDeleteModal(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0,0,0,0.5)",
						zIndex: 1000,
					},
					content: {
						backgroundColor: "transparent",
						border: "none",
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						width: "400px",
						height: "200px",
						zIndex: 1000,
					},
				}}>
				<div className='flex flex-col h-full justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full w-[400px] z-20'>
					<div
						className='cross-icon w-full flex justify-end p-3 text-2xl cursor-pointer'
						onClick={() => setOpenApproveDeleteModal(false)}>
						<FaTimes />
					</div>
					<div
						className={`bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-400 px-5 py-5 shadow rounded-2xl border border-[#ff4522] w-full`}
						id='download_modal'>
						<p className='text-center cursor-pointer'>
							After this action, this temlate falls in the trash and after 30
							days it will be deleted permanently.
						</p>
						<div className='flex justify-center mt-5'>
							<button
								className='bg-[#ff4522] text-white px-5 py-2 rounded-md mr-3'
								disabled={deleteLoading}
								onClick={() => {
									deleteTemplate();
								}}>
								Ok
							</button>
						</div>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={openAdModal}
				onRequestClose={() => setOpenAdModal(false)}
				style={{
					overlay: {
						backgroundColor: "rgba(0,0,0,0.5)",
						zIndex: 1000,
					},
					content: {
						backgroundColor: "transparent",
						border: "none",
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
						width: "800px",
						height: "600px",
						zIndex: 1000,
					},
				}}>
				{/* play a 30 s videos */}
				<div className='flex flex-col h-full justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full w-[800px] z-20'>
					<video
						src={data?.memeURL}
						autoPlay
						// controls
						style={{
							width: "100%",
							height: "100%",
						}}
					/>
					<button
						className='bg-transparent absolute bottom-0 left-0 right-0 mx-auto mb-5 text-white text-2xl'
						onClick={() => setOpenAdModal(false)}>
						Skip Ad
					</button>
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
				{selectedFile?.type === "image" ? (
					<img src={selectedFile.memeURL} alt='' className='dialogImage' />
				) : (
					<video
						src={selectedFile?.memeURL}
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
};

export default Trending;
