<script setup lang="ts">
import { computed, ref } from 'vue';
import { 
  DialogRoot, 
  DialogPortal, 
  DialogOverlay, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from 'radix-vue';
import { type Room, buildingData } from '../../data/building';
import { useBookmarksStore } from '../../stores/bookmarks';
import { useI18nStore } from '../../stores/i18n';
import { X, Heart, MapPin, Video, Map } from 'lucide-vue-next';
import PanoramaViewer from './PanoramaViewer.vue';
import AprilTagLocator from './AprilTagLocator.vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps<{
  room: Room | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const route = useRoute();
const i18n = useI18nStore();
const bookmarksStore = useBookmarksStore();
const showPanorama = ref(false);
const showLocator = ref(false);

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

const roomFloor = computed(() => {
  if (!props.room) return null;
  const floor = buildingData.find(f => f.rooms.some(r => r.id === props.room?.id));
  return floor ? floor.level : null;
});

const isAlreadyOnThisFloor = computed(() => {
  if (!roomFloor.value) return false;
  return route.name === 'floor' && parseInt(route.params.level as string) === roomFloor.value;
});

const navigateToFloor = () => {
  if (props.room && roomFloor.value !== null) {
    router.push({ 
      name: 'floor', 
      params: { level: roomFloor.value },
      query: { highlight: props.room.id }
    });
    emit('close');
  }
};
</script>

<template>
  <DialogRoot :open="isOpen" @update:open="val => !val && emit('close')">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content glass">
        <template v-if="room">
          <div class="modal-header">
            <div class="room-info">
              <DialogTitle class="room-name">{{ getRoomName(room) }}</DialogTitle>
              <DialogDescription class="room-meta">
                {{ room.nickname || room.type }} | {{ i18n.t('ui.level') }} {{ room.id.charAt(0) }}
              </DialogDescription>
            </div>
            <DialogClose class="close-btn">
              <X class="close-icon" />
            </DialogClose>
          </div>

          <div class="action-grid">
            <button 
              class="action-btn"
              :class="{ 'is-active': isBookmarked }"
              @click="toggleBookmark"
            >
              <Heart class="action-icon" :class="{ 'fill-icon': isBookmarked }"/>
              <span class="action-label">{{ isBookmarked ? i18n.t('ui.saved') : i18n.t('ui.save') }}</span>
            </button>

            <button 
              class="action-btn"
              :disabled="!room.hasPanorama"
              :class="{ 'disabled': !room.hasPanorama }"
              @click="showPanorama = true"
            >
              <Video class="action-icon"/>
              <span class="action-label">{{ i18n.t('ui.view_panorama') }}</span>
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
            
            <button 
              v-if="!isAlreadyOnThisFloor"
              class="action-btn"
              @click="navigateToFloor"
            >
              <Map class="action-icon"/>
              <span class="action-label">{{ i18n.t('ui.show_on_map') }}</span>
            </button>
          </div>
        </template>
      </DialogContent>
      
      <!-- Overlays -->
      <PanoramaViewer 
        v-if="showPanorama && room" 
        :url="room.panoramaUrl || ''" 
        :roomName="getRoomName(room)"
        @close="showPanorama = false"
      />

      <AprilTagLocator 
        v-if="showLocator && room" 
        :roomId="room.id" 
        :roomName="getRoomName(room)"
        @close="showLocator = false"
      />
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  inset: 0;
  z-index: 200;
  animation: fade-in 0.2s ease-out;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 400px;
  padding: 1.5rem;
  border-radius: 1.25rem;
  z-index: 210;
  animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  outline: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.room-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
}

.room-meta {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  text-transform: capitalize;
}

.close-btn {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--foreground);
  display: flex;
  transition: all 0.2s;
}

.dark .close-btn {
  background: rgba(255, 255, 255, 0.1);
}

.close-btn:hover {
  transform: rotate(90deg);
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.5);
  gap: 0.5rem;
  transition: all 0.2s;
}

.dark .action-btn {
  background: rgba(255, 255, 255, 0.02);
}

.action-btn:hover:not(.disabled) {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.02);
  transform: translateY(-2px);
}

.dark .action-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.is-active {
  border-color: #ef4444;
  color: #ef4444;
}

.action-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.dark .action-icon {
  color: var(--foreground);
}

.fill-icon {
  fill: currentColor;
}

.action-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.dark .action-label {
  color: var(--foreground);
}

.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-up {
  from { 
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
