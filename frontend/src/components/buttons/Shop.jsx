import React from 'react'

const Shop = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-secondary rounded-lg px-6 py-2 flex items-center gap-2"
    >
      <span className="font-semibold text-black">Shop  {" >"}</span>
    </button>
  )
}

export default Shop