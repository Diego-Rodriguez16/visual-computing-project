/**
 * Manages procedural audio synthesis using Web Audio API.
 * Generates engine sounds using oscillators (FM Synthesis) to avoid external assets.
 */
export class AudioManager {
    private ctx: AudioContext | null = null;
    private engineOsc: OscillatorNode | null = null;
    private engineGain: GainNode | null = null;
    private lfo: OscillatorNode | null = null; // Low Frequency Oscillator for rumble
    private isEngineRunning: boolean = false;
    private isInitialized: boolean = false;

    constructor() {
        // AudioContext must be resumed after user interaction
    }

    public async init() {
        if (this.isInitialized) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log("🔊 Audio Context created");
            this.isInitialized = true;
        } catch (e) {
            console.error("❌ Audio support not available", e);
        }
    }

    public startEngine() {
        if (!this.ctx || this.isEngineRunning) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Create oscillator for engine drone
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();
        this.lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // Setup LFO (Rumble)
        this.lfo.frequency.value = 30; // 30Hz rumble
        this.lfo.type = 'sawtooth';
        lfoGain.gain.value = 50; // Modulation depth

        // Setup Engine Tone
        this.engineOsc.type = 'sawtooth'; // Rough sound
        this.engineOsc.frequency.value = 60; // Idle RPM (low pitch)

        // Connect graph
        // LFO -> Engine Frequency (FM Synthesis)
        this.lfo.connect(lfoGain);
        lfoGain.connect(this.engineOsc.frequency); // Modulate pitch

        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        // Start
        this.engineOsc.start();
        this.lfo.start();

        // Check volume (fade in)
        this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.engineGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 1);

        this.isEngineRunning = true;
        console.log("🔊 Engine Started");
    }

    public updateEngineRPM(speedFactor: number) {
        // speedFactor: 0 to 1
        if (!this.engineOsc || !this.lfo || !this.ctx) return;

        const baseFreq = 60;
        const maxFreq = 200;

        const targetFreq = baseFreq + (maxFreq - baseFreq) * speedFactor;

        // Smooth transition
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
        this.lfo.frequency.setTargetAtTime(30 + (speedFactor * 50), this.ctx.currentTime, 0.1);
    }

    public playClick() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}
