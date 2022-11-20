import React, {  useState, useEffect } from 'react'

import AudioReactRecorder, { RecordState } from 'audio-react-recorder'
import styled from 'styled-components'  
import { db, auth, storage } from '../../../firebase'
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

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
 } from "firebase/firestore"


import {
    uploadBytes,
    getDownloadURL,
    ref,
    getStorage,
    deleteObject,
    listAll,
    list,
    listRef,
    getMetadata,
    updateMetadata,
    UploadTask,
    UploadTaskSnapshot,
    uploadBytesResumable,
} from "firebase/storage"



const Iconspecial = styled.i `
color: #fff;
background-color: #3b82f6;
&:hover {
  color: #fff;
  background-color: #e6e6e6;
}
`


function Recorder(props) {
  
  const {convoid, progressbar, progresswidth } = props
  const [record, setRecord] = useState(null)
  const [clicked, setClicked] = useState(false)
  const [reset, setReset]=useState(false)
  const user = useSelector(state => state?.data?.currentUser)
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(0)
  const [intervalId, setIntervalId] = useState('')


  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])


  function startRecord() {
    start()
    setClicked(true)
    setIntervalId(setInterval(() => {
        setTime(prev => prev + 1)
    }, 1000));
}

function stopRecord() {
    setTime(0)
    stop()
    setClicked(false)
    clearInterval(intervalId);
}
function resetRecord(){
  setReset(true)
  stop()
}

  function start() {
    setRecord(RecordState.START)
  }
 
  function stop() {
      setRecord(RecordState.STOP)
  }
  //audioData contains blob and blobUrl
    const onStop = (audioData) => {
    if(!reset && user){
      var reader = new FileReader();
      reader.readAsDataURL(audioData.blob); 
      reader.onloadend = function() {
        var base64data = reader.result;                
        function urltoFile(url, filename, mimeType){
          return (fetch(url)
              .then(function(res){return res.arrayBuffer();})
              .then(function(buf){return new File([buf], filename,{type:mimeType});})
          );
      }

        //Usage example:
        urltoFile(base64data, 'recording.wav','audio/wav').then((file) => {
            const childPath = `conversations/${convoid}/${user?.uid}/${uuidv4()}.wav`;
            const storageRef = ref(storage, childPath);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
              "state_changed",
                (snapshot) => {
                  progressbar.current.style.display = "flex";
                  const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  progresswidth.current.style.height = `${percentage}%`;
                },
                (error) => {
                  console.log(error);
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    let msgobject = {
                      message: downloadURL,
                      reaction: "",
                      msgdate: new Date(),
                      read: false,
                      senderid: user?.uid,
                      editing: false,
                      nobackground: true,
                      emoji: true,
                      base64: false,
                      audio: true
                    };
                    addDoc(collection(db, 'conversations', convoid, 'messages'), msgobject);
                    updateDoc(doc(db, 'conversations', convoid), {
                      lastmsgdate: serverTimestamp(),
                    }, { merge: true })
                  });
                  progressbar.current.style.display = 'none'  
                }
            );
      });
   }

    }else {
      setReset(false)
    }
  }
  
  
  
    return (
      <>
        <AudioReactRecorder state={record} onStop={onStop} />
        {!clicked ? (<Iconspecial  className='icondiv fal fa-microphone bg-slate-50 dark:bg-slate-900 !w-10' onClick={()=>{startRecord(); }}></Iconspecial>
        ) : (
        <div className="spinner-wave" onClick={()=>{stopRecord(); }}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
       
        <span className="time">
          {time}
          </span>
        <Iconspecial  className="left fal fa-times-circle bg-slate-50 dark:bg-slate-900 " onClick={()=>resetRecord()}></Iconspecial>

          </div>
         )}
       
      </>
    )
  }

export default Recorder