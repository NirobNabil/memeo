import React,  { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import { db, auth } from "../firebase";

function HeaderLink({ Icon, text, feed, active, avatar, hidden, handle, Menu, notificationsLength }) {
  const user = useSelector((state) => state.data.currentUser);

 


  return (
    <div
      className={`${
        hidden && "hidden md:inline-flex"
      } cursor-pointer flex flex-col justify-center items-center
      ${Menu && "bg-dark/60 dark:text-white lg:-mb-1.5 space-y-1.5"}
      ${
        feed
          ? " lg:-mb-1.5 space-y-1"
          : "lg:-mb-1.5 space-y-1"
      }
      ${active  ? "text-[#ff4522]" : !Menu &&  "text-gray-600 dark:text-gray-400"}
      `}
      onClick={handle}
    >
     
     <div className="flex items-center justify-center space-x-1 relative">
      {Icon && <Icon className="!h-7 !w-7 lg:!-mb-1" />}
      {!active && notificationsLength > 0 && (
        <div className="bg-red-600 rounded-full h-5 w-5 flex items-center justify-center absolute text-white text-xs font-bold -top-1.5 -right-1.5">
          <p className="text-xs text-white">{
          notificationsLength > 9 ? "9+" : notificationsLength
          }</p>
        </div>
      )}
      </div>
      

      
      

      <h4
        className={`text-sm ${
          feed && "hidden lg:flex justify-center w-full mx-auto"
        }
        `}
      >
        {text}
      </h4>
      {active && (
        <span className="hidden lg:inline-flex h-0.5 w-[calc(100%+20px)] bg-[#ff4522]  rounded-t-full" />
      )}
    </div>
  );
}

export default HeaderLink;