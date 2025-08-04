<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'
import JobCard from '../components/JobCard.vue'

const authStore = useAuthStore()
const jobStore = useJobStore()

const clientJobs = computed(() => {
  if (authStore.user?.id) {
    return jobStore.getJobsForClient(authStore.user.id)
  }
  return []
})

const jobStats = computed(() => {
  const jobs = clientJobs.value
  return {
    total: jobs.length,
    pending: jobs.filter(job => job.status === 'pending').length,
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
    <!-- Stats Overview -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="card text-center">
        <div class="text-2xl font-bold text-blue-600">{{ jobStats.total }}</div>
        <div class="text-sm text-gray-600">Total de Ofertas</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-yellow-600">{{ jobStats.pending }}</div>
        <div class="text-sm text-gray-600">Pendentes</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-green-600">{{ jobStats.inProgress }}</div>
        <div class="text-sm text-gray-600">Em Andamento</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-purple-600">{{ jobStats.completed }}</div>
        <div class="text-sm text-gray-600">Concluídos</div>
      </div>
    </div>

    <!-- Recent Jobs -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Ofertas Recentes</h2>
      
      <div v-if="clientJobs.length === 0" class="card text-center py-8">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma oferta criada</h3>
        <p class="text-gray-600 mb-4">Crie sua primeira oferta de trabalho para começar.</p>
        <RouterLink to="/client/create-offer" class="btn btn-primary">
          Criar Nova Oferta
        </RouterLink>
      </div>

      <div v-else class="space-y-4">
        <JobCard 
          v-for="job in clientJobs.slice(0, 5)" 
          :key="job.id" 
          :job="job"
          :show-client-actions="true"
        />
        
        <div v-if="clientJobs.length > 5" class="text-center">
          <button class="btn btn-secondary">Ver Todas as Ofertas</button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div class="grid grid-cols-1 gap-3">
        <RouterLink to="/client/create-offer" class="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-900">Criar Nova Oferta</div>
            <div class="text-sm text-gray-600">Publique um novo trabalho</div>
          </div>
        </RouterLink>
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

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.gap-3 {
  gap: 0.75rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>