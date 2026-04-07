import React from 'react'
import "./ButtonCom.css"

export default function ButtonCom({name, type, onClick}) {
  return (
    <button type={type} className="btn w-100 btn-styled" onClick={onClick}>{name}</button>
  )
}
