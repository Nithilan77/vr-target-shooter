# 🎯 VR Target Shooter - Meta Quest 3

A WebXR-powered virtual reality target shooting game optimized for Meta Quest 3 with full controller support and hand tracking capabilities.

## 🚀 Play Live

**🎮 [Play VR Target Shooter](https://yourusername.github.io/vr-target-shooter/fixed-vr-game.html)**

## ✨ Features

- **🥽 Full WebXR Support** - Compatible with Meta Quest 3 and other VR headsets
- **🎮 Controller Support** - Complete Quest 3 controller integration with haptic feedback
- **👋 Hand Tracking** - Advanced gesture recognition for natural interaction
- **� 360° Gameplay** - Free movement and omnidirectional target spawning  
- **� Dynamic Targets** - Smart target system with varying difficulty
- **� Real-time UI** - In-VR score tracking and game status

Files added
- `index.html` — main HTML file
- `js/main.js` — Three.js + WebXR demo code
- `package.json` — small helper to run a local static server

Quick start (development)
1. Install Node.js (if you don't have it).
2. From this project folder run:

   # install http-server (or use npx)
   npm install

   # start a static server on port 8080
   npm run start

3. If you run the server on your desktop, you must expose it over HTTPS to use immersive WebXR on the Quest 3 browser. Options:

  - Use `ngrok` (fast):
    - Install ngrok and run `npx http-server -p 8080` then `npx ngrok http 8080` (or run locally then `ngrok http 8080`).
    - Open the HTTPS forwarding URL from ngrok in the Quest 3 browser.

  - Use `mkcert` to create a local certificate and run `http-server -S -C cert.pem -K key.pem -p 8080 ./` (advanced; Windows instructions below).

  - Deploy the files to any static host that serves HTTPS (GitHub Pages, Netlify, Vercel).

How to play on Quest 3 (VR Mode)
- Open Oculus/Meta Browser on the Quest 3 and navigate to your HTTPS URL.
- You'll see a green **"Enter VR"** button in the bottom-right corner.
- Press the VR button and put on your headset to enter immersive mode.
- **In VR, you'll see:**
  - A floating UI panel showing your score, time, and targets
  - Green laser pointers extending from your controllers
  - 3D environment with mountains, platforms, and targets
- **Controls in VR:**
  - **Pull trigger** on either controller to start the game
  - **Left thumbstick:** Move around the VR space (forward/back/left/right)
  - **Right thumbstick:** Snap turn left/right (30-degree increments)
  - **Aim** with the controller (green laser shows direction)  
  - **Pull trigger** to shoot red and orange targets
  - **Haptic feedback** when you hit targets
- **VR Features:**
  - **Free Movement:** Walk around the entire 3D space using thumbsticks
  - **360-Degree Gameplay:** Targets spawn all around you - look behind!
  - **Two Target Types:** Red targets (normal) and Orange targets (behind you)
  - **Dynamic Spawning:** Targets appear at different distances and heights
  - **Snap Turning:** Comfortable VR turning without motion sickness
  - Full 6DOF controller tracking
  - Real Quest 3 controller models
  - In-VR UI that follows you around
  - Enhanced glowing effects for better target visibility

Notes & troubleshooting
- WebXR requires a secure context (HTTPS). The Oculus Browser enforces this for entering immersive VR.
- If controllers do not appear: try Oculus Browser (not other browsers), ensure your Quest 3 is updated, and try a different deployment method (ngrok or uploading to GitHub Pages).
- If the VR Button doesn't appear: your browser may not support immersive WebXR or secure context is missing. Try HTTPS.
- You can view `window.__scene` in the dev console (remote debugging via `chrome://inspect` with adb) to inspect scene objects.

mkcert (Windows) quick guide (optional)
- Install mkcert (https://github.com/FiloSottile/mkcert)
- Run `mkcert -install` then `mkcert localhost` to generate `localhost+2.pem` and `localhost+2-key.pem` (names may vary)
- Rename/copy those to `cert.pem` and `key.pem` in project folder and run:

  npm run start-https-mkcert

This will start an HTTPS server with a certificate trusted by your local machine (Quest will still need to trust the host if you use IP — using ngrok/ns is simpler).

Next steps (ideas)
- Add grabbing/throwing physics with cannon-es or ammo.js
- Add a simple UI for spawning prefabs
- Add passthrough camera toggles (Quest specific APIs) — advanced

If you'd like, I can:
- Add a simple grab/throw example (physics)
- Provide step-by-step instructions for serving via ngrok or GitHub Pages
- Convert to a Unity-based Quest 3 sample (native) if you prefer the Unity workflow
