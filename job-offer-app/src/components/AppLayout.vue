<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import BottomNavigation from './BottomNavigation.vue'
import AppHeader from './AppHeader.vue'

const showBottomNav = computed(() => {
  // Hide bottom nav on certain routes if needed
  return true
})
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="main-content">
      <RouterView />
    </main>
    
    <BottomNavigation v-if="showBottomNav" />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 80px; /* Space for bottom navigation */
  background-color: #f9fafb;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}
</style>