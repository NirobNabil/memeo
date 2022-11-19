/* eslint-disable @next/next/no-img-element */
import React, {useState, useEffect} from 'react'
import firebase from 'firebase/app'
import {db, auth} from '../../../firebase'
import Hoverableicondiv from './Hoverableiconsdiv'
import Link from 'next/link'

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
  setDoc,
 } from "firebase/firestore";

 import { connect } from 'react-redux'

function Users (props) {
 
    const { el, setChatuser, chatuser, setChatstarted, setChatview } = props

    const [recipimg, setRecipimg]=useState('')
    const [recipname, setRecipname] = useState('')
    const [reciponline, setReciponline]= useState(false)
    const [user, setUser] = useState(null);
    const [recipientId, setRecipientId] = useState('');
    const [msg, setMsg] = useState(null);

    const reg = /((?:(?!(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)).)+)|((?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?)/gm

    function ytVidId(url) {
      var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false
    }

  useEffect(() => {
    if(props?.user){
      setUser(props.user);
    }
  }, [props?.user])

  useEffect(()=>{
    if(el?.users && props?.user){
      el.users.map(user=>{
        if(user.uid !== props.user.uid){
          setRecipimg(user.photoURL)
          setRecipname(user.name)
        }
      })
      let uid = el.uids.filter(uid => uid !== props.user.uid)[0];
      setRecipientId(uid);
      getDoc(doc(db, 'users', uid)).then((doc) => {
        setReciponline(doc.data()?.online || false);
      })

    }
  }, [el, props?.user])

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'conversations', el.uid, 'messages'), orderBy('msgdate', 'desc'), limit(1)), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if(change.type === 'added'){
          setMsg(change.doc.data())
        }
      })
    })
    return unsubscribe
  }, [el?.uid]);
      
    


    function determineMsgtype(msg){
      if(msg){
        if(msg?.base64){
          return `<span style='font-size: 0px; position: absolute'>${msg.message}</span><img src=${msg.message} style='width: 22px; height: 22px; object-fit: cover; border-radius: 5px' />`
        }else if(msg?.file){
        return 'Sent a File'
        }else if(msg?.audio){
            return 'Sent a recording'
        }
        else if(msg?.video){
            return 'Sent a video'
        }
        else if(ytVidId(msg?.message)){
          return 'Sent a Video'
        }
        else {
          return msg.message.replace(reg, (_, text, img) => text ? `${text.trim()}` : `<Img src="${img}" />`)
        }
      }
    }

    function lastMsg(msg) {
      if(msg) {
        if(msg?.senderid === user?.uid) {
          return `<p>You: ${determineMsgtype(msg)}</p>`
        } else {
          return `<p>${determineMsgtype(msg)}</p>`
       }
      }
    }


    return (
      <div className='flex flex-row items-center justify-start w-full h-16 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md' 
       onClick={()=>{
        setChatuser(recipientId)}}>
         <div className="relative w-12">
                <img className="w-10 h-10 rounded-full" src={recipimg} alt=""/>
               <span className={`bottom-0 left-7 absolute z-50  w-3.5 h-3.5 ${reciponline ? "bg-green-400" : "bg-red-400"} border-2 border-white dark:border-gray-800 rounded-full`}></span>
          </div>
        <div className='flex flex-col ml-3 justify-between w-full'
        onClick={()=>{
          setChatstarted(true)
        }}
        >
          <div className='flex flex-row justify-between'>
            <p className='text-lg font-semibold'>{recipname}</p>
            <p className='text-xs text-gray-500'>{msg?.msgdate?.toDate().toLocaleTimeString()}</p>
          </div>
          <div className='flex flex-row'>
            <p className='text-sm text-gray-500' dangerouslySetInnerHTML={{__html: lastMsg(msg)}}></p>
          </div>
        </div>
      </div>
    )
}

const mapStateToProps = (state) => {
  return {
    user: state.data.currentUser
  }
}

export default connect(mapStateToProps)(Users)


