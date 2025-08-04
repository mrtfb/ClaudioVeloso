<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useJobStore, type JobOffer } from '../stores/jobs'

interface Props {
  job: JobOffer
  showClientActions?: boolean
  showInstallerActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showClientActions: false,
  showInstallerActions: false
})

const authStore = useAuthStore()
const jobStore = useJobStore()

const statusBadgeClass = computed(() => {
  switch (props.job.status) {
    case 'pending':
      return 'badge-pending'
    case 'accepted':
      return 'badge-accepted'
    case 'in_progress':
      return 'badge-accepted'
    case 'completed':
      return 'badge-completed'
    case 'cancelled':
      return 'badge-cancelled'
    default:
      return 'badge-pending'
  }
})

const statusText = computed(() => {
  switch (props.job.status) {
    case 'pending':
      return 'Pendente'
    case 'accepted':
      return 'Aceito'
    case 'in_progress':
      return 'Em Andamento'
    case 'completed':
      return 'Concluído'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Desconhecido'
  }
})

const canAccept = computed(() => {
  return props.job.status === 'pending' && 
         authStore.userType === 'installer' && 
         props.showInstallerActions
})

const canStart = computed(() => {
  return props.job.status === 'accepted' && 
         props.job.installerId === authStore.user?.id &&
         props.showInstallerActions
})

function acceptJob() {
  if (authStore.user?.id) {
    jobStore.acceptJob(props.job.id, authStore.user.id)
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-semibold text-gray-900">{{ job.title }}</h3>
      <span :class="['badge', statusBadgeClass]">{{ statusText }}</span>
    </div>
    
    <p class="text-gray-600 mb-3 line-clamp-2">{{ job.description }}</p>
    
    <div class="space-y-2 mb-4">
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        {{ job.location }}
      </div>
      
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {{ job.duration }}h de trabalho
      </div>
      
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
        </svg>
        {{ formatCurrency(job.payment) }}
      </div>
      
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7L6 9v10a2 2 0 002 2h8a2 2 0 002-2V9l-2-2"></path>
        </svg>
        Criado em {{ formatDate(job.createdAt) }}
      </div>
    </div>

    <!-- Installer Actions -->
    <div v-if="showInstallerActions" class="flex gap-2">
      <button 
        v-if="canAccept"
        @click="acceptJob"
        class="btn btn-primary flex-1"
      >
        Aceitar Trabalho
      </button>
      
      <RouterLink 
        v-if="canStart"
        :to="{ name: 'work-session', params: { jobId: job.id } }"
        class="btn btn-success flex-1"
      >
        Iniciar Trabalho
      </RouterLink>
      
      <RouterLink 
        v-if="job.status === 'in_progress' && job.installerId === authStore.user?.id"
        :to="{ name: 'work-session', params: { jobId: job.id } }"
        class="btn btn-primary flex-1"
      >
        Continuar
      </RouterLink>
    </div>

    <!-- Client Actions -->
    <div v-if="showClientActions && job.status === 'pending'" class="flex gap-2">
      <button class="btn btn-secondary flex-1">
        Editar
      </button>
      <button class="btn btn-danger flex-1">
        Cancelar
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.flex-1 {
  flex: 1 1 0%;
}
</style>