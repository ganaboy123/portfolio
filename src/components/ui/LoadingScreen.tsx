import { useCallback, useEffect, useRef, useState } from 'react'

const BOOT_MESSAGES = ['INITIALIZING CORE...', 'LOADING DIGITAL ENVIRONMENT...', 'CALIBRATING VISUAL SYSTEM...', 'ESTABLISHING CONNECTION...', 'SYSTEM READY.'] as const

interface LoadingScreenProps {
    onComplete: () => void
    reducedMotion?: boolean
    isLowPower?: boolean
}

function getCachedResourceHint() {
    return performance.getEntriesByType('resource').some((entry) => {
        const resource = entry as PerformanceResourceTiming
        return resource.transferSize === 0 && resource.decodedBodySize > 0
    })
}

function waitForDocumentReadiness() {
    const pageReady = document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
    const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve()
    return Promise.all([pageReady, fontsReady])
}

/** A brief OS-style boot sequence driven by browser readiness signals. */
export function LoadingScreen({ onComplete, reducedMotion = false, isLowPower = false }: LoadingScreenProps) {
    const [progress, setProgress] = useState(4)
    const [ready, setReady] = useState(false)
    const [revealing, setRevealing] = useState(false)
    const completeRef = useRef(false)

    const finish = useCallback(() => {
        if (completeRef.current) return
        completeRef.current = true
        onComplete()
    }, [onComplete])

    useEffect(() => {
        const cached = getCachedResourceHint()
        const minimumDuration = reducedMotion ? 0 : cached ? 220 : isLowPower ? 420 : 760
        const maximumDuration = reducedMotion ? 90 : cached ? 520 : 2000
        const startedAt = performance.now()
        let cancelled = false

        void waitForDocumentReadiness().then(() => {
            if (!cancelled) setReady(true)
        })

        const timer = window.setInterval(() => {
            const elapsed = performance.now() - startedAt
            setProgress((current) => {
                if (ready || elapsed >= maximumDuration) return 100
                const eased = Math.min(88, 4 + (elapsed / minimumDuration) * 84)
                return Math.max(current, Math.round(eased))
            })
        }, 80)

        const forceReady = window.setTimeout(() => setReady(true), maximumDuration)
        return () => {
            cancelled = true
            window.clearInterval(timer)
            window.clearTimeout(forceReady)
        }
    }, [isLowPower, ready, reducedMotion])

    useEffect(() => {
        if (progress === 100) setRevealing(true)
    }, [progress])

    useEffect(() => {
        if (!revealing) return
        const timer = window.setTimeout(finish, reducedMotion ? 0 : 360)
        return () => window.clearTimeout(timer)
    }, [finish, reducedMotion, revealing])

    const messageIndex = progress >= 100 ? 4 : Math.min(3, Math.floor(progress / 24))
    const compact = isLowPower || reducedMotion

    return (
        <section className="boot-screen" aria-label="Starting Harrison Appiah's portfolio" aria-busy={!revealing}>
            {!compact && <ParticleField />}
            <div className="boot-screen__metadata" aria-hidden><span>HA / OS-01</span><span>{isLowPower ? 'LOW POWER PROFILE' : 'SYSTEM BOOT'}</span></div>
            <div className="boot-screen__console">
                <p className="boot-screen__eyebrow">HARRISON APPIAH / PORTFOLIO NODE</p>
                <div className="boot-screen__messages" aria-live="polite" aria-atomic="true">
                    {BOOT_MESSAGES.map((message, index) => (
                        <p key={message} className={index <= messageIndex ? 'is-active' : ''}><span aria-hidden>{index < messageIndex ? '[OK]' : index === messageIndex ? '[..]' : '[--]'}</span>{message}</p>
                    ))}
                </div>
                <div className="boot-screen__progress" role="progressbar" aria-label="Portfolio loading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div style={{ transform: `scaleX(${progress / 100})` }} /></div>
                <div className="boot-screen__readout"><span>{String(progress).padStart(3, '0')}%</span><span>{ready ? 'CORE READY' : 'VERIFYING RESOURCES'}</span></div>
                {revealing && <div className="boot-screen__identity"><p>IDENTITY CONFIRMED</p><h1>Harrison Appiah</h1><span>COMPUTER SCIENTIST / SOFTWARE ENGINEER</span></div>}
            </div>
            <button className="boot-screen__skip" type="button" onClick={finish}>SKIP INTRO</button>
        </section>
    )
}

function ParticleField() {
    return <div className="boot-screen__particles" aria-hidden>{Array.from({ length: 20 }, (_, index) => <span key={index} style={{ left: `${(index * 37) % 100}%`, top: `${(index * 61) % 100}%`, animationDelay: `${(index % 7) * 0.35}s` }} />)}</div>
}
