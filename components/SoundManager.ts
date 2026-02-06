
class SoundManager {
  private audioCtx: AudioContext | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private melodyTimeout: any = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playPop() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  playToilet() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.4);
  }

  playCrash() {
    this.init();
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(20, this.audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.3);
  }

  playWin() {
    this.init();
    if (!this.audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx!.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.05, this.audioCtx!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx!.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);
      osc.start(this.audioCtx!.currentTime + i * 0.1);
      osc.stop(this.audioCtx!.currentTime + i * 0.1 + 0.5);
    });
  }

  startBGM() {
    this.init();
    if (!this.audioCtx || this.bgmOscillator) return;
    this.playMelody();
  }

  private playMelody() {
    if (!this.audioCtx) return;
    const melody = [
      { f: 392.00, d: 0.5 }, // G4
      { f: 440.00, d: 0.5 }, // A4
      { f: 349.23, d: 0.5 }, // F4
      { f: 523.25, d: 0.5 }, // C5
    ];
    let time = this.audioCtx.currentTime;
    
    const playNote = (index: number) => {
      if (!this.audioCtx) return;
      const note = melody[index % melody.length];
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + note.d);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + note.d);
      
      this.melodyTimeout = setTimeout(() => playNote(index + 1), note.d * 1000);
    };
    
    playNote(0);
  }

  stopBGM() {
    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }
  }
}

export const soundManager = new SoundManager();
