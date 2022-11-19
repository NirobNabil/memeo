/* eslint-disable @next/next/no-img-element */
import React, {useState} from 'react'

import { useRouter } from 'next/router'

export default function ProfileCard({post, func, text, from, isTrue, setRemoveList}) {

    const router = useRouter()
    const [buttonBlock, setButtonBlock] = useState(false);



  return (
        <li className="py-3 border-b  divide-y divide-gray-200 dark:divide-gray-700 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/Profile?uid=${post.uid}`)}>
                    <img className="w-10 h-10 rounded-full cusror-pointer"
                    src={post?.photoURL} alt={post?.name} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white cursor-pointer hover:underline hover:text-blue-500 hover:dark:text-blue-500"
                    onClick={() => router.push(`/Profile?uid=${post.uid}`)}>
                    
                        {post?.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        {post?.userName}
                    </p>
                </div>
                <div className="flex  space-x-3">
                    <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700"
                    onClick={() => {
                        if(from === "follow"){
                            setRemoveList((prev) => [...prev, post.id]);
                        }
                        else {
                            router.push(`/messenger/components/Body?uid=${post.uid}`);
                        }
                    }}>
                    
                        {from === "follow" ? (
                            "Remove"
                        ) : (
                            "message"
                        )}
                    </a>
                    <a href="#" className={`inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${buttonBlock && "cursor-not-allowed"}`}
                    onClick={() => {
                        setButtonBlock(true);
                        func(post, isTrue);
                    }}
                    disabled={buttonBlock}
                    style={{
                        pointerEvents: buttonBlock ? "none" : "auto",
                        opacity: buttonBlock ? 0.5 : 1,
                        backgroundColor: buttonBlock ? "transparent" : "#1DA1F2",
                    }}
                    >{text}</a>
                </div>
            </div>
        </li>
     )
}
