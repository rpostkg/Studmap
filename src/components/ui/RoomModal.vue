<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { type Room } from '../../data/building';
import { useBookmarksStore } from '../../stores/bookmarks';
import { useI18nStore } from '../../stores/i18n';
import { X, Bookmark, MapPin, Video } from 'lucide-vue-next';
import PanoramaViewer from './PanoramaViewer.vue';
import AprilTagLocator from './AprilTagLocator.vue';


const props = defineProps<{
  room: Room | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const i18n = useI18nStore();
const showPanorama = ref(false);
const showLocator = ref(false);

const bookmarksStore = useBookmarksStore();

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    showPanorama.value = false;
    showLocator.value = false;
  }
});

watch(() => props.room?.id, () => {
  showPanorama.value = false;
  showLocator.value = false;
});

const isBookmarked = computed(() => {
  if (!props.room) return false;
  return bookmarksStore.isBookmarked(props.room.id);
});

const toggleBookmark = () => {
  if (props.room) {
    bookmarksStore.toggleBookmark(props.room.id);
  }
};

const getRoomName = (room: Room) => {
  const localized = i18n.t(`rooms.${room.id}`);
  return localized !== `rooms.${room.id}` ? localized : room.name;
};
</script>

<template>
  <div v-if="isOpen && room" class="modal-root">
    <!-- Backdrop -->
    <div class="backdrop" @click="emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="modal-content">
        <div class="modal-header">
            <div class="room-info">
                <h3 class="room-name">{{ getRoomName(room) }}</h3>
                <p class="room-meta">{{ room.nickname || '' }} | {{ i18n.t('ui.floor') }} {{ room.id.charAt(0) }}</p>
            </div>
            <button @click="emit('close')" class="close-btn">
                <X class="close-icon" />
            </button>
        </div>

        <div class="action-grid">
            <button 
                class="action-btn"
                :class="{ 'bookmark-active': isBookmarked }"
                @click="toggleBookmark"
            >
                <Bookmark class="action-icon" :class="{ 'fill-icon': isBookmarked }"/>
                <span class="action-label">{{ isBookmarked ? i18n.t('ui.saved') : i18n.t('ui.save') }}</span>
            </button>

             <button 
                class="action-btn"
                :disabled="!room.hasPanorama"
                :class="{ 'disabled': !room.hasPanorama }"
                @click="showPanorama = true"
            >
                <Video class="action-icon"/>
                <span class="action-label">{{ i18n.t('ui.view_360') }}</span>
            </button>

            <button 
                class="action-btn"
                :disabled="!room.hasTag"
                :class="{ 'disabled': !room.hasTag }"
                @click="showLocator = true"
            >
                <MapPin class="action-icon"/>
                <span class="action-label">{{ i18n.t('ui.locate') }}</span>
            </button>
        </div>
        
        <div class="modal-footer">
            {{ i18n.t('ui.tap_backdrop_to_close') }}
        </div>
    </div>

    <!-- Panorama Viewer Overlay -->
    <Transition name="fade">
        <PanoramaViewer 
            v-if="showPanorama && room" 
            :url="room.panoramaUrl || ''" 
            :roomName="getRoomName(room)"
            @close="showPanorama = false"
        />
    </Transition>

    <!-- AprilTag Locator Overlay -->
    <Transition name="fade">
        <AprilTagLocator 
            v-if="showLocator && room" 
            :roomId="room.id" 
            :roomName="getRoomName(room)"
            @close="showLocator = false"
        />
    </Transition>
  </div>
</template>

<style scoped>
/* styles unchanged */
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

@media (min-width: 640px) {
  .modal-root {
    align-items: center;
  }
}

.backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.modal-content {
  background-color: var(--card);
  width: 100%;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  position: relative;
  z-index: 10;
  transform: translateY(0);
}

@media (min-width: 640px) {
  .modal-content {
    width: 24rem;
    border-radius: 0.75rem;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.room-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.room-meta {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.close-btn {
  padding: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--muted);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: transparent;
  gap: 0.5rem;
  transition: background-color 0.2s, color 0.2s;
}

.action-btn:hover:not(.disabled) {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.bookmark-active {
  border-color: var(--primary);
  color: var(--primary);
  background-color: rgba(15, 23, 42, 0.05);
}

.action-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.fill-icon {
  fill: currentColor;
}

.action-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  text-align: center;
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
