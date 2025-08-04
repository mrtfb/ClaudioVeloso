<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useJobStore } from './stores/jobs'

const authStore = useAuthStore()
const jobStore = useJobStore()

onMounted(() => {
  authStore.initializeAuth()
  jobStore.loadFromStorage()
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
