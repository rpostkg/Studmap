<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  DialogRoot, 
  DialogPortal, 
  DialogOverlay, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogClose 
} from 'radix-vue';
import { X, Moon, Sun, Globe, ChevronRight } from 'lucide-vue-next';
import { useI18nStore } from '../../stores/i18n';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const i18n = useI18nStore();
const isDarkMode = ref(false);

const toggleLanguage = () => {
  const nextLocale = i18n.locale === 'en' ? 'uk' : 'en';
  i18n.setLocale(nextLocale);
};

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  updateTheme();
};

const updateTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode.value = true;
  } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
  }
  updateTheme();
});
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content glass">
        <div class="modal-header">
          <div>
            <DialogTitle class="modal-title">{{ i18n.t('ui.settings') }}</DialogTitle>
            <DialogDescription class="modal-subtitle">
              {{ i18n.t('ui.settings_subtitle') || 'Customize your experience' }}
            </DialogDescription>
          </div>
          <DialogClose class="close-btn">
            <X class="icon" />
          </DialogClose>
        </div>

        <div class="settings-list">
          <!-- Language -->
          <div class="setting-row" @click="toggleLanguage">
            <div class="setting-info">
              <div class="icon-box">
                <Globe class="icon" />
              </div>
              <div>
                <div class="setting-label">{{ i18n.t('ui.language') }}</div>
                <div class="setting-value">{{ i18n.locale === 'en' ? 'English' : 'Українська' }}</div>
              </div>
            </div>
            <ChevronRight class="chevron" />
          </div>

          <!-- Theme -->
          <div class="setting-row" @click="toggleTheme">
            <div class="setting-info">
              <div class="icon-box">
                <Moon v-if="isDarkMode" class="icon" />
                <Sun v-else class="icon" />
              </div>
              <div>
                <div class="setting-label">{{ i18n.t('ui.theme') }}</div>
                <div class="setting-value">{{ isDarkMode ? i18n.t('ui.dark_mode') : i18n.t('ui.light_mode') }}</div>
              </div>
            </div>
            <div class="toggle" :class="{ 'is-active': isDarkMode }">
              <div class="toggle-thumb"></div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Version -->
          <div class="setting-row is-static">
            <div class="setting-info">
              <div>
                <div class="setting-label">{{ i18n.t('ui.version') }}</div>
                <div class="setting-value">0.1.0-alpha</div>
              </div>
            </div>
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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
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

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.setting-row:hover:not(.is-static) {
  background: rgba(0, 0, 0, 0.05);
}

.dark .setting-row:hover:not(.is-static) {
  background: rgba(255, 255, 255, 0.05);
}

.setting-row.is-static {
  cursor: default;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  background: var(--secondary);
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  color: var(--primary);
}

.setting-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.setting-value {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.chevron {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 0.5rem 0;
}

.toggle {
  width: 2.5rem;
  height: 1.25rem;
  background: var(--muted);
  border-radius: 9999px;
  position: relative;
  transition: background 0.2s;
}

.toggle.is-active {
  background: #0ea5e9; /* Premium blue */
}

.toggle-thumb {
  width: 1rem;
  height: 1rem;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.is-active .toggle-thumb {
  transform: translateX(1.25rem);
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
