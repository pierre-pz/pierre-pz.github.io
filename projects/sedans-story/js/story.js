/* Native, reversible scroll enhancement. All evidence exists in the initial HTML. */
(() => {
  'use strict';
  const root = document.querySelector('.sedans-story');
  if (!root) return;
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const evidence = JSON.parse($('#sd-evidence').textContent);
  const years = evidence.fleet.values;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // CSS owns eligibility; measured content fit is the final guard (including text zoom).
  let sceneFits = false;
  const chapters = $$('.sd-chapter');
  const navLinks = $$('.sd-chapter-menu nav a');
  const menu = $('.sd-chapter-menu');
  const motionButton = $('#motion-toggle');
  const fleet = $('#fleet');
  const fleetSteps = $$('.sd-fleet-step');
  const fleetFigure = $('.sd-fleet-visual');
  const fleetSvg = $('.sd-fleet-svg');
  const clip = $('#sd-reveal-rect');
  const slider = $('#fleet-slider');
  const follow = $('#fleet-follow');
  const procession = $('#model-procession');
  const stage = $('.sd-lineup-stage');
  const lanes = [$$('.sd-departure .sd-model'), $$('.sd-introduction .sd-model')];
  const modelToggle = $('#lineup-toggle');
  let userReduced = false;
  let manualYear = null;
  let allModels = false;
  let framePending = false;
  let lastYear = -1;
  let lastChapter = -1;
  let printing = false;
  let lastScrollIndex = -1;
  let plotBottom = 270;
  let plotSpan = 238;
  let modelImagesPrimed = false;
  const motionAllowed = () => !reduced.matches && !userReduced && !printing;
  const fullScene = () => motionAllowed() && sceneFits;

  function fitScenes() {
    const eligible = getComputedStyle(root).getPropertyValue('--sd-sticky-eligible').trim() === '1';
    root.classList.toggle('sd-scene', eligible && motionAllowed());
    sceneFits = eligible && motionAllowed();
    if (sceneFits) {
      const top = parseFloat(getComputedStyle(fleetFigure).top);
      const modelsFit = allModels || lanes.flat().every(card => {
        const lane = card.closest('.sd-lane');
        const stack = card.parentElement;
        return lane.offsetTop + stack.offsetTop + card.offsetTop + card.offsetHeight <= stage.clientHeight - 12;
      });
      sceneFits = fleetFigure.offsetHeight <= innerHeight - top - 14 && modelsFit;
      root.classList.toggle('sd-scene', sceneFits);
    }
    root.dataset.sceneMode = fullScene() ? 'sticky' : !motionAllowed() ? 'reduced-motion' : 'static';
    resizePlot();
  }

  function resizePlot() {
    // Re-layout the plot, rather than squashing its text and circular markers.
    const viewHeight = fleetSvg.clientHeight * 620 / fleetSvg.clientWidth;
    plotBottom = viewHeight - 34;
    plotSpan = plotBottom - 24;
    const y = value => plotBottom - value / 1000 / 12 * plotSpan;
    fleetSvg.setAttribute('viewBox', `0 0 620 ${viewHeight}`);
    fleetSvg.style.setProperty('--sd-axis-size', `${Math.max(12, 12 * 620 / fleetSvg.clientWidth)}px`);
    $$('.sd-gridline', fleetSvg).forEach((line, i) => {
      line.setAttribute('y1', y(i * 4000)); line.setAttribute('y2', y(i * 4000));
    });
    $$('.sd-axis:not(.sd-year-tick):not(#sd-crossover-label)', fleetSvg).forEach((tick, i) => tick.setAttribute('y', y(i * 4000) + 4));
    // Keep the crossover note in the open lower-left plot area, clear of the 2022 marker.
    const crossover = $('#sd-crossover-label');
    crossover.setAttribute('x', 48);
    crossover.setAttribute('y', y(2000));
    crossover.setAttribute('text-anchor', 'start');
    $$('.sd-year-tick', fleetSvg).forEach(tick => tick.setAttribute('y', viewHeight - 10));
    $('.sd-car-line').setAttribute('points', years.map((r, i) => `${56+i*65},${y(r.passenger_cars)}`).join(' '));
    $('.sd-mpv-line').setAttribute('points', years.map((r, i) => `${56+i*65},${y(r.multi_purpose_vehicles)}`).join(' '));
    $$('g[clip-path] rect', fleetSvg).forEach((point, i) => point.setAttribute('y', y(years[i].passenger_cars) - 3.5));
    $$('g[clip-path] circle', fleetSvg).forEach((point, i) => point.setAttribute('cy', y(years[i].multi_purpose_vehicles)));
    clip.setAttribute('height', viewHeight);
    $('#sd-year-marker').setAttribute('y1', 20);
    $('#sd-year-marker').setAttribute('y2', plotBottom + 5);
    lastYear = -1;
  }

  function updateMotion() {
    root.classList.toggle('sd-motion', motionAllowed());
    motionButton.textContent = motionAllowed() ? 'Reduce motion' : 'Motion reduced';
    motionButton.setAttribute('aria-pressed', String(!motionAllowed()));
    motionButton.disabled = reduced.matches;
    motionButton.title = reduced.matches ? 'Your system preference requests reduced motion.' : '';
    fitScenes();
    modelToggle.hidden = !fullScene();
    $$('.sd-scroll-hint').forEach(el => { el.hidden = !fullScene() || allModels; });
    if (!motionAllowed()) manualYear = null;
    queue();
  }

  function fleetScrollIndex() {
    // Shorter prose spacing, but a reserved 72-96px of travel for each
    // intermediate observed year. The crossover still gets the longer pause.
    const heading = step => $('.sd-step-year', step).getBoundingClientRect().top + scrollY;
    const readingLine = innerHeight * .62;
    const crossover = heading(fleetSteps[1]) - readingLine;
    const final = heading(fleetSteps[2]) - readingLine;
    const annualTravel = clamp(innerHeight * .11, 72, 96);
    const start = crossover - 4 * annualTravel;
    const release = final - 2 * annualTravel;
    if (scrollY < start) return 0;
    if (scrollY < crossover) return 1 + Math.min(3, Math.floor(clamp((scrollY-start)/(crossover-start)) * 4));
    if (scrollY < release) return 5;
    if (scrollY < final) return 6 + Math.min(1, Math.floor(clamp((scrollY-release)/(final-release)) * 2));
    return 8;
  }

  function renderFleet(scrollIndex) {
    // One observed row owns all current labels, markers and drawn geometry.
    const index = manualYear === null ? (fullScene() ? scrollIndex : 8) : manualYear - 2017;
    clip.setAttribute('width', String(14 + index * 65));
    fleetSteps.forEach(step => {
      const active = fullScene() && scrollIndex === index && Number(step.dataset.year) === years[index].year;
      step.dataset.active = String(active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    fleetFigure.dataset.year = years[index].year;
    fleetFigure.dataset.storyYear = years[scrollIndex].year;
    fleetFigure.dataset.control = manualYear === null ? 'story' : 'manual';
    if (index !== lastYear) {
      const row = years[index];
      $('#fleet-year').textContent = row.year;
      $('#cars-value').innerHTML = `${(row.passenger_cars / 1000).toFixed(1)} <small>million</small>`;
      $('#mpv-value').innerHTML = `${(row.multi_purpose_vehicles / 1000).toFixed(1)} <small>million</small>`;
      slider.value = row.year;
      slider.setAttribute('aria-valuetext', `${row.year}: ${(row.passenger_cars / 1000).toFixed(1)} million passenger cars; ${(row.multi_purpose_vehicles / 1000).toFixed(1)} million multi-purpose vehicles`);
      const x = 56 + index * 65;
      $('#sd-year-marker').setAttribute('x1', x);
      $('#sd-year-marker').setAttribute('x2', x);
      $('#sd-current-car').setAttribute('cx', x);
      $('#sd-current-car').setAttribute('cy', plotBottom - row.passenger_cars / 1000 / 12 * plotSpan);
      $('#sd-current-mpv').setAttribute('cx', x);
      $('#sd-current-mpv').setAttribute('cy', plotBottom - row.multi_purpose_vehicles / 1000 / 12 * plotSpan);
      $$('.sd-year-tick').forEach(tick => tick.classList.toggle('sd-current-tick', Number(tick.textContent) === row.year));
      $('#sd-crossover-label').style.visibility = row.year === 2022 ? 'visible' : 'hidden';
      lastYear = index;
    }
    follow.hidden = manualYear === null || !fullScene();
  }

  function renderModels(progress, arrival) {
    const animated = fullScene() && !allModels;
    const ease = t => t * t * (3 - 2 * t);
    const travel = Math.max(1, procession.getBoundingClientRect().height - stage.getBoundingClientRect().height);
    const transition = clamp(innerHeight * .31, 200, 260);
    const hold = Math.max(1, (travel - 3 * transition) / 4);
    const elapsed = progress * travel;
    const beat = Math.min(3, Math.floor(elapsed / (hold + transition)));
    const phase = elapsed - beat * (hold + transition);
    const changing = beat < 3 && phase > hold;
    const mix = changing ? clamp((phase - hold) / transition) : 0;
    const blend = ease(mix);
    const selected = beat + (changing && mix >= .5 ? 1 : 0);
    const distance = Math.min(110, Math.max(70, stage.clientHeight * .17));
    procession.dataset.progress = progress.toFixed(5);
    procession.dataset.beat = String(selected + 1);
    procession.dataset.phase = changing ? 'transition' : 'hold';
    procession.dataset.mix = mix.toFixed(5);
    procession.dataset.arrival = arrival.toFixed(5);
    lanes.forEach((cards, laneIndex) => {
      cards[0].closest('.sd-lane').dataset.beat = String(selected + 1);
      cards.forEach((card, i) => {
        if (!animated) {
          card.style.removeProperty('transform');
          card.style.removeProperty('opacity');
          card.style.removeProperty('visibility');
          ['--sd-copy-opacity','--sd-copy-y','--sd-image-opacity','--sd-image-y'].forEach(name => card.style.removeProperty(name));
          card.removeAttribute('aria-hidden');
          card.inert = false;
          return;
        }
        // Images overlap deliberately; text never does. Both lanes use the
        // same blend, with opposite vertical movement and no timed animation.
        let imageOpacity = 0, copyOpacity = 0, offset = 0;
        if (i === beat) {
          imageOpacity = changing ? 1 - blend : 1;
          copyOpacity = changing ? 1 - ease(clamp(mix / .42)) : 1;
          offset = changing ? blend : 0;
          if (beat === 0 && progress === 0) {
            imageOpacity = .35 + .65 * arrival;
            copyOpacity = .65 + .35 * arrival;
            offset = -(1 - arrival);
          }
        } else if (changing && i === beat + 1) {
          imageOpacity = blend;
          copyOpacity = ease(clamp((mix - .58) / .42));
          offset = -(1 - blend);
        }
        const direction = laneIndex === 0 ? -1 : 1;
        const y = `${(direction * offset * distance).toFixed(2)}px`;
        const painted = imageOpacity > 0 || copyOpacity > 0;
        card.style.opacity = painted ? '1' : '0';
        card.style.transform = 'none';
        card.style.visibility = painted ? 'visible' : 'hidden';
        card.style.setProperty('--sd-image-opacity', imageOpacity.toFixed(4));
        card.style.setProperty('--sd-copy-opacity', copyOpacity.toFixed(4));
        card.style.setProperty('--sd-image-y', y);
        card.style.setProperty('--sd-copy-y', y);
        const readable = copyOpacity > .01;
        card.inert = !readable;
        card.setAttribute('aria-hidden', String(!readable));
      });
    });
    $('.sd-procession-meter span').style.transform = `scaleX(${progress})`;
  }

  function update() {
    framePending = false;
    const height = innerHeight;
    const end = $('#story-end').getBoundingClientRect().top + scrollY;
    $('#reading-progress').style.transform = `scaleX(${clamp(scrollY / Math.max(1, end - height))})`;
    let active = 0;
    chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top < height * .42) active = index; });
    if (active !== lastChapter) {
      $('#chapter-status').textContent = `${String(active+1).padStart(2,'0')} — ${chapters[active].dataset.label}`;
      navLinks.forEach(link => {
        if (link.hash === `#${chapters[active].id}`) link.setAttribute('aria-current','true');
        else link.removeAttribute('aria-current');
      });
      lastChapter = active;
    }
    const scrollIndex = fleetScrollIndex();
    // A manual choice holds until the next annual scroll stage, without timers.
    if (scrollIndex !== lastScrollIndex) { manualYear = null; lastScrollIndex = scrollIndex; }
    renderFleet(scrollIndex);
    const lineRect = procession.getBoundingClientRect();
    if (!modelImagesPrimed && lineRect.top < height * 2) {
      $$('.sd-model-image').forEach(img => { img.loading = 'eager'; });
      modelImagesPrimed = true;
    }
    // Entry uses the approach to the pin, not the first short pinned beat.
    // At primary focus the first pair is already legible, then gets a full hold.
    const pin = parseFloat(getComputedStyle(stage).top) || 80;
    const approach = clamp((height * .9 - lineRect.top) / Math.max(1, height * .78 - pin));
    const arrival = approach * approach * (3 - 2 * approach);
    const modelProgress = clamp((pin - lineRect.top) / Math.max(1,lineRect.height-stage.getBoundingClientRect().height));
    renderModels(modelProgress, arrival);
    const hero = $('.sd-hero-grid').getBoundingClientRect();
    // Hold the opening pose briefly; finish while the hero is still in view.
    // Stacked layouts wait until the portrait itself is comfortably visible.
    const stackedHero = getComputedStyle($('.sd-hero-grid')).display === 'flex';
    const portrait = $('.sd-portrait-pair').getBoundingClientRect();
    const poseStart = stackedHero ? Math.max(20, portrait.top + scrollY - height * .55) : 20;
    const poseRange = stackedHero ? 140 : clamp(hero.height * .2, 120, 150);
    const poseMix = motionAllowed() ? clamp((scrollY - poseStart) / poseRange) : 0;
    const poseProgress = poseMix * poseMix * (3 - 2 * poseMix);
    $('.sd-thinking').style.opacity = (1-poseProgress).toFixed(3);
    $('.sd-shrug').style.opacity = poseProgress.toFixed(3);
    // Endpoint bars are quantitative geometry; reveal them by viewport progress, never count up values.
    $$('.sd-endpoints,.sd-search-chart').forEach(block => {
      const rect = block.getBoundingClientRect();
      const reveal = motionAllowed() ? clamp((height*.94-rect.top)/(height*.33)) : 1;
      $$('div.sd-endpoint-track>span,div.sd-search-track>span',block).forEach(bar => {
        bar.style.transform = `scaleX(${reveal})`;
      });
    });
  }
  function queue() {
    if (!framePending) { framePending = true; requestAnimationFrame(update); }
  }
  motionButton.addEventListener('click', () => { userReduced = !userReduced; updateMotion(); });
  slider.addEventListener('input', () => { manualYear = Number(slider.value); queue(); });
  $('#fleet-complete').addEventListener('click', () => { manualYear = 2025; queue(); });
  follow.addEventListener('click', () => { manualYear = null; queue(); });
  modelToggle.addEventListener('click', () => {
    allModels = !allModels;
    procession.dataset.static = String(allModels);
    modelToggle.textContent = allModels ? 'Restore scroll sequence' : 'View all models';
    modelToggle.setAttribute('aria-pressed', String(allModels));
    updateMotion();
  });
  navLinks.forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; $('summary',menu).focus(); } });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
  $$('.sd-data-link').forEach(link => link.addEventListener('click', () => { $('#fleet-table').open = true; }));
  if (location.hash === '#fleet-table') $('#fleet-table').open = true;
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',updateMotion,{passive:true});
  reduced.addEventListener('change', updateMotion);
  document.fonts.ready.then(updateMotion);
  $$('.sd-model-image').forEach(img => img.addEventListener('load', updateMotion, {once:true}));
  addEventListener('beforeprint', () => { printing = true; updateMotion(); update(); });
  addEventListener('afterprint', () => { printing = false; updateMotion(); });
  $$('.sd-js-only').forEach(el => { el.hidden = false; });
  // Portraits use local staged-photo assets; the secondary crossfade stays decorative.
  root.dataset.enhanced = 'true';
  updateMotion();
  update();
})();
