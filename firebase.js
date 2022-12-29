import { initializeApp ,  getApps ,  getApp } from  'firebase/app' ;
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { 
  getStorage,
  ref,
  deleteObject
 } from 'firebase/storage';
import {
	collection,
	query,
	where,
	getDocs,
	deleteDoc,
} from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDHovsj8YoxaH74p3dsgY1x7DATZwq-5KM",
//   authDomain: "memex-a0dc7.firebaseapp.com",
//   projectId: "memex-a0dc7",
//   storageBucket: "memex-a0dc7.appspot.com",
//   messagingSenderId: "396799761656",
//   appId: "1:396799761656:web:069b116d0df32675d96f0d",
//   measurementId: "G-LSYRVXGEJ6"
// };



const firebaseConfig = {
        apiKey: "AIzaSyDIpO1yc9GGN7fhb1rO-3u4zoQ1DZZBaQM",
        authDomain: "memeo-31738.firebaseapp.com",
        projectId: "memeo-31738",
        storageBucket: "memeo-31738.appspot.com",
        messagingSenderId: "502132303092",
        appId: "1:502132303092:web:8da40e9a6ca77f06f4aaa1",
        measurementId: "G-TCXYYFVX3D"
};


let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();


// call this function every 2 hour automatically to delete old Trash memes

async function deleteOldTrashMemes() {
  if(auth?.currentUser?.uid){
    const trashMemesRef = collection(db, 'memes', auth.currentUser.uid, 'Trash');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const q = query(trashMemesRef, where('deletedAt', '<', oneMonthAgo));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const storageRef = ref(storage, doc.data().memeURL);
      deleteObject(storageRef);
      deleteDoc(doc.ref);
    });
  }
}

setInterval(deleteOldTrashMemes, 1000 * 60 * 60 * 2);

export { auth, db, storage };
export default app;