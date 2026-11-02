import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ParallaxStarsBackground } from '@/components/ui/ParallaxStarsBackground'
import { CommunicationFooter } from '@/components/ui/CommunicationFooter'
import { ScrollJourneyLine } from '@/components/ui/ScrollJourneyLine'
import { TransitionEnvironment } from '@/components/ui/TransitionEnvironment'
import { Navigation } from '@/components/navigation/Navigation'
import { ModalPortal } from '@/components/modals/ModalPortal'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { BlogSection } from '@/components/sections/BlogSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { AssistantOrb } from '@/components/assistant/AssistantOrb'
import { useAppStore } from '@/store/useAppStore'
import { useDevice } from '@/hooks/useDevice'
import { detectGpuTier } from '@/lib/utils'
export default function App() {
  const setGpuTier = useAppStore((state) => state.setGpuTier)
  const setReducedMotion = useAppStore((state) => state.setReducedMotion)
  const device = useDevice()

  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setGpuTier(detectGpuTier())
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    // always dark
    document.documentElement.dataset.theme = 'dark'

    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 800)
    }
  }, [setGpuTier, setReducedMotion])

  const handleLoadComplete = () => {
    setRevealed(true)
  }

  return (
    <>
      <a className="skip-link" href="#main-scroll">Skip to main content</a>
      {/* Loading screen — shown on first visit */}
      {!revealed && (
        <LoadingScreen
          onComplete={handleLoadComplete}
          reducedMotion={device.reducedMotion}
          isLowPower={device.isLowPower}
        />
      )}

      <ParallaxStarsBackground reducedMotion={device.reducedMotion} />

      {/* Cinematic transition environment layer */}
      <TransitionEnvironment />
      <ScrollJourneyLine />

      {/* HUD + status — hidden on mobile (SystemStatus handles its own responsive) */}

      {/* Navigation */}
      <Navigation />

      {/* Brand logo — fixed top-left, desktop only (mobile nav has its own) */}
      <div
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top))',
          left: 'clamp(52px, 5vw, 72px)',
          zIndex: 'var(--z-nav)' as unknown as number,
          pointerEvents: 'all',
          // hidden on mobile — logo lives inside mobile nav bar
          display: device.isMobile ? 'none' : 'block',
        }}
      >
        <BrandLogo
          onClick={() => {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </div>

      {/* AI Assistant */}
      <AssistantOrb />

      {/* Modal portal — renders into document.body */}
      <ModalPortal />

      {/* Scrollable section host */}
      <main
        id="main-scroll"
        className="portfolio-content"
        tabIndex={-1}
        aria-label="Portfolio content"
        style={{
          position: 'relative',
          zIndex: 'var(--z-sections)' as unknown as number,
          overflowY: 'scroll',
          overflowX: 'hidden',
          height: '100vh',
          scrollSnapType: 'none',
        }}
      >
        <HeroSection revealed={revealed} />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <BlogSection />
        <ContactSection />
        <CommunicationFooter />
      </main>

      {/* Custom cursor — desktop only */}
    </>
  )
}
