<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { X } from 'lucide-vue-next';
import 'pannellum/build/pannellum.css';
import 'pannellum/build/pannellum.js';
import { useI18nStore } from '../../stores/i18n';
const i18n = useI18nStore();
const props = defineProps<{
  url: string;
  roomName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const viewerContainer = ref<HTMLElement | null>(null);
let viewer: any = null;

onMounted(() => {
  const pannellum = (window as any).pannellum;
  if (viewerContainer.value && pannellum) {
    viewer = pannellum.viewer(viewerContainer.value, {
      type: 'equirectangular',
      panorama: props.url,
      autoLoad: true,
      title: props.roomName,
      author: 'Studmap'
    });
  }
});

onUnmounted(() => {
  if (viewer) {
    viewer.destroy();
  }
});
</script>

<template>
  <div class="panorama-overlay">
    <div class="panorama-header">
        <h2 class="panorama-title">{{ roomName }} - {{ i18n.t('ui.panoui_header') }}</h2>
        <button @click="emit('close')" class="close-btn">
            <X class="close-icon" />
        </button>
    </div>
    <div ref="viewerContainer" class="viewer-container"></div>
  </div>
</template>

<style scoped>
.panorama-overlay {
  position: fixed;
  inset: 0;
  background-color: #000;
  z-index: 100;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.panorama-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 110;
}

.panorama-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 9999px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.viewer-container {
  flex: 1;
  width: 100%;
}

:deep(.pnlm-container) {
    background: transparent !important;
}
</style>
