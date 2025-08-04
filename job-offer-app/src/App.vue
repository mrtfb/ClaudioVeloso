<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useJobStore } from './stores/jobs'
import UserTypeSelection from './components/UserTypeSelection.vue'
import AppLayout from './components/AppLayout.vue'

const authStore = useAuthStore()
const jobStore = useJobStore()

onMounted(() => {
  authStore.initializeAuth()
  jobStore.loadFromStorage()
})
</script>

<template>
  <div id="app">
    <!-- Show user type selection if not authenticated -->
    <UserTypeSelection v-if="!authStore.isAuthenticated" />
    
    <!-- Show main app layout if authenticated -->
    <AppLayout v-else />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
