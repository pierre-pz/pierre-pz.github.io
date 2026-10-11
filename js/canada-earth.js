/* Decorative Earth image and ambient particles; no external dependencies. */
(function () {
  'use strict';
  const instances = new Map();
  const TAU = Math.PI * 2;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');

  function createEarth(scene) {
    if (instances.has(scene)) return instances.get(scene);
    const rig = scene.querySelector('.pz-ca-earth__rig');
    const canvas = scene.querySelector('.pz-ca-earth__particles');
    const image = scene.querySelector('.pz-ca-earth__image img');
    if (!rig || !canvas) return null;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return null;
    const abort = new AbortController();
    const listeners = { signal: abort.signal };
    let seed = 7219;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const motes = Array.from({ length: 180 }, () => ({
      angle: random() * TAU,
      lane: random(),
      size: .30 + random() * .60,
      alpha: .14 + random() * .36,
      speed: .7 + random() * .65,
      phase: random() * TAU
    }));
    const glints = [
      [821,472],[854,490],[884,526],[905,507],[932,498],
      [958,483],[986,489],[1021,499],[1019,454],[788,446],
      [581,449],[573,481],[559,528],[583,565],[656,385],
      [719,434],[878,405],[963,418]
    ].map(([x,y]) => ({ x, y, phase: random() * TAU, speed: .3 + random() * .2 }));
    // Match the two orbital trails in the background image.
    const tracks = [
      { x: 785, y: 465, rx: 788, ry: 208, tilt: -.50 },
      { x: 868, y: 390, rx: 646, ry: 220, tilt: -.41 }
    ];
    const surfaceLinks = [
      { from:[588,440], via:[731,356], to:[888,512], phase:.24 },
      { from:[888,512], via:[927,466], to:[968,483], phase:.68 }
    ];
    const trackLights = tracks.flatMap((track, lane) =>
      Array.from({ length: lane ? 4 : 6 }, (_, i) => ({
        track,
        angle: i * TAU / (lane ? 4 : 6) + .17 + lane * .23,
        size: 1.05 + random() * .65,
        speed: .012 + random() * .006,
        phase: random() * TAU,
        cool: i === 2 && lane === 1
      }))
    );
    const ambientLayer = createAmbientLayer();
    const flowLayer = createFlowLayer();
    let bloomLayer = null, surfaceLayer = null, bloomSource = '';
    let width = 1, height = 1, raf = 0, active = true, paused = false;
    let lastTime = 0, elapsed = 0, lastDraw = -100;
    let pointerX = 0, pointerY = 0, offsetX = 0, offsetY = 0;

    function orbitPoint(track, angle) {
      const x = Math.cos(angle) * track.rx;
      const y = Math.sin(angle) * track.ry;
      return {
        x: track.x + x * Math.cos(track.tilt) - y * Math.sin(track.tilt),
        y: track.y + x * Math.sin(track.tilt) + y * Math.cos(track.tilt)
      };
    }

    function orbitVisibility(point) {
      const distance = Math.hypot((point.x - 874) / 440, (point.y - 483) / 446);
      // Fade just before the silhouette so the trails disappear behind Earth.
      const limb = Math.min(1, Math.max(0, (distance - 1.012) / .065));
      const edge = Math.min(1, Math.max(0,
        Math.min(point.x, 1536 - point.x, point.y, 1024 - point.y) / 65));
      return limb * edge;
    }

    function createAmbientLayer() {
      const layer = document.createElement('canvas');
      layer.width = 1536;
      layer.height = 1024;
      const light = layer.getContext('2d');
      if (!light) return null;
      const pixels = light.createImageData(layer.width, layer.height);

      // Localized sunrise, with wider but much quieter atmospheric scattering.
      // Compute once in texture coordinates; resizing and animation reuse it.
      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const nx = (x - 874) / 440;
          const ny = (y - 483) / 446;
          const distance = (Math.hypot(nx, ny) - 1) * 443;
          if (distance < -120 || distance > 200) continue;
          const angle = Math.atan2(ny, nx) + 2.55;
          const delta = Math.atan2(Math.sin(angle), Math.cos(angle));
          const sunlight = Math.exp(-Math.pow(delta / .43, 2));
          const scattered = Math.exp(-Math.pow(delta / .78, 2));
          if (scattered < .003) continue;
          const rim = .70 * Math.exp(-.5 * Math.pow(distance / 1.45, 2));
          const atmosphere = distance >= 0
            ? .13 * Math.exp(-distance / 13) + .080 * Math.exp(-distance / 43) +
              .025 * Math.exp(-.5 * Math.pow(distance / 85, 2))
            : .18 * Math.exp(distance / 22) + .025 * Math.exp(distance / 46);
          const alpha = Math.min(.86, rim * sunlight + atmosphere * scattered);
          if (alpha < .002) continue;
          const hot = Math.exp(-Math.abs(distance) / 4);
          const i = (y * layer.width + x) * 4;
          pixels.data[i] = 255;
          pixels.data[i + 1] = 180 + 57 * hot;
          pixels.data[i + 2] = 61 + 110 * hot;
          pixels.data[i + 3] = Math.round(alpha * 255);
        }
      }
      light.putImageData(pixels, 0, 0);

      // Sample the image for bloom along its coastlines and orbital trails.
      return layer;
    }

    function createFlowLayer() {
      const layer = document.createElement('canvas');
      layer.width = 1536; layer.height = 1024;
      const flow = layer.getContext('2d');
      if (!flow) return null;
      tracks.forEach((track, lane) => {
        for (let filament = 0; filament < 3; filament++) {
          const path = { ...track, rx:track.rx + (filament - 1) * 12,
            ry:track.ry + (filament - 1) * 9, tilt:track.tilt + (filament - 1) * .006 };
          let previous = null;
          for (let step = 0; step <= 1100; step++) {
            const angle = step / 1100 * TAU;
            const point = orbitPoint(path, angle);
            const visibility = orbitVisibility(point);
            if (previous && visibility > 0 && previous.visibility > 0) {
              const envelope = .36 + .64 * Math.pow(.5 + .5 * Math.sin(angle * 3 + filament), 2);
              const alpha = Math.min(visibility,previous.visibility) * envelope * (filament === 1 ? .11 : .035);
              flow.strokeStyle = 'rgba(' + (lane ? '114,151,182,' : '218,167,79,') + alpha.toFixed(3) + ')';
              flow.lineWidth = filament === 1 ? .65 : .45;
              flow.beginPath(); flow.moveTo(previous.x,previous.y); flow.lineTo(point.x,point.y); flow.stroke();
            }
            previous = { ...point, visibility };
          }
        }
      });
      return layer;
    }

    function createSurfaceLayer(pixels) {
      const layer = document.createElement('canvas');
      layer.width = 1536; layer.height = 1024;
      const dots = layer.getContext('2d');
      if (!dots) return null;
      // Sample the existing land texture on a projected hemisphere. The points
      // follow its actual coastlines; spacing compresses toward the horizon.
      for (let latitude = -1.50; latitude < 1.50; latitude += .0125) {
        const ring = Math.cos(latitude);
        for (let longitude = -1.53; longitude < 1.53; longitude += .0145 / Math.max(.3,ring)) {
          const nx = Math.sin(longitude) * ring, ny = Math.sin(latitude);
          const depth = Math.cos(longitude) * ring;
          if (depth < .30) continue;
          const x = 874 + (nx * .989 - ny * .149) * 440;
          const y = 483 + (nx * .149 + ny * .989) * 446;
          const i = (Math.round(y) * 1536 + Math.round(x)) * 4;
          const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
          if (pixels.data[i + 3] < 160 || b < 28 || g < 23 || b < r * .88) continue;
          const alpha = (.25 + .52 * Math.min(1,b / 100)) * (.35 + .65 * depth);
          dots.fillStyle = 'rgba(127,154,178,' + alpha.toFixed(3) + ')';
          dots.beginPath(); dots.arc(x,y,.38 + .48 * depth,0,TAU); dots.fill();
        }
      }
      dots.strokeStyle = 'rgba(152,184,202,.14)';
      dots.lineWidth = .65;
      for (const link of surfaceLinks) {
        dots.beginPath(); dots.moveTo(...link.from);
        dots.quadraticCurveTo(...link.via,...link.to); dots.stroke();
      }
      return layer;
    }

    function surfacePoint(link, position) {
      const t = Math.max(0,Math.min(1,position)), u = 1 - t;
      return { x:u*u*link.from[0] + 2*u*t*link.via[0] + t*t*link.to[0],
        y:u*u*link.from[1] + 2*u*t*link.via[1] + t*t*link.to[1] };
    }

    function prepareSurface() {
      if (!image || !image.complete || !image.naturalWidth ||
          bloomSource === image.currentSrc || !instances.has(scene)) return;
      const source = document.createElement('canvas');
      source.width = 1536; source.height = 1024;
      const sourceContext = source.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) return;
      sourceContext.drawImage(image, 0, 0, source.width, source.height);
      let pixels;
      try { pixels = sourceContext.getImageData(0, 0, source.width, source.height); }
      catch { return; }
      surfaceLayer = createSurfaceLayer(pixels);
      // Isolate existing warm lights so the sea and the cool land stay dark.
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
        const warmth = Math.max(0, Math.min(1,
          (r - b - 30) / 120, (r - g - 8) / 50, (r - 75) / 140));
        if (!warmth || !pixels.data[i + 3]) { pixels.data[i + 3] = 0; continue; }
        const x = (i / 4) % 1536, y = Math.floor(i / 4 / 1536);
        const focus = Math.exp(-Math.pow((x - 902) / 205,2) - Math.pow((y - 503) / 148,2));
        const outside = Math.hypot((x - 874) / 440,(y - 483) / 446) > 1;
        const emission = outside ? .34 : .12 + .66 * focus;
        pixels.data[i] = 255;
        pixels.data[i + 1] = 197;
        pixels.data[i + 2] = 87;
        pixels.data[i + 3] = Math.round(pixels.data[i + 3] * warmth * emission);
      }
      sourceContext.putImageData(pixels, 0, 0);
      const layer = document.createElement('canvas');
      layer.width = source.width; layer.height = source.height;
      const glow = layer.getContext('2d');
      if (!glow) return;
      glow.globalCompositeOperation = 'lighter';
      for (const [blur, alpha] of [[15, .30], [5, .42], [1.3, .12]]) {
        glow.filter = 'blur(' + blur + 'px)';
        glow.globalAlpha = alpha;
        glow.drawImage(source, 0, 0);
      }
      bloomLayer = layer;
      bloomSource = image.currentSrc;
      paint(elapsed);
    }

    function spark(x, y, size, alpha) {
      const radius = size * 4.5;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, 'rgba(255,238,188,' + alpha.toFixed(3) + ')');
      glow.addColorStop(.10, 'rgba(255,214,125,' + (.88 * alpha).toFixed(3) + ')');
      glow.addColorStop(.29, 'rgba(250,176,49,' + (.32 * alpha).toFixed(3) + ')');
      glow.addColorStop(.60, 'rgba(234,148,29,' + (.09 * alpha).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(226,139,27,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.fillStyle = 'rgba(255,227,164,' + (.8 * alpha).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, size * .35, 0, TAU);
      ctx.fill();
    }

    function paint(time) {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(width / 1536, height / 1024);
      if (surfaceLayer) ctx.drawImage(surfaceLayer, 0, 0);
      if (flowLayer) ctx.drawImage(flowLayer, 0, 0);
      if (bloomLayer) ctx.drawImage(bloomLayer, 0, 0);
      if (ambientLayer) {
        ctx.globalAlpha = .98 + .02 * Math.sin(time * .21);
        ctx.drawImage(ambientLayer, 0, 0);
        ctx.globalAlpha = 1;
      }
      for (const point of trackLights) {
        const angle = point.angle + time * point.speed;
        const position = orbitPoint(point.track, angle);
        const visibility = orbitVisibility(position);
        if (visibility <= 0) continue;
        for (let step = 1; step <= 9; step++) {
          const from = orbitPoint(point.track, angle - step * .0025);
          const to = orbitPoint(point.track, angle - (step - 1) * .0025);
          const fade = Math.min(orbitVisibility(from),orbitVisibility(to)) * Math.pow(1 - step / 10,2);
          ctx.strokeStyle = 'rgba(' + (point.cool ? '147,190,219,' : '255,207,126,') + (fade * .46).toFixed(3) + ')';
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y); ctx.stroke();
        }
        const shimmer = .82 + .18 * Math.sin(time * .65 + point.phase);
        spark(position.x, position.y, point.size, visibility * shimmer * .72);
      }
      // Tiny moving points describe an orbit; the globe occludes the rear portion.
      for (const p of motes) {
        const a = p.angle + time * .028 * p.speed;
        const rx = 772 + p.lane * 112, ry = 126 + p.lane * 94;
        const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
        const x = 874 + ex * .865 + ey * .502;
        const y = 484 - ex * .502 + ey * .865;
        const dx = x - 874, dy = y - 483;
        if (dx * dx + dy * dy < 450 * 450) continue;
        const edge = Math.min(1, Math.max(0, Math.min(x, 1536 - x, y, 1024 - y) / 80));
        if (!edge) continue;
        const pulse = .68 + .32 * Math.sin(time * .55 + p.phase);
        ctx.fillStyle = 'rgba(237,174,54,' + (p.alpha * pulse * edge).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, TAU);
        ctx.fill();
        if (p.size > 1.1) spark(x, y, p.size, .42 * pulse * edge);
      }
      for (const p of glints) {
        const pulse = Math.pow(Math.max(0, Math.sin(time * p.speed + p.phase)), 7);
        if (pulse < .03) continue;
        const halo = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,5);
        halo.addColorStop(0, 'rgba(255,217,119,' + (.5 * pulse).toFixed(3) + ')');
        halo.addColorStop(.2, 'rgba(245,180,45,' + (.22 * pulse).toFixed(3) + ')');
        halo.addColorStop(1, 'rgba(245,180,45,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(p.x - 5,p.y - 5,10,10);
      }
      for (const link of surfaceLinks) {
        const position = (time * .024 + link.phase) % 1;
        const envelope = Math.sin(position * Math.PI);
        for (let step = 0; step < 12; step++) {
          const from = surfacePoint(link,position - (step + 1) * .006);
          const to = surfacePoint(link,position - step * .006);
          ctx.strokeStyle = 'rgba(195,213,218,' + (envelope * .36 * Math.pow(1-step/12,2)).toFixed(3) + ')';
          ctx.lineWidth = .9;
          ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y); ctx.stroke();
        }
        const head = surfacePoint(link,position);
        spark(head.x,head.y,1.1,envelope * .52);
      }
      ctx.restore();
    }
    function allowed() {
      return active && !document.hidden && !paused && !reduced.matches;
    }
    function frame(now) {
      raf = 0;
      if (!allowed()) { lastTime = 0; return; }
      if (lastTime) elapsed += Math.min((now - lastTime) / 1000, .1);
      lastTime = now;
      // 30 fps is ample for ambient motion; avoid a continuous 60 fps canvas.
      if (now - lastDraw >= 32) {
        offsetX += (pointerX - offsetX) * .065;
        offsetY += (pointerY - offsetY) * .065;
        const drift = Math.sin(elapsed * .16) * 2.3;
        scene.style.setProperty('--pz-ca-earth-x', (offsetX + Math.sin(elapsed * .11) * 1.5).toFixed(2) + 'px');
        scene.style.setProperty('--pz-ca-earth-y', (offsetY + drift).toFixed(2) + 'px');
        scene.style.setProperty('--pz-ca-earth-roll', (Math.sin(elapsed * .075) * .12).toFixed(3) + 'deg');
        paint(elapsed);
        lastDraw = now;
      }
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; lastTime = 0;
      if (reduced.matches || paused) {
        scene.style.setProperty('--pz-ca-earth-x','0px');
        scene.style.setProperty('--pz-ca-earth-y','0px');
        scene.style.setProperty('--pz-ca-earth-roll','0deg');
      }
      paint(elapsed);
      if (allowed()) raf = requestAnimationFrame(frame);
    }
    function resize() {
      const rect = rig.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6, 1800 / Math.max(rect.width,1));
      width = Math.max(1, Math.round(rect.width * ratio));
      height = Math.max(1, Math.round(rect.height * ratio));
      canvas.width = width; canvas.height = height;
      paint(elapsed);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(rig);
    const io = new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
      sync();
    });
    io.observe(scene);
    document.addEventListener('visibilitychange', sync, listeners);
    reduced.addEventListener('change', sync, listeners);
    window.addEventListener('pointermove', event => {
      if (!finePointer.matches || !allowed()) return;
      const rect = scene.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) {
        pointerX = 0; pointerY = 0; return;
      }
      pointerX = ((event.clientX - rect.left) / rect.width - .5) * 10;
      pointerY = ((event.clientY - rect.top) / rect.height - .5) * 7;
    }, { passive: true, signal: abort.signal });
    document.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; }, listeners);
    const instance = {
      pause(value = true) { paused = value; sync(); },
      destroy() {
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect(); io.disconnect(); abort.abort();
        ctx.clearRect(0,0,width,height);
        ['--pz-ca-earth-x','--pz-ca-earth-y','--pz-ca-earth-roll'].forEach(p => scene.style.removeProperty(p));
        instances.delete(scene);
      }
    };
    instances.set(scene, instance);
    resize(); sync();
    if (image) {
      image.addEventListener('load', prepareSurface, listeners);
      prepareSurface();
    }
    return instance;
  }
  function init(root = document) {
    return Array.from(root.querySelectorAll('[data-canada-earth]'), createEarth);
  }
  window.CanadaEarth = { init, get: element => instances.get(element) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  else init();
}());
