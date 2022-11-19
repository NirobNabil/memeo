/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */

import React, {useState, useEffect, useContext} from 'react'
import firebase from 'firebase/app'
import { db, auth } from '../../../firebase'
import { CSSTransition } from 'react-transition-group'
import { ContextApp } from '../ContextAPI'
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

import { connect } from 'react-redux'
 
function Userprofile (props) {


  const { chatuser } = props
  const [convoid, setConvoid] = useState('');
  const [creatorid, setCreatorid] = useState('');
  const [recipientid, setRecipientid] = useState('')
  const [recipname, setRecipname] = useState('')
  const [recipimg, setRecipimg] = useState('')
  const [recipnumber, setRecipnumber] = useState('')
  const [extend, setExtend] = useState(false)
  const [active, setActive] = useState(false)
  const [user, setUser] = useState(null);


  useEffect(() => {
    if(props?.user){
      setUser(props.user);
    }
  }, [props?.user])

  useEffect(() => {
    if(chatuser && user){
      setRecipientid(chatuser);
      setCreatorid(user.uid);
      let uid = [user.uid, chatuser].sort().join("");
      setConvoid(uid);
    }
  }, [chatuser, user]);
 

  useEffect(()=>{
    if(chatuser){
    getDoc(doc(db, 'users', chatuser)).then(doc => {
      const user = doc.data()
      setRecipname(user?.name || '')
      setRecipimg(user?.photoURL || '')
      setRecipnumber(user?.phoneNumber || '')
      setActive(user?.online || false)
    })
  }
  },[chatuser])




  return (
   <>
    <div className="profilepic profilepiccol br-l">
        <div>
          <p>{recipname.length>17?recipname.slice(0, 17)+'...':recipname}</p>
        </div>
        <i className="fal fa-cog"></i>
    </div> 
    <div className="personalinfo br-l flex flex-col">
     <div className='flex flex-row justify-between '><p>Personal info</p>
      <i className={extend ? `fal fa-chevron-up rotate`:'fal fa-chevron-up'} onClick={() => setExtend(!extend)}></i>
      </div>
      <CSSTransition in={extend} classNames='extended' timeout={0} unmountOnExit>
        <div className='extendoff'>
        <hr />
         <div className='flex flex-col my-2'>
           <div className="flex flex-row flexinfo justify-between"><p>Name #</p> <p>{recipname ? recipname : 'N/A'}</p></div>
           <div className="flex flex-row flexinfo justify-between"><p>Phone #</p> <p>{recipnumber===''?'N/A':recipnumber}</p></div>
         </div>
        </div>
      </CSSTransition>
    </div>
    <div className="mutualcontacts br-l pdng flexrow">
    <i className="fal fa-users"></i>
      <p>Mutual Contacts</p>
      <i className="fal fa-ellipsis-h-alt"></i>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.data.currentUser,
  }
}

export default connect(mapStateToProps)(Userprofile)
