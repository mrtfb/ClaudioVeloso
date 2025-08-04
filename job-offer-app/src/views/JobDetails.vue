<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const jobStore = useJobStore()

const loading = ref(false)
const jobId = route.params.jobId as string

const job = computed(() => {
  return jobStore.jobs.find(j => j.id === jobId)
})

const canAccept = computed(() => {
  return job.value?.status === 'pending' && 
         authStore.userType === 'installer'
})

const canStart = computed(() => {
  return job.value?.status === 'accepted' && 
         job.value.installerId === authStore.user?.id &&
         authStore.userType === 'installer'
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

async function acceptJob() {
  if (!job.value || !authStore.user?.id) return
  
  loading.value = true
  try {
    jobStore.acceptJob(job.value.id, authStore.user.id)
    // Redirect to installer dashboard
    router.push({ name: 'installer-dashboard' })
  } catch (error) {
    console.error('Error accepting job:', error)
  } finally {
    loading.value = false
  }
}

function startJob() {
  if (!job.value) return
  router.push({ name: 'work-session', params: { jobId: job.value.id } })
}

function goBack() {
  router.back()
}

onMounted(() => {
  jobStore.loadFromStorage()
  
  // If job not found, redirect back
  if (!job.value) {
    router.back()
  }
})
</script>

<template>
  <div class="container">
    <!-- Back Button -->
    <div class="mb-6">
      <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Voltar
      </button>
    </div>

    <div v-if="job" class="space-y-6">
      <!-- Job Header -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <h1 class="text-2xl font-bold text-gray-900">{{ job.title }}</h1>
          <span :class="[
            'badge text-sm px-3 py-1 rounded-full font-medium',
            job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
            job.status === 'in_progress' ? 'bg-green-100 text-green-800' :
            job.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
            'bg-red-100 text-red-800'
          ]">
            {{
              job.status === 'pending' ? 'Pendente' :
              job.status === 'accepted' ? 'Aceito' :
              job.status === 'in_progress' ? 'Em Andamento' :
              job.status === 'completed' ? 'Concluído' :
              'Cancelado'
            }}
          </span>
        </div>

        <p class="text-gray-700 text-lg leading-relaxed">{{ job.description }}</p>
      </div>

      <!-- Job Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Schedule & Location -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📅 Agendamento & Localização</h3>
          <div class="space-y-3">
            <div v-if="job.scheduledDate" class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7L6 9v10a2 2 0 002 2h8a2 2 0 002-2V9l-2-2"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Data e Hora</p>
                <p class="text-gray-600">{{ formatDateTime(job.scheduledDate) }}</p>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Localização</p>
                <p class="text-gray-600">{{ job.location }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment & Duration -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💰 Pagamento & Duração</h3>
          <div class="space-y-3">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Valor Total</p>
                <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(job.payment) }}</p>
              </div>
            </div>
            
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Duração Estimada</p>
                <p class="text-gray-600">{{ job.duration }} {{ job.duration === 1 ? 'hora' : 'horas' }}</p>
              </div>
            </div>

            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Valor por Hora</p>
                <p class="text-gray-600">{{ formatCurrency(job.payment / job.duration) }}/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 Histórico</h3>
        <div class="space-y-4">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <p class="font-medium text-gray-900">Oferta Criada</p>
              <p class="text-sm text-gray-600">{{ formatDateTime(job.createdAt) }}</p>
            </div>
          </div>
          
          <div v-if="job.status !== 'pending'" class="flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <p class="font-medium text-gray-900">Trabalho Aceito</p>
              <p class="text-sm text-gray-600">Por instalador</p>
            </div>
          </div>

          <div v-if="job.startedAt" class="flex items-center">
            <div class="w-3 h-3 bg-yellow-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <p class="font-medium text-gray-900">Trabalho Iniciado</p>
              <p class="text-sm text-gray-600">{{ formatDateTime(job.startedAt) }}</p>
            </div>
          </div>

          <div v-if="job.completedAt" class="flex items-center">
            <div class="w-3 h-3 bg-emerald-500 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <p class="font-medium text-gray-900">Trabalho Concluído</p>
              <p class="text-sm text-gray-600">{{ formatDateTime(job.completedAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="authStore.userType === 'installer'" class="card">
        <div class="flex gap-4">
          <button 
            v-if="canAccept"
            @click="acceptJob"
            :disabled="loading"
            class="btn btn-primary flex-1"
          >
            <span v-if="loading" class="flex items-center">
              <div class="spinner mr-2"></div>
              Aceitando...
            </span>
            <span v-else>✓ Aceitar Trabalho</span>
          </button>
          
          <button 
            v-if="canStart"
            @click="startJob"
            class="btn btn-success flex-1"
          >
            ▶ Iniciar Trabalho
          </button>
          
          <button 
            v-if="job.status === 'in_progress' && job.installerId === authStore.user?.id"
            @click="startJob"
            class="btn btn-primary flex-1"
          >
            ↗ Continuar Trabalho
          </button>
        </div>
      </div>
    </div>

    <!-- Job Not Found -->
    <div v-else class="card text-center">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Trabalho não encontrado</h2>
      <p class="text-gray-600 mb-4">O trabalho que procura não existe ou foi removido.</p>
      <button @click="goBack" class="btn btn-primary">
        Voltar
      </button>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
