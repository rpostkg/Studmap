<script setup lang="ts">
import { useRoute } from 'vue-router';
import { buildingData, type Room } from '../data/building';
import { computed, ref } from 'vue';
import RoomModal from '../components/ui/RoomModal.vue';
import { useFavoritesStore } from '../stores/favorites';
import { RotateCw } from 'lucide-vue-next';

const route = useRoute();
const level = computed(() => parseInt(route.params.level as string));
const floor = computed(() => buildingData.find(f => f.level === level.value));
const highlightRoomId = computed(() => route.query.highlight as string);

const selectedRoom = ref<Room | null>(null);
const isModalOpen = ref(false);
const isFlipped = ref(false);
const favoritesStore = useFavoritesStore();

const handleRoomClick = (room: Room) => {
    if (room.type === 'spacer') return;
    selectedRoom.value = room;
    isModalOpen.value = true;
};

// Calculate layout bounds for normalization
const bounds = computed(() => {
    if (!floor.value || floor.value.rooms.length === 0) {
        return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }
    const xs = floor.value.rooms.map(r => r.x);
    const xEnds = floor.value.rooms.map(r => r.x + r.width);
    const ys = floor.value.rooms.map(r => r.y);
    const yEnds = floor.value.rooms.map(r => r.y + r.height);
    
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xEnds),
        minY: Math.min(...ys),
        maxY: Math.max(...yEnds)
    };
});

const layoutWidth = computed(() => bounds.value.maxX - bounds.value.minX);
const layoutHeight = computed(() => bounds.value.maxY - bounds.value.minY);

// Auto-rotate horizontal layouts to be vertical-focused on mobile
const shouldRotate = computed(() => layoutWidth.value > layoutHeight.value);

const UNIT_SIZE = 45; // Base unit size in pixels

const containerStyle = computed(() => {
    const w = shouldRotate.value ? layoutHeight.value : layoutWidth.value;
    const h = shouldRotate.value ? layoutWidth.value : layoutHeight.value;
    
    return {
        position: 'relative' as 'relative',
        width: `${w * UNIT_SIZE}px`,
        height: `${h * UNIT_SIZE}px`,
        minHeight: `${h * UNIT_SIZE}px`,
    };
});

const getRoomStyle = (room: Room) => {
    let normX = room.x - bounds.value.minX;
    let normY = room.y - bounds.value.minY;
    
    if (isFlipped.value) {
        // Reverse coordinates for 180 degree flip
        normX = layoutWidth.value - (normX + room.width);
        normY = layoutHeight.value - (normY + room.height);
    }

    let left, top, width, height;
    
    if (shouldRotate.value) {
        // Rotate 90 degrees Clockwise
        // newX = height - (y + h)
        // newY = x
        left = (layoutHeight.value - (normY + room.height)) * UNIT_SIZE;
        top = normX * UNIT_SIZE;
        width = room.height * UNIT_SIZE;
        height = room.width * UNIT_SIZE;
    } else {
        left = normX * UNIT_SIZE;
        top = normY * UNIT_SIZE;
        width = room.width * UNIT_SIZE;
        height = room.height * UNIT_SIZE;
    }

    return {
        position: 'absolute' as 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
    };
};

const getRoomClass = (room: Room) => {
    const classes = ["room-base"];
    if (room.type === 'corridor') classes.push("corridor");
    else if (room.type === 'spacer') classes.push("spacer");
    else if (room.type === 'staircase') classes.push("staircase");
    else if (room.type === 'auditorium') classes.push("auditorium");
    else classes.push("standard-room");
    
    // Highlight specific room from navigation
    if (highlightRoomId.value === room.id) classes.push("highlight");

    // Highlight favorites
    if (favoritesStore.isFavorite(room.id)) classes.push("favorite");

    return classes.join(' ');
};
</script>

<template>
  <div class="floor-view">
    <div class="floor-header">
        <h2 class="floor-title">Level {{ level }}</h2>
        <button 
            @click="isFlipped = !isFlipped" 
            class="header-action-btn"
            :class="{ 'is-flipped': isFlipped }"
            title="Flip View 180°"
        >
            <RotateCw class="action-icon" />
            <span class="btn-label">Flip</span>
        </button>
    </div>
    
    <div class="map-container">
        <div v-if="floor" class="map-viewport">
             <div :style="containerStyle" class="map-grid">
                <template v-for="room in floor.rooms" :key="room.id">
                    <div 
                        :class="getRoomClass(room)"
                        :style="getRoomStyle(room)"
                        @click="handleRoomClick(room)"
                    >
                        <span v-if="room.type !== 'corridor' && room.type !== 'spacer'" class="room-label">{{ room.name }}</span>
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="empty-state">
            Floor {{ level }} not found.
        </div>
    </div>

    <RoomModal 
        :room="selectedRoom" 
        :is-open="isModalOpen" 
        @close="isModalOpen = false" 
    />
  </div>
</template>

<style scoped>
.floor-view {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  position: relative;
}

.floor-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background-color: var(--card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.floor-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.header-hint {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.map-container {
  flex: 1;
  overflow: auto;
  background-color: #f5f5f4; /* stone-50 */
}

@media (prefers-color-scheme: dark) {
  .map-container {
    background-color: rgba(12, 10, 9, 0.5); /* dark stone-950/50 */
  }
}

.map-viewport {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.map-grid {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  /* Absolute children will position relative to this */
}

@media (prefers-color-scheme: dark) {
  .map-grid {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.room-base {
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.room-label {
  font-size: 0.75rem;
  text-align: center;
  padding: 0.25rem;
}

.corridor {
  background-color: var(--muted);
  color: var(--muted-foreground);
  border-color: transparent;
  pointer-events: none;
}

.spacer {
  visibility: hidden;
  pointer-events: none;
}

.staircase {
  background-color: #ffedd5; /* orange-100 */
  border-color: #fed7aa; /* orange-200 */
  color: #c2410c; /* orange-700 */
}

@media (prefers-color-scheme: dark) {
  .staircase {
    background-color: #7c2d12; /* orange-900 */
    color: #fdba74; /* orange-300 */
  }
}

.auditorium {
  background-color: #f3e8ff; /* purple-100 */
  border-color: #e9d5ff; /* purple-200 */
  color: #7e22ce; /* purple-700 */
}

@media (prefers-color-scheme: dark) {
  .auditorium {
    background-color: #581c87; /* purple-900 */
    color: #d8b4fe; /* purple-300 */
  }
}

.standard-room {
  background-color: var(--card);
  cursor: pointer;
}

.standard-room:active {
  transform: scale(0.95);
}

.highlight {
  background-color: var(--primary);
  color: var(--primary-foreground) !important;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.3);
  z-index: 20;
  transform: scale(1.05);
}

.favorite {
  background-color: #fefce8; /* yellow-50 */
  border-color: #facc15; /* yellow-400 */
  color: #a16207; /* yellow-700 */
  box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.5);
  z-index: 10;
}

@media (prefers-color-scheme: dark) {
  .favorite {
    background-color: rgba(234, 179, 8, 0.3);
  }
}

.empty-state {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
}

.header-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  background-color: var(--accent);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.header-action-btn:hover {
  background-color: var(--muted);
}

.header-action-btn.is-flipped {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.action-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s;
}

.is-flipped .action-icon {
  transform: rotate(180deg);
}

.btn-label {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
