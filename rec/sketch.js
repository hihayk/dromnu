new p5((p) => {
  let lines = []; // {x1, y1, x2, y2} per frequency bin

  p.setup = function () {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.position(0, 0);
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-2');        // behind UI
    canvas.style('pointer-events', 'none');

    p.colorMode(p.RGB, 255);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    // regenerate lines for new size
    lines = [];
  };

  p.draw = function () {
    p.background(0); // black background

    if (!window.AudioViz) return;

    const data = AudioViz.getFrequencyData();
    if (!data) return;

    // make sure we have one line per frequency bin
    ensureLines(data.length);

    p.strokeWeight(2);

    for (let i = 0; i < data.length; i++) {
      const amp = data[i] / 255;           // 0..1
      const brightness = amp * 100;        // 0..255, black -> white

      const L = lines[i];

      p.stroke(brightness);
      p.strokeWeight(1)
      p.line(L.x1, L.y1, L.x2, L.y2);
    }
  };

  function ensureLines(count) {
    if (lines.length === count) return;

    lines = [];
    for (let i = 0; i < count; i++) {
      // random start point anywhere on canvas
      const x1 = p.random(0, p.width);
      const y1 = p.random(0, p.height);

      // random direction + length
      const angle = p.random(p.TWO_PI);
      const length = p.random(40, 200); // tweak for longer/shorter lines
      const x2 = x1 + p.cos(angle) * length;
      const y2 = y1 + p.sin(angle) * length;

      lines.push({ x1, y1, x2, y2 });
    }
  }
});