<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'

interface Props {
  jobId: string
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()
const jobStore = useJobStore()

const job = computed(() => {
  return jobStore.jobs.find(j => j.id === props.jobId)
})

const isJobStarted = computed(() => {
  return job.value?.status === 'in_progress'
})

const canStartJob = computed(() => {
  return job.value?.status === 'accepted' && 
         job.value?.installerId === authStore.user?.id
})

const canCompleteJob = computed(() => {
  return job.value?.status === 'in_progress' && 
         job.value?.installerId === authStore.user?.id
})

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const cameraActive = ref(false)
const cameraMode = ref<'before' | 'after' | null>(null)
const capturedPhoto = ref<string>('')

async function startCamera(mode: 'before' | 'after') {
  cameraMode.value = mode
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      cameraActive.value = true
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    alert('Erro ao acessar a câmera. Verifique as permissões.')
  }
}

function stopCamera() {
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
  cameraActive.value = false
  cameraMode.value = null
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  
  const canvas = canvasRef.value
  const video = videoRef.value
  
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    capturedPhoto.value = imageData
    
    // Save photo to job
    if (cameraMode.value === 'before') {
      jobStore.addBeforePhoto(props.jobId, imageData)
    } else if (cameraMode.value === 'after') {
      jobStore.updateJob(props.jobId, { afterPhoto: imageData })
    }
    
    stopCamera()
  }
}

function startWork() {
  if (job.value) {
    jobStore.startJob(props.jobId)
  }
}

function completeWork() {
  if (job.value && job.value.afterPhoto) {
    jobStore.completeJob(props.jobId, job.value.afterPhoto)
    router.push({ name: 'installer-dashboard' })
  } else {
    alert('É necessário tirar uma foto após o trabalho para concluir.')
  }
}

function formatDuration(startTime?: Date): string {
  if (!startTime) return '00:00:00'
  
  const now = new Date()
  const diff = now.getTime() - startTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (!job.value) {
    router.push({ name: 'installer-dashboard' })
  }
})
</script>

<template>
  <div class="container" v-if="job">
    <!-- Job Information -->
    <div class="card mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ job.title }}</h2>
      <p class="text-gray-600 mb-4">{{ job.description }}</p>
      
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Localização:</span>
          <div class="font-medium">{{ job.location }}</div>
        </div>
        <div>
          <span class="text-gray-600">Duração estimada:</span>
          <div class="font-medium">{{ job.duration }}h</div>
        </div>
        <div>
          <span class="text-gray-600">Pagamento:</span>
          <div class="font-medium">{{ job.payment }}€</div>
        </div>
        <div>
          <span class="text-gray-600">Status:</span>
          <div :class="[
            'font-medium',
            job.status === 'accepted' ? 'text-yellow-600' : 'text-green-600'
          ]">
            {{ job.status === 'accepted' ? 'Aceito' : 'Em Andamento' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Work Session Controls -->
    <div class="card mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Controle da Sessão</h3>
      
      <!-- Timer (if work started) -->
      <div v-if="isJobStarted && job.startedAt" class="text-center mb-6">
        <div class="text-3xl font-bold text-blue-600 mb-2">
          {{ formatDuration(job.startedAt) }}
        </div>
        <div class="text-sm text-gray-600">Tempo decorrido</div>
      </div>
      
      <!-- Start Work Button -->
      <button 
        v-if="canStartJob"
        @click="startWork"
        class="btn btn-success w-full mb-4"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 01-1 1H6a1 1 0 01-1-1V9a1 1 0 011-1h2M9 10V9a1 1 0 011-1h1M9 10H8a1 1 0 00-1 1v1M15 10v4a1 1 0 001 1h2a1 1 0 001-1V9a1 1 0 00-1-1h-2M15 10V9a1 1 0 00-1-1h-1M15 10h1a1 1 0 011 1v1"></path>
        </svg>
        Iniciar Trabalho
      </button>
      
      <!-- Complete Work Button -->
      <button 
        v-if="canCompleteJob"
        @click="completeWork"
        class="btn btn-primary w-full"
        :disabled="!job.afterPhoto"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Concluir Trabalho
      </button>
    </div>

    <!-- Photo Documentation -->
    <div class="card mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Documentação Fotográfica</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Before Photo -->
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Foto Antes</h4>
          <div v-if="job.beforePhoto" class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
            <img :src="job.beforePhoto" alt="Foto antes" class="w-full h-full object-cover" />
          </div>
          <div v-else class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <button 
            @click="startCamera('before')"
            class="btn btn-secondary w-full"
            :disabled="cameraActive"
          >
            {{ job.beforePhoto ? 'Refazer Foto' : 'Tirar Foto Antes' }}
          </button>
        </div>
        
        <!-- After Photo -->
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Foto Depois</h4>
          <div v-if="job.afterPhoto" class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
            <img :src="job.afterPhoto" alt="Foto depois" class="w-full h-full object-cover" />
          </div>
          <div v-else class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <button 
            @click="startCamera('after')"
            class="btn btn-secondary w-full"
            :disabled="cameraActive || !isJobStarted"
          >
            {{ job.afterPhoto ? 'Refazer Foto' : 'Tirar Foto Depois' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Camera Modal -->
    <div v-if="cameraActive" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded-lg w-full max-w-md mx-4">
        <div class="mb-4">
          <h3 class="text-lg font-semibold">
            {{ cameraMode === 'before' ? 'Foto Antes do Trabalho' : 'Foto Depois do Trabalho' }}
          </h3>
        </div>
        
        <div class="aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video ref="videoRef" autoplay class="w-full h-full object-cover"></video>
        </div>
        
        <div class="flex gap-2">
          <button @click="stopCamera" class="btn btn-secondary flex-1">
            Cancelar
          </button>
          <button @click="capturePhoto" class="btn btn-primary flex-1">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Capturar
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden canvas for photo capture -->
    <canvas ref="canvasRef" style="display: none;"></canvas>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

.flex-1 {
  flex: 1 1 0%;
}

.fixed {
  position: fixed;
}

.inset-0 {
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

.z-50 {
  z-index: 50;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>