const tracks = document.getElementById("tracks");

tracks.innerHTML += tracklist.map((track) => `
  <div class="track">
    <audio src="/rec/audios/${track}"></audio>
    <button class="play-pause"></button>
    <div class="slider-wrapper">
      <input
        type="range"
        class="slider seek"
        min="0"
        max="100"
        value="0"
        step="0.1"
      />
      <div class="slider-track"></div>
    </div>
  </div>
`).join('')

document.addEventListener("DOMContentLoaded", () => {
  const trackEls = document.querySelectorAll(".track");
  const players = Array.from(trackEls).map((el) => new AudioPlayer(el));
  // you have `players` here if needed
});

class AudioPlayer {
  static instances = [];
  static lastActive = null;

  static pauseAllExcept(player) {
    AudioPlayer.instances.forEach((p) => {
      if (p !== player) p.audio.pause();
    });
  }

  constructor(rootEl) {
    this.root = rootEl;
    this.audio = rootEl.querySelector("audio");
    this.playBtn = rootEl.querySelector(".play-pause");
    this.seek = rootEl.querySelector(".seek");
    this.sliderWrapper = rootEl.querySelector(".slider-wrapper");
    this.track = rootEl.querySelector(".track");

    // ⭐ register this audio element for visualization
    AudioViz.registerAudioEl(this.audio);

    AudioPlayer.instances.push(this);

    this.bindEvents();
  }

  bindEvents() {
    // Play / pause
    this.playBtn.addEventListener("click", () => {
      if (this.audio.paused) {
        AudioPlayer.pauseAllExcept(this);
        AudioPlayer.lastActive = this;
        this.audio.play();
      } else {
        this.audio.pause();
      }
      this.updatePlayingClass();
    });

    const highMultiplier = 1.2

    // Update slider while playing
    this.audio.addEventListener("timeupdate", () => {
      if (!this.audio.duration) return;
      const pct = (this.audio.currentTime / this.audio.duration) * 100;
      this.seek.value = pct;
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.sliderWrapper.style.height = Math.round(this.audio.duration * highMultiplier) + "px";
      this.root.style.gridRow = `span ${Math.round(this.audio.duration * highMultiplier) + 32}`;

      if (this.audio.duration) {
        this.sliderWrapper.classList.add("ready");
      }
    });

    // ⭐ Hook playing state + tell viz which analyser to use
    this.audio.addEventListener("play", () => {
      this.updatePlayingClass();
      AudioPlayer.lastActive = this;
      AudioViz.useFor(this.audio);  // <- active source for p5
    });

    this.audio.addEventListener("pause", () => this.updatePlayingClass());
    this.audio.addEventListener("ended", () => this.updatePlayingClass());

    // Slider drag -> seek
    this.seek.addEventListener("input", () => {
      if (this.audio.paused && this.audio.currentTime === 0) {
        this.seek.value = 0;

        AudioPlayer.pauseAllExcept(this);
        AudioPlayer.lastActive = this;
        this.audio.play();
        this.updatePlayingClass();
        return;
      }

      if (!this.audio.duration) return;
      const pct = this.seek.value / 100;
      this.audio.currentTime = this.audio.duration * pct;

      if (this.audio.paused) {
        AudioPlayer.pauseAllExcept(this);
        AudioPlayer.lastActive = this;
        this.audio.play();
      }
      this.updatePlayingClass();
    });
  }

  isPlaying() {
    return !this.audio.paused && !this.audio.ended;
  }

  updatePlayingClass() {
    if (this.isPlaying()) {
      this.sliderWrapper.classList.add("playing");
    } else {
      this.sliderWrapper.classList.remove("playing");
    }
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // avoid page scroll
    const p = AudioPlayer.lastActive;
    if (p) {
      if (p.audio.paused) {
        AudioPlayer.pauseAllExcept(p);
        p.audio.play();
      } else {
        p.audio.pause();
      }
      p.updatePlayingClass();
    }
  }
});