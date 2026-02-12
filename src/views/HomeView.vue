<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { buildingData, type Room } from '../data/building';
import { Search, ChevronRight, Video, MapPin, Map as MapIcon } from 'lucide-vue-next';

const router = useRouter();
const searchQuery = ref('');
const selectedRoom = ref<Room & { floor: number } | null>(null);
const isModalOpen = ref(false);

// Flatten all rooms for search
const allRooms = computed(() => {
  return buildingData.flatMap(floor => 
    floor.rooms.map(room => ({ ...room, floor: floor.level }))
  ).filter(r => r.type !== 'corridor' && r.type !== 'spacer' && r.type !== 'staircase');
});

const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allRooms.value.filter(room => 
    room.name.toLowerCase().includes(query) || 
    (room.nickname && room.nickname.toLowerCase().includes(query))
  );
});

const navigateToFloor = (level: number) => {
  router.push({ name: 'floor', params: { level } });
};

const handleSearchResultClick = (room: Room & { floor: number }) => {
  selectedRoom.value = room;
  isModalOpen.value = true;
};

// CSS for isometric-like stacking
const floorsForDisplay = buildingData.slice().reverse();
</script>

<template>
  <div class="home-container">
    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <Search class="search-icon" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search room (e.g. 101, Lab)" 
          class="search-input"
        />
      </div>
      
      <!-- Search Results Dropdown -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-dropdown">
        <div 
          v-for="room in searchResults" 
          :key="room.id"
          @click="handleSearchResultClick(room)"
          class="search-result-item"
        >
          <div class="result-info">
            <div class="result-name">{{ room.name }}</div>
            <div class="result-meta">Level {{ room.floor }} • {{ room.type }}</div>
          </div>
          <ChevronRight class="chevron-icon" />
        </div>
      </div>
      <div v-else-if="searchQuery && searchResults.length === 0" class="search-no-results">
        No rooms found.
      </div>
    </div>

    <!-- Isometric Floor Selector -->
    <div class="floor-selector-section">
        <div class="floor-stack">
            <div 
                v-for="(floor, index) in floorsForDisplay" 
                :key="floor.level"
                @click="navigateToFloor(floor.level)"
                class="floor-plate"
                :style="{ 
                    transform: `rotateX(60deg) rotateZ(45deg) translateY(${index * 40}px) translateZ(${-index * 20}px)`,
                    zIndex: floorsForDisplay.length - index
                }"
            >
               <div class="floor-content">
                 <span class="floor-level">{{ floor.level }}</span>
                 <div class="floor-label">Level</div>
               </div>
            </div>
        </div>
        <p class="selector-hint">Select a floor to explore</p>
    </div>

    <!-- Search Result Modal -->
    <div v-if="isModalOpen && selectedRoom" class="modal-overlay">
        <div class="backdrop" @click="isModalOpen = false"></div>
        <div class="modal-card">
            <h3 class="modal-title">{{ selectedRoom.name }}</h3>
            <p class="modal-subtitle">Level {{ selectedRoom.floor }} • {{ selectedRoom.type }}</p>

            <div class="modal-actions">
                <button 
                    class="modal-action-btn"
                    :disabled="!selectedRoom.panoramaUrl"
                    :class="{ 'dimmed': !selectedRoom.panoramaUrl }"
                >
                    <Video class="btn-icon" />
                    <span class="btn-text">View Panorama</span>
                </button>

                <button 
                    class="modal-action-btn dimmed"
                    disabled
                >
                    <MapPin class="btn-icon" />
                    <span class="btn-text">Locate with AprilTag</span>
                </button>

                <button 
                    @click="navigateToFloor(selectedRoom.floor)"
                    class="modal-action-btn"
                >
                    <MapIcon class="btn-icon" />
                    <span class="btn-text">Open Floor Map</span>
                </button>
            </div>

            <button @click="isModalOpen = false" class="cancel-btn">
                Cancel
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
}

.search-section {
  position: relative;
  z-index: 30;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.search-input {
  width: 100%;
  height: 2.5rem;
  padding-left: 2.5rem;
  padding-right: 1rem;
  border-radius: 9999px;
  border: 1px solid var(--input);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  font-size: 0.875rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  outline: none;
}

.search-input:focus {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.search-dropdown {
  position: absolute;
  top: 3rem;
  left: 0;
  right: 0;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 15rem;
  overflow-y: auto;
  z-index: 50;
}

.search-result-item {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: var(--muted);
}

.result-name {
  font-weight: 700;
}

.result-meta {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.search-no-results {
  position: absolute;
  top: 3rem;
  left: 0;
  right: 0;
  background-color: var(--card);
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.floor-selector-section {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 0;
    perspective: 1000px;
}

.floor-stack {
    position: relative;
    width: 12rem;
    height: 16rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
}

.floor-plate {
    position: absolute;
    width: 10rem;
    height: 10rem;
    background-color: var(--card);
    border: 2px solid rgba(15, 23, 42, 0.2);
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floor-plate:hover {
    border-color: var(--primary);
    background-color: rgba(15, 23, 42, 0.05);
    /* In a real scenario we'd handle the transform better but this is for simplicity */
}

.floor-content {
    transform: rotate(-45deg);
    text-align: center;
}

.floor-level {
    font-size: 1.875rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.8);
    transition: color 0.2s;
}

.floor-plate:hover .floor-level {
    color: var(--primary);
}

.floor-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
}

.selector-hint {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 2rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
  }
}

.backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-card {
  background-color: var(--card);
  width: 100%;
  max-width: 24rem;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 10;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: transparent;
  width: 100%;
  transition: background-color 0.2s;
  text-align: left;
}

.modal-action-btn:hover:not(.dimmed) {
  background-color: var(--accent);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary);
}

.btn-text {
  font-weight: 500;
}

.dimmed {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  margin-top: 1.5rem;
  width: 100%;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  background: transparent;
  border: none;
  transition: color 0.2s;
}

.cancel-btn:hover {
  color: var(--foreground);
}
</style>
