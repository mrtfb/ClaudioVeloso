<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'client-dashboard':
      return 'Meus Trabalhos'
    case 'create-offer':
      return 'Nova Oferta'
    case 'installer-dashboard':
      return 'Trabalhos Disponíveis'
    case 'calendar':
      return 'Calendário'
    case 'work-session':
      return 'Sessão de Trabalho'
    default:
      return 'Gestão de Trabalhos'
  }
})

function logout() {
  authStore.logout()
}
</script>

<template>
  <header class="header">
    <div class="flex items-center">
      <h1 class="header-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600">
        {{ authStore.user?.name }}
      </span>
      <button 
        @click="logout"
        class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Sair"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
      </button>
    </div>
  </header>
</template>