/* eslint-disable @next/next/no-page-custom-font */
import React, {useState, useEffect} from "react";
import {
  db,
  auth,
  storage,
} from '../../firebase';
import Body from './components/Body'
import ContextAppProvider from './ContextAPI'

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  endBefore,
  startAt,
  endAt,
  increment,
  decrement,
  runTransaction,
  writeBatch,
  addDoc,
  getFirestore,
  getDocFromCache,
} from 'firebase/firestore';

import { fetchUserAgain } from '../../redux/actions/index'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { useRouter } from 'next/router'



function App(props) {
  const router = useRouter();

  if(props?.data?.currentUser?.uid === undefined){
    auth.onAuthStateChanged((user) => {
      if(user){
        props.fetchUserAgain(user.uid)
      }
    })
  }


  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        props.fetchUserAgain(user.uid)
      }
    })
  }, [])
  


  return ( 
      <ContextAppProvider>
          <Body id={router?.query?.id}/>
      </ContextAppProvider>
  );
}

const mapStateToProps = (state) => {
  return {
    data: state.data
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchUserAgain }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)