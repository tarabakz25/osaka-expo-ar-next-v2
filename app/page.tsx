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

  const delay = 1000
  
  useEffect(() => {
    setTimeout(() => setShowTitle(true), 0)

    setTimeout(() => setShowManual(true), delay)
    setTimeout(() => setShowTitle(false), delay)

    setTimeout(() => setShowManual(false), delay * 2)
    setTimeout(() => setShowSelectProject(true), delay * 2)
  }, [])

  
  return (
    <div>
      <Particles />
      <div className={`flex flex-col items-center text-center h-screen ${showSelectProject ? 'justify-start overflow-y-auto' : 'justify-center'}`}>
        {showTitle && (
          <div className="backdrop-blur-md mx-20 bg-white/10 p-6 rounded-lg">
            <Title />
          </div>
        )}
        {showManual && (
          <div className="backdrop-blur-md mx-20 bg-white/10 p-6 rounded-lg">
            <Manual />
          </div>
        )}
        {showSelectProject && (
          <div className="backdrop-blur-md my-20 mx-10 bg-white/10 p-6 rounded-lg">
            <SelectProject />
          </div>
        )}
      </div>
    </div>
  )
}