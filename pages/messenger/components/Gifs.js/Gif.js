import React from 'react'
import axios from 'axios'

import Search from './Search'
import Hoverablebutton from '../Hoverablebutton';
import Hoverableicondiv from '../Hoverableiconsdiv';
import {db, auth} from '../../../../firebase'
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
  arrayUnion,
  arrayRemove,
 } from "firebase/firestore";


import { useSelector } from 'react-redux';

export default function Gif(props) {
    // STATEs
    const {setGif, convoid, chatuser, notifibool, chatimg }= props
    const [data, setData] = React.useState([]);
    const [title, setTitle] = React.useState('Gif');
    const [loader, setLoader] = React.useState(true);
    const [offset, setOffset] = React.useState(0);
    const [limit, setLimit] = React.useState(10)
    const [totalCount, setTotalCount] = React.useState(0)
    const [search, setSearch] = React.useState('');
    const [trending, setTrending] = React.useState(false)
    const [trendSearch, setTrendSearch] = React.useState(false)
    const [tSearch, setTsearch] = React.useState([])
    const [user, setUser] = React.useState(null);
    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if(user){
        setUser(user)
        }
    }, []);
//
// ─── FETCH ──────────────────────────────────────────────────────────────────────
const fetchData = async (title)=>{
let URL = `https://api.giphy.com/v1/gifs/search?q=${title}&api_key=nn7ZohI4KJCwSXdYVpViEi7RkUmJacV3&limit=${limit}&offset=${offset}`;
// Try and catch
try{
    let fetchGif = await axios(URL);
    let fetchRes = await fetchGif;
    if(fetchRes.status === 200){
    // Set Data
    setData(fetchRes.data.data)
    // Set Total Count
    setTotalCount(fetchRes.data.pagination.total_count)
    // Set loader false
    setLoader(false)
     // Call new content
     content()
     // Set fetch random false
     if(trending){
     setTrending(false)
    // Reset offset
    setOffset(0)
     }
     // Set trend searching
     setTrendSearch(false)
    
    }
}
catch(error){
    if(error) throw error
}

}
// Remove image
// const removeImage = id => {
//     setData(
//      data.filter(gif => gif.id !== id)
//     )
//   }
// USE EFFECT on offset change fetch new data
React.useEffect(()=>{

    if(!trending){
    fetchData(title)
    }
},[offset])

 //
 // ─── HANDLE DOWNLOAD ────────────────────────────────────────────────────────────
     
const handleDownload = (url)=>{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function(){
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(this.response);
        let tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = title.charAt(0).toUpperCase() + title.slice(1);
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}

// Scroll on top function
const onTop = () => {
    let options = { top: 0, left: 0, behavior: 'smooth' };
    window.scrollTo(options);
}

// Handle Next Pagination
const handleNext = ()=>{
    // Set loader true
    setLoader(true);
    // Add one page
    setOffset(offset + limit)
    // Go on top
    onTop()
}
// Handle prev Pagination
const handlePrev = ()=>{
    // Loader true
    setLoader(true);
    // One page
    setOffset(offset - limit) 
    // Go on top
    onTop()
}
function sendGif(img){
    let msgobject = {
        message: img,
        reaction1: "",
        reaction2: "",
        msgdate: new Date(),
        read: false,
        senderid: user.uid,
        editing: false,
        nobackground: true,
        emoji: true,
        base64: true
      };
      // Add message to db
        addDoc(collection(db, 'conversations', convoid, 'messages'), msgobject);
        
        let notificationobj = {
            notifimsg: img,
            notifidate: new Date(),
            read: false,
            sender: user.name,
            gif: true,
            id: convoid,
            senderid: user.uid,
            photoURL: user.photoURL,
          } 
          if(notifibool){
            addDoc(collection(db, 'users', chatuser, 'notifications'), notificationobj);
          }
}
 //
 // ─── RENDER CONTENT ─────────────────────────────────────────────────────────────
     
const content = () => {
    switch(true) {
    // If loader is true show loader spinner
      case loader:
        return <div>Loading...</div>
    // If data array more than zero loop through
      case data.length > 0:
        return  data.map(g => {
            return (
                <div className='gif-card' key={g.id}>
                   <img className='image' onClick={() => sendGif(g.images.fixed_height.url)} src={g.images.fixed_width.url} alt="gif"/>
                </div>
            )
        })

    // Otherwise return default
      default:
        return data
    }
  }

//
// ─── RETURN ─────────────────────────────────────────────────────────────────────
    
return (
    <div className='gif bs'>
        <header>
        <i className="fal fa-times" onClick={()=>setGif(false)}></i>
        <h2>Search GIFs</h2>
        <Search search={search} setSearch={setSearch} fetchData={fetchData} setTitle={setTitle}/>

        </header>
    
        <div className='gif-wrap'>
      
        {trendSearch ? 
        (
            <div className='gif-trend-search'>
            <ul> 
            {tSearch.map((t,i)=> <li key={i}><strong>{i + 1}</strong> {t.toUpperCase()}</li>)}
            </ul>
            </div>
        )
        :
        ''
        }
          {content()}
        </div>
        <div className="flexrow np-btn">
        <button className='themeBtn flex' s onClick={handlePrev}><i className="fas fa-backward"></i></button>
        <button className='themeBtn flex' onClick={handleNext}><i className="fas fa-forward"></i></button>
        </div>

       
    </div>
)
}
