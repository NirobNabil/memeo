import React from 'react'
import { db, auth } from '../../../firebase'
import { useSelector }  from 'react-redux'
function Sidebar () {
  const user = useSelector(state => state.data.currentUser)

  return (
    <>
      <div className="logo ">
            <i className="far fa-comments"></i>
            <p>Messenger</p>
        </div>
        <div className="userinfo bs">
           <div className="search">
               <i className="far fa-search"></i>
               <input type="text" placeholder='Search'/>
           </div>
           <div className="bell">
               <div className="notifi"></div>
               <i className="far fa-bell"></i>
           </div>
           <div className="profilepic">
               <img src="https://www.gettyimages.ca/gi-resources/images/500px/983794168.jpg" alt=""/>
                <p>{user?.name}<i className="far fa-chevron-down"></i></p>
          </div>
        </div>
    </>
  )
}
export default Sidebar