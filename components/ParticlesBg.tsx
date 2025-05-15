'use client'

import { useCallback } from "react"
import Particles from "react-tsparticles"
import { css } from "@emotion/react"
import { loadFull } from "tsparticles"

export default function ParticlesBg() {
    const particlesInit = useCallback(async (engine: any) => {
        // エンジンに全機能をロード
        await loadFull(engine)
    }, [])

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
            options={{
                background: {
                    color: {
                        value: "transparent"
                    }
                },
                particles: {
                    number: {
                        value: 80
                    },
                    color: {
                        value: "#ffffff"
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.5,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 3
                    }
                }
            }}
        />
    )
}