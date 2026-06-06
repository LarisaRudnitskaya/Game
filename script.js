(function () {
  'use strict';

  const SEGMENT_COLORS = [
    { fill: '#4a6741', text: '#ffffff' },
    { fill: '#fdfbf7', text: '#4a6741' },
    { fill: '#e2e8d8', text: '#4a6741' },
    { fill: '#ede8df', text: '#1a1a1a' },
  ];

  const PRIZES = [
    {
      id: 'discount10',
      label: 'Скидка 10%',
      short: '−10%',
      desc: 'Скидка 10% на любую покупку в официальном магазине Herbion.',
      promoCode: 'HERBION10',
    },
    {
      id: 'discount15',
      label: 'Скидка 15%',
      short: '−15%',
      desc: 'Скидка 15% на следующий заказ натуральной косметики Herbion.',
      promoCode: 'HERBION15',
    },
    {
      id: 'discount20',
      label: 'Скидка 20%',
      short: '−20%',
      desc: 'Скидка 20% на уходовые средства Herbion — только сегодня.',
      promoCode: 'HERBION20',
    },
    {
      id: 'ozon500',
      label: '500 ₽ на OZON',
      short: '500 ₽',
      desc: 'Бонус 500 рублей на покупку продукции Herbion на маркетплейсе OZON.',
      promoCode: 'HERBION500',
    },
    {
      id: 'ozon300',
      label: '300 ₽ на OZON',
      short: '300 ₽',
      desc: 'Бонус 300 рублей на заказ Herbion на OZON от 2000 ₽.',
      promoCode: 'HERBION300',
    },
    {
      id: 'shampoo',
      label: 'Шампунь в подарок',
      short: 'Шампунь',
      desc: 'Натуральный шампунь Herbion для волос — подарок при заказе от 1500 ₽.',
      promoCode: 'HERBIONGIFT',
    },
    {
      id: 'serum',
      label: 'Сыворотка в подарок',
      short: 'Сыворотка',
      desc: 'Увлажняющая сыворотка Herbion — бесплатно к заказу от 2500 ₽.',
      promoCode: 'HERBIONSERUM',
    },
    {
      id: 'twoForOne',
      label: '2 средства по цене 1',
      short: '2 = 1',
      desc: 'Спецпредложение: два средства Herbion по цене одного. Выберите пару в каталоге.',
      promoCode: 'HERBION2X1',
    },
    {
      id: 'delivery',
      label: 'Бесплатная доставка',
      short: 'Доставка',
      desc: 'Бесплатная доставка вашего заказа Herbion по всей России.',
      promoCode: 'HERBIONFREE',
    },
    {
      id: 'guide',
      label: 'Гид по уходу за кожей',
      short: 'Гид',
      desc: 'PDF-гид «Уход за проблемной кожей» от экспертов Herbion — на вашу почту.',
      promoCode: null,
    },
    {
      id: 'samples',
      label: 'Набор пробников',
      short: 'Пробники',
      desc: 'Мини-набор пробников Herbion — попробуйте линейку перед покупкой.',
      promoCode: 'HERBIONTRY',
    },
    {
      id: 'firstOrder',
      label: '−25% на первый заказ',
      short: '−25%',
      desc: 'Скидка 25% для новых клиентов Herbion на первую покупку.',
      promoCode: 'HERBIONNEW',
    },
  ];

  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const spinBtn = document.getElementById('spinBtn');
  const retryBtn = document.getElementById('retryBtn');
  const closeBtn = document.getElementById('closeBtn');
  const closeBtnAlt = document.getElementById('closeBtnAlt');
  const resultOverlay = document.getElementById('resultOverlay');
  const resultTitle = document.getElementById('resultTitle');
  const resultDesc = document.getElementById('resultDesc');
  const resultCodeWrap = document.getElementById('resultCodeWrap');
  const resultCode = document.getElementById('resultCode');
  const gameHint = document.getElementById('gameHint');
  const wheelWrapper = document.querySelector('.wheel-wrapper');

  const SEGMENT_COUNT = PRIZES.length;
  const SEGMENT_ANGLE = (2 * Math.PI) / SEGMENT_COUNT;
  const SPIN_DURATION = 5400;
  const MIN_SPINS = 5;

  let currentRotation = 0;
  let isSpinning = false;
  let logicalSize = 460;

  function getSegmentStyle(index) {
    return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
  }

  function drawWheel(rotation) {
    const size = logicalSize;
    const center = size / 2;
    const radius = center - 10;
    const fontSize = 14;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const startAngle = i * SEGMENT_ANGLE - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;
      const style = getSegmentStyle(i);
      const prize = PRIZES[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = style.fill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + SEGMENT_ANGLE / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = style.text;
      ctx.font = `700 ${fontSize}px "Inter", system-ui, sans-serif`;
      ctx.fillText(prize.short, radius - 14, fontSize * 0.35);
      ctx.restore();
    }

    ctx.restore();
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function normalizeRotation(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  function getTargetRotation(prizeIndex) {
    const segmentCenterLocal =
      prizeIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - Math.PI / 2;
    const desiredMod = normalizeRotation(-Math.PI / 2 - segmentCenterLocal);
    const currentMod = normalizeRotation(currentRotation);
    let delta = desiredMod - currentMod;
    if (delta <= 0) delta += 2 * Math.PI;
    const fullSpins = MIN_SPINS + Math.floor(Math.random() * 2);
    return currentRotation + delta + fullSpins * 2 * Math.PI;
  }

  function spin() {
    if (isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    wheelWrapper.classList.add('is-spinning');
    gameHint.textContent = 'Колесо крутится…';

    const prizeIndex = Math.floor(Math.random() * SEGMENT_COUNT);
    const targetRotation = getTargetRotation(prizeIndex);
    const startRotation = currentRotation;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = easeOutQuart(progress);

      currentRotation = startRotation + (targetRotation - startRotation) * eased;
      drawWheel(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentRotation = targetRotation;
        drawWheel(currentRotation);
        finishSpin(PRIZES[prizeIndex]);
      }
    }

    requestAnimationFrame(animate);
  }

  function finishSpin(prize) {
    isSpinning = false;
    spinBtn.disabled = false;
    wheelWrapper.classList.remove('is-spinning');
    gameHint.textContent = 'Один подарок на участника · нажмите «Крутить»';
    showResult(prize);
  }

  function showResult(prize) {
    resultTitle.textContent = prize.label;
    resultDesc.textContent = prize.desc;

    if (prize.promoCode) {
      resultCodeWrap.hidden = false;
      resultCode.textContent = prize.promoCode;
    } else {
      resultCodeWrap.hidden = true;
    }

    resultOverlay.hidden = false;
    resultOverlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      resultOverlay.classList.add('is-visible');
    });
  }

  function hideResult() {
    resultOverlay.classList.remove('is-visible');
    resultOverlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (!resultOverlay.classList.contains('is-visible')) {
        resultOverlay.hidden = true;
      }
    }, 350);
  }

  function handleResize() {
    const wrapper = canvas.parentElement;
    logicalSize = Math.min(wrapper.clientWidth, 460);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    canvas.style.width = logicalSize + 'px';
    canvas.style.height = logicalSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel(currentRotation);
  }

  spinBtn.addEventListener('click', spin);
  retryBtn.addEventListener('click', () => {
    hideResult();
    setTimeout(spin, 400);
  });
  closeBtn.addEventListener('click', hideResult);
  closeBtnAlt.addEventListener('click', hideResult);

  resultOverlay.addEventListener('click', (e) => {
    if (e.target === resultOverlay) hideResult();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resultOverlay.classList.contains('is-visible')) {
      hideResult();
    }
  });

  window.addEventListener('resize', handleResize);
  handleResize();
})();
