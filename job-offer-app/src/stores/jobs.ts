import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'

export interface JobOffer {
  id: string
  title: string
  description: string
  location: string
  duration: number // hours
  payment: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  clientId: string
  installerId?: string
  createdAt: Date
  scheduledDate?: Date
  startedAt?: Date
  completedAt?: Date
  beforePhoto?: string
  afterPhoto?: string
}

export const useJobStore = defineStore('jobs', () => {
  const jobs = ref<JobOffer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const pendingJobs = computed(() => jobs.value.filter(job => job.status === 'pending'))
  const acceptedJobs = computed(() => jobs.value.filter(job => job.status === 'accepted'))
  const inProgressJobs = computed(() => jobs.value.filter(job => job.status === 'in_progress'))
  const completedJobs = computed(() => jobs.value.filter(job => job.status === 'completed'))

  // Get jobs for specific user
  const getJobsForClient = computed(() => (clientId: string) => 
    jobs.value.filter(job => job.clientId === clientId)
  )
  
  const getJobsForInstaller = computed(() => (installerId: string) =>
    jobs.value.filter(job => job.installerId === installerId)
  )

  // Actions
  function addJob(jobData: Omit<JobOffer, 'id' | 'createdAt'>) {
    const newJob: JobOffer = {
      ...jobData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    }
    jobs.value.push(newJob)
    saveToStorage()
    return newJob
  }

  function updateJob(jobId: string, updates: Partial<JobOffer>) {
    const index = jobs.value.findIndex(job => job.id === jobId)
    if (index !== -1) {
      jobs.value[index] = { ...jobs.value[index], ...updates }
      saveToStorage()
      return jobs.value[index]
    }
    return null
  }

  function acceptJob(jobId: string, installerId: string) {
    return updateJob(jobId, {
      status: 'accepted',
      installerId
    })
  }

  function startJob(jobId: string) {
    return updateJob(jobId, {
      status: 'in_progress',
      startedAt: new Date()
    })
  }

  function completeJob(jobId: string, afterPhoto?: string) {
    return updateJob(jobId, {
      status: 'completed',
      completedAt: new Date(),
      afterPhoto
    })
  }

  function cancelJob(jobId: string) {
    return updateJob(jobId, {
      status: 'cancelled'
    })
  }

  function addBeforePhoto(jobId: string, photo: string) {
    return updateJob(jobId, { beforePhoto: photo })
  }

  function saveToStorage() {
    localStorage.setItem('jobs', JSON.stringify(jobs.value))
  }

  function loadFromStorage() {
    const savedJobs = localStorage.getItem('jobs')
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs)
        jobs.value = parsedJobs.map((job: JobOffer) => ({
          ...job,
          createdAt: new Date(job.createdAt),
          scheduledDate: job.scheduledDate ? new Date(job.scheduledDate) : undefined,
          startedAt: job.startedAt ? new Date(job.startedAt) : undefined,
          completedAt: job.completedAt ? new Date(job.completedAt) : undefined
        }))
      } catch (error) {
        console.error('Error parsing saved jobs:', error)
        jobs.value = []
      }
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    jobs: readonly(jobs),
    loading: readonly(loading),
    error: readonly(error),
    pendingJobs,
    acceptedJobs,
    inProgressJobs,
    completedJobs,
    getJobsForClient,
    getJobsForInstaller,
    addJob,
    updateJob,
    acceptJob,
    startJob,
    completeJob,
    cancelJob,
    addBeforePhoto,
    loadFromStorage,
    clearError
  }
})