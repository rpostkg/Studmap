<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as Comlink from 'comlink';
import { X, Camera } from 'lucide-vue-next';
import { useI18nStore } from '../../stores/i18n';

const props = defineProps<{
  roomId: string;
  roomName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const i18n = useI18nStore();
const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const isSearching = ref(true);
const matchFound = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(true);
const loadingStatus = ref(i18n.t('ui.initializing'));
const debugLogs = ref<string[]>([]);
const showDebug = ref(false);
const detectionCount = ref(0);
const lastFrameTime = ref(0);
const fps = ref(0);
const resolution = ref('0x0');
const isTesting = ref(false);
const testResult = ref<string | null>(null);
let lastLogMessage = '';

const addLog = (msg: string) => {
  if (msg === lastLogMessage) return; // Deduplicate
  lastLogMessage = msg;
  console.log(msg);
  debugLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (debugLogs.value.length > 20) debugLogs.value.pop();
};

let worker: Worker | null = null;
let apriltag: any = null;
let animationId: number | null = null;
let closeTimeout: number | null = null;
let bannerTimeout: number | null = null;

const initCamera = async () => {
  addLog('Initializing camera...');
  if (!navigator.mediaDevices) {
    const errorMsg = i18n.t('ui.camera_error_secure');
    error.value = errorMsg;
    addLog(`ERROR: ${errorMsg}`);
    console.warn("Secure Context check:", window.isSecureContext);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });
    if (video.value) {
      video.value.srcObject = stream;
      addLog('Camera stream started');
    }
  } catch (err: any) {
    addLog(`Camera error: ${err.message}`);
    error.value = i18n.t('ui.camera_error_denied', { message: err.message });
  }
};

const processFrame = async () => {
  if (!video.value || !canvas.value || !apriltag) return;

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  resolution.value = `${canvas.value.width}x${canvas.value.height}`;

  if (canvas.value.width === 0) {
    animationId = requestAnimationFrame(processFrame);
    return;
  }

  // Draw video frame to canvas
  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  const pixels = imageData.data;
  const grayscale = new Uint8Array(canvas.value.width * canvas.value.height);
  
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    const avg = Math.round(((pixels[i] ?? 0) + (pixels[i+1] ?? 0) + (pixels[i+2] ?? 0)) / 3);
    grayscale[j] = avg;
  }

  try {
    const detections = await apriltag.detect(grayscale, canvas.value.width, canvas.value.height);
    detectionCount.value = detections.length;
    
    const targetId = props.roomId.replace(/\D/g, '');
    const foundMatch = detections.find((d: any) => String(d.id) === targetId);

    if (foundMatch) {
      if (!matchFound.value) {
        matchFound.value = true;
        addLog(`Located: ${props.roomName}`);
      }
      if (bannerTimeout) {
        window.clearTimeout(bannerTimeout);
        bannerTimeout = null;
      }
    } else if (matchFound.value && !bannerTimeout) {
      bannerTimeout = window.setTimeout(() => {
        matchFound.value = false;
        bannerTimeout = null;
      }, 500);
    }

    const endTime = performance.now();
    if (lastFrameTime.value > 0) {
      const delta = endTime - lastFrameTime.value;
      if (delta > 0) fps.value = Math.round(1000 / delta);
    }
    lastFrameTime.value = endTime;
  } catch (err: any) {
    addLog(`Detection Error: ${err.message}`);
  }

  animationId = requestAnimationFrame(processFrame);
};

const runTest = async () => {
  if (!apriltag || isTesting.value) return;
  isTesting.value = true;
  testResult.value = "Running test...";
  addLog("Running test with test_tag.png...");
  
  try {
    const img = new Image();
    img.src = '/test_tag.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const testCanvas = document.createElement('canvas');
    testCanvas.width = img.width;
    testCanvas.height = img.height;
    const testCtx = testCanvas.getContext('2d')!;
    testCtx.drawImage(img, 0, 0);

    const testData = testCtx.getImageData(0, 0, img.width, img.height);
    const pixels = testData.data;
    const grayscale = new Uint8Array(img.width * img.height);
    let sum = 0;
    for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
      const avg = Math.round(((pixels[i] ?? 0) + (pixels[i+1] ?? 0) + (pixels[i+2] ?? 0)) / 3);
      grayscale[j] = avg;
      sum += avg;
    }

    addLog(`Scanning test image (${img.width}x${img.height}), data sum: ${sum}...`);
    const detections = await apriltag.detect(grayscale, img.width, img.height);
    
    if (detections.length > 0) {
      testResult.value = `SUCCESS: Found ${detections.length} tags. IDs: ${detections.map((d:any) => d.id).join(', ')}`;
      addLog(testResult.value);
    } else {
      testResult.value = "FAILED: No tags found in test image.";
      addLog(testResult.value);
    }
  } catch (err: any) {
    testResult.value = `ERROR: ${err.message}`;
    addLog(`Test failed: ${err.message}`);
  } finally {
    isTesting.value = false;
  }
};

onMounted(async () => {
  addLog('Mounted, starting init...');
  isLoading.value = true;
  loadingStatus.value = i18n.t('ui.connecting_camera');
  await initCamera();

  try {
    loadingStatus.value = i18n.t('ui.preparing_worker');
    addLog('Loading worker from /apriltag/apriltag.js');
    worker = new Worker('/apriltag/apriltag.js', { type: 'module' });
    
    worker.onerror = (e) => {
      addLog(`Worker error event: ${e.message}`);
    };

    const ApriltagConstructor: any = Comlink.wrap(worker);
    
    loadingStatus.value = i18n.t('ui.initializing_wasm');
    addLog('Creating Apriltag instance...');
    
    apriltag = await new ApriltagConstructor(Comlink.proxy(() => {
      addLog('AprilTag Detector Ready callback triggered');
      isLoading.value = false;
      animationId = requestAnimationFrame(processFrame);
    }));
  } catch (err: any) {
    addLog(`Init error: ${err.message}`);
    console.error('Worker error:', err);
    error.value = `Failed to initialize tag detector: ${err.message}`;
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (closeTimeout) window.clearTimeout(closeTimeout);
  if (bannerTimeout) window.clearTimeout(bannerTimeout);
  if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }
  if (worker) worker.terminate();
});
</script>

<template>
  <div class="locator-overlay">
    <div class="locator-header">
      <button @click="emit('close')" class="close-btn">
        <X />
      </button>
      <div class="header-text" @click="showDebug = !showDebug">
        <h3>{{ i18n.t('ui.locating_room', { name: roomName }) }}</h3>
        <p v-if="!matchFound">{{ i18n.t('ui.scan_hint_id', { id: roomId.replace(/\D/g, '') }) }}</p>
      </div>
    </div>

    <div class="camera-container">
      <video ref="video" autoplay playsinline muted class="hidden-video"></video>
      <canvas ref="canvas" class="detection-canvas"></canvas>
      
      <div class="log-overlay" v-if="showDebug && !isLoading && !error">
        <div v-for="(log, i) in debugLogs.slice(0, 5)" :key="i" class="overlay-log-line">
          {{ log }}
        </div>
      </div>

      <div class="hud-overlay" v-if="showDebug && !isLoading && !error && !matchFound">
        <div class="test-results-box" v-if="testResult">
          <h3>Test Output</h3>
          <p>{{ testResult }}</p>
          <button @click="testResult = null" class="clear-test-btn">Dismiss</button>
        </div>
        <div class="hud-stat">
          <span class="stat-label">Detections</span>
          <span class="stat-value" :class="{ 'has-detections': detectionCount > 0 }">{{ detectionCount }}</span>
        </div>
        <div class="hud-stat">
          <span class="stat-label">FPS</span>
          <span class="stat-value">{{ fps }}</span>
        </div>
        <div class="hud-stat">
          <span class="stat-label">RES</span>
          <span class="stat-value">{{ resolution }}</span>
        </div>
        <button @click="runTest" class="test-btn" :disabled="isTesting">
          {{ isTesting ? 'Testing...' : 'Test Pattern' }}
        </button>
      </div>

      <div v-if="isLoading" class="overlay-state">
        <div class="spinner"></div>
        <p>{{ loadingStatus }}</p>
        <button @click="showDebug = !showDebug" class="debug-toggle">
          {{ showDebug ? 'Hide Debug' : 'Show Debug' }}
        </button>
      </div>

      <div v-if="showDebug" class="debug-console">
        <div v-for="(log, i) in debugLogs" :key="i" class="debug-line">
          {{ log }}
        </div>
      </div>

      <div v-if="error" class="overlay-state error">
        <p>{{ error }}</p>
        <button @click="emit('close')" class="retry-btn">Close</button>
      </div>

      <Transition name="slide-up">
        <div v-if="matchFound" class="success-banner">
          <div class="banner-content">
            <div class="success-dot"></div>
            <span>{{ i18n.t('ui.saved') }}: <strong>{{ roomName }}</strong></span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="locator-footer" v-if="!matchFound && !error && !isLoading">
      <div class="scan-hint">
        <Camera class="hint-icon" />
        <span>{{ i18n.t('ui.point_camera_hint') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* styles unchanged */
.locator-overlay {
  position: fixed;
  inset: 0;
  background-color: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  color: white;
  pointer-events: auto;
}

.locator-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  z-index: 10;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.header-text p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.camera-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-video {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.detection-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
}

.hud-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  z-index: 40;
}

.log-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 6rem;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 40;
}

.overlay-log-line {
  font-family: monospace;
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  color: #fbbf24;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hud-stat {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  border-right: 3px solid #64748b;
}

.stat-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  opacity: 0.6;
  font-weight: 700;
}

.stat-value {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

.has-detections {
  color: #3b82f6;
}

.test-btn {
  margin-top: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-results-box {
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid #3b82f6;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  pointer-events: auto;
  max-width: 250px;
}

.test-results-box h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #3b82f6;
}

.test-results-box p {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  color: white;
  line-height: 1.4;
}

.clear-test-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #94a3b8;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.debug-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.debug-console {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  padding: 1rem;
  font-family: monospace;
  font-size: 0.75rem;
  overflow-y: auto;
  z-index: 30;
  pointer-events: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-line {
  margin-bottom: 0.25rem;
  word-break: break-all;
  border-left: 2px solid #3b82f6;
  padding-left: 0.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-banner {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  padding: 1.2rem 2.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(34, 197, 94, 0.4);
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-size: 1.25rem;
  white-space: nowrap;
}

.success-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

.locator-footer {
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  justify-content: center;
  z-index: 10;
}

.scan-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9rem;
}

.hint-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
