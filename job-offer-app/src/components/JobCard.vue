<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
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

function viewJobDetails() {
  router.push({ name: 'job-details', params: { jobId: props.job.id } })
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

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<template>
  <div 
    class="job-card-compact" 
    :class="{ 'clickable': showInstallerActions && job.status === 'pending' }"
    @click="showInstallerActions && job.status === 'pending' ? viewJobDetails() : null"
  >
    <!-- Left side: Status indicator square -->
    <div class="status-square" :class="statusBadgeClass">
      <span class="status-icon">{{ job.title.charAt(0).toUpperCase() }}</span>
    </div>
    
    <!-- Main content area -->
    <div class="job-content">
      <div class="job-header">
        <h3 class="job-title">{{ job.title }}</h3>
        <span class="job-payment">{{ formatCurrency(job.payment) }}</span>
      </div>
      
      <div class="job-details">
        <span class="job-location">📍 {{ job.location }}</span>
        <span class="job-duration">⏱️ {{ job.duration }}h</span>
        <span v-if="job.scheduledDate" class="job-scheduled">📅 {{ formatDateTime(job.scheduledDate) }}</span>
        <span class="job-status" :class="statusBadgeClass">{{ statusText }}</span>
      </div>
      
      <p class="job-description">{{ job.description }}</p>
    </div>
    
    <!-- Right side: Actions -->
    <div class="job-actions" @click.stop>
      <!-- Installer Actions -->
      <template v-if="showInstallerActions">
        <button 
          v-if="canAccept"
          @click="acceptJob"
          class="action-btn accept-btn"
          title="Aceitar Trabalho"
        >
          ✓
        </button>
        
        <RouterLink 
          v-if="canStart"
          :to="{ name: 'work-session', params: { jobId: job.id } }"
          class="action-btn start-btn"
          title="Iniciar Trabalho"
        >
          ▶
        </RouterLink>
        
        <RouterLink 
          v-if="job.status === 'in_progress' && job.installerId === authStore.user?.id"
          :to="{ name: 'work-session', params: { jobId: job.id } }"
          class="action-btn continue-btn"
          title="Continuar"
        >
          ↗
        </RouterLink>
      </template>

      <!-- Client Actions -->
      <template v-if="showClientActions && job.status === 'pending'">
        <button class="action-btn edit-btn" title="Editar">
          ✏️
        </button>
        <button class="action-btn cancel-btn" title="Cancelar">
          ✕
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.job-card-compact {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  margin-bottom: 8px;
  min-height: 80px;
  transition: all 0.2s ease;
}

.job-card-compact:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.job-card-compact.clickable {
  cursor: pointer;
}

.job-card-compact.clickable:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* Status square on the left */
.status-square {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
  color: white;
}

.status-icon {
  font-size: 18px;
  font-weight: bold;
}

/* Main content area */
.job-content {
  flex: 1;
  min-width: 0;
}

.job-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 12px;
}

.job-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.job-payment {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  white-space: nowrap;
}

.job-details {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.job-location,
.job-duration,
.job-scheduled {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 2px;
}

.job-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.job-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Actions on the right */
.job-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: white;
}

.accept-btn {
  background: #059669;
}

.accept-btn:hover {
  background: #047857;
}

.start-btn,
.continue-btn {
  background: #3b82f6;
}

.start-btn:hover,
.continue-btn:hover {
  background: #2563eb;
}

.edit-btn {
  background: #6b7280;
}

.edit-btn:hover {
  background: #4b5563;
}

.cancel-btn {
  background: #dc2626;
}

.cancel-btn:hover {
  background: #b91c1c;
}

/* Status badge colors */
.badge-pending {
  background: #f59e0b;
  color: #92400e;
}

.badge-accepted {
  background: #3b82f6;
  color: white;
}

.badge-completed {
  background: #059669;
  color: white;
}

.badge-cancelled {
  background: #dc2626;
  color: white;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .job-card-compact {
    padding: 10px;
    gap: 10px;
    min-height: 70px;
  }
  
  .status-square {
    width: 40px;
    height: 40px;
  }
  
  .status-icon {
    font-size: 16px;
  }
  
  .job-title {
    font-size: 14px;
  }
  
  .job-payment {
    font-size: 12px;
  }
  
  .job-details {
    gap: 8px;
  }
  
  .job-location,
  .job-duration {
    font-size: 11px;
  }
  
  .job-description {
    font-size: 12px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>