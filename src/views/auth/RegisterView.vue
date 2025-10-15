<!-- src/components/auth/RegisterForm.vue -->
<template>
  <BaseCard class="w-full max-w-md mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
      <p class="text-gray-600">Join our temple management platform</p>
    </div>

    <!-- Registration Success Alert (Non-modal version) -->
    <div v-if="registrationSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Registration Successful!</h3>
          <div class="mt-1 text-sm text-green-700">
            <p v-if="needsApproval">
              Your temple admin account has been created. You'll receive an email once your account is approved by our team.
            </p>
            <p v-else>
              Your account has been created successfully. You can now login to access your dashboard.
            </p>
          </div>
          <div class="mt-3">
            <BaseButton @click="goToLogin" variant="success" size="sm">
              Go to Login
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <form v-if="!registrationSuccess" @submit.prevent="handleRegister" class="space-y-6">
      <!-- Full Name Field -->
      <div>
        <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="fullName"
          v-model="form.fullName"
          type="text"
          placeholder="Enter your full name"
          :error="errors.fullName"
          required
          autocomplete="name"
          @input="clearError('fullName')"
        />
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          :error="errors.email"
          required
          autocomplete="email"
          @input="clearError('email')"
        />
      </div>

      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Create a strong password"
          :error="errors.password"
          required
          autocomplete="new-password"
          @input="clearError('password')"
        />
        <PasswordStrengthMeter 
          :password="form.password" 
          class="mt-2"
        />
      </div>

      <!-- Phone Field (Required) -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span class="text-red-500">*</span>
        </label>
        <BaseInput
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="Enter your phone number"
          :error="errors.phone"
          required
          autocomplete="tel"
          @input="clearError('phone')"
        />
      </div>

      <!-- Role Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          I want to join as <span class="text-red-500">*</span>
        </label>
        
        <!-- Role Selection Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="role in roleOptions"
            :key="role.value"
            :class="[
              'relative border-2 rounded-lg cursor-pointer transition-all duration-200 p-4',
              form.role === role.value 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            ]"
            @click="selectRole(role.value)"
          >
            <div class="flex flex-col items-center text-center">
              <!-- Icon -->
              <div :class="[
                'w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-colors duration-200',
                form.role === role.value ? 'bg-indigo-100' : 'bg-gray-200'
              ]">
                <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="role.value === 'tenant'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 8h2V9h-2v8z" />
                  <path v-else-if="role.value === 'devotee'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  <path v-else-if="role.value === 'volunteer'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <!-- Role Name -->
              <h3 class="font-medium text-gray-900">{{ role.label }}</h3>
            </div>
            
            <!-- Selection Indicator -->
            <div v-if="form.role === role.value" 
                class="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <!-- Role Error -->
        <div v-if="errors.role" class="mt-2 text-sm text-red-600">
          {{ errors.role }}
        </div>
      </div>
      
      <!-- Temple Details Form (shown when Temple Admin is selected) -->
      <div v-if="form.role === 'tenant'" class="mt-6 overflow-hidden bg-white rounded-lg border border-gray-200">
        <!-- Temple Details Header -->
        <div class="px-6 py-4 bg-indigo-600">
          <div class="flex items-center">
            <h3 class="text-lg font-medium leading-6 text-white">Temple Details</h3>
          </div>
          <p class="mt-1 text-sm text-indigo-100">
            Please provide the following details about your temple
          </p>
        </div>
        
        <div class="px-6 py-5 space-y-6">
          <!-- Temple Name -->
          <div>
            <label for="templeName" class="block text-sm font-medium text-gray-700 mb-1">
              Temple Name <span class="text-red-500">*</span>
            </label>
            <input
              id="templeName"
              v-model="templeDetails.name"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter temple name"
              required
              @input="clearError('templeName')"
            />
            <div v-if="errors.templeName" class="mt-1 text-xs text-red-600">
              {{ errors.templeName }}
            </div>
          </div>
          
          <!-- Temple Place -->
          <div>
            <label for="templePlace" class="block text-sm font-medium text-gray-700 mb-1">
              Temple Place <span class="text-red-500">*</span>
            </label>
            <input
              id="templePlace"
              v-model="templeDetails.place"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter temple location"
              required
              @input="clearError('templePlace')"
            />
            <div v-if="errors.templePlace" class="mt-1 text-xs text-red-600">
              {{ errors.templePlace }}
            </div>
          </div>
          
          <!-- Temple Address -->
          <div>
            <label for="templeAddress" class="block text-sm font-medium text-gray-700 mb-1">
              Temple Address <span class="text-red-500">*</span>
            </label>
            <textarea
              id="templeAddress"
              v-model="templeDetails.address"
              rows="3"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter complete temple address"
              required
              @input="clearError('templeAddress')"
            ></textarea>
            <div v-if="errors.templeAddress" class="mt-1 text-xs text-red-600">
              {{ errors.templeAddress }}
            </div>
          </div>
          
          <!-- Temple Phone -->
          <div>
            <label for="templePhone" class="block text-sm font-medium text-gray-700 mb-1">
              Temple Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              id="templePhone"
              v-model="templeDetails.phoneNumber"
              type="tel"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter temple contact number"
              required
              @input="clearError('templePhoneNo')"
            />
            <div v-if="errors.templePhoneNo" class="mt-1 text-xs text-red-600">
              {{ errors.templePhoneNo }}
            </div>
          </div>
          
          <!-- Temple Description - Now Mandatory -->
          <div>
            <label for="templeDescription" class="block text-sm font-medium text-gray-700 mb-1">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              id="templeDescription"
              v-model="templeDetails.description"
              rows="4"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Provide additional details about your temple (history, services, etc.)"
              required
              @input="clearError('templeDescription')"
            ></textarea>
            <div v-if="errors.templeDescription" class="mt-1 text-xs text-red-600">
              {{ errors.templeDescription }}
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Privacy -->
      <div class="flex items-start mt-6">
        <input
          id="terms"
          v-model="form.acceptTerms"
          type="checkbox"
          required
          class="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
          @change="clearError('acceptTerms')"
        />
        <label for="terms" class="ml-3 text-sm text-gray-700">
          I agree to the 
          <router-link to="/terms" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Terms of Service
          </router-link>
          and 
          <router-link to="/privacy" class="text-indigo-600 hover:text-indigo-800 font-medium">
            Privacy Policy
          </router-link>
          <span class="text-red-500">*</span>
        </label>
      </div>
      <div v-if="errors.acceptTerms" class="text-red-600 text-sm -mt-4">
        {{ errors.acceptTerms }}
      </div>

      <!-- CAPTCHA Container -->
      <div id="turnstile"></div>      

      <!-- Submit Button -->
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="isLoading"
        :disabled="!isFormValid || !isCaptchaVerified"
        class="w-full mt-6"
      >
        <template v-if="!isCaptchaVerified">
          Complete CAPTCHA to Register
        </template>
        <template v-else>
          Create Account
        </template>
      </BaseButton>

      <!-- Login Link -->
      <div class="text-center pt-4 border-t border-gray-200">
        <p class="text-sm text-gray-600">
          Already have an account?
          <router-link 
            to="/login" 
            class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
          >
            Sign In
          </router-link>
        </p>
      </div>
    </form>

    <!-- Registration Success Modal (alternative approach) -->
    <BaseModal v-if="showSuccessModal" @close="goToLogin">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900">Registration Successful!</h3>
      </template>
      <template #default>
        <div class="py-4">
          <p v-if="needsApproval" class="text-gray-600">
            Your temple admin account has been created. You'll receive an email once your account is approved by our team.
          </p>
          <p v-else class="text-gray-600">
            Your account has been created successfully. You can now login to access your dashboard.
          </p>
        </div>
      </template>
      <template #footer>
        <BaseButton @click="goToLogin" variant="primary" class="w-full">
          Go to Login
        </BaseButton>
      </template>
    </BaseModal>
  </BaseCard>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/plugins/axios'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

// State
const isLoading = ref(false)
const showSuccessModal = ref(false)
const needsApproval = ref(false)
const registrationSuccess = ref(false)
const errors = ref({})
const captchaToken = ref('')
const isCaptchaVerified = ref(false)

// Fixed role options
const roleOptions = [
  { value: 'tenant', label: 'Temple Admin' },
  { value: 'devotee', label: 'Devotee' },
  { value: 'volunteer', label: 'Volunteer' }
]

// Form data
const form = ref({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: '',
  acceptTerms: false,
  templeDetails: null
})

// Temple details
const templeDetails = ref({
  name: '',
  place: '',
  address: '',
  phoneNumber: '',
  description: ''
})

// Watch for role changes to clear temple-related errors
watch(() => form.value.role, (newRole, oldRole) => {
  if (oldRole === 'tenant' && newRole !== 'tenant') {
    // Clear all temple-related errors when switching away from temple admin
    const templeErrorKeys = ['templeName', 'templePlace', 'templeAddress', 'templePhoneNo', 'templeDescription']
    templeErrorKeys.forEach(key => {
      delete errors.value[key]
    })
  }
})

// Computed
const isFormValid = computed(() => {
  const hasBasicFields = form.value.fullName && 
                        form.value.email && 
                        form.value.password && 
                        form.value.phone && 
                        form.value.role &&
                        form.value.acceptTerms
                        
  const hasTempleDetails = form.value.role !== 'tenant' || 
                          (templeDetails.value.name && 
                           templeDetails.value.place && 
                           templeDetails.value.address && 
                           templeDetails.value.phoneNumber &&
                           templeDetails.value.description)
                           
  return hasBasicFields && hasTempleDetails && Object.keys(errors.value).length === 0
})

// Methods

// Clear specific error when user starts typing
const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
    // Force reactivity
    errors.value = { ...errors.value }
  }
}

const selectRole = (role) => {
  console.log('Role selected:', role)
  form.value.role = role
  clearError('role')
  
  // Clear temple-related errors when changing roles
  if (role !== 'tenant') {
    const templeErrorKeys = ['templeName', 'templePlace', 'templeAddress', 'templePhoneNo', 'templeDescription']
    templeErrorKeys.forEach(key => delete errors.value[key])
    errors.value = { ...errors.value }
  }
}

const validateForm = () => {
  const newErrors = {}

  // Full name validation
  const namePattern = /^[A-Za-z\s]+$/
  if (!form.value.fullName.trim()) {
    newErrors.fullName = 'Full name is required'
  } else if (form.value.fullName.trim().length < 2) {
    newErrors.fullName = 'Full name must be at least 2 characters'
  } else if (!namePattern.test(form.value.fullName.trim())) {
    newErrors.fullName = 'Full name cannot contain numbers or special characters'
  }

  // Email validation
  if (!form.value.email) {
    newErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    newErrors.email = 'Please enter a valid email address'
  } else if (!form.value.email.endsWith('@gmail.com')) {
    newErrors.email = 'Only @gmail.com email addresses are allowed'
  }

  // Password validation
  if (!form.value.password) {
    newErrors.password = 'Password is required'
  } else if (form.value.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }

  // Phone validation
  if (!form.value.phone) {
    newErrors.phone = 'Phone number is required'
  } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(form.value.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Please enter a valid phone number'
  }

  // Role validation
  if (!form.value.role) {
    newErrors.role = 'Please select your role'
  }

  // Temple details validation for Temple Admin role
  if (form.value.role === 'tenant') {
    if (!templeDetails.value.name) {
      newErrors.templeName = 'Temple name is required'
    }
    if (!templeDetails.value.place) {
      newErrors.templePlace = 'Temple place is required'
    }
    if (!templeDetails.value.address) {
      newErrors.templeAddress = 'Temple address is required'
    }
    if (!templeDetails.value.phoneNumber) {
      newErrors.templePhoneNo = 'Temple phone number is required'
    }
    if (!templeDetails.value.description) {
      newErrors.templeDescription = 'Temple description is required'
    }
    
    // Set temple details in form for submission
    if (templeDetails.value.name && 
        templeDetails.value.place && 
        templeDetails.value.address && 
        templeDetails.value.phoneNumber &&
        templeDetails.value.description) {
      form.value.templeDetails = { ...templeDetails.value }
    }
  }

  // Terms validation
  if (!form.value.acceptTerms) {
    newErrors.acceptTerms = 'You must accept the terms and privacy policy'
  }

  // Replace errors object completely to ensure reactivity
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Reset CAPTCHA function
const resetCaptcha = () => {
  isCaptchaVerified.value = false
  captchaToken.value = ''
  if (window.turnstile) {
    window.turnstile.reset()
  }
}

// Register handler
const handleRegister = async () => {
  // Check CAPTCHA verification first
  if (!isCaptchaVerified.value) {
    showError('Please complete the CAPTCHA verification')
    return
  }

  // Clear all previous errors before validation
  errors.value = {}
  
  if (!validateForm()) {
    // Scroll to first error
    nextTick(() => {
      const firstError = document.querySelector('.text-red-600')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
    return
  }
  
  isLoading.value = true

  try {
    const roleMapping = {
      'tenant': 'templeadmin',
      'devotee': 'devotee', 
      'volunteer': 'volunteer'
    }

    const registrationData = {
      fullName: form.value.fullName,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone,
      role: roleMapping[form.value.role] || form.value.role,
      captchaToken: captchaToken.value
    }

    // Add temple details for temple admin role
    if (form.value.role === 'tenant') {
      registrationData.templeName = templeDetails.value.name
      registrationData.templePlace = templeDetails.value.place
      registrationData.templeAddress = templeDetails.value.address
      registrationData.templePhoneNo = templeDetails.value.phoneNumber
      registrationData.templeDescription = templeDetails.value.description || ''
    }

    try {
      const response = await apiClient.auth.register(registrationData)
      needsApproval.value = form.value.role === 'tenant'
      showSuccessModal.value = true
      registrationSuccess.value = true

      success(needsApproval.value 
        ? 'Your temple admin account has been created! You\'ll be notified after approval.' 
        : 'Your account has been created successfully!')

      if (authStore && typeof authStore.setRegistrationResult === 'function') {
        authStore.setRegistrationResult({
          success: true,
          needsApproval: needsApproval.value,
          message: needsApproval.value 
            ? 'Your temple admin account has been created. You\'ll be notified after approval.'
            : 'Your account has been created successfully.'
        })
      }

      resetForm()
      setTimeout(() => goToLogin(), 3000)
    } catch (apiError) {
      console.error('API Error during registration:', apiError)

      if (apiError.response?.data?.error) {
        const backendError = apiError.response.data.error

        if (backendError === 'Email is already registered') {
          errors.value.email = 'This email is already registered. Please login or use another email.'
          showError(errors.value.email)
        } else {
          showError(backendError)
        }
      }

      if (apiError.response?.data?.errors) {
        const backendErrors = apiError.response.data.errors
        Object.keys(backendErrors).forEach(field => {
          errors.value[field] = backendErrors[field]
        })
      }
      
      // Ensure errors object is reactive
      errors.value = { ...errors.value }
      
      // Reset CAPTCHA on error
      resetCaptcha()
    }
  } catch (err) {
    console.error('Registration error:', err)
    showError('An error occurred during registration. Please try again.')
    
    // Reset CAPTCHA on error
    resetCaptcha()
  } finally {
    isLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  form.value = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: '',
    acceptTerms: false,
    templeDetails: null
  }

  templeDetails.value = {
    name: '',
    place: '',
    address: '',
    phoneNumber: '',
    description: ''
  }

  errors.value = {}
}

// Redirect to login
const goToLogin = () => {
  showSuccessModal.value = false
  nextTick(() => router.push('/login'))
}

onMounted(() => {
  if (window.turnstile) {
    window.turnstile.render(
      '#turnstile', 
      {
        sitekey: '0x4AAAAAAB5PF2XfNfEgAul2',
        callback: function(token) {
          captchaToken.value = token
          isCaptchaVerified.value = true
          console.log("✅ CAPTCHA verification successful")
        },
        'error-callback': function() {
          captchaToken.value = ''
          isCaptchaVerified.value = false
          showError('CAPTCHA verification failed. Please try again.')
          console.log("❌ CAPTCHA verification failed")
        },
        'expired-callback': function() {
          captchaToken.value = ''
          isCaptchaVerified.value = false
          showError('CAPTCHA expired. Please verify again.')
          console.log("⏰ CAPTCHA expired")
        }
      }
    )
  }
})
</script>