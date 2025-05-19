"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Particles from "@/components/ParticlesBg"
import WaterEffect from "@/components/WaterEffect"
import Manual from "@/components/Landing/Manual"
import Title from "@/components/Landing/Title"
import SelectProject from "@/components/Landing/SelectProject"


export default function Home() {
  const [showTitle, setShowTitle] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showSelectProject, setShowSelectProject] = useState(false)

  const delay = 3000
  
  useEffect(() => {
    setTimeout(() => setShowTitle(true), 0)

    setTimeout(() => setShowManual(true), delay)
    setTimeout(() => setShowTitle(false), delay)

    setTimeout(() => setShowManual(false), delay * 2)
    setTimeout(() => setShowSelectProject(true), delay * 2)
  }, [])

  
  return (
    <div className="min-h-screen">
      <Particles />
      <WaterEffect />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className={`transition-opacity duration-1000 ease-in-out ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
          {showTitle && (
            <Title />
          )}
        </div>
        <div className={`transition-opacity duration-1000 ease-in-out ${showManual ? 'opacity-100' : 'opacity-0'}`}>
          {showManual && (
            <div className="backdrop-blur-md mx-10 bg-white/10 p-6 rounded-lg">
              <Manual />
            </div>
          )}
        </div>
        <div className={`transition-opacity duration-1000 ease-in-out ${showSelectProject ? 'opacity-100' : 'opacity-0'}`}>
          {showSelectProject && (
            <SelectProject />
          )}
        </div>
      </div>
    </div>
  )
}