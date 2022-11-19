import { PlusIcon } from "@heroicons/react/solid";
import { Search, Tag } from "@mui/icons-material";
import { Chip, Stack } from "@mui/material";
import Link from "next/link";
import React, { useState, useEffect } from "react";

import {
	HiOutlineTemplate,
	HiBadgeCheck,
	HiFilm,
	HiCamera,
	HiSearch,
	HiOutlineUserGroup,
} from "react-icons/hi";

import ChipInput from "material-ui-chip-input";

import { db, auth, storage } from "../../firebase";


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
  } from 'firebase/firestore';
import { 
getDownloadURL, 
ref,
uploadBytes,
getStorage,
uploadBytesResumable,

} from "@firebase/storage";

import { useTheme } from "next-themes";

const TemplateMenu1 = (props) => {
	const { setActiveTab } = props;
	const [showTag, setShowTag] = useState(false);
	const [tags, setTags] = useState([]);
	const [tagsLen, setTagsLen] = useState(10);
	const [chiplen, setChipLen] = useState(4);

	const { search, setSearch, searchTags, setSearchTags } = props;

	const { theme } = useTheme();

	useEffect(() => {
		const getTags = async () => {
			const q = query(collection(db, "tags"), orderBy("count", "desc"), limit(tagsLen));
			const querySnapshot = await getDocs(q);
			const tags = [];
			querySnapshot.forEach((doc) => {
				tags.push(doc.data());
			});
			setTags(tags);
		};
		getTags();
	}, [tagsLen]);

	useEffect(() => {
		searchTags?.map((tag) => {
			getDocs(query(collection(db, "tags"), where("tag", "==", tag), limit(1))).then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					updateDoc(doc.ref, {
						count: increment(1),
					});
				});
				if (querySnapshot.empty) {
					addDoc(collection(db, "tags"), {
						tag: tag,
						count: 1,
					});
				}
			});
		});
	}, [searchTags]);

	const handleAddChip = (chip) => {
		setSearchTags([...searchTags, chip]);
	};



	
	return (
		<div>
			<div className=''>
				<div className='card bg-white dark:bg-slate-800'>
					<div className='card-content mt-2 px-10 py-5'>
						<div className='card-content-inner'>
							{/* search box  */}
							<div className='search-box flex flex-row items-center rounded-xl gap-5 py-2 px-5 bg-gray-100 dark:bg-slate-900 mb-4'>
								<label htmlFor='search-meme' className=''>
									{/* <HiSearch className='dark:text-gray-400' /> */}
									<Chip  className='bg-gray-100 dark:bg-slate-900 text-black dark:text-white text-xs' icon={showTag ? <Search /> : <Tag />}
									 onClick={() => {
										setShowTag(!showTag);
										setSearch("");
										setSearchTags([]);
									 }} />
 

								</label>
							  {!showTag ? (
								<>
									<input
									type='text'
									id='search-meme'
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									name='search-meme'
									placeholder='Search Meme'
									className='bg-transparent w-full outline-none'
								/>
								</>
							  ) : (
								<>

								  <ChipInput
								    placeholder="Search Tags"
									className='bg-transparent w-full outline-none text-black dark:text-white flex-grow flex-shrink 
									 placeholder-black dark:placeholder-white inline-block'
									value={searchTags}
									onAdd={(chip) => handleAddChip(chip)}
									onDelete={(chip, index) => {
										const newTags = [...searchTags];
										newTags.splice(index, 1);
										setSearchTags(newTags);
									}}
								/>
								</>
							  )}
							</div>
							{showTag && (
							<Stack direction="column" spacing={1}>
								<Stack direction="row" spacing={1} flexWrap="wrap" 
								>
									{tags?.slice(0, chiplen).map((tag, index) => <Chip key={index} label={tag.tag}
									 onClick={() => handleAddChip(tag.tag)} 
									style={
										theme !== "dark"
											? { color: "#fff", backgroundColor: "#1f2937", margin: "0 5px 5px 0" }
											: { color: "#000", backgroundColor: "#fff", margin: "0 5px 5px 0" }
									} />)}
									{tags?.length > chiplen && <Chip label={`+${tags?.length - chiplen}`} style={
										theme !== "dark"
											? { color: "#fff", backgroundColor: "#1f2937", margin: "0 5px 5px 0" }
											: { color: "#000", backgroundColor: "#fff", margin: "0 5px 5px 0" }
									} onClick={() => setChipLen(tags?.length)} />}
								{tags?.length === 0 && <Chip label="No tags" style={
										theme !== "dark"
											? { color: "#fff", backgroundColor: "#1f2937", margin: "0 5px 5px 0" }
											: { color: "#000", backgroundColor: "#fff", margin: "0 5px 5px 0" }
									} />}
									{tags?.length === chiplen && <Chip label="Add More"
									variant="outlined"
									color="primary"
									style={
										{ margin: "0 5px 5px 0" }
									} 
									onClick={() => setTagsLen(tagsLen + 10)} />}
									
									{tags?.length === chiplen && <Chip label="Hide"
									variant="outlined"
									color="secondary"
									style={
										{ margin: "0 5px 5px 0" }
									  } 
									onClick={() => setChipLen(4)} />}
		
								</Stack>
							</Stack>
							)}
							<div className='list-block media-list'>
								<ul className='text-gray-600 dark:text-gray-400'>
									<li className='mb-4'
									onClick={() => setActiveTab("memes")}
									>
										<div
											className='item-link item-content flex flex-row flex-start cursor-pointer  items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
								          	transform hover:-translate-y-1 hover:scale-110'>
											<div className='item-media'>
												<HiOutlineTemplate className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Meme Template</div>
											</div>
										</div>
									</li>

									<li className='mb-4'
									 onClick={() => setActiveTab("popular")}
									>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
									transform hover:-translate-y-1 hover:scale-110'>
											<div className='item-media'>
												<HiBadgeCheck className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Popular Template</div>
											</div>
										</div>
									</li>
									<li className='mb-4'
									 onClick={() => setActiveTab("image-memes")}
									>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
								           	transform hover:-translate-y-1 hover:scale-110'>
											<div className='item-media'>
												<HiCamera className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Image Template</div>
											</div>
										</div>
									</li>
									<li className='mb-4'
									 onClick={() => setActiveTab("video-memes")}
									>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out 
												transform hover:-translate-y-1 hover:scale-110'>
											<div className='item-media'>
												<HiFilm className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>Video Template</div>
											</div>
										</div>
									</li>
									<li className='mb-4'
									 onClick={() => setActiveTab("meme-generator")}
									>
										<div
											className='item-link item-content flex flex-row cursor-pointer items-center w-full  hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg p-2 transition duration-300 ease-in-out
								        	transform hover:-translate-y-1 hover:scale-110'>
											<div className='item-media'>
												<HiOutlineUserGroup className='w-6 h-6 mr-6' />
											</div>
											<div className='item-inner'>
												<div className='item-title'>My Template</div>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TemplateMenu1;
