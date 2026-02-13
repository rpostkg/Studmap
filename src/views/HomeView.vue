<script setup lang="ts">
import { useI18nStore } from '../stores/i18n';
import { useRouter } from 'vue-router';
import { buildingData } from '../data/building';

const router = useRouter();
const i18n = useI18nStore();

const navigateToFloor = (level: number) => {
  router.push({ name: 'floor', params: { level } });
};

// CSS for isometric-like stacking
const floorsForDisplay = buildingData.slice().reverse();
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h2 class="welcome-title">{{ i18n.t('ui.app_title') }}</h2>
      <p class="welcome-subtitle">{{ i18n.t('ui.select_floor_hint') }}</p>
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
                    '--z-offset': `${index * 40}px`,
                    transform: `rotateX(55deg) rotateZ(-45deg) translateZ(calc(${index * 40}px))`,
                    zIndex: floorsForDisplay.length - index
                }"
            >
               <div class="floor-content">
                 <span class="floor-level">{{ floor.level }}</span>
                 <div class="floor-label">{{ i18n.t('ui.level') }}</div>
               </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 1rem;
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
}

.welcome-section {
  text-align: center;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.welcome-subtitle {
  color: var(--muted-foreground);
  font-size: 1rem;
}

.floor-selector-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
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
    width: 15rem;
    height: 10rem;
    background-color: var(--card);
    border: 4px solid rgba(15, 23, 42, 0.2);
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
}

.floor-plate:hover {
    border-color: #0ea5e9;
    background-color: var(--accent);
    transform: rotateX(55deg) rotateZ(-45deg) translateZ(calc(var(--z-offset) + 10px)) !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.floor-content {
    transform: rotateZ(45deg) rotateX(-55deg);
    text-align: center;
    transition: transform 0.3s;
}

.floor-plate:hover .floor-content {
    transform: rotateZ(45deg) rotateX(-55deg) scale(1.1);
}

.floor-level {
    font-size: 2.5rem;
    font-weight: 900;
    color: var(--foreground);
}

.floor-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: var(--muted-foreground);
}

@media (prefers-color-scheme: dark) {
  .floor-plate {
    background-color: #1e1e2d;
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
