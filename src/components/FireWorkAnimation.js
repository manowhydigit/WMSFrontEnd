import React, { useEffect, useRef } from 'react';

const FireworksAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let chars, particles, canvas, ctx, w, h, current;
    const duration = 5000;
    const str = ['Happy', 'New', 'Year', '2025'];

    const init = () => {
      canvas = canvasRef.current;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      requestAnimationFrame(render);
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      particles = window.innerWidth < 400 ? 55 : 99;
    };

    const makeChar = (c) => {
      const tmp = document.createElement('canvas');
      const size = tmp.width = tmp.height = w < 400 ? 200 : 300;
      const tmpCtx = tmp.getContext('2d');
      tmpCtx.font = `bold ${size}px Arial`;
      tmpCtx.fillStyle = 'white';
      tmpCtx.textBaseline = 'middle';
      tmpCtx.textAlign = 'center';
      tmpCtx.fillText(c, size / 2, size / 2);
      const char2 = tmpCtx.getImageData(0, 0, size, size);
      const char2particles = [];
      for (let i = 0; char2particles.length < particles; i++) {
        const x = size * Math.random();
        const y = size * Math.random();
        const offset = parseInt(y) * size * 4 + parseInt(x) * 4;
        if (char2.data[offset]) {
          char2particles.push([x - size / 2, y - size / 2]);
        }
      }
      return char2particles;
    };

    const makeChars = (t) => {
      const actual = parseInt(t / duration) % str.length;
      if (current === actual) return;
      current = actual;
      chars = [...str[actual]].map(makeChar);
    };

    const render = (t) => {
      makeChars(t);
      requestAnimationFrame(render);
      ctx.fillStyle = '#00000010';
      ctx.fillRect(0, 0, w, h);
      chars.forEach((pts, i) => firework(t, i, pts));
    };

    const firework = (t, i, pts) => {
      t -= i * 200;
      const id = i + chars.length * parseInt(t - (t % duration));
      t = (t % duration) / duration;
      let dx = ((i + 1) * w) / (1 + chars.length);
      dx += Math.min(0.33, t) * 100 * Math.sin(id);
      let dy = h * 0.5;
      dy += Math.sin(id * 4547.411) * h * 0.1;
      if (t < 0.33) {
        rocket(dx, dy, id, t * 3);
      } else {
        explosion(pts, dx, dy, id, Math.min(1, Math.max(0, t - 0.33) * 2));
      }
    };

    const rocket = (x, y, id, t) => {
      ctx.fillStyle = 'white';
      const r = 2 - 2 * t + Math.pow(t, 15 * t) * 16;
      y = h - y * t;
      circle(x, y, r);
    };

    const explosion = (pts, x, y, id, t) => {
      const dy = t * t * t * 20;
      let r = Math.sin(id) * 1 + 3;
      r = t < 0.5 ? (t + 0.5) * t * r : r - t * r;
      ctx.fillStyle = `hsl(${id * 55}, 55%, 55%)`;
      pts.forEach((xy, i) => {
        if (i % 20 === 0) {
          ctx.fillStyle = `hsl(${id * 55}, 55%, ${55 + t * Math.sin(t * 55 + i) * 45}%)`;
        }
        circle(t * xy[0] + x, h - y + t * xy[1] + dy, r);
      });
    };

    const circle = (x, y, r) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    init();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      {/* Canvas for fireworks animation */}
      <canvas ref={canvasRef} style={{ display: 'block', background: 'black' }} />

      {/* Overlayed image and text */}
      <div
        className="img"
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -10%)',
          color: 'white',
        }}
      >
        {/* Uncomment the image as needed */}
        {/* <img src="https://i.pinimg.com/originals/66/b0/02/66b002f6f5022553a6cf52d8d01241df.gif" alt="Animation" /> */}
        {/* <img src={butterfly} alt="Butterfly" /> */}
        <h2>
          {/* <img src={logoonly} width="150" alt="Logo" /> */}
          <span>Uniworld</span> <br />
          <span>Logistics</span>
          
        </h2>
      </div>
    </div>
  );
};

export default FireworksAnimation;
