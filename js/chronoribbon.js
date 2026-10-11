(() => {
        'use strict';

        const section = document.getElementById('experience');
        const data = JSON.parse(section.querySelector('.cx-data').textContent);
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mobile = window.matchMedia('(max-width: 600px)');
        const SVG = 'http://www.w3.org/2000/svg';
        const month = value => { const [year, mo] = value.split('-').map(Number); return year * 12 + mo - 1; };
        const today = new Date();
        const current = today.getFullYear() * 12 + today.getMonth();
        const lower = month('2021-09');
        const upper = Math.max(month('2028-01'), current + 1);
        const range = upper - lower;
        const pct = value => 100 * (value - lower) / range;
        const end = item => item.end ? month(item.end) + 1 : current + 1;
        const dateLabel = today.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
        section.querySelectorAll('[data-current-month]').forEach(el => { el.textContent = dateLabel; });
        const svgEl = (tag, attrs, parent) => {
          const node = document.createElementNS(SVG, tag);
          Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
          if (parent) parent.appendChild(node);
          return node;
        };
        const text = (parent, x, y, value, cls = '') => {
          const el = svgEl('text', { x, y, class: cls }, parent); el.textContent = value; return el;
        };
        const span = (cls, parent) => { const el = document.createElement('span'); el.className = cls; parent.appendChild(el); return el; };
        function miniYears(parent) {
          const years = span('cx-mini-years', parent);
          [[lower, 'Sep 21'], [month('2024-01'), '2024'], [month('2026-01'), '2026'], [upper, 'Dec 27']].forEach(([value, label]) => {
            const tick = span('', years); tick.textContent = label; tick.style.left = `${pct(value)}%`;
          });
        }
        function miniBar(parent, item) {
          const start = month(item.start), finish = end(item), observed = Math.min(finish, current + 1);
          const rail = span('cx-bar', parent);
          if (observed > start) {
            const fill = span('cx-bar-fill', rail);
            fill.style.left = `${pct(start)}%`; fill.style.width = `${(observed - start) / range * 100}%`;
          }
          if (finish > observed) {
            const fill = span('cx-bar-fill future', rail);
            fill.style.left = `${pct(observed)}%`; fill.style.width = `${(finish - observed) / range * 100}%`;
          }

        }

        miniYears(section.querySelector('.cr-mobile-scale'));
        const stage = section.querySelector('.cr-stage');
        const art = section.querySelector('.cr-art');
        const cards = Array.from(section.querySelectorAll('.cr-card'));
        const byID = new Map(data.map(item => [item.id, item]));
        let pinned = null, transient = null, scrolled = 'ontario', frame = 0, visible = false;
        const y = value => 38 + (upper - value) / range * 866;
        const ribbonX = pos => 500 + 18 * Math.sin(pos / 137) - 13 * Math.cos(pos / 76);
        const pathBetween = (from, to, offset = 0) => {
          const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 8));
          return Array.from({ length: steps + 1 }, (_, i) => {
            const pos = from + (to - from) * i / steps;
            return `${i ? 'L' : 'M'} ${(ribbonX(pos) + offset).toFixed(2)} ${pos.toFixed(2)}`;
          }).join(' ');
        };

        // The phone ribbon shows order. The horizontal bars retain exact time.
        function drawMobile() {
          const height = stage.offsetHeight;
          art.setAttribute('viewBox', `0 0 30 ${height}`);
          const stageTop = stage.getBoundingClientRect().top;
          const points = cards.map(card => ({
            id: card.dataset.id, kind: card.dataset.kind,
            y: card.getBoundingClientRect().top - stageTop + 31
          }));
          const ribbonAt = y => 13 + 4.5 * Math.sin(y / 103);
          const curve = (a,b,offset=0) => {
            const steps = Math.max(2,Math.ceil((b-a)/7));
            return Array.from({length:steps+1},(_,i)=>{
              const y=a+(b-a)*i/steps;
              return `${i?'L':'M'}${ribbonAt(y)+offset} ${y}`;
            }).join(' ');
          };
          const from=points[0].y-15,to=points[points.length-1].y+40;
          svgEl('path',{d:curve(from,to),fill:'none',stroke:'#ffd40012','stroke-width':12,'stroke-linecap':'round'},art);
          svgEl('path',{d:curve(from,to,-3),fill:'none',stroke:'#ffd40066','stroke-width':1.5},art);
          svgEl('path',{d:curve(from,to,3),fill:'none',stroke:'#d8ddd850','stroke-width':1.5},art);
          points.forEach(point=>{
            const group=svgEl('g',{class:'cr-segment','data-id':point.id,'data-kind':point.kind},art);
            const color=point.kind==='education'?'#d8ddd8':'#ffd400', x=ribbonAt(point.y);
            svgEl('path',{d:curve(point.y-15,point.y+40),fill:'none',stroke:color,'stroke-width':2,class:'cr-mobile-glow',opacity:0},group);
            svgEl('path',{d:`M${x+5} ${point.y} H30`,class:'cr-connector'},group);
            if(point.kind==='education')svgEl('rect',{x:x-3,y:point.y-3,width:6,height:6,transform:`rotate(45 ${x} ${point.y})`,fill:'#101218',stroke:color,'stroke-width':1.5},group);
            else svgEl('circle',{cx:x,cy:point.y,r:3.5,fill:color,stroke:'#101218','stroke-width':2},group);
          });
          update();
        }

        function draw() {
          art.replaceChildren();
          if (mobile.matches) { drawMobile(); return; }
          art.setAttribute('viewBox', '0 0 1000 960');
          const nowY = y(current + 1);
          svgEl('rect', { x: 394, y: 22, width: 212, height: Math.max(0, nowY - 22), rx: 26, fill: '#d8ddd804' }, art);
          for (let value = lower; value <= upper; value++) {
            const pos = y(value), major = value % 12 === 0;
            svgEl('line', { x1: 403, x2: major ? 605 : 412, y1: pos, y2: pos, class: major ? 'cr-grid' : 'cr-guide' }, art);
            if (major && value < upper) text(art, 416, pos - 9, Math.floor(value / 12), 'cr-year');
          }
          text(art, 500, 10, 'DEC 2027').setAttribute('text-anchor', 'middle');
          text(art, 500, 949, 'SEP 2021').setAttribute('text-anchor', 'middle');
          svgEl('path', { d: pathBetween(38, 904), stroke: '#ffd40008', 'stroke-width': 38, fill: 'none', 'stroke-linecap': 'round' }, art);
          svgEl('path', { d: pathBetween(38, 904), stroke: '#ffd4001c', 'stroke-width': 36, fill: 'none', 'stroke-linecap': 'round' }, art);
          svgEl('path', { d: pathBetween(38, 904), stroke: '#14171b', 'stroke-width': 34, fill: 'none', 'stroke-linecap': 'round' }, art);
          svgEl('path', { d: pathBetween(38, 904, -8), stroke: '#ffd40019', 'stroke-width': 5, fill: 'none' }, art);
          svgEl('path', { d: pathBetween(38, 904, 8), stroke: '#d8ddd81b', 'stroke-width': 4, fill: 'none' }, art);
          data.forEach(item => {
            const group = svgEl('g', { class: 'cr-segment', 'data-id': item.id, 'data-kind': item.kind }, art);
            const start = month(item.start), finish = end(item), observed = Math.min(current + 1, finish);
            const edu = item.kind === 'education', offset = edu ? 8 : -8, color = edu ? '#d8ddd8' : '#ffd400';
            if (finish > observed) svgEl('path', { d: pathBetween(y(finish), y(observed), offset), stroke: color, 'stroke-width': 4, 'stroke-dasharray': '3 7', fill: 'none' }, group);
            if (observed > start) {
              svgEl('path', { d: pathBetween(y(observed), y(start), offset), stroke: color, 'stroke-width': edu ? 6 : 6, fill: 'none', 'stroke-linecap': 'round' }, group);
              if (edu) svgEl('path', { d: pathBetween(y(observed), y(start), offset), stroke: '#252c2c', 'stroke-width': 2, fill: 'none' }, group);
            }
            const card = cards.find(el => el.dataset.id === item.id);
            const cardBox = card.getBoundingClientRect(), stageBox = stage.getBoundingClientRect();
            const left = cardBox.left < stageBox.left + stageBox.width / 2;
            const cardX = (left ? cardBox.right - stageBox.left : cardBox.left - stageBox.left) / stageBox.width * 1000;
            const cardY = (cardBox.top + cardBox.height / 2 - stageBox.top) / stageBox.height * 960;
            const pointY = y(start), pointX = ribbonX(pointY) + offset;
            const elbow = left ? 380 : 620;
            svgEl('path', { d: `M${pointX} ${pointY} H${left ? pointX - 25 : pointX + 25} C${elbow} ${pointY} ${elbow} ${cardY} ${cardX} ${cardY}`, class: 'cr-connector' }, group);
            if (edu) svgEl('rect', { x: pointX - 4.5, y: pointY - 4.5, width: 9, height: 9, transform: `rotate(45 ${pointX} ${pointY})`, fill: '#15191e', stroke: color, 'stroke-width': 2 }, group);
            else svgEl('circle', { cx: pointX, cy: pointY, r: 5, fill: '#171810', stroke: color, 'stroke-width': 2 }, group);
          });
          svgEl('line', { x1: 397, x2: 603, y1: nowY, y2: nowY, stroke: '#ffd40088', 'stroke-width': 1, 'stroke-dasharray': '2 5' }, art);
          text(art, 528, nowY - 9, `${dateLabel.toUpperCase()}`, 'cr-now');
          // Keep labels at their native width when the ribbon narrows on tablet.
          const textScale = 1000 / stage.getBoundingClientRect().width;
          art.querySelectorAll('text').forEach(label => {
            const x = label.getAttribute('x'), y = label.getAttribute('y');
            label.setAttribute('transform', `translate(${x} ${y}) scale(${textScale} 1) translate(${-x} ${-y})`);
          });
          update();
        }
        function update() {
          const active = transient || pinned || scrolled;
          cards.forEach(card => {
            card.classList.toggle('is-active', card.dataset.id === active);
            card.setAttribute('aria-pressed', String(card.dataset.id === pinned));
          });
          art.querySelectorAll('.cr-segment').forEach(el => {
            const selected = el.dataset.id === active;
            el.classList.toggle('is-active', selected);
            const glow = el.querySelector('.cr-mobile-glow');
            if (glow) glow.setAttribute('opacity', selected ? '1' : '0');
          });
        }
        cards.forEach(card => {
          const item = byID.get(card.dataset.id);
          miniBar(card.querySelector('.cr-mobile-bar'), item);
          card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { transient = item.id; update(); } });
          card.addEventListener('pointerleave', () => { transient = null; update(); });
          card.addEventListener('focus', () => { transient = item.id; update(); });
          card.addEventListener('blur', () => { transient = null; update(); });
          card.addEventListener('click', () => { pinned = pinned === item.id ? null : item.id; transient = null; update(); });
        });
        section.addEventListener('keydown', event => { if (event.key === 'Escape') { pinned = null; transient = null; update(); } });
        function onScroll() {
          frame = 0;
          if (!visible || reduced.matches || pinned || transient) return;
          const focusY = window.innerHeight * .5;
          const nearest = cards.reduce((best, card) => {
            const rect = card.getBoundingClientRect(), distance = Math.abs(rect.top + rect.height / 2 - focusY);
            return distance < best.distance ? { id: card.dataset.id, distance } : best;
          }, { distance: Infinity });
          scrolled = nearest.id; update();
        }
        window.addEventListener('scroll', () => { if (visible && !frame) frame = requestAnimationFrame(onScroll); }, { passive: true });
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) onScroll(); }).observe(section);
        } else visible = true;
        if ('ResizeObserver' in window) new ResizeObserver(draw).observe(stage);
        else window.addEventListener('resize', draw);
        mobile.addEventListener('change', draw);
        draw();
        if (document.fonts) document.fonts.ready.then(draw);

      })();
