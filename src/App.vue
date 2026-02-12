<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainLayout from './components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <RouterView />
  </MainLayout>
</template>

<style>
/* Global styles could also be placed here if not in main.css */
</style>
