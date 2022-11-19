import React from 'react'
import { CSSTransition } from "react-transition-group";
import Hoverableicondiv from "./Hoverableiconsdiv";
import Dialogue from "./Dialogue";
import Chatviewrow from './Chatviewrow'



export default function SmallChatView(props) {

   const { convos, setChatopen, chatopen, chatuser, setChatuser, chatstarted, setChatstarted , chatview, setChatview } = props;

   const usersRow = convos?.map((el, index)=>{
    return <div key={index} className="profilepic">
                <Chatviewrow el={el} setChatopen={setChatopen} chatopen={chatopen} chatuser={chatuser} setChatuser={setChatuser}   setChatstarted={setChatstarted} setChatview={setChatview} />
            </div>
    })

  return (
    <>
        <Hoverableicondiv  classNames={"chatdiv flex bs"} icon={"comment"} state={chatview} setState={setChatview}/>
        <CSSTransition in={chatview} timeout={300} unmountOnExit classNames='chatusers'>
          <div className="chatusers bs bg-white dark:bg-slate-800 ">
            <h2>Chat</h2>
            <div className="users flex-row bg-white dark:bg-slate-800">
              <i className="fal fa-times" onClick={()=> setChatview(false)} style={{color: 'var(--theme-color)', position: 'absolute', top: '15px',right: '20px'}}></i>
                    {usersRow}
                  </div>
            </div>
          </CSSTransition>

          <CSSTransition 
            in={chatstarted}
            classNames='chatview'
            unmountOnExit 
            timeout={300}
          >
            <div className='chatview bs bg-white dark:bg-slate-800' 
            style={{
              right: chatview?'330px':'50px',
              width: chatview ? 'calc(77% - 380px)':'calc(29% - 100px)',
              height: 'calc(100% - 100px)',
              bottom: '0px',
              minWidth: '300px',
            }}>
                <div className="">
                  <div className="dialogue bg-white dark:bg-slate-800">
                     <Dialogue type={'small'} chatuser={chatuser} icon='fal fa-times' setState={setChatstarted} />     
                  </div>
                </div>
            </div>
          </CSSTransition>
    </>
  )
}
