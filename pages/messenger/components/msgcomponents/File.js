import React, {useState, useEffect} from 'react'

function File (props) {
  const {link, name}= props
  return (

      <a href={link} target='_blank' className='file' rel="noreferrer"><i className='fal fa-file'> </i><span>Download {name}</span></a>

  )
}
export default File