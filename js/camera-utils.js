/* ============================================================
   CamCheck — shared camera utilities
   Plain vanilla JS, no build step, so it can be dropped into
   any static page (GitHub Pages friendly).
   ============================================================ */

const CamCheck = (() => {
  let currentStream = null;

  /** Ask for camera access and attach the stream to a <video> element. */
  async function startCamera(videoEl, constraints) {
    stopCamera();
    const finalConstraints = constraints || {
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
    currentStream = stream;
    videoEl.srcObject = stream;
    await videoEl.play().catch(() => {});
    return stream;
  }

  function stopCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach((t) => t.stop());
      currentStream = null;
    }
  }

  /** List every video input device the browser can see. */
  async function listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  }

  /** List every audio input (microphone) device the browser can see. */
  async function listMics() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "audioinput");
  }

  /**
   * Fill a <select> with the available cameras and return the device list.
   * Device labels are only meaningful after permission has been granted at
   * least once — before that, browsers hand back generic "camera 1" labels.
   */
  async function populateDeviceSelect(selectEl, currentDeviceId) {
    const devices = await listCameras();
    selectEl.innerHTML = "";
    devices.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label || `カメラ ${i + 1}`;
      if (d.deviceId === currentDeviceId) opt.selected = true;
      selectEl.appendChild(opt);
    });
    return devices;
  }

  /** Same idea as populateDeviceSelect, but for microphones. */
  async function populateMicSelect(selectEl, currentDeviceId) {
    const devices = await listMics();
    selectEl.innerHTML = "";
    devices.forEach((d, i) => {
      const opt = document.createElement("option");
      opt.value = d.deviceId;
      opt.textContent = d.label || `マイク ${i + 1}`;
      if (d.deviceId === currentDeviceId) opt.selected = true;
      selectEl.appendChild(opt);
    });
    return devices;
  }

  /** Read the live settings (resolution, frame rate, facing mode) off a track. */
  function readTrackSettings(stream) {
    const track = stream.getVideoTracks()[0];
    if (!track) return null;
    const settings = track.getSettings ? track.getSettings() : {};
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    return {
      label: track.label || "Unnamed camera",
      width: settings.width || null,
      height: settings.height || null,
      frameRate: settings.frameRate || null,
      facingMode: settings.facingMode || null,
      aspectRatio: settings.aspectRatio || null,
      deviceId: settings.deviceId || null,
      capabilities,
    };
  }

  /** Measure actual delivered FPS by counting frames over a window, using rVFC when available. */
  function measureFrameRate(videoEl, windowMs = 1500) {
    return new Promise((resolve) => {
      let count = 0;
      const start = performance.now();

      if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
        const tick = () => {
          count += 1;
          const elapsed = performance.now() - start;
          if (elapsed < windowMs) {
            videoEl.requestVideoFrameCallback(tick);
          } else {
            resolve(Math.round((count / elapsed) * 1000));
          }
        };
        videoEl.requestVideoFrameCallback(tick);
      } else {
        // Fallback: rAF-based sampling (less precise, still useful).
        const tick = () => {
          count += 1;
          const elapsed = performance.now() - start;
          if (elapsed < windowMs) {
            requestAnimationFrame(tick);
          } else {
            resolve(Math.round((count / elapsed) * 1000));
          }
        };
        requestAnimationFrame(tick);
      }
    });
  }

  /** Sample the current frame onto an offscreen canvas and estimate average brightness (0-255). */
  function estimateLightLevel(videoEl) {
    if (!videoEl.videoWidth) return null;
    const canvas = document.createElement("canvas");
    const sampleSize = 64; // downsample for speed
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, sampleSize, sampleSize);
    const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Perceived luminance
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return Math.round(total / (data.length / 4));
  }

  /** Capture the current frame as a PNG data URL, at the video's native resolution. */
  function captureFrame(videoEl, mirrored = true) {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext("2d");
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  }

  /** Draw a rule-of-thirds grid onto a canvas sized to match its container. */
  function drawThirdsGrid(canvasEl) {
    const rect = canvasEl.parentElement.getBoundingClientRect();
    canvasEl.width = rect.width;
    canvasEl.height = rect.height;
    const ctx = canvasEl.getContext("2d");
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i += 1) {
      const x = (canvasEl.width / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasEl.height);
      ctx.stroke();
      const y = (canvasEl.height / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasEl.width, y);
      ctx.stroke();
    }
  }

  function lightLabel(level) {
    if (level === null) return { text: "—", cls: "" };
    if (level < 40) return { text: `${level} ・ 暗すぎ`, cls: "fail" };
    if (level < 80) return { text: `${level} ・ やや暗い`, cls: "warn-v" };
    if (level > 230) return { text: `${level} ・ 白飛び`, cls: "warn-v" };
    return { text: `${level} ・ 良好`, cls: "pass" };
  }

  function fpsLabel(fps) {
    if (!fps) return { text: "—", cls: "" };
    if (fps < 15) return { text: `${fps} fps ・ カクつく`, cls: "fail" };
    if (fps < 24) return { text: `${fps} fps ・ まずまず`, cls: "warn-v" };
    return { text: `${fps} fps ・ 滑らか`, cls: "pass" };
  }

  function resLabel(w, h) {
    if (!w || !h) return { text: "—", cls: "" };
    const px = w * h;
    let tag = "SD";
    let cls = "warn-v";
    if (px >= 3840 * 2160 * 0.9) { tag = "4K"; cls = "pass"; }
    else if (px >= 1920 * 1080 * 0.9) { tag = "1080p"; cls = "pass"; }
    else if (px >= 1280 * 720 * 0.9) { tag = "720p"; cls = "pass"; }
    return { text: `${w}×${h} ・ ${tag}`, cls };
  }

  return {
    startCamera,
    stopCamera,
    listCameras,
    listMics,
    populateDeviceSelect,
    populateMicSelect,
    readTrackSettings,
    measureFrameRate,
    estimateLightLevel,
    captureFrame,
    drawThirdsGrid,
    lightLabel,
    fpsLabel,
    resLabel,
  };
})();
