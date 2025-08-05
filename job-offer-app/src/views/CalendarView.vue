<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useJobStore, type JobOffer } from '@/stores/jobs'

const authStore = useAuthStore()
const jobStore = useJobStore()

const currentDate = ref(new Date())

const scheduledJobs = computed(() => {
  if (authStore.userType === 'installer' && authStore.user?.id) {
    // For installers: show their assigned jobs (accepted/in_progress) + all pending jobs they could accept
    const assignedJobs = jobStore.getJobsForInstaller(authStore.user.id)
      .filter(job => job.scheduledDate && (job.status === 'accepted' || job.status === 'in_progress'))
    
    const availableJobs = jobStore.pendingJobs
      .filter(job => job.scheduledDate && !job.installerId)
    
    return [...assignedJobs, ...availableJobs]
      .sort((a, b) => (a.scheduledDate?.getTime() || 0) - (b.scheduledDate?.getTime() || 0))
  } else if (authStore.userType === 'client' && authStore.user?.id) {
    return jobStore.getJobsForClient(authStore.user.id)
      .filter(job => job.scheduledDate)
      .sort((a, b) => (a.scheduledDate?.getTime() || 0) - (b.scheduledDate?.getTime() || 0))
  }
  return []
})

const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('pt-PT', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const currentDateObj = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    // Get all jobs for the current day based on user type
    let dayJobs: JobOffer[] = []
    if (authStore.userType === 'installer' && authStore.user?.id) {
      // For installers: show their assigned jobs + available pending jobs
      const assignedJobs = jobStore.getJobsForInstaller(authStore.user.id)
        .filter(job => job.scheduledDate && 
          job.scheduledDate.toDateString() === currentDateObj.toDateString() &&
          (job.status === 'accepted' || job.status === 'in_progress'))
      
      const availableJobs = jobStore.pendingJobs
        .filter(job => job.scheduledDate && 
          job.scheduledDate.toDateString() === currentDateObj.toDateString() &&
          !job.installerId)
      
      dayJobs = [...assignedJobs, ...availableJobs]
    } else if (authStore.userType === 'client' && authStore.user?.id) {
      // For clients: show all their jobs regardless of status
      dayJobs = jobStore.getJobsForClient(authStore.user.id)
        .filter(job => job.scheduledDate && 
          job.scheduledDate.toDateString() === currentDateObj.toDateString())
    } else {
      // Fallback: show all jobs with scheduled dates (for debugging)
      dayJobs = jobStore.jobs
        .filter(job => job.scheduledDate && 
          job.scheduledDate.toDateString() === currentDateObj.toDateString())
    }
    
    const day = {
      date: new Date(currentDateObj),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: currentDateObj.toDateString() === new Date().toDateString(),
      jobs: dayJobs
    }
    days.push(day)
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return days
})

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function goToToday() {
  currentDate.value = new Date()
}

onMounted(() => {
  jobStore.loadFromStorage()
  
  // Debug: Log jobs to see what's available
  console.log('All jobs:', jobStore.jobs)
  console.log('Scheduled jobs:', scheduledJobs.value)
  console.log('Current user:', authStore.user)
  console.log('User type:', authStore.userType)
})
</script>

<template>
  <div class="container">
    <!-- Calendar Header -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <h2 class="text-xl font-semibold text-gray-900 capitalize">{{ currentMonth }} - UPDATED VERSION</h2>
        
        <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <button @click="goToToday" class="btn btn-secondary w-full">
        Hoje
      </button>
    </div>

    <!-- Calendar Grid -->
    <div class="card">
      <!-- Week Days Header -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="day" 
             class="text-center text-sm font-medium text-gray-600 p-2">
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        <div 
          v-for="day in calendarDays" 
          :key="day.date.toISOString()"
          :class="[
            'min-h-20 p-1 border border-gray-100 rounded-lg',
            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
            day.isToday ? 'bg-blue-50 border-blue-200' : ''
          ]"
        >
          <div :class="[
            'text-sm font-medium mb-1',
            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
            day.isToday ? 'text-blue-600' : ''
          ]">
            {{ day.date.getDate() }}
          </div>
          
          <!-- Jobs for this day -->
          <div class="space-y-1">
            <div 
              v-for="job in day.jobs.slice(0, 2)" 
              :key="job.id"
              class="rounded-2xl p-3 shadow-lg border-2"
              :style="{
                backgroundColor: job.status === 'pending' ? '#fde047' : 
                                job.status === 'accepted' ? '#93c5fd' : 
                                job.status === 'in_progress' ? '#86efac' : '#d1d5db',
                borderColor: job.status === 'pending' ? '#facc15' : 
                            job.status === 'accepted' ? '#60a5fa' : 
                            job.status === 'in_progress' ? '#4ade80' : '#9ca3af',
                color: 'black',
                fontSize: '11px',
                lineHeight: '1.3',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
              }"
            >
              <div class="font-bold truncate text-center mb-1" style="line-height: 1.2;">
                {{ job.title }}
              </div>
              <div class="truncate text-center text-xs opacity-75" style="line-height: 1.1;">
                {{ job.scheduledDate ? job.scheduledDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '' }}
              </div>
            </div>
            <div v-if="day.jobs.length > 2" class="text-xs text-white font-bold bg-gray-700 rounded px-1" style="text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">
              +{{ day.jobs.length - 2 }} mais
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Jobs -->
    <div class="card mt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Próximos Trabalhos</h3>
      
      <div v-if="scheduledJobs.length === 0" class="text-center py-4 text-gray-600">
        Nenhum trabalho agendado
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="job in scheduledJobs.slice(0, 5)" 
          :key="job.id"
          class="flex items-center justify-between p-3 rounded-lg border-2 shadow-md"
          :style="{
            backgroundColor: job.status === 'pending' ? '#fde047' : 
                            job.status === 'accepted' ? '#93c5fd' : 
                            job.status === 'in_progress' ? '#86efac' : '#d1d5db',
            borderColor: job.status === 'pending' ? '#facc15' : 
                        job.status === 'accepted' ? '#60a5fa' : 
                        job.status === 'in_progress' ? '#4ade80' : '#9ca3af',
            color: 'black'
          }"
        >
          <div>
            <div class="font-bold text-gray-900 text-base">{{ job.title }}</div>
            <div class="text-sm text-gray-800 font-medium">{{ job.location }}</div>
            <div v-if="job.scheduledDate" class="text-sm text-gray-900 font-bold">
              📅 {{ job.scheduledDate.toLocaleDateString('pt-PT', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric'
              }) }} às {{ job.scheduledDate.toLocaleTimeString('pt-PT', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs px-3 py-1 rounded-full font-black"
                 style="font-weight: 900; letter-spacing: 0.5px; color: black;">
              {{ 
                job.status === 'pending' ? 'PENDENTE' :
                job.status === 'accepted' ? 'AGENDADO' : 
                job.status === 'in_progress' ? 'EM ANDAMENTO' : 'DESCONHECIDO'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-7 {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.gap-1 {
  gap: 0.25rem;
}

.min-h-20 {
  min-height: 5rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>