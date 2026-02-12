import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useFavoritesStore = defineStore('favorites', () => {
    const favorites = ref<string[]>([]);

    // Initialize from localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        try {
            favorites.value = JSON.parse(storedFavorites);
        } catch (e) {
            console.error('Failed to parse favorites from localStorage', e);
        }
    }

    // Watch for changes and update localStorage
    watch(favorites, (newFavorites) => {
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }, { deep: true });

    const addFavorite = (roomId: string) => {
        if (!favorites.value.includes(roomId)) {
            favorites.value.push(roomId);
        }
    };

    const removeFavorite = (roomId: string) => {
        favorites.value = favorites.value.filter(id => id !== roomId);
    };

    const isFavorite = (roomId: string) => {
        return favorites.value.includes(roomId);
    };

    const toggleFavorite = (roomId: string) => {
        if (isFavorite(roomId)) {
            removeFavorite(roomId);
        } else {
            addFavorite(roomId);
        }
    };

    return {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite
    };
});
