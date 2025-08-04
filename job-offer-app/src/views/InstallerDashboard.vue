<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'
import JobCard from '../components/JobCard.vue'

const authStore = useAuthStore()
const jobStore = useJobStore()

const activeFilter = ref<'available' | 'my-jobs'>('available')

const availableJobs = computed(() => {
  return jobStore.pendingJobs
})

const myJobs = computed(() => {
  if (authStore.user?.id) {
    return jobStore.getJobsForInstaller(authStore.user.id)
  }
  return []
})

const displayedJobs = computed(() => {
  return activeFilter.value === 'available' ? availableJobs.value : myJobs.value
})

const myJobsStats = computed(() => {
  const jobs = myJobs.value
  return {
    total: jobs.length,
    accepted: jobs.filter(job => job.status === 'accepted').length,
    inProgress: jobs.filter(job => job.status === 'in_progress').length,
    completed: jobs.filter(job => job.status === 'completed').length
  }
})

onMounted(() => {
  jobStore.loadFromStorage()
})
</script>

<template>
  <div class="container">
    <!-- Filter Tabs -->
    <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button
        @click="activeFilter = 'available'"
        :class="[
          'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
          activeFilter === 'available'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        Disponíveis ({{ availableJobs.length }})
      </button>
      <button
        @click="activeFilter = 'my-jobs'"
        :class="[
          'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
          activeFilter === 'my-jobs'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        Meus Trabalhos ({{ myJobs.length }})
      </button>
    </div>

    <!-- My Jobs Stats (only show when viewing my jobs) -->
    <div v-if="activeFilter === 'my-jobs'" class="grid grid-cols-2 gap-4 mb-6">
      <div class="card text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ myJobsStats.accepted }}</div>
        <div class="text-sm text-gray-600">Aceitos</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-green-600">{{ myJobsStats.inProgress }}</div>
        <div class="text-sm text-gray-600">Em Andamento</div>
      </div>
    </div>

    <!-- Jobs List -->
    <div v-if="displayedJobs.length === 0" class="card text-center py-8">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ activeFilter === 'available' ? 'Nenhum trabalho disponível' : 'Nenhum trabalho aceito' }}
      </h3>
      <p class="text-gray-600">
        {{ 
          activeFilter === 'available' 
            ? 'Não há ofertas de trabalho disponíveis no momento.' 
            : 'Você ainda não aceitou nenhum trabalho.'
        }}
      </p>
    </div>

    <div v-else class="jobs-list">
      <JobCard 
        v-for="job in displayedJobs" 
        :key="job.id" 
        :job="job"
        :show-installer-actions="true"
      />
    </div>

    <!-- Quick Stats for Available Jobs -->
    <div v-if="activeFilter === 'available' && availableJobs.length > 0" class="card mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-xl font-bold text-blue-600">
            {{ availableJobs.reduce((sum, job) => sum + job.payment, 0).toFixed(0) }}€
          </div>
          <div class="text-sm text-gray-600">Valor Total Disponível</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-bold text-green-600">
            {{ (availableJobs.reduce((sum, job) => sum + job.payment, 0) / Math.max(availableJobs.reduce((sum, job) => sum + job.duration, 0), 1)).toFixed(0) }}€/h
          </div>
          <div class="text-sm text-gray-600">Valor Médio por Hora</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.flex-1 {
  flex: 1 1 0%;
}
</style>