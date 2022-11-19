import React, {useState, useEffect, useContext} from 'react'

function Input (props) {
  const {type, title, value, setValue, placeholder, changeCSSVar} = props

  return (
   <div className='input flexrow sb'>
     <p>{title}</p>
     {type==='text'?<input required onBlur={(e)=>e.target.style.border='solid 2px #eee'} onFocus={(e)=>e.target.style.border=`solid 2px ${value}`} placeholder={placeholder} type={type} value={value} onChange={(e)=>{setValue(e.target.value)}}/>:
         <input required onBlur={(e)=>e.target.style.border='solid 2px #eee'} onFocus={(e)=>e.target.style.border=`solid 2px ${value}`} placeholder={placeholder} type={type} value={value} onChange={(e)=>{setValue(e.target.value); changeCSSVar(e)}}/>
    }
    </div>
  )
}
export default Input