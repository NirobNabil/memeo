import React, { createContext, useState, useEffect } from 'react'
import { db, auth } from '../../firebase'

import {
  collection, 
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

import { useSelector } from 'react-redux'

export let ContextApp = createContext({
  notificont: {
    emoji: '',
    msg: ''
  },
  notifi: false,
  setNotificont: ()=>{},
  setNotifi: ()=>{}
})

const ContextAppProvider = (props) => {
  
 
  const [notifi, setNotifi] = useState(false)
  const [notificont, setNotificont] = useState({
    emoji: '',
    msg: ''
  })
  

  
  
  return (
    <ContextApp.Provider value={{ notificont, notifi, setNotificont, setNotifi}}>
      {props.children}
    </ContextApp.Provider>
  )
}
export default ContextAppProvider