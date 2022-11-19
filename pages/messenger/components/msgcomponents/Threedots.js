
import React, {useState, useEffect, useRef} from 'react'
import Contextoptions from './Contextoptions'
import {db, storage} from '../../../../firebase'
import Contextmenu from '../Contextmenu'
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
import { 
  deleteObject,
  ref,
  getStorage,
  listAll,
  
} from 'firebase/storage'





function Threedots (props) {

  const {msg, user, msgs, convoid } = props
  const [visible, setVisible] = useState(false)
  const [emojis, setEmojis] = useState(false)
  const [msgidedit, setMsgidedit] = useState('')
  const threedots = useRef()


  useEffect(() => {
    if(typeof window !== 'undefined'){
      document.addEventListener('click', function(e){
        if(e.target !== threedots.current){
          setVisible(false)
          setEmojis(false)
        }
      })
    }
  }, [])
 
  const allemojis = [
  {
    class: 'smile-wink yellow',
    msg: 'Wink',
    color: 'blue'
  },
  {
    class: 'kiss-beam red',
    msg: 'Love',
    color: 'red'
  },
  {
    class: 'grin-stars yellow',
    msg: 'Stars',
    color: 'blue'
  },
  {
    class: 'grin-squint-tears yellow',
    msg: 'Laugh',
    color: 'red'
  },
  {
    class: 'frown red',
    msg: 'Frown',
    color: 'blue'
  },
  {
    class: 'heart red',
    msg: 'Like',
    color: 'red'
  }
    ] 
    function sendReaction(opt){
      msgs && msgs?.map(msg => {
          if(msgidedit === msg.id){
            if(msg?.senderid === user.uid){
              updateDoc(doc(db, "conversations", convoid, "messages", msg.id), {
                reaction1: `fas fa-${opt}`,
              }, {merge: true})
            }else {
              updateDoc(doc(db, "conversations", convoid, "messages", msg.id), {
                reaction2: `fas fa-${opt}`,
              }, {merge: true})
            }
          }
      })
    }
    const emojisrow = allemojis && allemojis.map((emoji, index)=>{
      return <i 
      key={index}  
      className={'fas fa-' + emoji.class} 
      onClick={()=>{sendReaction(emoji.class); setVisible(false)}}
      style={{
        cursor: 'pointer', 
        color: emoji.color,
        background: 'transparent',
      }}
      />
    })
    const contextoption = useRef()
    const emojiref = useRef()

 
  function copyMsg(){
    var r = document.createRange()
    let text = document.querySelector(`#${"u" + msgidedit} .msg`)
    if(text){
      r.selectNode(text)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(r)
      document.execCommand('copy')
      window.getSelection().removeAllRanges()
      setVisible(false)
    }
  }

  function deleteMsg(){
    msgs && msgs.map(msg => {
      if(msgidedit === msg.id && msg?.senderid === user?.uid){
        let itemindex = msgs.indexOf(msg)
        msgs.splice(itemindex, 1) 
        deleteDoc(doc(db, 'conversations', convoid, 'messages', msg?.id));
        if(msg?.video || msg?.audio  || msg?.image || msg?.file){
            const storageDownloadURL = ref(storage, msg.message);
            deleteObject(storageDownloadURL)
        }
       
        setVisible(false)
      }
  })

  }
 

  return (
    <div className='text-slate-500 dark:text-white'>
      <i ref={threedots} onClick={(e)=>{setMsgidedit(msg.id); setVisible(!visible)}} 
      className={`${msg?.senderid === user?.uid ?"fal fa-ellipsis-v-alt rightdots ":'fal fa-ellipsis-v-alt leftdots'} text-white dark:text-slate-900`}
      style={{
        color: 'slateblue',
      }}
      ></i>
      <div onContextMenu={(e)=>e.preventDefault()} onClick={(e)=>e.stopPropagation()} className='flexrow optionsEdit bg-white dark:bg-slate-900 ' ref={contextoption} data-id={msg?.msgid} 
      style={{
        display: visible?'flex':'none',
        padding: '5px 10px',
        }}>
      <div className="emojisdiv">
      <Contextoptions classNames={'laugn'} icon={'fas fa-laugh'} setState={setEmojis} re={emojiref}/>
      <div  onClick={(e)=> e.stopPropagation()} className="emojisrow flexrow bs" style={{
        display: emojis ?'flex':'none',  zIndex: 'var(--high-priority)',
        padding: '5px 2px',
        }}>
        {emojisrow}
      </div>
      </div>
       <Contextoptions classNames={'copy'} icon={'fas fa-copy'} function1={() => copyMsg()}/>
       <Contextoptions classNames={'delete'} icon={'fas fa-trash'} function1={()=> deleteMsg()}/>
      </div>
    </div>
      )
}
export default Threedots