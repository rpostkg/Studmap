import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useBookmarksStore = defineStore('bookmarks', () => {
    const bookmarks = ref<string[]>([]);

    // Initialize from localStorage
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
        try {
            bookmarks.value = JSON.parse(storedBookmarks);
        } catch (e) {
            console.error('Failed to parse bookmarks from localStorage', e);
        }
    }

    // Watch for changes and update localStorage
    watch(bookmarks, (newBookmarks) => {
        localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    }, { deep: true });

    const addBookmark = (roomId: string) => {
        if (!bookmarks.value.includes(roomId)) {
            bookmarks.value.push(roomId);
        }
    };

    const removeBookmark = (roomId: string) => {
        bookmarks.value = bookmarks.value.filter(id => id !== roomId);
    };

    const isBookmarked = (roomId: string) => {
        return bookmarks.value.includes(roomId);
    };

    const toggleBookmark = (roomId: string) => {
        if (isBookmarked(roomId)) {
            removeBookmark(roomId);
        } else {
            addBookmark(roomId);
        }
    };

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark
    };
});
