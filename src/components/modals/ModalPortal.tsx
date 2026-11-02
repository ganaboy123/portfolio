import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { gsap } from "@/lib/animation"
import { useAppStore } from "@/store/useAppStore"
import { projects, blogPosts } from "@/data/content"
import { HUDLabel } from "@/components/ui/primitives/HUDLabel"
import { GlowLine } from "@/components/ui/primitives/GlowLine"
import { TechBadge } from "@/components/ui/primitives/TechBadge"
import { StatusIndicator } from "@/components/ui/primitives/StatusIndicator"
import { useCursor } from "@/hooks/useCursor"
import { formatDate } from "@/lib/utils"
import { useFocusTrap } from "@/hooks/useFocusTrap"

export function ModalPortal() {
  const activeModal = useAppStore((s) => s.activeModal)
  const closeModal = useAppStore((s) => s.closeModal)
  if (!activeModal) return null
  return createPortal(<ModalInner onClose={closeModal} config={activeModal} />, document.body)
}

interface ModalConfig {
  type: "project" | "blog" | "skill"
  id: string
}
interface ModalInnerProps { config: ModalConfig; onClose: () => void }

function ModalInner({ config, onClose }: ModalInnerProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const cursor = useCursor()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      gsap.fromTo(panelRef.current, { y: 32, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" })
    })
    return () => ctx.revert()
  }, [])

  const handleClose = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.25 })
    gsap.to(panelRef.current, { y: 16, opacity: 0, scale: 0.97, duration: 0.25, onComplete: onClose })
  }

  useFocusTrap(panelRef, true, handleClose)

  const z = "var(--z-modal)" as unknown as number

  return (
    <>
      <div ref={backdropRef} onClick={handleClose} style={{ position: "fixed", inset: 0, background: "rgba(3,4,10,0.75)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: z }} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(680px,92vw)", maxHeight: "85vh", zIndex: 41, background: "rgba(10,13,24,0.96)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-lg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "var(--shadow-modal)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(56,189,248,0.3),transparent)" }} />
        <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div id="modal-title"><HUDLabel variant="cyan">{config.type.toUpperCase()} / {config.id.toUpperCase()}</HUDLabel></div>
          <button onClick={handleClose} onMouseEnter={() => cursor.set("hover")} onMouseLeave={cursor.reset} aria-label="Close" style={{ background: "none", border: "1px solid var(--color-border-default)", color: "var(--color-text-tertiary)", width: 28, height: 28, borderRadius: "var(--radius-sm)", cursor: "none", fontFamily: "var(--font-mono)", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
          {config.type === "project" && <ProjectBody id={config.id} />}
          {config.type === "blog" && <BlogBody id={config.id} />}
        </div>
      </div>
    </>
  )
}

function ProjectBody({ id }: { id: string }) {
  const p = projects.find((x) => x.id === id)
  if (!p) return <HUDLabel>NOT FOUND</HUDLabel>
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-text-primary)", marginBottom: 4 }}>{p.title}</h2>
          <HUDLabel variant="cyan">{p.subtitle}</HUDLabel>
        </div>
        <StatusIndicator status={p.status === "live" ? "online" : "processing"} showPing={p.status === "live"} size="md" label={p.status.toUpperCase()} />
      </div>
      <GlowLine color="cyan" style={{ marginBottom: 20 }} />
      <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 24 }}>{p.description}</p>
      <div style={{ marginBottom: 16 }}>
        <HUDLabel variant="dim" style={{ display: "block", marginBottom: 10 }}>TECHNOLOGY STACK</HUDLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{p.tags.map((t) => <TechBadge key={t} variant="cyan">{t}</TechBadge>)}</div>
      </div>
      <HUDLabel variant="dim">YEAR: {p.year}</HUDLabel>
    </div>
  )
}

function BlogBody({ id }: { id: string }) {
  const post = blogPosts.find((x) => x.id === id)
  if (!post) return <HUDLabel>NOT FOUND</HUDLabel>
  return (
    <div>
      <HUDLabel variant="violet" style={{ display: "block", marginBottom: 10 }}>{formatDate(post.date)}</HUDLabel>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-text-primary)", lineHeight: 1.3, marginBottom: 20 }}>{post.title}</h2>
      <GlowLine color="violet" style={{ marginBottom: 20 }} />
      <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 24 }}>{post.excerpt}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{post.tags.map((t) => <TechBadge key={t} variant="violet">{t}</TechBadge>)}</div>
        <HUDLabel variant="dim">{post.readTime} MIN READ</HUDLabel>
      </div>
    </div>
  )
}
