import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 0;

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@Komura | Profile VIP</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <style>
        :root {
            --accent: #b81b9d;
            --accent-glow: rgba(184, 27, 157, 0.7);
            --accent-light: #f43f5e;
            --bg-card: rgba(10, 10, 14, 0.35);
            --border-card: rgba(255, 255, 255, 0.12);
            --text-color: #ffffff;
            --text-muted: #94a3b8;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Plus Jakarta Sans', sans-serif;
            cursor: url(https://r2.guns.lol/77b0701e-5346-4bbf-9419-67fc8c79ca47.png) 16 16, auto !important;
        }

        body, html {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #050505;
            color: var(--text-color);
            display: flex;
            align-items: center;
            justify-content: center;
            perspective: 1100px;
        }

        .back-shop-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 12px;
            background: rgba(15, 23, 42, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: 0.25s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .back-shop-btn:hover {
            border-color: var(--accent);
            background: rgba(184, 27, 157, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 0 15px var(--accent-glow);
        }
        .back-shop-btn svg { width: 14px; height: 14px; fill: var(--accent-light); }

        #bg-video {
            position: fixed;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            z-index: -3;
            transform: translate(-50%, -50%);
            object-fit: cover;
            filter: brightness(0.42) contrast(1.12) saturate(1.1);
        }

        #snow-canvas, #trail-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        #snow-canvas { z-index: -2; }
        #trail-canvas { z-index: 99; }

        #enter-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #040406;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 999;
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.8s;
            user-select: none;
        }

        #enter-overlay h1 {
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 4px;
            text-transform: lowercase;
            text-shadow: 0 0 20px var(--accent-glow), 0 0 40px var(--accent);
            animation: pulse 1.6s ease-in-out infinite;
        }

        #enter-overlay p {
            font-size: 13px;
            color: var(--text-muted);
            margin-top: 12px;
            letter-spacing: 1.5px;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1.02); }
        }

        .card-wrapper {
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.12s ease-out;
            z-index: 10;
        }

        .profile-container {
            width: 92vw;
            max-width: 440px;
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 26px;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            padding: 24px 20px 20px 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 35px var(--accent-glow);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .shine-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(184, 27, 157, 0.06) 100%);
            z-index: 1;
        }

        .top-meta-bar {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            padding-bottom: 12px;
            margin-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ping-pill {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(34, 197, 94, 0.12);
            color: #4ade80;
            padding: 3px 8px;
            border-radius: 8px;
            border: 1px solid rgba(34, 197, 94, 0.25);
        }
        .ping-dot {
            width: 6px;
            height: 6px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 8px #22c55e;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .avatar-box {
            position: relative;
            margin: 4px 0 10px 0;
        }

        .avatar {
            width: 95px;
            height: 95px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--accent);
            box-shadow: 0 0 28px var(--accent-glow);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .avatar-box:hover .avatar {
            transform: scale(1.08) rotate(4deg);
        }

        .status-dot {
            position: absolute;
            bottom: 5px;
            right: 8px;
            width: 17px;
            height: 17px;
            border-radius: 50%;
            background-color: #ed4245;
            border: 3.5px solid #111;
            box-shadow: 0 0 12px rgba(237, 66, 69, 0.9);
        }

        .name-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 4px;
        }

        .username {
            font-size: 26px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 0.5px;
            text-shadow: 0 0 18px var(--accent-glow);
        }

        .badges-bar {
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .badge-icon {
            width: 21px;
            height: 21px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 3px;
            transition: 0.2s;
        }

        .badge-icon:hover {
            transform: translateY(-2px) scale(1.2);
            background: var(--accent);
            box-shadow: 0 0 12px var(--accent);
        }

        .badge-icon svg {
            width: 100%;
            height: 100%;
            fill: #ffffff;
        }

        .typewriter-box {
            font-size: 13px;
            color: #e2e8f0;
            font-weight: 600;
            min-height: 20px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .typing-cursor {
            display: inline-block;
            width: 2px;
            height: 14px;
            background-color: var(--accent);
            margin-left: 4px;
            animation: blink 0.8s infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        .discord-status-card {
            width: 100%;
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 10px 14px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
        }

        .game-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #a855f7, #ec4899);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 0 12px rgba(236, 72, 153, 0.4);
        }

        .game-icon svg { width: 18px; height: 18px; fill: white; }

        .status-info { display: flex; flex-direction: column; overflow: hidden; }
        .status-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--accent-light);
            letter-spacing: 0.6px;
        }
        .status-detail {
            font-size: 12.5px;
            color: #ffffff;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .status-state { font-size: 10.5px; color: var(--text-muted); }

        .player-bar {
            width: 100%;
            background: rgba(0, 0, 0, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            padding: 12px 14px;
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
            gap: 9px;
        }

        .player-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .song-desc {
            display: flex;
            align-items: center;
            gap: 10px;
            overflow: hidden;
            text-align: left;
            flex: 1;
            min-width: 0;
        }

        .vinyl-disc {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: radial-gradient(circle, #222 35%, #050505 70%);
            border: 2px solid var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 0 10px var(--accent-glow);
            animation: spin 3.5s linear infinite;
            animation-play-state: paused;
        }
        .vinyl-disc.spinning { animation-play-state: running; }
        .vinyl-center {
            width: 10px;
            height: 10px;
            background: var(--accent-light);
            border-radius: 50%;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .song-title-group {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            flex: 1;
            min-width: 0;
        }

        .song-name-box {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            mask-image: linear-gradient(90deg, #000 88%, transparent 100%);
            -webkit-mask-image: linear-gradient(90deg, #000 88%, transparent 100%);
        }

        .song-name {
            display: inline-block;
            font-size: 12.5px;
            font-weight: 800;
            color: #ffffff;
            white-space: nowrap;
            will-change: transform;
        }

        .animate-scroll {
            animation: marquee-scroll ease-in-out infinite alternate;
        }

        @keyframes marquee-scroll {
            0%, 20% { transform: translateX(0); }
            80%, 100% { transform: translateX(var(--scroll-distance, 0px)); }
        }

        .track-counter { font-size: 10px; font-weight: 700; color: var(--accent-light); margin-top: 1px; }

        .player-controls { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .ctrl-btn {
            background: none;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 8px;
            transition: 0.2s;
        }
        .ctrl-btn svg { width: 17px; height: 17px; fill: #ffffff; transition: 0.2s; }
        .ctrl-btn:hover svg { fill: var(--accent); transform: scale(1.15); }

        .progress-block { display: flex; flex-direction: column; gap: 4px; }
        .progress-container {
            width: 100%;
            height: 5px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            cursor: pointer;
            position: relative;
        }
        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, var(--accent), var(--accent-light));
            border-radius: 3px;
            box-shadow: 0 0 10px var(--accent);
        }
        .time-box {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            font-family: monospace;
        }

        .player-bottom-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 4px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .download-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 3px 9px;
            border-radius: 7px;
            font-size: 10px;
            font-weight: 700;
            text-decoration: none;
            transition: 0.2s;
        }
        .download-btn:hover {
            background: var(--accent);
            border-color: var(--accent);
            box-shadow: 0 0 10px var(--accent-glow);
        }
        .download-btn svg { width: 12px; height: 12px; fill: currentColor; }

        .volume-box {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .volume-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 75px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            outline: none;
        }
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: var(--accent);
            cursor: pointer;
            box-shadow: 0 0 6px var(--accent);
        }

        .social-icons {
            display: flex;
            justify-content: center;
            gap: 12px;
            width: 100%;
            margin-top: 2px;
        }

        .social-link {
            width: 44px;
            height: 44px;
            border-radius: 13px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.08);
            position: relative;
        }

        .social-link svg { width: 22px; height: 22px; fill: #ffffff; transition: 0.2s; }
        .social-link img { width: 22px; height: 22px; border-radius: 6px; object-fit: cover; }

        .social-link:hover {
            background: var(--accent);
            transform: translateY(-4px) scale(1.12);
            box-shadow: 0 0 22px var(--accent);
            border-color: var(--accent);
        }

        .footer-info {
            margin-top: 14px;
            font-size: 11px;
            color: var(--text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        .views-count { display: flex; align-items: center; gap: 6px; font-weight: 700; }
        .views-count svg { width: 14px; height: 14px; fill: currentColor; }
        .hotkeys-hint { font-size: 9.5px; opacity: 0.6; }
    </style>
</head>
<body>

    <a href="/" class="back-shop-btn" title="Ghé Shop">
        <svg viewBox="0 0 24 24"><path d="m12 3l10 9h-3v8h-5v-6h-4v6H5v-8H2l10-9z"/></svg>
        <span>Komura Shop</span>
    </a>

    <div id="enter-overlay" onclick="enterSite()">
        <h1>click to enter...</h1>
        <p>[ ÂM THANH & HIỆU ỨNG TƯƠNG TÁC ]</p>
    </div>

    <video autoplay loop muted playsinline id="bg-video">
        <source src="https://r2.guns.lol/eba5f969-1955-44df-9931-a98a32fce5f9.mp4" type="video/mp4">
    </video>

    <audio id="bg-audio"></audio>

    <canvas id="snow-canvas"></canvas>
    <canvas id="trail-canvas"></canvas>

    <div class="card-wrapper" id="card-wrapper">
        <div class="profile-container" id="profile-card">
            <div class="shine-layer"></div>

            <div class="top-meta-bar">
                <span id="live-clock">Hà Nội, VN --:--:--</span>
                <div class="ping-pill">
                    <span class="ping-dot"></span>
                    <span id="ping-val">19ms Online</span>
                </div>
            </div>

            <div class="avatar-box">
                <img src="https://cdn.discordapp.com/attachments/1467110452784795745/1546822624330649621/IMG_4492.jpg?ex=6aa12e54&is=6a9fdcd4&hm=8c634d99dc22d7745b6bb0403aed022afaae3007043a67a9014592bf297f4ef0&" alt="Komura" class="avatar">
                <div class="status-dot" title="Do Not Disturb"></div>
            </div>

            <div class="name-row">
                <h1 class="username">Komura</h1>
                
                <div class="badges-bar">
                    <div class="badge-icon" title="Đã xác minh chính chủ">
                        <svg viewBox="0 0 24 24"><path d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4l4.25 4.25ZM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                    </div>
                    <div class="badge-icon" title="Red Flash Clan Leader">
                        <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
                    </div>
                    <div class="badge-icon" title="AI Software Architect">
                        <svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6l6 6l1.4-1.4zm5.2 0l4.6-4.6l-4.6-4.6L16 6l6 6l-6 6l-1.4-1.4z"/></svg>
                    </div>
                </div>
            </div>

            <div class="typewriter-box">
                <span id="typewriter-text"></span><span class="typing-cursor"></span>
            </div>

            <div class="discord-status-card">
                <div class="game-icon">
                    <svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                </div>
                <div class="status-info">
                    <span class="status-title">Hoạt Động Hiện Tại</span>
                    <span class="status-detail">Đang nghe playlist Komura</span>
                    <span class="status-state">Red Flash Clan Leader • 24/7</span>
                </div>
            </div>

            <div class="player-bar" id="music-widget">
                <div class="player-top">
                    <div class="song-desc">
                        <div class="vinyl-disc" id="vinyl-disc">
                            <div class="vinyl-center"></div>
                        </div>
                        <div class="song-title-group">
                            <div class="song-name-box">
                                <span class="song-name" id="song-name">Thuốc Tê</span>
                            </div>
                            <span class="track-counter" id="track-counter">Track 1 / 17</span>
                        </div>
                    </div>

                    <div class="player-controls">
                        <button class="ctrl-btn" onclick="prevTrack()" title="Bài trước (Mũi tên trái)">
                            <svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>

                        <button class="ctrl-btn" onclick="togglePlay()" id="play-btn" title="Phát/Dừng (Space)">
                            <svg id="play-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        </button>

                        <button class="ctrl-btn" onclick="nextTrack()" title="Bài tiếp (Mũi tên phải)">
                            <svg viewBox="0 0 24 24"><path d="m6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                        </button>
                    </div>
                </div>

                <div class="progress-block">
                    <div class="progress-container" onclick="seekAudio(event)">
                        <div class="progress-fill" id="progress-bar"></div>
                    </div>
                    <div class="time-box">
                        <span id="cur-time">00:00</span>
                        <span id="dur-time">00:00</span>
                    </div>
                </div>

                <div class="player-bottom-row">
                    <button class="download-btn" onclick="downloadCurrentTrack()" title="Tải bài hát này về máy">
                        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                        <span>Tải nhạc</span>
                    </button>

                    <div class="volume-box">
                        <button class="ctrl-btn" onclick="toggleMute()" title="Tắt/Bật âm (M)">
                            <svg id="mute-icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                        </button>
                        <input type="range" min="0" max="1" step="0.01" value="0.5" class="volume-slider" id="vol-slider">
                    </div>
                </div>
            </div>

            <div class="social-icons">
                <a href="https://discord.gg/2WKkw8VPs" target="_blank" class="social-link" title="Discord Server">
                    <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                </a>

                <a href="https://www.tiktok.com/@ltpkomuraa" target="_blank" class="social-link" title="TikTok">
                    <svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.03 3.29-1.44 3.48-3.23.08-1.25.04-2.5.04-3.75V.02z"/></svg>
                </a>

                <a href="https://www.facebook.com/share/18LSN7pima/?mibextid=wwXIfr" target="_blank" class="social-link" title="Facebook">
                    <img src="https://cdn.upanhlaylink.com/i/3n0VitIs.jpeg" alt="Facebook">
                </a>
            </div>

            <div class="footer-info">
                <div class="views-count">
                    <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    <span id="page-views">158 views</span>
                </div>
                <span class="hotkeys-hint">[ Space: Play/Pause • M: Mute • ◄ ►: Chuyển bài ]</span>
            </div>

        </div>
    </div>

    <script>
        function updateGlobalViews() {
            const elem = document.getElementById('page-views');
            if (!elem) return;

            const BASE_VIEWS = 158;
            const START_TIME = 1773000000000;
            const now = Date.now();
            const additionalViews = Math.max(0, Math.floor((now - START_TIME) / (15 * 60 * 1000)));
            const total = BASE_VIEWS + additionalViews;

            elem.textContent = total.toLocaleString('vi-VN') + ' views';
        }
        updateGlobalViews();

        function updateClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
            document.getElementById('live-clock').textContent = 'Hà Nội, VN ' + timeStr;
        }
        setInterval(updateClock, 1000);
        updateClock();

        const playlist = [
            { title: "Thuốc Tê", url: "https://r2.guns.lol/9d4cd208-0803-43db-85fa-bff9c5e617fa.mp3" },
            { title: "Anh Chưa Thương Em Đến Vậy Đâu Remix", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai2.mp3" },
            { title: "Quên Một Người Từng Yêu", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai3.mp3" },
            { title: "Người Âm Phủ", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai4.mp3" },
            { title: "Nụ Hồng Mong Manh REMIX", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai5.mp3" },
            { title: "Quê Tôi", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai6.mp3" },
            { title: "Yêu Bằng Mắt", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai7.mp3" },
            { title: "Cưới Luôn Được Không X Cưới Đi", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai8.mp3" },
            { title: "Đừng Ai Nhắc Về Cô Ấy", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai9.mp3" },
            { title: "Chỉ Bằng Cái Gật Đầu × Sao Mình Chưa Nắm Tay Nhau × Nói Sẽ Khó Nhưng Vui × Em Có Còn Khóc Một Mình × Tòng Phu", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai10.mp3" },
            { title: "Mashup Gián Đáng Iu Hong X Anh Rất Nhớ Em", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai11.mp3" },
            { title: "Nhìn Em Lần Cuối x Giá Như Anh Là Người Vô Tâm x Đáy Biển Remix", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai12.mp3" },
            { title: "Sợ Phải Kết Thúc x Chấp Niệm Trong Em x Anh Muốn Em Sống Sao", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai13.mp3" },
            { title: "Kết Thúc Lâu Rồi", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai14.mp3" },
            { title: "Hương Phận Hồng Nhan", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai15.mp3" },
            { title: "Tình Ta Hai Ngã", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai16.mp3" },
            { title: "Vạn Vật Thay Đổi Vật Chất Lên Ngôi", url: "https://raw.githubusercontent.com/1nhine/Profile/main/bai17.mp3" }
        ];

        let currentTrackIndex = 0;
        const audio = document.getElementById('bg-audio');
        const progressBar = document.getElementById('progress-bar');
        const playIcon = document.getElementById('play-icon');
        const songNameElem = document.getElementById('song-name');
        const trackCounter = document.getElementById('track-counter');
        const vinyl = document.getElementById('vinyl-disc');
        const curTimeElem = document.getElementById('cur-time');
        const durTimeElem = document.getElementById('dur-time');
        const volSlider = document.getElementById('vol-slider');

        function formatTime(secs) {
            if (isNaN(secs)) return "00:00";
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }

        function checkSongOverflow() {
            if (!songNameElem || !songNameElem.parentElement) return;
            songNameElem.classList.remove('animate-scroll');
            songNameElem.style.transform = 'none';

            setTimeout(() => {
                const containerWidth = songNameElem.parentElement.clientWidth;
                const textWidth = songNameElem.scrollWidth;

                if (textWidth > containerWidth + 6) {
                    const diff = textWidth - containerWidth + 14;
                    songNameElem.style.setProperty('--scroll-distance', '-' + diff + 'px');
                    const duration = Math.max(6, diff / 22);
                    songNameElem.style.animationDuration = duration + 's';
                    songNameElem.classList.add('animate-scroll');
                }
            }, 100);
        }

        function loadTrack(index) {
            currentTrackIndex = index;
            audio.src = playlist[currentTrackIndex].url;
            songNameElem.textContent = playlist[currentTrackIndex].title;
            trackCounter.textContent = 'Track ' + (currentTrackIndex + 1) + ' / ' + playlist.length;
            progressBar.style.width = '0%';
            checkSongOverflow();
        }

        loadTrack(0);
        window.addEventListener('resize', checkSongOverflow);

        function enterSite() {
            const overlay = document.getElementById('enter-overlay');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.visibility = 'hidden', 800);

            audio.volume = parseFloat(volSlider.value) || 0.5;
            audio.play().then(() => {
                vinyl.classList.add('spinning');
                playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            }).catch(e => console.log(e));
        }

        function togglePlay() {
            if (audio.paused) {
                audio.play();
                vinyl.classList.add('spinning');
                playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            } else {
                audio.pause();
                vinyl.classList.remove('spinning');
                playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            }
        }

        function nextTrack() {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
            audio.play();
            vinyl.classList.add('spinning');
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }

        function prevTrack() {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrackIndex);
            audio.play();
            vinyl.classList.add('spinning');
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        }

        audio.onended = () => { nextTrack(); };

        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                audio.volume = val;
                audio.muted = (val === 0);
            });
        }

        function toggleMute() {
            audio.muted = !audio.muted;
            if (volSlider) {
                volSlider.value = audio.muted ? 0 : audio.volume;
            }
        }

        function downloadCurrentTrack() {
            const current = playlist[currentTrackIndex];
            const link = document.createElement('a');
            link.href = current.url;
            link.target = '_blank';
            link.download = current.title + '.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        audio.ontimeupdate = () => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = percent + '%';
                curTimeElem.textContent = formatTime(audio.currentTime);
                durTimeElem.textContent = formatTime(audio.duration);
            }
        };

        function seekAudio(e) {
            const container = e.currentTarget;
            const clickPos = (e.pageX - container.getBoundingClientRect().left) / container.offsetWidth;
            if (audio.duration) {
                audio.currentTime = clickPos * audio.duration;
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'ArrowRight') {
                nextTrack();
            } else if (e.code === 'ArrowLeft') {
                prevTrack();
            } else if (e.code === 'KeyM') {
                toggleMute();
            }
        });

        const words = [
            "Red Flash Clan Leader ⚡",
            "Thiếu Tiền vcl😭😭",
            "Owner @ Komura Shop 🛒",
            "Listening to: Komura Playlist 🎧"
        ];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeElem = document.getElementById('typewriter-text');

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typeElem.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typeElem.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            let speed = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentWord.length) {
                speed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                speed = 450;
            }

            setTimeout(type, speed);
        }
        type();

        const cardWrapper = document.getElementById('card-wrapper');
        document.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return;
            const xAxis = (window.innerWidth / 2 - e.pageX) / 24;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 24;
            cardWrapper.style.transform = 'rotateY(' + (-xAxis) + 'deg) rotateX(' + yAxis + 'deg)';
        });

        const snowCanvas = document.getElementById('snow-canvas');
        const sCtx = snowCanvas.getContext('2d');
        let sw = snowCanvas.width = window.innerWidth;
        let sh = snowCanvas.height = window.innerHeight;

        const snowFlakes = [];
        for (let i = 0; i < 70; i++) {
            snowFlakes.push({
                x: Math.random() * sw,
                y: Math.random() * sh,
                r: Math.random() * 2.5 + 0.8,
                sy: Math.random() * 1.2 + 0.4,
                sx: Math.random() * 0.6 - 0.3,
                op: Math.random() * 0.7 + 0.2
            });
        }

        function drawSnow() {
            sCtx.clearRect(0, 0, sw, sh);
            sCtx.fillStyle = '#b81b9d';
            for (let p of snowFlakes) {
                sCtx.beginPath();
                sCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                sCtx.globalAlpha = p.op;
                sCtx.fill();
                p.y += p.sy;
                p.x += p.sx;
                if (p.y > sh) { p.y = -5; p.x = Math.random() * sw; }
            }
            requestAnimationFrame(drawSnow);
        }
        drawSnow();

        const trailCanvas = document.getElementById('trail-canvas');
        const tCtx = trailCanvas.getContext('2d');
        let tw = trailCanvas.width = window.innerWidth;
        let th = trailCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            sw = snowCanvas.width = tw = trailCanvas.width = window.innerWidth;
            sh = snowCanvas.height = th = trailCanvas.height = window.innerHeight;
        });

        const trails = [];
        document.addEventListener('mousemove', (e) => {
            for (let i = 0; i < 2; i++) {
                trails.push({
                    x: e.pageX,
                    y: e.pageY,
                    r: Math.random() * 3 + 1,
                    alpha: 1,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5
                });
            }
        });

        function drawTrails() {
            tCtx.clearRect(0, 0, tw, th);
            for (let i = 0; i < trails.length; i++) {
                const t = trails[i];
                tCtx.beginPath();
                tCtx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                tCtx.fillStyle = '#f43f5e';
                tCtx.globalAlpha = t.alpha;
                tCtx.shadowBlur = 10;
                tCtx.shadowColor = '#b81b9d';
                tCtx.fill();

                t.x += t.vx;
                t.y += t.vy;
                t.alpha -= 0.035;

                if (t.alpha <= 0) {
                    trails.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(drawTrails);
        }
        drawTrails();
    </script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
