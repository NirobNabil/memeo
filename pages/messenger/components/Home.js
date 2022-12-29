/* eslint-disable react/jsx-key */
import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "../../../firebase";
import Link from 'next/link'

import { ContextApp } from "../ContextAPI";
import Hoverlink from "./Hoverlink";
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

 import { useSelector } from 'react-redux';


function Body(props) {
  const { themecolor } = useContext(ContextApp);
  const [cover, setCover] = useState("");
  const { handleLogout } = props;
  const [user, setUser] = React.useState(null);

  const links = ["chat", "notifications", "settings", "logout"];
  const [notifi, setNotifLength]= useState(0)
  const lnks = [
    { icon: "fal fa-comment-alt", txt: "chat" },
    { icon: "fal fa-bell", txt: "Notifications" },
    { icon: "fal fa-cog", txt: "Settings" },
    { icon: "fal fa-sign-out", txt: "Logout" }
  ];
  // const id =db.collection('users').doc().id

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if(user){
      setUser(user)
    }
  }, []);


  const lnksrow =
    lnks &&
    lnks.map((lnk) => {
      return (
        <Hoverlink  icon={lnk.icon} txt={lnk.txt} handleLogout={handleLogout} />
      );
    });
  function determineTime() {
    const d = new Date();
    if (d.getHours() >= 6 && d.getHours() < 12) {
      return "Good Morning,";
    } else if (d.getHours() >= 12 && d.getHours() < 17) {
      return "Good Afternoon,";
    } else if (d.getHours() >= 17 && d.getHours() < 20) {
      return "Good Evening,";
    } else if (d.getHours() >= 20 && d.getHours() <= 23) {
      return "Good Night,";
    } else if (d.getHours() >= 0 && d.getHours() < 6) {
      return "Good Night,";
    }
  }
  function determinetext() {
    if (user) {
      
        return determineTime() + " " + user.name
      
    }
  }
  
  return (
    <div className="home">
      <div className="header flex sb">
        <h2>{determinetext()}</h2>
      </div>
      <hr />
      <div className="flex fe sticky">
        <h2 className="marginBottom">Navigate</h2>
        <div className="gridobjects bs marginBottom">
          <Hoverlink
            icon="fal fa-comment-alt"
            txt="Chat"
            classNames="blueback one flexrow sa"
            lnk="/messenger/chat"
          />
          <div className="bell">
          <Hoverlink
            icon="fal fa-bell"
            txt="Notifications"
            classNames="blueback two flexrow sa"
            lnk="/notifications"
          />
          <div className="notificount flex">{notifi}</div>
          </div>
          <Hoverlink
            icon="fal fa-cog"
            txt="Settings"
            classNames="blueback three flexrow sa "
            lnk="/settings"
          />
          <Hoverlink
            icon="fal fa-sign-out"
            txt="Logout"
            classNames="blueback four flexrow sa"
            lnk="/"
            clk={() => props.handleLogout()}
          />
        </div>
      </div>
      <hr />
      <div className="homeside">
        <div className="notifications flex bs">
          <h2>Notifications</h2>
          <strong><p>Pending: {notifi}</p></strong>
          <Link href="/notifications" className="flexrow sb">
            <div>
            <p>
              Go to notifications <hr />
            </p>
            <i className="fal fa-arrow-right" style={{ color: themecolor }}></i>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Body;
