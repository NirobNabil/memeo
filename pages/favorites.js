import React, { useState, useEffect } from 'react'
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
  } from 'firebase/firestore'

import { db, storage, auth } from '../firebase'

import Feed from '../components/Feed';
import Menu from '../components/Menu';
import Widgets from '../components/Widgets';

function Favorites(props) {
    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    

    useEffect(() => {
        setUser(props.user)
    }, [props.user])

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'posts', user.uid, 'userFavorites'));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach((docData) => {
                    getDoc(doc(db, 'posts', docData.data().uid, 'userPosts', docData.data().id)).then((docElement) => {
                        if (docElement.exists()) {
                            getDoc(doc(db, 'users', docData.data().uid)).then((docUser) => {
                                setPosts((prev) => prev.filter((post) => post.id !== docElement.id).concat({ id: docElement.id, ...docElement.data(), user: docUser.data() }))
                            })
                        }
                        else {
                            deleteDoc(doc(db, 'posts', user.uid, 'userFavorites', docData.id))
                        }
                    })
                });
            });
            return unsubscribe;
        } else {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    getDoc(doc(db, 'users', user.uid)).then((doc) => {
                        if (doc.exists()) {
                            setUser({ ...doc.data(), uid: doc.id })
                        }
                    })
                } else {
                    setUser(null)
                }
            })
        }
    }, [user])




  return (
        <div className="bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto md:space-y-6 justify-center ">
            <div className="hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2">
                {/* <Menu follow={follow} following={following} followers={followers} /> */}
            </div>
            <div  className="flex-grow border-l border-r border-gray-100 dark:border-gray-700 max-w-xl xl:w-[520px]  space-x-5  my-3 mx-3 md:mx-0">
                <Feed posts={posts} inactive len={1} />
            </div>
            <div className="hidden  md:inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px]">
                <Widgets />
            </div>
          </div>
  )
}

const mapStateToProps = (state) => {
    return {
        user: state.data.currentUser,
    };
}

export default connect(mapStateToProps)(Favorites)