import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type Room } from '../data/building';

export const useModalStore = defineStore('modal', () => {
    const selectedRoom = ref<Room | null>(null);
    const isRoomModalOpen = ref(false);

    function openRoom(room: Room) {
        selectedRoom.value = room;
        isRoomModalOpen.value = true;
    }

    function closeRoom() {
        isRoomModalOpen.value = false;
    }

    return {
        selectedRoom,
        isRoomModalOpen,
        openRoom,
        closeRoom
    };
});
