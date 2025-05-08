'use client'

import { useCallback } from "react"
import Particles from "react-tsparticles"
import { css } from "@emotion/react"
import { Engine } from "tsparticles-engine"

export default function ParticlesBg() {
    const particlesInit = useCallback(async (engine: Engine) => {
        // エンジン初期化をスキップします
        // loadFullの代わりに何もしない
    }, [])

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: "#000"
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