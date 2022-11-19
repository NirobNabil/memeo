/* eslint-disable @next/next/no-img-element */
import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import firebase from 'firebase/app'
import {db, auth} from '../../../firebase'

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

 import Image from 'next/image';


 import { connect } from 'react-redux'


function Users (props) {
  
    const {element, setChatuser } = props
    const [recipientid, setRecipientid] = useState('')
    const [recipimg, setRecipimg] = useState('')
    const [recipname, setRecipname] = useState('')
    const [msg, setMsg] = useState('')
    const [user, setUser] = useState(null);
    const [reciponline, setReciponline]= useState(false)


    const reg = /((?:(?!(?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)).)+)|((?:https?|ftp):\/\/[\S]*\.(?:png|jpe?g|gif|svg|webp)(?:\?\S+=\S*(?:&\S+=\S*)*)?)/gm
    function ytVidId(url) {
      var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false
    }

    function determineMsgtype(msg){
      if(msg){
        if(msg?.base64){
          return `<span style='font-size: 0px; position: absolute'>${msg.message}</span><img src="${msg.message}"/>`
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
          return msg.message.replace(reg, (_, text, img) => text ? `<p>${text.trim()}</p>` : `<img src="${img}" />`)
        }
      }

    }
    function lastMsg(msg) {
      if(msg) {
        if(msg?.senderid === user?.uid) {
          return `<p>You:</p> ${determineMsgtype(msg)}`
        } else {
          return determineMsgtype(msg)
       }
      }
    }

    useEffect(() => {
      if(props?.user){
        setUser(props.user)
      }
    }, [props?.user])

    useEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, 'conversations', element.uid, 'messages'), orderBy('msgdate', 'desc'), limit(1)), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if(change.type === 'added'){
            setMsg(change.doc.data())
          }
        })
      })
      return unsubscribe
    }, [element]);

    useEffect(() => {
      if(element && user){
        let recipient = element.uids.filter(el => el !== user.uid)[0]
        let userObj = element.users.filter(el => el.uid !== user.uid)[0]
        setRecipientid(recipient)
        setRecipimg(userObj?.photoURL)
        setRecipname(userObj?.name)
        getDoc(doc(db, 'users', recipient)).then((doc) => {
          setReciponline(doc?.data()?.online || false);
        })
      }
    }, [element, user])

    


return (
   <>
   <div className='activelink card p-1 bg-slate-700 dark:bg-gray-500 cursor-pointer my-1'
    onClick={()=>{ 
      setChatuser(recipientid)
     }
      }>
      <div className="user">
        <div className="relative">
        {recipimg && <img className="w-10 h-10 rounded-full" src={recipimg} alt=""/>}
          <span className={`bottom-3 left-7 absolute  w-3.5 h-3.5 ${reciponline ? "bg-green-400" : "bg-red-400"} border-2 border-white dark:border-gray-800 rounded-full`}></span>
        </div>
         
        <div className="info flex flex-col">
          <p className='username'>
            {
            recipname?.length > 15 ?
            recipname.slice(0, 15) + '...' : recipname
            }
            </p>
            
            <small dangerouslySetInnerHTML={{__html: lastMsg(msg)}}></small>        
          </div>
      </div>
  </div>
  </>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.data.currentUser
  }
}

export default connect(mapStateToProps)(Users);