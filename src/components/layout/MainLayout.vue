<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { Home, Heart } from 'lucide-vue-next';

const route = useRoute();
</script>

<template>
  <div class="layout">
    <!-- Header -->
    <header class="header">
      <h1 class="title">College Map</h1>
    </header>

    <!-- Main Content Area -->
    <main class="main">
      <slot></slot>
    </main>

    <!-- Bottom Navigation -->
    <nav class="nav">
      <RouterLink 
        to="/" 
        class="nav-item"
        :class="{ 'active': route.name === 'home' }"
      >
        <Home class="icon" />
        <span class="label">Home</span>
      </RouterLink>

      <RouterLink 
        to="/favorites" 
        class="nav-item"
        :class="{ 'active': route.name === 'favorites' }"
      >
        <Heart class="icon" />
        <span class="label">Favorites</span>
      </RouterLink>
    </nav>
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

.header {
  border-bottom: 1px solid var(--border);
  background-color: var(--card);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.main {
  flex: 1;
  overflow: auto;
  padding-bottom: 5rem; /* space for nav */
  position: relative;
}

.nav {
  border-top: 1px solid var(--border);
  background-color: var(--card);
  height: 4rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 20;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  items-center: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--muted-foreground);
  transition: color 0.2s;
  text-decoration: none;
  align-items: center;
}

.nav-item:hover {
  color: var(--primary);
}

.nav-item.active {
  color: var(--primary);
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.label {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
