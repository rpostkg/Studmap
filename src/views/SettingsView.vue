<script setup lang="ts">
import { Settings, Globe, Moon, Sun, ChevronRight } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { useI18nStore } from '../stores/i18n';

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
  <div class="settings-view">
    <div class="settings-header">
      <h2 class="view-title">
        <Settings class="header-icon" />
        {{ i18n.t('ui.settings') }}
      </h2>
      <p class="view-subtitle">{{ i18n.t('ui.settings_subtitle') || 'Preferences and system configuration' }}</p>
    </div>

    <div class="content-area">
      <div class="settings-group">
        <h3 class="group-title">{{ i18n.t('ui.appearance') }}</h3>
        <div class="setting-item" @click="toggleTheme">
          <div class="setting-info">
            <div class="setting-icon-wrapper">
              <Moon v-if="isDarkMode" class="setting-icon" />
              <Sun v-else class="setting-icon" />
            </div>
            <div class="setting-text">
              <div class="setting-label">{{ i18n.t('ui.theme') }}</div>
              <div class="setting-value">{{ isDarkMode ? i18n.t('ui.dark_mode') : i18n.t('ui.light_mode') }}</div>
            </div>
          </div>
          <div class="toggle-switch" :class="{ 'active': isDarkMode }">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <div class="setting-item" @click="toggleLanguage">
          <div class="setting-info">
            <div class="setting-icon-wrapper">
              <Globe class="setting-icon" />
            </div>
            <div class="setting-text">
              <div class="setting-label">{{ i18n.t('ui.language') }}</div>
              <div class="setting-value">{{ i18n.locale === 'en' ? 'English' : 'Українська' }}</div>
            </div>
          </div>
          <ChevronRight class="chevron-icon" />
        </div>
      </div>

      <div class="settings-group">
        <h3 class="group-title">{{ i18n.t('ui.about') }}</h3>
        <div class="setting-item simple">
          <div class="setting-text">
            <div class="setting-label">{{ i18n.t('ui.version') }}</div>
            <div class="setting-value">0.1.0-alpha</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background);
}

.settings-header {
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
  padding-left: 0.5rem;
}

.setting-item {
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.setting-item:hover {
  border-color: var(--primary);
  background-color: var(--accent);
}

.setting-item.simple {
  cursor: default;
}

.setting-item.simple:hover {
  border-color: var(--border);
  background-color: var(--card);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-icon-wrapper {
  background-color: var(--secondary);
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary);
}

.setting-label {
  font-weight: 600;
  font-size: 0.9375rem;
}

.setting-value {
  font-size: 0.75rem;
  color: var(--muted-foreground);
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}

.toggle-switch {
  width: 2.5rem;
  height: 1.25rem;
  background-color: var(--muted);
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background-color: var(--primary);
}

.toggle-thumb {
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.active .toggle-thumb {
  transform: translateX(1.25rem);
}
</style>
