import React from 'react'
import Userrow from './Userrow'
import Userprofile from './Userprofile'

import Dialogue from "./Dialogue";




function Paths (props) {


    let { adduser, setAdduser, chatuser, setChatuser, convos, fetchMore} = props



    return ( 
          <div 
           className={`conversations dark:bg-slate-800 bg-white-50 flex flex-col w-full  h-full overflow-hidden`}>
              <div className={"chatcontainer"}>
                  <div className={"userrow spanall shadow-indigo-50 xl:flex hidden p-5 h-screen text-slate-700/100 dark:text-white/60 bg-white-50 dark:bg-slate-800 border-r-2 border-color-white-50 dark:border-slate-800"}>
                    <Userrow chatuser={chatuser} setChatuser={setChatuser} convos={convos} fetchMore={fetchMore} setAdduser={()=> setAdduser(!adduser)}/>
                  </div>
                  {chatuser && (
                    <>
                      <div className='dialogue spanall min-w-max h-screen pt-2 bg-white dark:bg-slate-900/50 dark:text-white border-l border-r dark:border-slate-500 border-x-white/50 border-color-white-50'>
                          <Dialogue chatuser={chatuser}/>
                     </div>
                    <div className="userprofile w-full xl:flex spanall hidden pt-2">
                        <div>
                           <Userprofile chatuser={chatuser} /> 
                        </div>
                     </div>
                    </>
                  )}
              </div>
      </div> 
  )
}
export default Paths