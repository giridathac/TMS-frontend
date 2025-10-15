

<template>
  <div class="profile-edit-container">
    <div class="max-w-4xl mx-auto py-8 px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
        <p class="text-gray-600">Update your personal and spiritual information</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-600">Loading profile...</span>
      </div>

      <!-- Error State -->
      <div v-if="error && !isLoading" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="text-red-400">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error Loading Profile</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="!isLoading">
        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-indigo-600">Profile Completion</span>
            <span class="text-sm text-gray-500">{{ completionPercentage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: completionPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Multi-step Form -->
        <div class="bg-white rounded-lg shadow-sm border">
          <!-- Step Navigation -->
          <div class="border-b border-gray-200 px-6 py-4">
            <nav class="flex space-x-8">
              <button
                v-for="(step, index) in steps"
                :key="step.id"
                @click="currentStep = index"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  currentStep === index
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ step.title }}
              </button>
            </nav>
          </div>

          <!-- Step Content -->
          <div class="p-6">
            <!-- Personal Details -->
            <div v-if="currentStep === 0" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    v-model="profile.fullName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    v-model="profile.dateOfBirth"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    v-model="profile.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    v-model="profile.gender"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  v-model="profile.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your complete address"
                ></textarea>
              </div>
            </div>

            <!-- Spiritual Information -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Spiritual Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gotra</label>
                  <input
                    v-model="profile.gotra"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your gotra"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nakshatra</label>
                  <input
                    v-model="profile.nakshatra"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your nakshatra"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Rashi</label>
                  <input
                    v-model="profile.rashi"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your rashi"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <select
                    v-model="profile.preferredLanguage"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Language</option>
                    <option value="kannada">Kannada</option>
                    <option value="hindi">Hindi</option>
                    <option value="sanskrit">Sanskrit</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Family Information -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Family Information</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input
                    v-model="profile.fatherName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter father's name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                  <input
                    v-model="profile.motherName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter mother's name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
                  <input
                    v-model="profile.spouseName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter spouse name (if applicable)"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Number of Children</label>
                  <input
                    v-model="profile.numberOfChildren"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <!-- Preferences -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Seva Preferences</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Preferred Sevas</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label
                    v-for="seva in sevaTypes"
                    :key="seva.id"
                    class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="seva.id"
                      v-model="profile.preferredSevas"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">{{ seva.name }}</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">Notification Preferences</label>
                <div class="space-y-3">
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.emailNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">Email notifications for events and sevas</span>
                  </label>
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.smsNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">SMS notifications for important updates</span>
                  </label>
                  <label class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      v-model="profile.whatsappNotifications"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-700">WhatsApp notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              v-if="currentStep > 0"
              @click="currentStep--"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Previous
            </button>
            <div v-else></div>
            
            <div class="flex space-x-3">
              <button
                @click="saveProfile"
                :disabled="isSaving"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
              
              <button
                v-if="currentStep < steps.length - 1"
                @click="currentStep++"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import devoteeService from '@/services/devotee.service'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// Current step
const currentStep = ref(0)
const isSaving = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Steps configuration
const steps = ref([
  { id: 'personal', title: 'Personal' },
  { id: 'spiritual', title: 'Spiritual' },
  { id: 'family', title: 'Family' },
  { id: 'preferences', title: 'Preferences' }
])

// Profile data - Initialize with empty values
const profile = ref({
  fullName: '',
  dateOfBirth: '',
  phone: '',
  gender: '',
  address: '',
  gotra: '',
  nakshatra: '',
  rashi: '',
  preferredLanguage: '',
  fatherName: '',
  motherName: '',
  spouseName: '',
  numberOfChildren: 0,
  preferredSevas: [],
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: false
})

// Seva types (static data)
const sevaTypes = ref([
  { id: 'abhisheka', name: 'Abhisheka' },
  { id: 'archana', name: 'Archana' },
  { id: 'annadana', name: 'Annadana' },
  { id: 'pradakshina', name: 'Pradakshina' },
  { id: 'bhajan', name: 'Bhajan' },
  { id: 'cleaning', name: 'Cleaning' }
])

// Computed properties
const completionPercentage = computed(() => {
  const fields = [
    profile.value.fullName,
    profile.value.dateOfBirth,
    profile.value.phone,
    profile.value.gender,
    profile.value.address,
    profile.value.gotra,
    profile.value.preferredLanguage
  ]
  
  const filledFields = fields.filter(field => field && field.toString().trim() !== '').length
  return Math.round((filledFields / fields.length) * 100)
})

// Helper function to format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  } catch (err) {
    console.error('Error formatting date:', err)
    return ''
  }
}

// Helper function to get seva preferences from API data
const getSevaPreferences = (data) => {
  const sevas = []
  if (data.seva_abhisheka) sevas.push('abhisheka')
  if (data.seva_archana) sevas.push('archana')
  if (data.seva_annadana) sevas.push('annadana')
  if (data.seva_pradakshina) sevas.push('pradakshina')
  if (data.seva_bhajan) sevas.push('bhajan')
  if (data.seva_cleaning) sevas.push('cleaning')
  return sevas
}

// Methods
const loadProfile = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('Loading profile data...')
    const response = await devoteeService.getProfile()
    
    if (response && response.data) {
      const data = response.data
      console.log('Profile data received:', data)
      
      // Map API response to form fields
      profile.value = {
        fullName: data.full_name || '',
        dateOfBirth: formatDateForInput(data.dob),
        phone: data.phone || '',
        gender: data.gender || '',
        address: [
          data.street_address,
          data.city,
          data.state,
          data.pincode
        ].filter(Boolean).join(', '),
        gotra: data.gotra || '',
        nakshatra: data.nakshatra || '',
        rashi: data.rashi || '',
        preferredLanguage: data.preferred_language || '',
        fatherName: data.father_name || '',
        motherName: data.mother_name || '',
        spouseName: data.spouse_name || '',
        numberOfChildren: data.number_of_children || 0,
        preferredSevas: getSevaPreferences(data),
        emailNotifications: data.email_notifications !== false,
        smsNotifications: data.sms_notifications !== false,
        whatsappNotifications: data.whatsapp_notifications === true
      }
      
      console.log('Profile mapped to form:', profile.value)
    } else {
      console.log('No profile data found - user may be new')
      // Keep default empty values for new users
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = err.message || 'Failed to load profile data'
    
    // Don't show error toast if it's just a 404 (new user)
    if (!err.message?.includes('404') && !err.message?.includes('not found')) {
      showToast(error.value, 'error')
    }
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  try {
    isSaving.value = true
    error.value = null
    
    console.log('Saving profile data:', profile.value)
    
    // Convert form data to API format
    const profileData = {
      full_name: profile.value.fullName || null,
      dob: profile.value.dateOfBirth || null,
      phone: profile.value.phone || null,
      gender: profile.value.gender || null,
      
      // Parse address components (basic implementation)
      street_address: profile.value.address || null,
      city: null,
      state: null,
      pincode: null,
      country: 'India',
      
      gotra: profile.value.gotra || null,
      nakshatra: profile.value.nakshatra || null,
      rashi: profile.value.rashi || null,
      preferred_language: profile.value.preferredLanguage || null,
      
      father_name: profile.value.fatherName || null,
      mother_name: profile.value.motherName || null,
      spouse_name: profile.value.spouseName || null,
      number_of_children: profile.value.numberOfChildren || 0,
      
      // Seva preferences
      seva_abhisheka: profile.value.preferredSevas.includes('abhisheka'),
      seva_archana: profile.value.preferredSevas.includes('archana'),
      seva_annadana: profile.value.preferredSevas.includes('annadana'),
      seva_pradakshina: profile.value.preferredSevas.includes('pradakshina'),
      seva_bhajan: profile.value.preferredSevas.includes('bhajan'),
      seva_cleaning: profile.value.preferredSevas.includes('cleaning'),
      
      // Notification preferences
      email_notifications: profile.value.emailNotifications,
      sms_notifications: profile.value.smsNotifications,
      whatsapp_notifications: profile.value.whatsappNotifications
    }
    
    console.log('Sending profile data to API:', profileData)
    
    const response = await devoteeService.createOrUpdateProfile(profileData)
    console.log('Profile saved successfully:', response.data)
    
    showToast('Profile updated successfully!', 'success')
    
    // Redirect back to dashboard after successful save
    const entityId = route.params.id
    if (entityId) {
      router.push(`/entity/${entityId}/devotee/dashboard`)
    } else {
      router.push('/devotee/dashboard')
    }
    
  } catch (err) {
    console.error('Error saving profile:', err)
    error.value = err.message || 'Error saving profile'
    showToast(error.value, 'error')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-edit-container {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
}
</style>