<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'

const authStore = useAuthStore()
const jobStore = useJobStore()

const currentDate = ref(new Date())

const scheduledJobs = computed(() => {
  if (authStore.user?.id) {
    return jobStore.getJobsForInstaller(authStore.user.id)
      .filter(job => job.status === 'accepted' || job.status === 'in_progress')
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
    const day = {
      date: new Date(currentDateObj),
      isCurrentMonth: currentDateObj.getMonth() === month,
      isToday: currentDateObj.toDateString() === new Date().toDateString(),
      jobs: scheduledJobs.value.filter(job => 
        job.scheduledDate && 
        job.scheduledDate.toDateString() === currentDateObj.toDateString()
      )
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
        
        <h2 class="text-xl font-semibold text-gray-900 capitalize">{{ currentMonth }}</h2>
        
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
              :class="[
                'text-xs p-1 rounded text-white truncate',
                job.status === 'accepted' ? 'bg-yellow-500' : 'bg-green-500'
              ]"
              :title="job.title"
            >
              {{ job.title }}
            </div>
            <div v-if="day.jobs.length > 2" class="text-xs text-gray-500">
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
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <div class="font-medium text-gray-900">{{ job.title }}</div>
            <div class="text-sm text-gray-600">{{ job.location }}</div>
          </div>
          <div class="text-right">
            <div :class="[
              'text-xs px-2 py-1 rounded-full',
              job.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            ]">
              {{ job.status === 'accepted' ? 'Agendado' : 'Em Andamento' }}
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