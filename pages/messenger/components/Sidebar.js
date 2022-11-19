import React, {useState, useEffect, useContext} from 'react'
import Link from 'next/link'
import firebase from 'firebase/app'
import { db, auth } from '../../../firebase'
import {ContextApp} from '../ContextAPI'
import {
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
  getDoc,
  doc,
  getDocs,

} from 'firebase/firestore';

import { useTheme } from 'next-themes'


function Sidebar (props) {

  const {theme, setTheme} = useTheme()

  return (
   <>
        <div className="flex flex-col space-y-5 w-10 items-center justify-center bg-white-50 dark:bg-slate-700/60 ">
          <Link href="/">
            {/* <span> */}
              <i className="fas fa-home"></i>
            {/* </span> */}
          </Link>
            {/* <span>
              <i className="fas fa-bell"></i>
            </span> */}
            {/* <span>
              <i className="fas fa-cog"></i>
            </span> */}
            {theme === 'dark' ? (
              <span  onClick={() => setTheme('light')}>
                <i className="fas fa-sun"></i>
              </span>
            ) : (
              <span  onClick={() => setTheme('dark')}>
                <i className="fas fa-moon"></i>
              </span>
            )}
            {/* <span  onClick={()=>{""}}>
               <i className="fas fa-sign-out-alt"></i>
              </span> */}
        </div>    

  </>
  )
}
export default Sidebar