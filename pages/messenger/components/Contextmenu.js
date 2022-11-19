/* eslint-disable react/jsx-key */
import React, { useEffect, useRef, useState } from 'react'
import {CSSTransition} from 'react-transition-group'
import { db, auth, storage } from '../../../firebase'
import firebase from 'firebase/app'
import { ContextApp } from '../ContextAPI'
import Hoverabletexticonflexrow from './Hoverabletexticonflexrow'
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
 } from "firebase/firestore"
 import { 
  deleteObject,
  ref,
  getStorage,
  listAll,
  
} from 'firebase/storage'

import { connect } from 'react-redux'

const Contextmenu = (props) => {


  const [user, setUser] = useState(null)
  const {themebool, emojibool,type ,copy,convoid,contextmenu, setContextmenu, contextstyle, msgid} = props
  const [events, setEvents] = useState(false)
  const [visible, setVisible] = useState(false)
  const emojis = ['smile','angry','sad-cry','surprise']
  const contextmenuSelector = useRef()


  useEffect(()=>{
    if(props?.user){
      setUser(props.user)
    }
  },[props?.user])


  useEffect(() => {
    if(typeof window !== 'undefined'){
      document.addEventListener('click', function(e){
        const target = e.target
        if(target !== contextmenuSelector.current){
          setContextmenu(false)
        }
      })
    }
  }, [])

  

  const allemojis = [{
    class: 'surprise yellow',
    msg: 'Surprised'
  },{
    class: 'tired blue',
    msg: 'Tired'
  },
  {
    class: 'smile-wink yellow',
    msg: 'Wink'
  },
  {
    class: 'kiss-beam red',
    msg: 'Like'
  },
  {
    class: 'grin-stars yellow',
    msg: 'Stars'
  },
  {
    class: 'grin-squint-tears yellow',
    msg: 'Laugh'
  },
  {
    class: 'grimace yellow',
    msg: 'Grimace'
  }, 
  {
    class: 'frown red',
    msg: 'Frown'
  },
  {
    class: 'heart red',
    msg: 'Love'
  }
    ] 
 
  function sendReaction(opt){
    getDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1))).then((docdata)=>{
      if(docdata.exists){
        if(docdata.data()?.senderid === user?.uid){
          updateDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1)), {
            reaction1: `fas fa-${opt}`
          }, {merge: true})
        }
        else{
          updateDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1)), {
            reaction2: `fas fa-${opt}`
          }, {merge: true})
        }
      }
      setContextmenu(false)
    })
  }

  function copyFunc(msgid){
    var r = document.createRange()
    let text = document.querySelector(`#${msgid} .msg`)
    r.selectNode(text)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(r)
    document.execCommand('copy')
    window.getSelection().removeAllRanges()
    setContextmenu(false)
  }

  function deleteFunc(){
    getDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1))).then((docdata)=>{
      if(docdata.exists){
        if(docdata.data()?.senderid === user?.uid){
        deleteDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1)))
        if(docdata.data()?.video || docdata.data()?.image || docdata.data()?.audio || docdata.data()?.file){
          const storageDownloadURL = ref(storage, docdata.data().message);
          deleteObject(storageDownloadURL)
        }
       
        setContextmenu(false)
        }
      }
    })
  }
  function editFunc(){
          let edit = document.querySelector(`#${msgid} p`)
          edit.setAttribute('contentEditable', 'true')

          edit.oninput = (e)=>{
            if(e.target.innerText.length > 0 && e.target.innerText[e.target.innerText.length-1] === '\n'){
            updateDoc(doc(db, 'conversations', convoid, 'messages', msgid.slice(1)), {
              message: e.target.innerText.slice(0, e.target.innerText.length-1),
              editing: true
            }, {merge: true})
            edit.setAttribute('contentEditable', 'false')
            setContextmenu(false)
           }
          }
          setContextmenu(false)

    }
  const emojisrow = emojis?.map((opt, index) =>{
    return <div 
    key={index} 
    onClick={() => sendReaction(opt)}> <i className={'fad fa-'+( opt === 'cry'?'sad-cry': opt)} ></i>  </div>

  })
  const allemojisrow = allemojis?.map((emoji, index) =>{
    return <div key={index} onClick={() => sendReaction(emoji.class)}>
             <i 
             style={{color: emoji.class.includes('red')?'red': emoji.class.includes('blue')?'blue': 'yellow'}}
             className={emoji.className === 'heart red'?'fas fa-'+emoji.class:'fas fa-'+ emoji.class}></i>
            <p 
            style={{
              color: 'gray',
            }}
            >{emoji.msg}</p>
    </div>
  })
  
 


  return (
    <>
    {
      type === 'msg'?   <div  ref={contextmenuSelector}  onContextMenu={(e)=>e.preventDefault()} className="contextmenu dark:bg-slate-900 bg-white  bs" 
      style={{display: contextmenu?'flex':'none', left: contextstyle.left+'px', top: contextstyle.top+'px'}}
      >
       <div className='emojis'
       >{emojisrow}</div>
       <div className={'option laugh' } onMouseOver={()=>setVisible(true)} onMouseLeave={()=>setVisible(false)}>
         <i className='fas fa-laugh'></i> <p>Reaction</p>
         <CSSTransition
          in={visible}
          timeout={200}
          classNames="drophover"
          unmountOnExit
          >
        <div className='dropmenu bs dark:bg-slate-900 bg-white'>
        {allemojisrow}
        </div>
        </CSSTransition>
        </div>
    <div className={'option copy'} onClick={()=>copyFunc(msgid)}>
    <i className='fal fa-copy'></i> <p>Copy</p>
   </div>    
   <div className={'option edit'} onClick={()=>editFunc()}>
    <i className='fal fa-edit'></i> <p>Edit</p>
   </div>

   <div className={'option delete'} onClick={()=>deleteFunc()}>
    <i className='fal fa-trash'></i> <p>Delete</p>
   </div>
    </div>
    :type === 'settings'?
    <div ref={contextmenuSelector}  onContextMenu={(e) => e.preventDefault()} className="contextmenu bs" style={{display: contextmenu?'flex':'none', left: contextstyle.left+'px', top: contextstyle.top+'px'}}>
        
        {(emojibool === true ||  themebool === true ||type === 'settings')?'':<>
        <Hoverabletexticonflexrow classNames={'option'} functionOne={()=>props.setThemebool(true)} icon={'adjust'} text={'Theme'}/>
        <Hoverabletexticonflexrow classNames={'option'} functionOne={()=>props.setEmojibool(true)} icon={props.emojitype} text={'Emoji'}/>
        </> }
        <Hoverabletexticonflexrow classNames={'option'} functionOne={()=>window.location.reload()} icon={'sync'} text={'Reload'}/>
        <Hoverabletexticonflexrow classNames={'option'} functionOne={()=>""} icon={'long-arrow-alt-right'} text={'Forward'}/>
        <Hoverabletexticonflexrow classNames={'option'} functionOne={()=>""} icon={'undo'} text={'Previous'}/>
       
    </div>
    :
    ''
    }
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.data.currentUser
  }
}

export default connect(mapStateToProps)(Contextmenu)


