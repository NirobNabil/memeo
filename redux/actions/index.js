import { USER_STATE_CHANGE } from "../constants";
import { CLEAR_DATA } from "../constants";

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
			}

        } else {
            dispatch({ type: USER_STATE_CHANGE, currentUser: null });
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
	}
};



export const clearData = () => (dispatch) => {
	dispatch({ type: CLEAR_DATA });
};
