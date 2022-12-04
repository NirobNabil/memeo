/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import {
	CalendarIcon,
	ChartBarIcon,
	EmojiHappyIcon,
	PhotographIcon,
	XIcon,
} from "@heroicons/react/outline";
import { useRef, useState, useCallback } from "react";
import { auth, db, storage } from "../firebase";
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
	getFirestore,
} from "firebase/firestore";
import {
	getDownloadURL,
	ref,
	uploadBytes,
	getStorage,
	uploadBytesResumable,
} from "@firebase/storage";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Link from "next/link";

import { FileOpen } from "@mui/icons-material";

const Picker = dynamic(() => import("@emoji-mart/react"), {
	ssr: false,
});

import Progress from "./Components/Progress";
import Modal from "react-modal";

import { useSelector } from "react-redux";

function Input() {
	const user = useSelector((state) => state.data.currentUser);
	const { theme } = useTheme();
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const filePickerRef = useRef(null);
	const [showEmojis, setShowEmojis] = useState(false);
	const [tagFriend, setTagFriend] = useState(false);
	const [taggedFriends, setTaggedFriends] = useState([]);
	const [tagFriends, setTagFriends] = useState([]);
	const [progress, setProgress] = useState(0);

	const sendPost = async () => {
		if (loading) return;
		setLoading(true);

		if (selectedFile) {
			const response = await fetch(selectedFile);
			const blob = await response.blob();
			const type = blob.type.split("/")[1];

      const storageRef = ref(storage, `posts/${user?.uid}/${Date.now()}.${type}`);
      const task = uploadBytesResumable(storageRef, blob);
      task.on('state_changed', (snapshot) => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percentage);
      }, (error) => {
        console.log(error);
      }, async () => {
        
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        const postRef = await addDoc(collection(db, "posts"), {
          caption: input,
          timestamp: serverTimestamp(),
          type: blob.type.split('/')[0],
          postURL: downloadURL,
          likes: 0,
          comments: 0,
          shares: 0,
          share: false,
          uid: user?.uid,
          user: {
            uid: user?.uid,
            name: user?.name,
            photoURL: user?.photoURL,
            userName: user?.userName || user?.email.split('@')[0],
          }
        });
        await updateDoc(doc(db, "posts", postRef.id), {
          postID: postRef.id,
        })
        await addDoc(collection(db, `posts/${user?.uid}/userPosts`), {
          timestamp: serverTimestamp(),
          postID: postRef.id,
        })
        .then(() => {
          if(input) {
            let text = input;
            let words = text.split(" ");
            words.filter((word) => word.startsWith("@"));
            taggedFriends.map(async (friend) => {
              if(words.includes(`@${friend.userName}`)) {
               await addDoc(collection(db, `notifications/${friend.id}/notifications`), {
                  type: "tag",
                  notifidate: serverTimestamp(),
                  read: false,
                  postID: postRef.id,
                  userName: user?.userName,
                  notifimsg: `${user?.userName} tagged you in a post`,
                  sender: user?.name,
                  senderid: user?.uid,
                  photoURL: user?.photoURL,
                });
                
              }
            });
          }
          setLoading(false);
          setInput("");
          setSelectedFile(null);
          setShowEmojis(false);
          setTagFriend(false);
          setTaggedFriends([]);
          setTagFriends([]);
          setProgress(0);
          filePickerRef.current.value = null;
        });

  
        
      });

    } else {
      
      const postRef = await addDoc(collection(db, "posts"), {
        caption: input,
        timestamp: serverTimestamp(),
        type: "text",
        postURL: "",
        likes: 0,
        comments: 0,
        shares: 0,
        share: false,
        uid: user?.uid,
        user: {
          uid: user?.uid,
          name: user?.name,
          photoURL: user?.photoURL,
          userName: user?.userName || user?.email.split('@')[0],
        }
      });
      await updateDoc(doc(db, "posts", postRef.id), {
        postID: postRef.id,
      });
     await addDoc(collection(db, `posts/${user?.uid}/userPosts`), {
        timestamp: serverTimestamp(),
        postID: postRef.id,
      }).then(() => {
        if(input) {
          let text = input;
          let words = text.split(" ");
          words.filter((word) => word.startsWith("@"));
          taggedFriends.map(async (friend) => {
            if(words.includes(`@${friend.userName}`)) {
             await addDoc(collection(db, `notifications/${friend.id}/notifications`), {
                type: "tag",
                notifidate: serverTimestamp(),
                read: false,
                postID: postRef.id,
                userName: user?.userName,
                notifimsg: `${user?.userName} tagged you in a post`,
                sender: user?.name,
                senderid: user?.uid,
                photoURL: user?.photoURL,
              });
            }
          });
        }
        setLoading(false);
        setInput("");
        setSelectedFile(null);
        setShowEmojis(false);
        setTagFriend(false);
        setTaggedFriends([]);
        setTagFriends([]);
        setProgress(0);
        filePickerRef.current.value = null;
      });


      
    }
    
   
  };

	const addImageToPost = (e) => {
		const reader = new FileReader();
		if (e.target.files[0]) {
			reader.readAsDataURL(e.target.files[0]);
		}

		reader.onload = (readerEvent) => {
			setSelectedFile(readerEvent.target.result);
		};
	};

	const addEmoji = (e) => {
		let sym = e.unified.split("-");
		let codesArray = [];
		sym.forEach((el) => codesArray.push("0x" + el));
		let emoji = String.fromCodePoint(...codesArray);
		setInput(input + emoji);
	};

	const textInput = useCallback((e) => {
		setInput(e.target.value);
		let tagFriend = e.target.value.split(" ").splice(-1)[0];
		if (tagFriend.startsWith("@")) {
			setTagFriend(true);

			let text = tagFriend.slice(1);
			getDocs(
				query(
					collection(db, "users"),
					where("userName", ">=", text),
					where("userName", "<=", text + "\uf8ff"),
					orderBy("userName", "asc"),
					limit(5)
				)
			).then((querySnapshot) => {
				let friends = [];
				querySnapshot.forEach((doc) => {
					friends.push({
						id: doc.id,
						name: doc.data().name,
						photoURL: doc.data().photoURL,
						userName: doc.data()?.userName,
					});
				});
				setTaggedFriends(friends);
			});
		} else {
			setTagFriend(false);
		}
	}, []);

	return (
		<div className='p-2 text-gray-500 font-medium border-b-2 border-gray-200 dark:border-gray-800 dark:bg-gray-900 rounded-sm'>
			<div className='flex flex-col space-y-3'>
				<div className='flex space-x-2 flex-inline mt-3 '>
					<Link href={`/Profile?uid=${user?.uid}`}>
						<img
							src={user?.photoURL}
							alt=''
							className='h-7 w-7 rounded-full object-cover mt-2 cursor-pointer'
						/>
					</Link>
					<div className='flex flex-col'>
						<div className='flex items-start flex-col'>
							<Link href={`/Profile?uid=${user?.uid}`}>
								<p className='font-semibold dark:text-white/75 cursor-pointer hover:underline'>
									{user?.name}
								</p>
							</Link>
							<p className='text-sm font-bold dark:text-gray-400'>
								@{user?.userName}
							</p>
						</div>
					</div>
				</div>
				<div className='flex flex-col space-y-3 px-1'>
					<textarea
						className='w-full h-24 px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white dark:bg-slate-800 dark:text-white/75 dark:focus:bg-slate-700'
						placeholder={`What's on your mind, ${user?.name}?`}
						value={input}
						onChange={textInput}></textarea>
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-2'>
							<input
								type='file'
								ref={filePickerRef}
								hidden
								onChange={addImageToPost}
							/>
							<p
								className='text-sm font-semibold dark:text-white/75 cursor-pointer hover:text-blue-500'
								onClick={() => filePickerRef.current.click()}>
								<svg
									aria-hidden='true'
									className='w-6 h-6 cursor-pointer text-[#ff4522] transition duration-150 transform hover:scale-110'
									fill='currentColor'
									viewBox='0 0 20 20'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										fillRule='evenodd'
										d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
										clipRule='evenodd'></path>
								</svg>
							</p>

							{/* emoji picker */}
							<div className='flex items-center space-x-2'>
								<EmojiHappyIcon
									className='h-6 w-6 cursor-pointer transition duration-150 transform hover:scale-110 text-[#ff4522]'
									onClick={() => setShowEmojis(!showEmojis)}
								/>
							</div>
						</div>
						<button
							disabled={!input && !selectedFile}
							onClick={sendPost}
							className={`bg-[#ff4522] text-white font-semibold px-4 py-2 rounded-lg ${
								!input && !selectedFile && "opacity-50"
							}`}>
							Post
						</button>
					</div>
				</div>

				{tagFriend && (
					<div className='flex flex-col space-y-3 px-1'>
						<div className='flex flex-col space-y-2 flex-start px-2'>
							{taggedFriends.map((friend) => (
								<div
									key={friend.id}
									className='flex items-center space-x-2'
									onClick={() => {
										let text = input;
										while (text.length > 0 && text[text.length - 1] !== " ") {
											text = text.slice(0, -1);
										}
										text += `@${friend.userName} `;
										setInput(text);
										setTagFriends((prev) => [...prev, friend]);
										setTagFriend(false);
									}}>
									<img
										src={friend.photoURL}
										alt=''
										className='h-7 w-7 rounded-full object-cover mt-2 cursor-pointer'
									/>
									<div className='flex flex-col space-y-1'>
										<p className='text-sm font-semibold dark:text-white/75 cursor-pointer hover:text-blue-500'>
											{friend.name}
										</p>
										<p className='text-xs dark:text-white/50'>
											{friend.userName}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{selectedFile && (
					<div className='flex flex-col space-y-3 px-1 relative'>
						<div
							className='absolute w-8 h-8 bg-[#15181c] hover:bg-[#272c26] bg-opacity-75 rounded-full flex items-center justify-center cursor-pointer z-10 dark:bg-slate-900 left-20 top-8 dark:hover:bg-slate-800'
							onClick={() => setSelectedFile(null)}>
							<XIcon className='h-5 w-5 text-white dark:text-white/75 cursor-pointer hover:text-blue-500 dark:hover:text-blue-500' />
						</div>

						{selectedFile?.includes("image") ? (
							<img
								src={selectedFile}
								className='max-h-80 object-contain w-full cursor-pointer rounded-lg'
							/>
						) : (
							<video
								src={selectedFile}
								className='rounded-2xl max-h-80 object-contain w-full cursor-pointer'
								controls
							/>
						)}
					</div>
				)}
			</div>
			{showEmojis && (
				<Picker
					onEmojiSelect={addEmoji}
					theme={theme === "dark" ? "dark" : "light"}
				/>
			)}

			{loading && (
				<div
					className={`flex flex-col items-center space-y-2 bg-white dark:bg-slate-900 p-5 rounded-xl shadow-md w-full z-50 mt-5`}>
					<Progress progress={progress} />
					<p className='text-lg font-semibold dark:text-white/75'>
						Uploading...
					</p>
				</div>
			)}
		</div>
	);
}

export default Input;
