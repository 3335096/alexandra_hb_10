(function () {
  const COLORS = [
    '#ff6bb8',
    '#f43fa5',
    '#db2777',
    '#fcd34d',
    '#86efac',
    '#93c5fd',
    '#e9d5ff',
    '#fda4af',
    '#fbcfe8',
    '#fef08a',
  ];

  function burstConfetti(clientX, clientY) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const x =
      typeof clientX === 'number' && !Number.isNaN(clientX) ? clientX : window.innerWidth / 2;
    const y =
      typeof clientY === 'number' && !Number.isNaN(clientY) ? clientY : window.innerHeight / 2;

    const root = document.createElement('div');
    root.className = 'confetti-root';
    root.setAttribute('aria-hidden', 'true');
    root.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden;';

    document.body.appendChild(root);

    const n = 68;
    for (let i = 0; i < n; i++) {
      const piece = document.createElement('span');
      const w = 5 + Math.random() * 8;
      const h = 4 + Math.random() * 9;
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 420;
      const vx = Math.cos(angle) * speed * 0.45;
      const vy = Math.sin(angle) * speed * 0.45 - (120 + Math.random() * 280);
      const endX = vx * 1.15;
      const endY = vy + 420 + Math.random() * 160;
      const rot = Math.random() * 720;

      piece.className = 'confetti-chip';
      piece.style.cssText = [
        'position:absolute',
        'left:' + x + 'px',
        'top:' + y + 'px',
        'width:' + w + 'px',
        'height:' + h + 'px',
        'margin-left:' + -w / 2 + 'px',
        'margin-top:' + -h / 2 + 'px',
        'background-color:' + COLORS[Math.floor(Math.random() * COLORS.length)],
        'border-radius:' + (Math.random() > 0.4 ? '50%' : '3px'),
        'box-shadow:0 1px 2px rgba(0,0,0,.12)',
        'will-change:transform,opacity',
      ].join(';');

      root.appendChild(piece);

      const anim = piece.animate(
        [
          { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
          {
            transform: 'translate(' + endX + 'px,' + endY + 'px) rotate(' + rot + 'deg)',
            opacity: 0,
          },
        ],
        {
          duration: 1100 + Math.random() * 500,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
          fill: 'forwards',
        }
      );
      anim.onfinish = function () {
        if (piece.parentNode) piece.remove();
      };
    }

    window.setTimeout(function () {
      if (root.parentNode) root.remove();
    }, 2200);
  }

  window.burstConfetti = burstConfetti;
})();
