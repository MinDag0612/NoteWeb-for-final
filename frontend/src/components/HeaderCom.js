import React from 'react'
import ButtonCom from './ButtonCom'
import "./HeaderCom.css"

export default function HeaderCom( {userName }) {
  return (
    <>
    <div className='header-block w-100 d-flex flex-row align-items-center p-3 mb-3'>
        <div className='web-name p-2'>
            <h2 className='m-0'><b>Notify's</b></h2>
            <p className='m-0'>{userName}</p>
        </div>

        <div className='m-0 ms-auto'>
        <button type="button" class="btn btn-outline-light">Logout</button>
        </div>
    </div>
    </>
  )
}
