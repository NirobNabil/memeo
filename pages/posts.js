import React, { useState, useEffect } from 'react'
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

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline'

import Feed from '../components/Feed';
import Widgets from '../components/Widgets';
import { useRouter } from 'next/router';

export default function Posts() {
    const [posts, setPosts] = useState([])
    const [length, setLength] = useState(25);

    const router = useRouter()

    const { id } = router.query;
    

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, `posts/${id}`), (docData) => {
            if (docData.exists()) {
                setPosts([{ ...docData.data(), id: docData.id }])
            }
        })
        return unsubscribe
    }, [id])

    const fetchMore = ()  => {
        setLength(length + 25)
    }




  return (
        <div className="bg-[#F3F2EF] dark:bg-slate-900 dark:text-white min-h-screen flex  flex-row w-full mx-auto md:space-y-6 justify-center ">
            <div className="flex left-1 top-1 absolute items-center justify-center h-12 w-12 rounded-full bg-white dark:bg-slate-800 shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700">
                <ArrowLeftIcon className="h-6 w-6" onClick={() => router.back()} />
            </div>
            


            <div className="hidden md:flex xl:flex flex-col items-center xl:items-start xl:w-[360px] p-2">
                {/* <Menu follow={follow} following={following} followers={followers} /> */}
            </div>
            <div  className="flex-grow border-l border-r border-gray-100 dark:border-gray-700 max-w-xl xl:w-[520px]  space-x-5  my-3 mx-3 md:mx-0">
                <Feed posts={posts} 
                nactive 
                len={length}  
                fetchMore={fetchMore}
                fromPost={true}
                inactive={false}
                />
            </div>
            <div className="hidden  md:inline space-y-5 p-2 item-center px-6 xl:items-end  xl:w-[360px]">
                {/* <Widgets /> */}
            </div>
        </div>
  )
}