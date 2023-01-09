/* eslint-disable @next/next/no-page-custom-font */
import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../../firebase";
import Body from "./components/Body";
import ContextAppProvider from "./ContextAPI";

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

import { fetchUserAgain } from "../../redux/actions/index";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useRouter } from "next/router";

import Loading from "../../components/Loading";
import Head from "next/head";

function App(props) {
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const { id } = router.query;

	if (props?.data?.currentUser?.uid === undefined) {
		auth.onAuthStateChanged((user) => {
			setLoading(true);
			if (user) {
				props.fetchUserAgain(user.uid);
			}
			setLoading(false);
		});
	}

	useEffect(() => {
		auth.onAuthStateChanged((user) => {
			setLoading(true);
			if (user) {
				props.fetchUserAgain(user.uid);
			}
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<div className='justify-center items-center flex flex-col h-screen'>
				<Loading />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Memeo | Messenger</title>
			</Head>
			<ContextAppProvider>
				<Body id={id} />
			</ContextAppProvider>
		</>
	);
}

const mapStateToProps = (state) => {
	return {
		data: state.data,
	};
};

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ fetchUserAgain }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
