// ─────────────────────────────────────────────────────────────────────────────
//  VOID AUDIO ENGINE
//  Pure Web Audio API — no external files required.
//  All sounds are procedurally synthesized.
//
//  Architecture:
//    AudioEngine singleton owns the AudioContext.
//    All nodes run through a master GainNode so global volume is one knob.
//    Three ambient layers run in background loops.
//    One-shot sounds (click, hover, transition, confirm) are triggered on demand.
//    Never autoplay — context only starts on explicit user interaction.
// ─────────────────────────────────────────────────────────────────────────────

export class AudioEngine {
    private ctx: AudioContext | null = null
    private master: GainNode | null = null
    private ambientNodes: Map<string, { gain: GainNode; source?: AudioBufferSourceNode | OscillatorNode; stop: () => void }> = new Map()
    private _enabled = false
    private _volume = 0.35
    private started = false

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    get enabled() { return this._enabled }
    get volume() { return this._volume }

    async enable(): Promise<void> {
        if (!this.ctx) {
            this.ctx = new AudioContext()
            this.master = this.ctx.createGain()
            this.master.gain.setValueAtTime(this._volume, this.ctx.currentTime)
            this.master.connect(this.ctx.destination)
        }

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume()
        }

        this._enabled = true

        if (!this.started) {
            this.started = true
            this.startAmbient()
        }
    }

    disable(): void {
        this._enabled = false
        this.stopAmbient()
        if (this.ctx) {
            this.ctx.suspend()
        }
    }

    setVolume(v: number): void {
        this._volume = Math.max(0, Math.min(1, v))
        if (this.master && this.ctx) {
            this.master.gain.linearRampToValueAtTime(this._volume, this.ctx.currentTime + 0.1)
        }
    }

    destroy(): void {
        this.stopAmbient()
        this.ctx?.close()
        this.ctx = null
        this.master = null
        this.started = false
        this._enabled = false
    }

    // ── Ambient layers ────────────────────────────────────────────────────────

    private startAmbient(): void {
        if (!this.ctx || !this.master) return
        this.startSpacecraftHum()
        this.startAtmosphere()
        this.startElectronicTexture()
    }

    private stopAmbient(): void {
        this.ambientNodes.forEach((node) => node.stop())
        this.ambientNodes.clear()
    }

    /**
     * Layer 1 — Spacecraft hum: two detuned oscillators (drone)
     * Very low frequency, barely perceptible, creates the sense of machinery
     */
    private startSpacecraftHum(): void {
        if (!this.ctx || !this.master) return
        const ctx = this.ctx

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 3.5)
        gain.connect(this.master)

        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(42, ctx.currentTime)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(43.8, ctx.currentTime) // slight detune = beating

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(180, ctx.currentTime)
        filter.Q.setValueAtTime(0.8, ctx.currentTime)

        osc1.connect(filter)
        osc2.connect(filter)
        filter.connect(gain)

        osc1.start()
        osc2.start()

        this.ambientNodes.set('hum', {
            gain,
            stop: () => {
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
                setTimeout(() => { osc1.stop(); osc2.stop() }, 1600)
            },
        })
    }

    /**
     * Layer 2 — Deep atmosphere: filtered noise
     * Simulates the pressurized environment of a spacecraft hull
     */
    private startAtmosphere(): void {
        if (!this.ctx || !this.master) return
        const ctx = this.ctx

        // Create noise buffer
        const bufLen = ctx.sampleRate * 3
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 5)
        gain.connect(this.master)

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(90, ctx.currentTime)
        filter.Q.setValueAtTime(0.4, ctx.currentTime)
        filter.connect(gain)

        const playLoop = () => {
            if (!this._enabled || !this.ctx) return
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(filter)
            source.onended = () => { if (this._enabled) playLoop() }
            source.start()
        }
        playLoop()

        this.ambientNodes.set('atmosphere', {
            gain,
            stop: () => {
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
            },
        })
    }

    /**
     * Layer 3 — Electronic texture: high-pass filtered noise + subtle LFO modulation
     * Creates the digital shimmer / interface ambient feel
     */
    private startElectronicTexture(): void {
        if (!this.ctx || !this.master) return
        const ctx = this.ctx

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 7)
        gain.connect(this.master)

        // LFO to slowly modulate gain — creates "breathing" effect
        const lfo = ctx.createOscillator()
        lfo.type = 'sine'
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime) // very slow

        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(0.008, ctx.currentTime)
        lfo.connect(lfoGain)
        lfoGain.connect(gain.gain)
        lfo.start()

        // High-pass filtered noise
        const bufLen = ctx.sampleRate * 2
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

        const hp = ctx.createBiquadFilter()
        hp.type = 'highpass'
        hp.frequency.setValueAtTime(2800, ctx.currentTime)
        hp.Q.setValueAtTime(0.5, ctx.currentTime)
        hp.connect(gain)

        const playLoop = () => {
            if (!this._enabled || !this.ctx) return
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(hp)
            source.onended = () => { if (this._enabled) playLoop() }
            source.start()
        }
        playLoop()

        this.ambientNodes.set('texture', {
            gain,
            stop: () => {
                lfo.stop()
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2)
            },
        })
    }

    // ── One-shot interaction sounds ───────────────────────────────────────────

    /**
     * Soft click: quick sine blip — used on UI button presses
     */
    playClick(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06)

        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.10)

        osc.connect(gain)
        gain.connect(this.master)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.12)
    }

    /**
     * Hover: barely audible high tick — used on interactive element entry
     */
    playHover(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(1200, ctx.currentTime)

        gain.gain.setValueAtTime(0.025, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)

        osc.connect(gain)
        gain.connect(this.master)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.06)
    }

    /**
     * Section transition: rising tone sweep
     */
    playTransition(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.4)

        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55)

        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(500, ctx.currentTime)
        filter.Q.setValueAtTime(2, ctx.currentTime)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.master)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.6)
    }

    /**
     * Confirm / success: two-tone positive chime
     */
    playConfirm(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const freqs = [660, 880]
        const delays = [0, 0.12]

        freqs.forEach((freq, i) => {
            if (!this.ctx || !this.master) return
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()

            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delays[i])

            gain.gain.setValueAtTime(0, ctx.currentTime + delays[i])
            gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + delays[i] + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delays[i] + 0.35)

            osc.connect(gain)
            gain.connect(this.master)

            osc.start(ctx.currentTime + delays[i])
            osc.stop(ctx.currentTime + delays[i] + 0.4)
        })
    }

    /**
     * Error / alert: descending tone
     */
    playError(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25)

        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(600, ctx.currentTime)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.master)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.32)
    }

    /**
     * Open modal / reader: soft pad swell
     */
    playOpen(): void {
        if (!this._enabled || !this.ctx || !this.master) return
        const ctx = this.ctx

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(330, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3)

        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.12)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)

        osc.connect(gain)
        gain.connect(this.master)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.55)
    }
}

// ── Singleton export ──────────────────────────────────────────────────────────
export const audioEngine = new AudioEngine()
