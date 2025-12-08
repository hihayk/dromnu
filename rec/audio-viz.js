class AudioViz {
  static ctx = null;
  static analysers = new Map();   // audioEl -> analyser
  static currentAnalyser = null;

  static init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
  }

  static registerAudioEl(audioEl) {
    this.init();
    if (this.analysers.has(audioEl)) return;

    const src = this.ctx.createMediaElementSource(audioEl);
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;

    src.connect(analyser);
    analyser.connect(this.ctx.destination);

    this.analysers.set(audioEl, analyser);
  }

  static useFor(audioEl) {
    this.currentAnalyser = this.analysers.get(audioEl) || null;

    // resume context on user gesture (mobile / Safari)
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  static getFrequencyData() {
    const analyser = this.currentAnalyser;
    if (!analyser) return null;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  }
}

window.AudioViz = AudioViz;