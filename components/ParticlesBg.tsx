import { useCallback } from "react"
import type { Container, Engine } from "tsparticles-engine"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim"

export default function ParticlesBg() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine)
    }, [])

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        console.log(container)
    }, [])

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
                particles: {
                    number: {
                        value: 100,
                        density: {
                            enable: true,
                            value_area: 800
                        }
                    },
                    color: {
                        value: "#6FB8E3"
                    },
                    shape: {
                        type: "circle",
                        stroke: {
                            width: 0,
                            color: "#6FB8E3"
                        }
                    },
                    opacity: {
                        value: 0.5,
                        random: true
                    },
                    size: {
                        value: 5,
                        random: true
                    },
                    links: {
                        enable: false,
                        distance: 150,
                        color: "#888888",
                        opacity: 0.6,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 0.5,
                        direction: "top",
                        random: true,
                        straight: false
                    }
                },
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "repulse"
                        },
                        onClick: {
                            enable: true,
                            mode: "push"
                        },
                        resize: true
                    }
                },
                detectRetina: true
            }}
        />
    )
}