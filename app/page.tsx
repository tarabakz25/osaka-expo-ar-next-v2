"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Particles from "@/components/ParticlesBg"
import WaterEffect from "@/components/WaterEffect"
import Manual from "@/components/Landing/Manual"
import Title from "@/components/Landing/Title"


export default function Home() {
  const [showTitle, setShowTitle] = useState(false)
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowTitle(true), 0)

    setTimeout(() => setShowManual(true), 4000)
    setTimeout(() => setShowTitle(false), 4000)
  }, [])

  
  return (
    <div>
      <Particles />
      <div>
        {showTitle && <Title />}
        {showManual && <Manual />}
      </div>
    </div>
  )
}