<script setup lang="ts">
import { ref } from 'vue';
import TopBar from './TopBar.vue';
import SettingsModal from '../ui/SettingsModal.vue';
import BookmarksModal from '../ui/BookmarksModal.vue';
import RoomModal from '../ui/RoomModal.vue';
import { useModalStore } from '../../stores/modal';

const modalStore = useModalStore();
const isSettingsOpen = ref(false);
const isBookmarksOpen = ref(false);
</script>

<template>
  <div class="layout">
    <TopBar 
      @open-settings="isSettingsOpen = true"
      @open-bookmarks="isBookmarksOpen = true"
      @select-room="room => modalStore.openRoom(room)"
    />

    <main class="main">
      <slot></slot>
    </main>

    <!-- Global Modals -->
    <SettingsModal v-model:open="isSettingsOpen" />
    <BookmarksModal 
      v-model:open="isBookmarksOpen" 
      @select-room="room => modalStore.openRoom(room)"
    />
    <RoomModal 
      :room="modalStore.selectedRoom" 
      :is-open="modalStore.isRoomModalOpen" 
      @close="modalStore.closeRoom()"
    />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background);
  color: var(--foreground);
}

.main {
  flex: 1;
  overflow: auto;
  position: relative;
}
</style>
