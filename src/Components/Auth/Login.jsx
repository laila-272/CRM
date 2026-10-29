import React, { useState, useEffect, useRef } from "react";

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lp-body {
    min-height: 100vh;
    background: #0d0400;
    color: #fff;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }

  /* ── Canvas background ── */
  #auth-waves-canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  /* ── Page ── */
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 30px;
    position: relative;
    z-index: 1;
  }

  /* ── Grid ── */
  .register-container {
    width: 100%;
    max-width: 1240px;
    display: grid;
    grid-template-columns: 46% 54%;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .auth-zoom-out { zoom: 0.8; }

  /* ══ LEFT SIDE ══ */
  .left-side {
    padding: 50px 55px 50px 20px;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .brand { display: flex; align-items: center; gap: 12px; }

  .brand-favicon {
    width: 128px !important;
    height: 128px !important;
    object-fit: contain;
    flex-shrink: 0;
  }

  .hero {
    margin-top: 44px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .hero h1 {
    font-size: clamp(26px, 2.6vw, 42px);
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: -1.5px;
    color: #fff;
  }

  .hero h1 span {
    background: linear-gradient(90deg, #c2410c, #b84d00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero p {
    margin-top: 16px;
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.7;
    max-width: 380px;
  }

  .features {
    list-style: none;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .features li {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #cbd5e1;
    font-size: 12px;
    padding: 10px 14px;
    background: rgba(255,255,255,.025);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.05);
    transition: background .2s;
    cursor: default;
  }

  .features li:hover {
    background: rgba(194,65,12,.07);
    border-color: rgba(194,65,12,.15);
  }

  .feature-icon {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #92400e, #b84d00);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(184,77,0,.3);
    flex: 0 0 30px;
  }

  .feature-icon i { color: #fff; line-height: 1; }

  /* Stats */
  .stats {
    display: flex;
    align-items: stretch;
    gap: 0;
    margin-top: 32px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(194,65,12,.15);
    border-radius: 14px;
    overflow: hidden;
  }

  .stat {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
    text-align: center;
    min-width: 0;
  }

  .stat + .stat::before {
    content: '';
    position: absolute;
    left: 0; top: 18%; bottom: 18%;
    width: 1px;
    background: rgba(255,255,255,.08);
  }

  .stat-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(194,65,12,.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
  }

  .stat-icon-wrap i { font-size: 14px; color: #fb923c; }

  .stat strong {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    white-space: nowrap;
  }

  .stat span { color: #64748b; font-size: 13px; display: block; }

  /* ══ Mockup ══ */
  .mockup-wrap {
    position: relative;
    margin-top: auto;
    padding-top: 32px;
    width: 100%;
    max-width: 480px;
    height: 295px;
    padding-left: 44px;
  }

  .float-card-left {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background: rgba(26,10,0,.9);
    border: 1px solid rgba(194,65,12,.35);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0,0,0,.55), 0 0 14px rgba(184,77,0,.15);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
  }

  .float-card-left i { font-size: 18px; color: #b84d00; }

  .dashboard-preview {
    position: absolute;
    left: 44px; right: 0;
    top: 0; bottom: 0;
    background: #110800;
    border: 1px solid rgba(194,65,12,.25);
    border-radius: 14px;
    box-shadow:
      0 40px 80px rgba(0,0,0,.75),
      0 0 50px rgba(184,77,0,.1),
      inset 0 1px 0 rgba(255,255,255,.04);
    padding: 11px 10px 9px;
    transform: perspective(1400px) rotateX(3deg) rotateY(-4deg);
    overflow: hidden;
    z-index: 2;
  }

  .dashboard-top {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
  }

  .dots { display: flex; gap: 4px; }
  .dots span { width: 7px; height: 7px; border-radius: 50%; opacity: .9; }
  .dots span:nth-child(1) { background: #ef4444; }
  .dots span:nth-child(2) { background: #f59e0b; }
  .dots span:nth-child(3) { background: #22c55e; }

  .db-title-bar {
    height: 11px; width: 75px;
    background: rgba(194,65,12,.18);
    border-radius: 4px;
    margin-left: 5px;
  }

  .dashboard-body {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 7px;
    height: calc(100% - 26px);
  }

  .dashboard-sidebar {
    background: rgba(255,255,255,.025);
    border-radius: 7px;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .side-item { height: 6px; border-radius: 4px; background: rgba(255,255,255,.08); }
  .side-item.active {
    height: 16px;
    border-radius: 4px;
    background: linear-gradient(90deg, #92400e, #b84d00);
  }

  .side-avatar {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: rgba(194,65,12,.22);
    margin: auto auto 0;
    border: 1px solid rgba(194,65,12,.3);
  }

  .dashboard-content { display: flex; flex-direction: column; gap: 6px; overflow: hidden; }

  .dc-top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0; }

  .dc-card {
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(194,65,12,.1);
    border-radius: 6px;
    padding: 6px 7px;
  }

  .dc-card-title { height: 5px; width: 50%; background: rgba(255,255,255,.18); border-radius: 3px; margin-bottom: 5px; }

  .dc-bar { height: 5px; border-radius: 3px; margin-bottom: 3px; }
  .dc-bar.b1 { width: 78%; background: linear-gradient(90deg, #92400e, #b84d00); }
  .dc-bar.b2 { width: 52%; background: linear-gradient(90deg, #7c2d12, #92400e); }
  .dc-bar.b3 { width: 62%; background: rgba(194,65,12,.35); }
  .dc-bar.b4 { width: 38%; background: rgba(184,77,0,.3); }

  .chart {
    flex: 1;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(194,65,12,.08);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .chart svg { position: absolute; inset: 0; width: 100%; height: 100%; }

  .dc-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; flex-shrink: 0; }

  .dc-sm-card {
    background: rgba(255,255,255,.035);
    border: 1px solid rgba(194,65,12,.1);
    border-radius: 6px;
    padding: 6px 7px;
  }

  .dc-sm-card-centered { text-align: center; }
  .dc-sm-title { height: 4px; width: 55%; background: rgba(255,255,255,.15); border-radius: 3px; margin-bottom: 5px; }
  .dc-sm-title-centered { margin: 0 auto 4px; }

  .dc-sm-bar { height: 4px; border-radius: 3px; margin-bottom: 3px; }
  .dc-sm-bar.p { width: 72%; background: rgba(194,65,12,.4); }
  .dc-sm-bar.q { width: 48%; background: rgba(184,77,0,.3); }
  .dc-sm-bar.r { width: 62%; background: rgba(124,45,8,.38); }
  .dc-sm-bar.s { width: 38%; background: rgba(124,45,8,.25); }

  .dc-donut {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 3px solid #92400e;
    border-right-color: #b84d00;
    border-bottom-color: rgba(194,65,12,.2);
    margin: 2px auto 0;
  }

  /* ══ RIGHT SIDE ══ */
  .right-side {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 30px 40px 40px;
    position: relative;
  }

  .language {
    position: absolute;
    top: 6px; right: 24px;
    z-index: 3;
    border: 1px solid rgba(194,65,12,.45);
    border-radius: 30px;
    padding: 9px 16px;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
    background: rgba(20,8,0,.65);
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .language a { color: #94a3b8; text-decoration: none; white-space: nowrap; cursor: pointer; }
  .language a:hover, .language a.active { color: #fff; }

  [dir="rtl"] .language { right: auto; left: 24px; }

  .register-card {
    width: 100%;
    max-width: 600px;
    background: linear-gradient(145deg, rgba(20,8,0,.97), rgba(10,4,0,.99));
    border: 1px solid rgba(194,65,12,.28);
    border-radius: 18px;
    padding: 40px;
    box-shadow: 0 30px 100px rgba(0,0,0,.6), 0 0 60px rgba(184,77,0,.1);
    backdrop-filter: blur(20px);
  }

  .register-card h2 { font-size: 28px; font-weight: 800; letter-spacing: -1px; }

  .register-card-subtitle {
    color: #94a3b8;
    margin-top: 8px;
    margin-bottom: 26px;
    line-height: 1.6;
    font-size: 13px;
  }

  .form-group { margin-bottom: 18px; }

  .form-group label {
    display: block;
    color: #f8fafc;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .input-wrapper { position: relative; }

  .input-wrapper > i {
    position: absolute;
    left: 16px; top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 16px;
    pointer-events: none;
    z-index: 2;
  }

  .form-control {
    width: 100%;
    height: 50px;
    padding: 0 48px 0 46px;
    border-radius: 10px;
    border: 1px solid rgba(194,65,12,.35);
    background: rgba(15,5,0,.8);
    color: #fff;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    transition: .2s;
    position: relative;
    z-index: 1;
  }

  .form-control::placeholder { color: #4b5563; }

  .form-control:focus {
    border-color: #c2410c;
    box-shadow: 0 0 0 3px rgba(194,65,12,.12);
    background: rgba(28,10,0,.9);
  }

  .pw-toggle {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 16px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .pw-toggle:hover { color: #94a3b8; }

  .terms {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 20px 0;
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.6;
    cursor: pointer;
  }

  .terms input { margin-top: 3px; accent-color: #c2410c; flex-shrink: 0; }

  .register-button {
    width: 100%;
    height: 48px;
    border: 0;
    border-radius: 30px;
    background: linear-gradient(90deg, #7c2d12, #92400e, #b84d00);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 10px 35px rgba(146,64,14,.4);
    transition: .2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .register-button:disabled { opacity: 0.7; cursor: not-allowed; }

  .register-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 45px rgba(146,64,14,.6);
  }

  .login-text {
    text-align: center;
    margin-top: 22px;
    color: #64748b;
    font-size: 14px;
  }

  .login-text a {
    color: #d97706;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
  }

  .login-text a:hover { text-decoration: underline; }

  .error-box {
    margin-bottom: 18px;
    padding: 12px 15px;
    border-radius: 10px;
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.25);
    color: #fca5a5;
    font-size: 13px;
  }

  .error-box ul { margin-left: 18px; }

  /* ── Responsive ── */
  @media (max-width: 1000px) {
    .register-container { grid-template-columns: 1fr; }
    .left-side { display: none; }
    .right-side { min-height: 100vh; padding: 30px; }
  }

  @media (max-width: 600px) {
    .register-page { padding: 15px; }
    .right-side { padding: 15px; }
    .register-card { padding: 26px 18px; }
    .register-card h2 { font-size: 22px; }
  }
`;

// ─── Auth Waves Canvas ─────────────────────────────────────────────────────────
// نفس التأثير الموجود في الصورة: خطوط sine wave متشابكة بزوايا مختلفة على الشاشة كلها
function AuthWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // رسم خط sine wave بزاوية مائلة من نقطة بداية لنقطة نهاية
    function drawWaveLine(
      x0,
      y0,
      x1,
      y1,
      amplitude,
      frequency,
      phase,
      speed,
      alpha,
      lineWidth,
    ) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(len / 3);

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // موقع على المحور الأساسي
        const bx = x0 + dx * t;
        const by = y0 + dy * t;
        // الاتجاه العمودي للخط (perpendicular)
        const nx = -dy / len;
        const ny = dx / len;
        // موجة sine في الاتجاه العمودي
        const wave =
          Math.sin(t * len * frequency + time * speed + phase) * amplitude;
        const px = bx + nx * wave;
        const py = by + ny * wave;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.strokeStyle = `rgba(184, 77, 0, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    function animate() {
      const W = canvas.width;
      const H = canvas.height;

      // خلفية بـ radial gradient
      const grad = ctx.createRadialGradient(
        W * 0.3,
        H * 0.6,
        0,
        W * 0.3,
        H * 0.6,
        Math.max(W, H),
      );
      grad.addColorStop(0, "#1e0a00");
      grad.addColorStop(0.45, "#100500");
      grad.addColorStop(1, "#060200");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ═══ مجموعة الخطوط المائلة من أسفل يسار لأعلى يمين ═══
      const diag1 = [
        // [x0_ratio, y0_ratio, x1_ratio, y1_ratio, amp, freq, phase, speed, alpha, lw]
        [-0.1, 1.1, 0.9, -0.05, 32, 0.01, 0.0, 0.28, 0.18, 1.2],
        [-0.05, 1.15, 0.95, 0.0, 26, 0.008, 1.2, 0.22, 0.22, 1.5],
        [0.0, 1.2, 1.0, 0.05, 38, 0.012, 2.5, 0.32, 0.15, 1.0],
        [0.05, 1.25, 1.05, 0.1, 22, 0.009, 0.8, 0.25, 0.2, 1.3],
        [0.1, 1.3, 1.1, 0.15, 30, 0.011, 3.8, 0.3, 0.14, 1.0],
        [0.15, 1.1, 1.1, 0.0, 28, 0.007, 1.5, 0.2, 0.16, 1.1],
        [0.2, 1.2, 1.15, 0.05, 34, 0.013, 4.2, 0.35, 0.12, 0.9],
        [-0.2, 1.0, 0.8, -0.1, 20, 0.008, 2.0, 0.18, 0.16, 1.2],
        [-0.15, 0.95, 0.85, -0.15, 24, 0.01, 3.5, 0.26, 0.13, 1.0],
      ];

      // ═══ مجموعة خطوط عكسية من أعلى يسار لأسفل يمين (بزاوية أقل) ═══
      const diag2 = [
        [-0.1, -0.1, 1.1, 0.7, 30, 0.009, 1.0, 0.24, 0.14, 1.1],
        [-0.15, 0.0, 1.1, 0.8, 25, 0.011, 2.8, 0.3, 0.12, 1.0],
        [-0.05, -0.2, 1.05, 0.6, 35, 0.008, 0.3, 0.2, 0.15, 1.2],
        [0.0, -0.15, 1.0, 0.65, 22, 0.012, 4.0, 0.28, 0.11, 0.9],
        [-0.2, 0.1, 1.2, 0.9, 28, 0.01, 1.8, 0.22, 0.13, 1.0],
        [-0.1, 0.2, 1.1, 1.0, 32, 0.007, 3.2, 0.26, 0.12, 1.1],
      ];

      [...diag1, ...diag2].forEach(
        ([x0r, y0r, x1r, y1r, amp, freq, phase, speed, alpha, lw]) => {
          drawWaveLine(
            x0r * W,
            y0r * H,
            x1r * W,
            y1r * H,
            amp,
            freq,
            phase,
            speed,
            alpha,
            lw,
          );
        },
      );

      time += 0.012;
      animId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="auth-waves-canvas" aria-hidden="true" />;
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="mockup-wrap">
      <div className="float-card-left">
        <i className="fas fa-lock" />
      </div>
      <div className="dashboard-preview">
        <div className="dashboard-top">
          <div className="dots">
            <span />
            <span />
            <span />
          </div>
          <div className="db-title-bar" />
        </div>
        <div className="dashboard-body">
          <div className="dashboard-sidebar">
            <div className="side-item active" />
            <div className="side-item" />
            <div className="side-item" />
            <div className="side-item" />
            <div className="side-item" />
            <div className="side-avatar" />
          </div>
          <div className="dashboard-content">
            <div className="dc-top-row">
              <div className="dc-card">
                <div className="dc-card-title" />
                <div className="dc-bar b1" />
                <div className="dc-bar b2" />
              </div>
              <div className="dc-card">
                <div className="dc-card-title" />
                <div className="dc-bar b3" />
                <div className="dc-bar b4" />
              </div>
            </div>
            <div className="chart">
              <svg
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b84d00" stopOpacity="0.6" />
                    <stop
                      offset="100%"
                      stopColor="#b84d00"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                  <linearGradient id="gBrown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,78 C35,72 65,55 105,48 C145,41 175,55 215,40 C255,25 295,15 335,26 C360,33 385,29 400,27 L400,100 L0,100 Z"
                  fill="url(#gOrange)"
                />
                <path
                  d="M0,78 C35,72 65,55 105,48 C145,41 175,55 215,40 C255,25 295,15 335,26 C360,33 385,29 400,27"
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="2"
                />
                <path
                  d="M0,88 C45,84 80,70 120,64 C160,58 190,70 230,57 C270,44 310,40 355,50 C375,55 392,52 400,51 L400,100 L0,100 Z"
                  fill="url(#gBrown)"
                />
                <path
                  d="M0,88 C45,84 80,70 120,64 C160,58 190,70 230,57 C270,44 310,40 355,50 C375,55 392,52 400,51"
                  fill="none"
                  stroke="#7c2d12"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              </svg>
            </div>
            <div className="dc-bottom-row">
              <div className="dc-sm-card">
                <div className="dc-sm-title" />
                <div className="dc-sm-bar p" />
                <div className="dc-sm-bar q" />
              </div>
              <div className="dc-sm-card dc-sm-card-centered">
                <div className="dc-sm-title dc-sm-title-centered" />
                <div className="dc-donut" />
              </div>
              <div className="dc-sm-card">
                <div className="dc-sm-title" />
                <div className="dc-sm-bar r" />
                <div className="dc-sm-bar s" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main LoginPage Component ─────────────────────────────────────────────────
/**
 * LoginPage React Component
 *
 * Props:
 *   - onLogin(email, password, remember): async fn → ربط الـ API هنا
 *       يرجع بيانات النجاح أو يعمل throw للـ error
 *   - onRegisterClick(): fn → اتفضح لما يضغط Register
 *   - onLanguageChange(locale): fn → 'en' | 'ar'
 *   - locale: 'en' | 'ar'  (default: 'en')
 *   - logoSrc: رابط صورة اللوجو
 *   - registerUrl: رابط صفحة التسجيل (لو مفيش onRegisterClick)
 *
 * مثال ربط API:
 *   <LoginPage
 *     onLogin={async (email, password, remember) => {
 *       const res = await fetch('/api/login', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
 *         body: JSON.stringify({ email, password, remember }),
 *       });
 *       const data = await res.json();
 *       if (!res.ok) throw data;
 *       window.location.href = '/dashboard';
 *     }}
 *     onRegisterClick={() => navigate('/register')}
 *   />
 */
export default function LoginPage({
  onLogin,
  onRegisterClick,
  onLanguageChange,
  locale = "en",
  logoSrc = "/assets/logo/favicon.png",
  registerUrl = "/register",
}) {
  const isRtl = locale === "ar";

  // ── i18n ─────────────────────────────────────────────────────────────────────
  const translations = {
    en: {
      heroTitle: (
        <>
          Manage smarter,
          <br />
          <span>grow faster.</span>
        </>
      ),
      heroDesc:
        "A unified CRM platform that centralises your clients, sales pipeline, and team collaboration in one powerful dashboard.",
      featureDashboard: "Unified dashboard for all your business data",
      featureSales: "Boost sales with real-time pipeline insights",
      featureSecurity: "Enterprise-grade security & role management",
      daysFree: "Days Free",
      industries: "Industries",
      support: "Support",
      welcomeBack: "Welcome back 👋",
      loginSubtitle: "Enter your credentials to access your workspace.",
      email: "Email",
      emailPlaceholder: "you@company.com",
      password: "Password",
      passwordPlaceholder: "••••••••",
      rememberMe: "Remember me",
      login: "Login",
      noAccount: "Don't have an account?",
      register: "Register",
      langEn: "EN",
      langAr: "AR",
    },
    ar: {
      heroTitle: (
        <>
          أدِر بذكاء،
          <br />
          <span>انمو بسرعة.</span>
        </>
      ),
      heroDesc:
        "منصة CRM موحّدة تجمع عملاءك وخط المبيعات وتعاون الفريق في لوحة تحكم واحدة قوية.",
      featureDashboard: "لوحة تحكم موحّدة لجميع بيانات أعمالك",
      featureSales: "عزّز المبيعات برؤى خط الأنابيب الفوري",
      featureSecurity: "أمان على مستوى المؤسسة وإدارة الأدوار",
      daysFree: "أيام مجانية",
      industries: "قطاع",
      support: "دعم",
      welcomeBack: "مرحباً بعودتك 👋",
      loginSubtitle: "أدخل بياناتك للوصول إلى مساحة عملك.",
      email: "البريد الإلكتروني",
      emailPlaceholder: "you@company.com",
      password: "كلمة المرور",
      passwordPlaceholder: "••••••••",
      rememberMe: "تذكّرني",
      login: "تسجيل الدخول",
      noAccount: "ليس لديك حساب؟",
      register: "إنشاء حساب",
      langEn: "EN",
      langAr: "AR",
    },
  };

  const t = translations[locale] || translations.en;

  // ── State ─────────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      if (onLogin) await onLogin(email, password, remember);
    } catch (err) {
      if (err?.errors) {
        setErrors(Object.values(err.errors).flat());
      } else if (err?.message) {
        setErrors([err.message]);
      } else {
        setErrors(["An unexpected error occurred. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Styles */}
      <style>{styles}</style>

      {/* Font Awesome — احذفي لو عندك globally */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <div className="lp-body" dir={isRtl ? "rtl" : "ltr"}>
        {/* ══ الخلفية المتحركة: خطوط sine متشابكة ══ */}
        <AuthWaves />

        <div className="register-page">
          <div className="register-container auth-zoom-out">
            {/* ════ LEFT SIDE ════ */}
            <div className="left-side">
              <div className="brand">
                <img src={logoSrc} alt="Strong CRM" className="brand-favicon" />
              </div>

              <div className="hero">
                <h1>{t.heroTitle}</h1>
                <p>{t.heroDesc}</p>

                <ul className="features">
                  <li>
                    <span className="feature-icon">
                      <i className="fas fa-lock" />
                    </span>
                    {t.featureDashboard}
                  </li>
                  <li>
                    <span className="feature-icon">
                      <i className="fas fa-bolt" />
                    </span>
                    {t.featureSales}
                  </li>
                  <li>
                    <span className="feature-icon">
                      <i className="fas fa-clock" />
                    </span>
                    {t.featureSecurity}
                  </li>
                </ul>

                <div className="stats">
                  <div className="stat">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-shield-halved" />
                    </div>
                    <strong>3</strong>
                    <span>{t.daysFree}</span>
                  </div>
                  <div className="stat">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-rocket" />
                    </div>
                    <strong>+20</strong>
                    <span>{t.industries}</span>
                  </div>
                  <div className="stat">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-calendar-days" />
                    </div>
                    <strong>24/7</strong>
                    <span>{t.support}</span>
                  </div>
                </div>

                <DashboardMockup />
              </div>
            </div>
            {/* ════ END LEFT SIDE ════ */}

            {/* ════ RIGHT SIDE ════ */}
            <div className="right-side">
              {/* Language Switcher */}
              <div className="language">
                <i className="fas fa-globe" />
                <a
                  className={locale === "en" ? "active" : ""}
                  onClick={() => onLanguageChange && onLanguageChange("en")}
                >
                  {t.langEn}
                </a>
                <span>/</span>
                <a
                  className={locale === "ar" ? "active" : ""}
                  onClick={() => onLanguageChange && onLanguageChange("ar")}
                >
                  {t.langAr}
                </a>
                <i className="fas fa-chevron-down" />
              </div>

              {/* Card */}
              <div className="register-card">
                <h2>{t.welcomeBack}</h2>
                <p className="register-card-subtitle">{t.loginSubtitle}</p>

                {/* Errors */}
                {errors.length > 0 && (
                  <div className="error-box">
                    {errors.length === 1 ? (
                      errors[0]
                    ) : (
                      <ul>
                        {errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="lp-email">{t.email}</label>
                    <div className="input-wrapper">
                      <i className="fas fa-envelope" />
                      <input
                        type="email"
                        id="lp-email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label htmlFor="lp-password">{t.password}</label>
                    <div className="input-wrapper">
                      <i className="fas fa-lock" />
                      <input
                        type={showPw ? "text" : "password"}
                        id="lp-password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        required
                      />
                      <button
                        type="button"
                        className="pw-toggle"
                        onClick={() => setShowPw((v) => !v)}
                        tabIndex={-1}
                      >
                        <i
                          className={showPw ? "fas fa-eye-slash" : "fas fa-eye"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Remember */}
                  <label className="terms">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>{t.rememberMe}</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="register-button"
                    disabled={loading}
                  >
                    <span>{loading ? "..." : t.login}</span>
                    {!loading && <i className="fas fa-arrow-right" />}
                  </button>
                </form>

                {/* Register link */}
                <p className="login-text">
                  <span>{t.noAccount}</span>
                  {onRegisterClick ? (
                    <a onClick={onRegisterClick} style={{ cursor: "pointer" }}>
                      {t.register}
                    </a>
                  ) : (
                    <a href={registerUrl}>{t.register}</a>
                  )}
                </p>
              </div>
            </div>
            {/* ════ END RIGHT SIDE ════ */}
          </div>
        </div>
      </div>
    </>
  );
}
