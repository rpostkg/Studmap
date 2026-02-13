<script setup lang="ts">
import { computed } from 'vue';
import { 
  DialogRoot, 
  DialogPortal, 
  DialogOverlay, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from 'radix-vue';
import { X, Bookmark, ChevronRight } from 'lucide-vue-next';
import { useBookmarksStore } from '../../stores/bookmarks';
import { useI18nStore } from '../../stores/i18n';
import { buildingData, type Room } from '../../data/building';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'select-room', room: Room & { floor: number }): void;
}>();

const bookmarksStore = useBookmarksStore();
const i18n = useI18nStore();

const bookmarkedRooms = computed(() => {
  return buildingData.flatMap(floor => 
    floor.rooms
      .filter(room => bookmarksStore.isBookmarked(room.id))
      .map(room => ({ ...room, floor: floor.level }))
  );
});

const handleSelect = (room: Room & { floor: number }) => {
  emit('select-room', room);
  emit('update:open', false);
};
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content glass">
        <div class="modal-header">
          <div>
            <DialogTitle class="modal-title">{{ i18n.t('ui.bookmarks') }}</DialogTitle>
            <DialogDescription class="modal-subtitle">
              {{ i18n.t('ui.quick_access_bookmarks') }}
            </DialogDescription>
          </div>
          <DialogClose class="close-btn">
            <X class="icon" />
          </DialogClose>
        </div>

        <div class="bookmarks-list">
          <div v-if="bookmarkedRooms.length > 0" class="list-container">
            <div 
              v-for="room in bookmarkedRooms" 
              :key="room.id"
              @click="handleSelect(room)"
              class="bookmark-row"
            >
              <div class="room-info">
                <div class="room-name">
                  {{ i18n.t(`rooms.${room.id}`) !== `rooms.${room.id}` ? i18n.t(`rooms.${room.id}`) : room.name }}
                </div>
                <div class="room-meta">{{ i18n.t('ui.level') }} {{ room.floor }}</div>
              </div>
              <ChevronRight class="chevron" />
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon-box">
              <Bookmark class="empty-icon" />
            </div>
            <p class="empty-text">{{ i18n.t('ui.no_bookmarks_yet') }}</p>
            <p class="empty-hint">{{ i18n.t('ui.tap_bookmark_hint') }}</p>
          </div>
        </div>
      </DialogContent>
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
  max-height: 85vh;
  padding: 1.5rem;
  border-radius: 1.25rem;
  z-index: 210;
  animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  outline: none;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--foreground);
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
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

.bookmarks-list {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bookmark-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.dark .bookmark-row {
  background: rgba(255, 255, 255, 0.02);
}

.bookmark-row:hover {
  border-color: var(--primary);
  background: rgba(0, 0, 0, 0.02);
}

.dark .bookmark-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.room-name {
  font-weight: 600;
  font-size: 1rem;
}

.room-meta {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.chevron {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon-box {
  background: var(--muted);
  padding: 1rem;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  color: var(--muted-foreground);
}

.empty-text {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--muted-foreground);
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
