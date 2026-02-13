<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Settings, Bookmark, X, ChevronRight, Home } from 'lucide-vue-next';
import { useI18nStore } from '../../stores/i18n';
import { useRouter } from 'vue-router';
import { buildingData, type Room } from '../../data/building';

const emit = defineEmits<{
  (e: 'open-settings'): void;
  (e: 'open-bookmarks'): void;
  (e: 'select-room', room: Room & { floor: number }): void;
}>();

const router = useRouter();
const i18n = useI18nStore();
const searchQuery = ref('');
const isSearchFocused = ref(false);

const allRooms = computed(() => {
  return buildingData.flatMap(floor => 
    floor.rooms.map(room => ({ ...room, floor: floor.level }))
  ).filter(r => r.type !== 'corridor' && r.type !== 'spacer' && r.type !== 'staircase');
});

const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allRooms.value.filter(room => {
    const localizedName = i18n.t(`rooms.${room.id}`);
    const name = localizedName !== `rooms.${room.id}` ? localizedName : room.name;
    const nickname = room.nickname?.toLowerCase() || '';
    return name.toLowerCase().includes(query) || nickname.includes(query);
  });
});

const handleSelect = (room: Room & { floor: number }) => {
  emit('select-room', room);
  searchQuery.value = '';
  isSearchFocused.value = false;
};

const clearSearch = () => {
  searchQuery.value = '';
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <header class="top-bar glass">
    <div class="nav-icons">
      <button class="nav-btn" @click="goHome" :title="i18n.t('ui.home')">
        <Home class="icon" />
      </button>
      <button class="nav-btn" @click="emit('open-settings')" :title="i18n.t('ui.settings')">
        <Settings class="icon" />
      </button>
      <button class="nav-btn" @click="emit('open-bookmarks')" :title="i18n.t('ui.bookmarks')">
        <Bookmark class="icon" />
      </button>
    </div>

    <div class="search-container" :class="{ 'is-focused': isSearchFocused }">
      <div class="search-input-wrapper">
        <Search class="search-icon" />
        <input 
          v-model="searchQuery"
          @focus="isSearchFocused = true"
          type="text" 
          :placeholder="i18n.t('ui.search_placeholder')" 
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <X class="clear-icon" />
        </button>
      </div>

      <!-- Search Results Dropdown -->
      <Transition name="slide-down">
        <div v-if="searchQuery && isSearchFocused" class="search-dropdown glass">
          <div v-if="searchResults.length > 0" class="results-list">
            <div 
              v-for="room in searchResults" 
              :key="room.id"
              @click="handleSelect(room)"
              class="result-item"
            >
              <div class="result-info">
                <span class="result-name">
                  {{ i18n.t(`rooms.${room.id}`) !== `rooms.${room.id}` ? i18n.t(`rooms.${room.id}`) : room.name }}
                </span>
                <span class="result-meta">{{ i18n.t('ui.level') }} {{ room.floor }}</span>
              </div>
              <ChevronRight class="chevron-icon" />
            </div>
          </div>
          <div v-else class="no-results">
            {{ i18n.t('ui.no_rooms_found') }}
          </div>
        </div>
      </Transition>
    </div>

    <!-- Backdrop for search focus -->
    <div v-if="isSearchFocused" class="search-backdrop" @click="isSearchFocused = false"></div>
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 4rem;
}

.nav-icons {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  background: transparent;
  border: none;
  color: var(--foreground);
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.search-container {
  flex: 1;
  max-width: 400px;
  position: relative;
  z-index: 110;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 2.5rem;
  padding: 0 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: var(--background);
  font-size: 0.9rem;
  transition: all 0.2s;
  outline: none;
}

.is-focused .search-input {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  padding: 0.25rem;
  display: flex;
  color: var(--muted-foreground);
}

.clear-icon {
  width: 1rem;
  height: 1rem;
}

.search-dropdown {
  position: absolute;
  top: 3rem;
  left: 0;
  right: 0;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 25rem;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.result-item {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--border);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark .result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.result-info {
  display: flex;
  flex-direction: column;
}

.result-name {
  font-weight: 600;
  font-size: 0.95rem;
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

.no-results {
  padding: 1.5rem;
  text-align: center;
  color: var(--muted-foreground);
  font-size: 0.9rem;
}

.search-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 105;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
