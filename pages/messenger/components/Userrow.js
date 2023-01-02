/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useContext, useCallback } from "react";
import Users from "./Users";
import { db, auth } from "../../../firebase";
import firebase from "firebase/app";
import { ContextApp } from "../ContextAPI";
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
} from "firebase/firestore";
import { useSelector } from "react-redux";

import InfiniteScroll from "react-infinite-scroll-component";

function Userrow(props) {
	const [keyword, setKeyword] = useState("");
	const pattern = new RegExp("\\b" + keyword.replace(/[\W_]+/g, ""), "i");

	const { setChatuser, chatuser, convos, fetchMore, setShow } = props;

	return (
		<>
			<h3 className='text-md font-semibold mt-12'>ChatList</h3>
			<div className='search abs'>
				<input
					type='text'
					placeholder='Search'
					onFocus={() => props.setAdduser()}
					className='placeholder-gray-400 text-gray-600 bg-gray-100 dark:bg-slate-900 rounded-full w-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent'
				/>
				<i className='far fa-plus' onClick={() => props.setAdduser()}></i>
			</div>
			<div className='users'>
				<InfiniteScroll
					dataLength={convos?.length || 0}
					next={fetchMore}
					hasMore={true}
					// loader={<h1>Loading ...</h1>}
					endMessage={
						<p style={{ textAlign: "center" }}>
							<b>Yay! You have seen it all</b>
						</p>
					}
					// scrollableTarget="scrollableDiv"
					height={500}>
					{convos?.map((element, index) => (
						<Users
							key={index}
							chatuser={chatuser}
							setChatuser={setChatuser}
							element={element}
							onClick={setShow("chatbox")}
						/>
					))}
				</InfiniteScroll>
			</div>
		</>
	);
}
export default Userrow;
