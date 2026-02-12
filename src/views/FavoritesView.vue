<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';
import { buildingData } from '../data/building';
import { Heart, ChevronRight } from 'lucide-vue-next';

const favoritesStore = useFavoritesStore();
const router = useRouter();

const favoriteRooms = computed(() => {
  return buildingData.flatMap(floor => 
    floor.rooms
      .filter(room => favoritesStore.isFavorite(room.id))
      .map(room => ({ ...room, floor: floor.level }))
  );
});

const navigateToRoom = (room: { id: string, floor: number }) => {
  router.push({ 
    name: 'floor', 
    params: { level: room.floor },
    query: { highlight: room.id }
  });
};
</script>

<template>
  <div class="favorites-view">
    <div class="favorites-header">
      <h2 class="view-title">
        <Heart class="header-icon" />
        Favorites
      </h2>
      <p class="view-subtitle">Quick access to your saved rooms</p>
    </div>

    <div class="content-area">
      <div v-if="favoriteRooms.length > 0" class="favorites-list">
        <div 
          v-for="room in favoriteRooms" 
          :key="room.id"
          @click="navigateToRoom(room)"
          class="favorite-card"
        >
          <div class="card-info">
            <div class="card-name">{{ room.name }}</div>
            <div class="card-meta">
              <span class="meta-tag">Level {{ room.floor }}</span>
              <span class="meta-type">{{ room.type }}</span>
            </div>
          </div>
          <ChevronRight class="card-chevron" />
        </div>
      </div>

      <div v-else class="empty-favorites">
        <div class="empty-icon-wrapper">
          <Heart class="empty-icon" />
        </div>
        <div class="empty-text">
          <h3 class="empty-title">No favorites yet</h3>
          <p class="empty-subtitle">Tap the heart icon on a room to save it here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background);
}

.favorites-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  background-color: var(--card);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--primary);
  fill: var(--primary);
}

.view-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.favorites-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.favorite-card {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorite-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.card-name {
  font-size: 1.125rem;
  font-weight: 700;
  transition: color 0.2s;
}

.favorite-card:hover .card-name {
  color: var(--primary);
}

.card-meta {
  font-size: 0.75rem;
  color: var(--muted-foreground);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.meta-tag {
  background-color: var(--secondary);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.meta-type {
  text-transform: capitalize;
}

.card-chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--muted-foreground);
  transition: color 0.2s;
}

.favorite-card:hover .card-chevron {
  color: var(--primary);
}

.empty-favorites {
  display: flex;
  flex-direction: column;
  items-center: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 1rem;
  opacity: 0.7;
  align-items: center;
}

.empty-icon-wrapper {
  background-color: var(--muted);
  padding: 1rem;
  border-radius: 9999px;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--muted-foreground);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-top: 0.25rem;
}
</style>
