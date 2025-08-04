<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()

const navigationItems = computed(() => {
  if (authStore.userType === 'client') {
    return [
      {
        name: 'Dashboard',
        route: 'client-dashboard',
        icon: 'home'
      },
      {
        name: 'Nova Oferta',
        route: 'create-offer',
        icon: 'plus'
      }
    ]
  } else {
    return [
      {
        name: 'Trabalhos',
        route: 'installer-dashboard',
        icon: 'briefcase'
      },
      {
        name: 'Calendário',
        route: 'calendar',
        icon: 'calendar'
      }
    ]
  }
})

function getIcon(iconName: string) {
  const icons = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    plus: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    briefcase: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
    calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'
  }
  return icons[iconName as keyof typeof icons] || icons.home
}
</script>

<template>
  <nav class="nav-bottom">
    <RouterLink
      v-for="item in navigationItems"
      :key="item.route"
      :to="{ name: item.route }"
      :class="[
        'nav-item',
        route.name === item.route ? 'active' : ''
      ]"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIcon(item.icon)"></path>
      </svg>
      <span>{{ item.name }}</span>
    </RouterLink>
  </nav>
</template>