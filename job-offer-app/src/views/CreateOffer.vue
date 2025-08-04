<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJobStore } from '../stores/jobs'

const router = useRouter()
const authStore = useAuthStore()
const jobStore = useJobStore()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive({
  title: '',
  description: '',
  location: '',
  duration: 1,
  payment: 0,
  scheduledDate: (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })(),
  scheduledTime: '09:00'
})

function validateForm(): boolean {
  errors.value = {}
  
  if (!form.title.trim()) {
    errors.value.title = 'Título é obrigatório'
  }
  
  if (!form.description.trim()) {
    errors.value.description = 'Descrição é obrigatória'
  }
  
  if (!form.location.trim()) {
    errors.value.location = 'Localização é obrigatória'
  }
  
  if (form.duration < 1) {
    errors.value.duration = 'Duração deve ser pelo menos 1 hora'
  }
  
  if (form.payment <= 0) {
    errors.value.payment = 'Pagamento deve ser maior que 0'
  }
  
  if (!form.scheduledDate) {
    errors.value.scheduledDate = 'Data é obrigatória'
  }
  
  if (!form.scheduledTime) {
    errors.value.scheduledTime = 'Hora é obrigatória'
  }
  
  // Validate that the scheduled date/time is in the future
  if (form.scheduledDate && form.scheduledTime) {
    const scheduledDateTime = new Date(`${form.scheduledDate}T${form.scheduledTime}`)
    if (scheduledDateTime <= new Date()) {
      errors.value.scheduledDate = 'Data e hora devem ser no futuro'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function submitOffer() {
  if (!validateForm() || !authStore.user?.id) {
    return
  }
  
  loading.value = true
  
  try {
    // Combine date and time into a single Date object
    const scheduledDateTime = new Date(`${form.scheduledDate}T${form.scheduledTime}`)
    
    jobStore.addJob({
      title: form.title,
      description: form.description,
      location: form.location,
      duration: form.duration,
      payment: form.payment,
      status: 'pending',
      clientId: authStore.user.id,
      scheduledDate: scheduledDateTime
    })
    
    // Reset form
    Object.assign(form, {
      title: '',
      description: '',
      location: '',
      duration: 1,
      payment: 0,
      scheduledDate: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
      })(),
      scheduledTime: '09:00'
    })
    
    // Navigate back to dashboard
    router.push({ name: 'client-dashboard' })
  } catch (error) {
    console.error('Error creating job offer:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <form @submit.prevent="submitOffer" class="space-y-6">
      <!-- Title -->
      <div class="form-group">
        <label for="title" class="form-label">Título do Trabalho *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          :class="{ 'border-red-500': errors.title }"
          placeholder="Ex: Instalação de sistema de climatização"
        />
        <p v-if="errors.title" class="text-red-500 text-sm mt-1">{{ errors.title }}</p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">Descrição *</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-input form-textarea"
          :class="{ 'border-red-500': errors.description }"
          placeholder="Descreva detalhadamente o trabalho a ser realizado..."
          rows="4"
        ></textarea>
        <p v-if="errors.description" class="text-red-500 text-sm mt-1">{{ errors.description }}</p>
      </div>

      <!-- Location -->
      <div class="form-group">
        <label for="location" class="form-label">Localização *</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          class="form-input"
          :class="{ 'border-red-500': errors.location }"
          placeholder="Ex: Lisboa, Rua da Liberdade, 123"
        />
        <p v-if="errors.location" class="text-red-500 text-sm mt-1">{{ errors.location }}</p>
      </div>

      <!-- Duration and Payment -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label for="duration" class="form-label">Duração (horas) *</label>
          <input
            id="duration"
            v-model.number="form.duration"
            type="number"
            min="1"
            max="24"
            class="form-input"
            :class="{ 'border-red-500': errors.duration }"
          />
          <p v-if="errors.duration" class="text-red-500 text-sm mt-1">{{ errors.duration }}</p>
        </div>

        <div class="form-group">
          <label for="payment" class="form-label">Pagamento (€) *</label>
          <input
            id="payment"
            v-model.number="form.payment"
            type="number"
            min="0"
            step="0.01"
            class="form-input"
            :class="{ 'border-red-500': errors.payment }"
            placeholder="0.00"
          />
          <p v-if="errors.payment" class="text-red-500 text-sm mt-1">{{ errors.payment }}</p>
        </div>
      </div>

      <!-- Scheduled Date and Time -->
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label for="scheduledDate" class="form-label">Data Agendada *</label>
          <input
            id="scheduledDate"
            v-model="form.scheduledDate"
            type="date"
            class="form-input"
            :class="{ 'border-red-500': errors.scheduledDate }"
            :min="new Date().toISOString().split('T')[0]"
          />
          <p v-if="errors.scheduledDate" class="text-red-500 text-sm mt-1">{{ errors.scheduledDate }}</p>
        </div>

        <div class="form-group">
          <label for="scheduledTime" class="form-label">Hora Agendada *</label>
          <input
            id="scheduledTime"
            v-model="form.scheduledTime"
            type="time"
            class="form-input"
            :class="{ 'border-red-500': errors.scheduledTime }"
          />
          <p v-if="errors.scheduledTime" class="text-red-500 text-sm mt-1">{{ errors.scheduledTime }}</p>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="card bg-blue-50 border-blue-200">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">Resumo da Oferta</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-blue-700">Valor por hora:</span>
            <span class="font-medium text-blue-900">
              {{ form.duration > 0 ? (form.payment / form.duration).toFixed(2) : '0.00' }}€/h
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-700">Valor total:</span>
            <span class="font-bold text-blue-900">{{ form.payment.toFixed(2) }}€</span>
          </div>
          <div v-if="form.scheduledDate && form.scheduledTime" class="flex justify-between border-t border-blue-200 pt-2">
            <span class="text-blue-700">Agendado para:</span>
            <span class="font-medium text-blue-900">
              {{ new Date(`${form.scheduledDate}T${form.scheduledTime}`).toLocaleDateString('pt-PT', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          type="button"
          @click="router.back()"
          class="btn btn-secondary flex-1"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary flex-1"
          :disabled="loading"
        >
          <span v-if="loading" class="flex items-center">
            <div class="spinner mr-2"></div>
            Criando...
          </span>
          <span v-else>Criar Oferta</span>
        </button>
      </div>
    </form>
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

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.border-red-500 {
  border-color: #ef4444;
}

.text-red-500 {
  color: #ef4444;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.text-blue-700 {
  color: #1d4ed8;
}

.text-blue-900 {
  color: #1e3a8a;
}
</style>