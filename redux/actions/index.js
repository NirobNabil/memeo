import { USER_STATE_CHANGE } from "../constants";
import { CLEAR_DATA } from "../constants";
import { USER_CHATS_STATE_CHANGE } from "../constants";

import { db, auth, storage } from "../../firebase";

import {
	collection,
	doc,
	getDoc,
	getDocs,
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
} from "firebase/firestore";

export const fetchUser = () => (dispatch) => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                dispatch({ type: USER_STATE_CHANGE, currentUser: docSnap.data() });
				const conversationsRef = collection(db, 'conversations');
				const q = query(conversationsRef, where('uids', 'array-contains', docSnap.data().uid), orderBy('lastmsgdate', 'desc'), limit(10));
				 onSnapshot(q, (querySnapshot) => {
				const conversations = [];
				querySnapshot.forEach((doc) => {
					conversations.push({...doc.data(), id: doc.id});
				});
				dispatch({ type: USER_CHATS_STATE_CHANGE, chats: conversations });
			 });
			}
		}
	});
};


export const fetchUserAgain = (uid) => async (dispatch) => {
	const userRef = doc(db, "users", uid);
	const docSnap = await getDoc(userRef);
	console.log(docSnap.data());
	if (docSnap.exists()) {
		console.log("Document data:", docSnap.data());
		dispatch({ type: USER_STATE_CHANGE, currentUser: docSnap.data() });
		const conversationsRef = collection(db, 'conversations');
		const q = query(conversationsRef, where('uids', 'array-contains', docSnap.data().uid), orderBy('lastmsgdate', 'desc'), limit(10));
			onSnapshot(q, (querySnapshot) => {
		const conversations = [];
		querySnapshot.forEach((doc) => {
			conversations.push({...doc.data(), id: doc.id});
		});
		dispatch({ type: USER_CHATS_STATE_CHANGE, chats: conversations });
		});
	}
};



export const clearData = () => (dispatch) => {
	dispatch({ type: CLEAR_DATA });
};
