/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useRef} from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { auth, db } from '../firebase'
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
} from 'firebase/firestore'
import Head from 'next/head'
import Feed from '../components/Feed'
import Post from '../components/Post'
import Menu from '../components/Menu'
import Widgets from '../components/Widgets'
import {  storage } from '../firebase'
import { useSelector , useDispatch} from 'react-redux'


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
import Loading from '../components/Loading'

import { ArrowBack } from '@mui/icons-material'

import { fetchUserAgain } from '../redux/actions'
import Modal from 'react-modal'

export default function Profile(props) {
  const [User, setUser] = useState(null)
  const [userPost, setUserPost] = useState([])
  const [backgroundURL, setBackgroundURL] = useState(null)
  const [photoURL, setPhotoURL] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [followingUIDs, setFollowingUIDs] = useState([])
  const [followersUIDs, setFollowersUIDs] = useState([])
  const [thisUser, setThisUser] = useState(null)
  const [userMemes, setUserMemes] = useState([])
  const [isOpen, setIsOpen] = useState(false)



  const user = useSelector((state) => state?.data?.currentUser);
  const dispatch = useDispatch();


  const backgroundURLRef = useRef(null)
  const photoURLRef = useRef(null)

  const router = useRouter()
  const { uid } = router.query

  useEffect(() => {
    if (user?.uid === undefined){
      auth.onAuthStateChanged((user) => {
        if (user) {
          dispatch(fetchUserAgain(user?.uid))
        }
      })
    }
  }, [])

  useEffect(() => {
    if (uid) {
      getDoc(doc(db, "users", uid)).then((doc) => {
        if (doc.exists()) {
          setThisUser(doc.data())
        }
      });
    }
  }, [uid]);

  useEffect(() => {
    if (uid) {
    (async () => {
      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const user = doc.data()
        setUser(doc.data())
        setBackgroundURL(doc.data()?.backgroundURL || "https://firebasestorage.googleapis.com/v0/b/instagram-clone-2f5b9.appspot.com/o/defaults%2Fbackground.jpg?alt=media&token=7b2b0b0f-8b1f-4b1f-8f9d-1b2f2f2f2f2f")
        setPhotoURL(doc.data()?.photoURL || "https://firebasestorage.googleapis.com/v0/b/instagram-clone-2f5b9.appspot.com/o/defaults%2Fprofile.jpg?alt=media&token=7b2b0b0f-8b1f-4b1f-8f9d-1b2f2f2f2f2f")
        setName(doc.data()?.name || "")
        setBio(doc.data()?.bio || "")
        getDocs(collection(db, 'posts'), where('uid', '==', uid), orderBy('timestamp', 'desc'), limit(10)).then((querySnapshot) => {
          const posts = []
          querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data(), user})
          })
          setUserPost(posts)
        })
      });

    })()
    }
  }, [uid, router])

  const fetchMorePosts = async () => {
    if(userPost.length > 0) {
      const last = userPost[userPost.length - 1]
      const q = query(collection(db, 'posts'), where('uid', '==', uid), orderBy('timestamp', 'desc'), startAfter(last.timestamp), limit(10));
      const querySnapshot = await getDocs(q);
      const posts = []
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data(), user})
      })
      setUserPost([...userPost, ...posts])
    }
  }

  useEffect(() => {
    if (uid) {
      (async () => {
        await getDoc(doc(db, 'users', uid, 'following', uid)).then((doc) => {
          if(doc.exists()){
            setFollowingUIDs(doc.data().following)
          }
        })

        await getDoc(doc(db, 'users', uid, 'followers', uid)).then((doc) => {
          if(doc.exists()){
            setFollowersUIDs(doc.data().followers)
          }
        })
      })()
    }
  }, [uid])

  useEffect(() => {
    if (uid) {
      (async () => {
        followersUIDs.slice(0, 10).map(async (uid) => {
          await getDoc(doc(db, 'users', uid)).then((doc) => {
            if(doc.exists()){
              setFollowers((followers) => [...followers, {id: doc.id, ...doc.data()}])
            }
          })
        })
      })()
    }
  }, [uid, followersUIDs])

  useEffect(() => {
    if (uid) {
      (async () => {
        followingUIDs.slice(0, 10).map(async (uid) => {
          await getDoc(doc(db, 'users', uid)).then((doc) => {
            if(doc.exists()){
              setFollowing((following) => [...following, {id: doc.id, ...doc.data()}])
            }
          })
        })
      })()
    }
  }, [uid, followingUIDs])

  const fetchMoreFollowers = async () => {
    if(uid && followers?.length > 0 && followersUIDs.length > followers.length){
      followersUIDs.slice(followers.length, followers.length + 10).map(async (uid) => {
        await getDoc(doc(db, 'users', uid)).then((doc) => {
          if(doc.exists()){
            setFollowers((followers) => [...followers, {id: doc.id, ...doc.data()}])
          }
        })
      })
    }
  }

  const fetchMoreFollowing = async () => {
    if(uid && following?.length > 0 && followingUIDs.length > following?.length){
      followingUIDs.slice(following.length, following.length + 10).map(async (uid) => {
        await getDoc(doc(db, 'users', uid)).then((doc) => {
          if(doc.exists()){
            setFollowing((following) => [...following, {id: doc.id, ...doc.data()}])
          }
        })
      })
    }
  }

  useEffect(() => {
    if (uid) {
      const q = query(collection(db, 'memes', uid, 'userMemes'), orderBy("timestamp", "desc"), limit(10));
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
      const q = query(collection(db, 'memes', uid, 'userMemes'), orderBy("timestamp", "desc"), startAfter(lastMeme?.timestamp), limit(10));
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
  
  const handleFileBackgroundURL =  (e) => {
    const file = e.target.files[0]
    if(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundURL(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFilePhotoURL =  (e) => {
    const file = e.target.files[0]
    if(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoURL(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)

    if(backgroundURL !== User.backgroundURL) {
      try {
        const storageRef = ref(storage, `backgroundURL/${User.uid}`)
        await deleteObject(storageRef)
      }
      catch (error) {
        console.log(error)
      }
      const response = await fetch(backgroundURL)
      const blob = await response.blob()
      const storageRef = ref(storage, `backgroundURL/${User.uid}`)
      const uploadTask = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(uploadTask.ref)
      await setDoc(doc(db, 'users', User.uid), {
        backgroundURL: downloadURL
      }, { merge: true })
    }

    if(photoURL !== User.photoURL) {
      try {
        const storageRef = ref(storage, `photoURL/${User.uid}`)
        await deleteObject(storageRef)
      }
      catch (error) {
        console.log(error)
      }
      const response = await fetch(photoURL)
      const blob = await response.blob()
      const storageRef = ref(storage, `photoURL/${User.uid}`)
      const uploadTask = await uploadBytes(storageRef, blob)
      const downloadURL = await getDownloadURL(uploadTask.ref)
      await setDoc(doc(db, 'users', User.uid), {
        photoURL: downloadURL
      }, { merge: true })
      const q = query(collection(db, 'conversations'), where('uids', 'array-contains', User.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docdata) => {
        await setDoc(doc(db, 'conversations', docdata.id), {
          users: docdata.data().users.map((user) => {
            if(user.uid === User.uid) {
              return {
                ...user,
                photoURL: downloadURL
              }
            }
            else {
              return user
            }
          })
        }, { merge: true })
      });
    }

    if(name !== User.name) {
      await setDoc(doc(db, 'users', User.uid), {
        name: name
      }, { merge: true })
    }

    if(bio !== User.bio) {
      await setDoc(doc(db, 'users', User.uid), {
        bio: bio
      }, { merge: true })
    }

    setLoading(false)

  }

  const followToggle = async (uid, isTrue) => {
		if (!isTrue) {
			updateDoc(doc(db, "users", uid, "followers", uid), {
				followers: arrayUnion(uid),
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
				  emoji: "🤗"
				},
				uid: [user.uid, uid].sort().join(""), //sorts the uid's alphabetically and joins them together
				uids: [user.uid, uid],
				users: [{
				  uid: user?.uid,
				  name: user?.name,
				  photoURL: user?.photoURL,
				}, {
				  uid: uid,
				  name: thisUser?.name,
				  photoURL: thisUser?.photoURL,
				}],
				nickname1: '',
				nickname2: '',
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
      setFollowersUIDs((followersUIDs) => [...followersUIDs, user.uid])
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

  


  if(loading) {
    <div className="flex justify-center items-center h-screen opacity-50">
      <Loading />
    </div>
  }

  

  return (
    <>
    <div className=" dark:bg-slate-900 dark:text-gray-400 text-gray-600 bg-white min-h-screen">
      <ArrowBack 
       className='cursor-pointer w-8 h-8 text-gray-400 dark:text-gray-300 absolute top-4 left-4'
        onClick={() => router.back()}
      />
      <div className="flex flex-col items-center justify-center">
        {User && (
           <img
           src={User?.backgroundURL || 'https://images.unsplash.com/photo-1617670000000-0c0c0c0c0c0c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'}
           alt="background pic"
           className="w-full h-40 object-cover cursor-pointer "
          />
        )}
         <div className='flex flex-col items-center absolute top-20 bg-opacity-50 bg-white dark:bg-slate-900/50 w-full'>
              {User && (
                    <Image
                    src={User?.photoURL || 'https://firebasestorage.googleapis.com/v0/b/memex-1.appspot.com/o/photoURL%2Fdefault.png?alt=media&token=0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b0b'}
                    alt="profile pic"
                    width={150}
                    height={150}
                    className="rounded-full border-4 border-white cursor-pointer absolute "
                    onClick={() => setIsOpen(true)}
                  />
                )}
           </div>
        <div className='left-0 right-0 relative top-20 bottom-0 bg-white dark:bg-slate-900/50  '>
          <div className='flex flex-col items-center '>
            <div className='flex flex-col items-center'>
              <h1 className='text-xl font-bold'>{User?.name}</h1>
              <p className='text-gray-500 text-sm'>{User?.userName}</p>
              <p className='text-gray-500 text-sm'>{User?.bio}</p>
            </div>

            <div className='flex flex-row gap-10 items-center justify-center my-2'>
              <button className='flex items-center justify-center  space-x-1  bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 border border-gray-300 dark:border-slate-800'
              onClick={() => router.push(`/messenger/components/Body?uid=${User?.uid}`)}
              >
                Message
              </button>
              {uid === user?.uid ? (
               <button className='flex items-center justify-center  space-x-1  bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 border border-gray-300 dark:border-slate-800'
               onClick={() => setIsOpen(true)}
               >
                  Edit Profile
                  </button>
                  ) : (
                  <button className='flex items-center justify-center  space-x-1  bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 border border-gray-300 dark:border-slate-800'
                  onClick={() => {
                    if(followersUIDs.includes(user?.uid)) {
                      followToggle(uid, true);
                    }
                    else {
                      followToggle(uid, false);
                  }
                }}
                  >
                      {followersUIDs.includes(auth?.currentUser?.uid) ? 'Unfollow' : 'Follow'}
                  </button>
                )}
            </div>
            

            <div className='flex flex-row gap-10 items-center justify-center my-2 '>
              <div className='flex items-center justify-center  space-x-1  bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
                <h1 className='text-md  mx-2'>{
                 followingUIDs.length
                }</h1>
                <p className='text-gray-500 text-sm'>Following</p>
              </div>
              <div className='flex items-center justify-center  space-x-1   bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
                <h1 className='text-md  mx-2'>{
                 followersUIDs.length
                }</h1>
                <p className='text-gray-500 text-sm'>Followers</p>
              </div>
              <div className='flex items-center justify-center  space-x-1 bg-transparent hover:bg-gray-100  dark:text-gray-400 text-gray-600 dark:bg-slate-900 rounded-full px-4 py-2 '>
                <h1 className='text-md  mx-2'>{
                userPost ? userPost.length : 0
                }</h1>
                <p className='text-gray-500 text-sm'>Posts</p>
              </div>
          </div>
            
          </div>
        </div>
      </div>
      
      <div 
        // className="bg-[#F3F2EF] dark:bg-black dark:text-white flex flex-row md:flex-row gap-10 fixed w-full h-full  md:space-y-6 justify-center "
        className="bg-[#F3F2EF] relative top-40  dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto md:space-y-6 justify-center "
       >
        <div className="hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2">
            <Menu 
             following={following} 
             followers={followers} 
             profile={true}
             fetchFollowing={fetchMoreFollowing}
             fetchFollowers={fetchMoreFollowers}
             followingUIDs={followingUIDs}
             followersUIDs={followersUIDs}
             />
        </div>


        <div 
           className="flex-grow border-l border-r border-gray-100 dark:border-gray-700 max-w-xl xl:w-[520px]  space-x-5  my-3 mt-20 "
        >
          <Feed
           posts={userPost} 
           inactive 
           len={1}
           fetchMore={fetchMorePosts}
           active={false}
           />
            
        </div>
        <div className="hidden  md:inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px]">
            <Widgets 
             fetchUserMemes={fetchUserMemes}
             userMemes={userMemes}
             fromProfile={true}
            />
        </div>
       </div>
     </div>
     <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0)',
            border: 'none',
            zIndex: 1000,
            width: '100%',
            maxWidth: '500px',
          },
        }}
      >
    
        <div className="modal-box w-11/12 dark:bg-slate-800 bg-slate-100 scrollbar-hide ">
          <div className='flex flex-col items-center '>
            <div className='flex flex-col items-center'>
              <label htmlFor="backgroundURL" className='text-sm text-gray-600 py-5'>Background Image</label>
              <input
                type="file"
                id="fileBackground"
                accept="image/*"
                onChange={handleFileBackgroundURL}
                className='hidden'
                ref={backgroundURLRef}
              />
              
                <img
                src={backgroundURL || 'https://images.unsplash.com/photo-1617670000000-0c0c0c0c0c0c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'}
                alt="background pic"
                className="w-full h-40 object-cover cursor-pointer "
                onClick={() =>  backgroundURLRef.current.click()}
              />
              <label htmlFor="photoURL" className='text-sm text-gray-500 py-5'>Profile Image</label>
              <input
                type="file"
                id="filePhoto"
                accept="image/*"
                onChange={handleFilePhotoURL}
                className='hidden'
                ref={photoURLRef}
              />
               <Image
                src={photoURL || 'https://firebasestorage.googleapis.com/v0/b/memex-1.appspot.com/o/photoURL%2Fdefault.png?alt=media&token=0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b0b'}
                alt="profile pic"
                width={150}
                height={150}
                className="rounded-full border-4 border-white cursor-pointer btn object-cover"
                onClick={() =>  photoURLRef.current.click()}
               />
            </div>
            <div className='flex flex-col items-center'>
              <label htmlFor="name" className='text-sm text-gray-500 py-5'>Name</label>
              <input 
               type="text"
               placeholder="Type here" 
               className="input input-bordered w-full max-w-xs bg-slate-300 dark:bg-slate-800 dark:text-white"
               value={name}
                onChange={(e) => setName(e.target.value)}
               />
            </div>
            <div className='flex flex-col items-center'>
              <label htmlFor="bio" className='text-sm text-gray-500 py-5'>Bio</label>
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs bg-slate-300 dark:bg-slate-800 dark:text-white"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className='flex flex-col items-center'>
              <label htmlFor="button" className='text-sm text-gray-500 py-5'>Update</label>
              <button
                className="btn py-5 px-10 bg-slate-300 dark:bg-slate-800 dark:text-white inline-flex items-center justify-center"
                onClick={handleUpdateProfile}
              >
                Update Profile
              </button>
            </div>
          </div>
          
          <div className="modal-action">
            <a href="#" className="btn  btn-sm bg-slate-600/50 dark:bg-slate-800 text-white"
            disabled={loading}
            >
              {loading ? 'Loading...' : 'Close'}
            </a>
          </div>
        </div>
      </Modal>
    </>
  )
}
