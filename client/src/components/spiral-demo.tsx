'use client'
import SpiralAnimation from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'

const SpiralDemo = () => {
  const [startVisible, setStartVisible] = useState(false)

  const navigateToPersonalSite = () => {
    window.location.href = "https://xubh.top/"
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Spiral animation - lowest layer (z-0) */}
      <div className="absolute inset-0 z-0">
        <SpiralAnimation />
      </div>
      
      {/* Logo - middle layer (z-10) behind particles but visible */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
        transition-all duration-1500 ease-out
        ${startVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-48 h-48 object-contain drop-shadow-2xl"
        />
      </div>
      
      {/* Enter button - top layer (z-20) */}
      <div className={`absolute left-1/2 bottom-32 -translate-x-1/2 z-20
        transition-all duration-1500 ease-out delay-500
        ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button 
          onClick={navigateToPersonalSite}
          className="text-white text-2xl tracking-[0.2em] uppercase font-extralight
            transition-all duration-700 hover:tracking-[0.3em] hover:text-gray-300">
          Enter
        </button>
      </div>
    </div>
  )
}

export { SpiralDemo }
