<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <router-link to="/tenant/dashboard" class="hover:text-indigo-600">Dashboard</router-link>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-gray-900">Create Temple</span>
            </nav>
            <h1 class="text-2xl font-bold text-gray-900">Register New Temple</h1>
            <p class="text-gray-600 mt-1">Fill out the form below to register your temple for approval</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Error Display -->
    <div v-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800 mb-1">Error</h3>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
          <button @click="error = null" class="ml-auto">
            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-indigo-600">Step {{ currentStep }} of 3</span>
          <span class="text-sm text-gray-500">{{ Math.round((currentStep / 3) * 100) }}% Complete</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / 3) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form @submit.prevent="handleSubmit">
          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Basic Information</h2>
              <p class="text-gray-600">Provide the essential details about your temple</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Temple Name -->
              <div class="md:col-span-2">
                <label for="templeName" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Name *
                </label>
                <input
                  id="templeName"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.name }"
                  placeholder="Enter temple name"
                />
                <p v-if="fieldErrors.name" class="text-red-600 text-sm mt-1">{{ fieldErrors.name }}</p>
              </div>

              <!-- Deity -->
              <div>
                <label for="deity" class="block text-sm font-medium text-gray-700 mb-2">
                  Main Deity *
                </label>
                <input
                  id="deity"
                  v-model="form.main_deity"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.main_deity }"
                  placeholder="e.g., Lord Vishnu, Goddess Lakshmi"
                />
                <p v-if="fieldErrors.main_deity" class="text-red-600 text-sm mt-1">{{ fieldErrors.main_deity }}</p>
              </div>

              <!-- Temple Type -->
              <div>
                <label for="templeType" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Type *
                </label>
                <select
                  id="templeType"
                  v-model="form.temple_type"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.temple_type }"
                >
                  <option value="">Select temple type</option>
                  <option value="traditional">Traditional</option>
                  <option value="modern">Modern</option>
                  <option value="heritage">Heritage</option>
                  <option value="community">Community</option>
                </select>
                <p v-if="fieldErrors.temple_type" class="text-red-600 text-sm mt-1">{{ fieldErrors.temple_type }}</p>
              </div>

              <!-- Established Year -->
              <div>
                <label for="establishedYear" class="block text-sm font-medium text-gray-700 mb-2">
                  Established Year *
                </label>
                <input
                  id="establishedYear"
                  v-model="form.established_year"
                  type="number"
                  min="1800"
                  :max="new Date().getFullYear()"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.established_year }"
                  placeholder="YYYY"
                />
                <p v-if="fieldErrors.established_year" class="text-red-600 text-sm mt-1">{{ fieldErrors.established_year }}</p>
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.phone }"
                  placeholder="+91 XXXXX XXXXX"
                  @input="formatPhoneNumber"
                />
                <p v-if="fieldErrors.phone" class="text-red-600 text-sm mt-1">{{ fieldErrors.phone }}</p>
                <p class="text-gray-500 text-xs mt-1">Enter with country code (e.g., +91 9876543210)</p>
              </div>

              <!-- Email -->
              <div class="md:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Email *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.email }"
                  placeholder="temple@example.com"
                />
                <p v-if="fieldErrors.email" class="text-red-600 text-sm mt-1">{{ fieldErrors.email }}</p>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Temple Description
                </label>
                <textarea
                  id="description"
                  v-model="form.description"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Brief description of the temple, its history, and significance..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Step 2: Address Information -->
          <div v-show="currentStep === 2" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Temple Address</h2>
              <p class="text-gray-600">Provide the complete address details</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Street Address -->
              <div class="md:col-span-2">
                <label for="street_address" class="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  id="street_address"
                  v-model="form.street_address"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.street_address }"
                  placeholder="Enter complete street address"
                />
                <p v-if="fieldErrors.street_address" class="text-red-600 text-sm mt-1">{{ fieldErrors.street_address }}</p>
              </div>

              <!-- City -->
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  v-model="form.city"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.city }"
                  placeholder="Enter city name"
                />
                <p v-if="fieldErrors.city" class="text-red-600 text-sm mt-1">{{ fieldErrors.city }}</p>
              </div>

              <!-- State -->
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  id="state"
                  v-model="form.state"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.state }"
                >
                  <option value="">Select state</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
                <p v-if="fieldErrors.state" class="text-red-600 text-sm mt-1">{{ fieldErrors.state }}</p>
              </div>

              <!-- District -->
              <div>
                <label for="district" class="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  id="district"
                  v-model="form.district"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.district }"
                  placeholder="Enter district name"
                />
                <p v-if="fieldErrors.district" class="text-red-600 text-sm mt-1">{{ fieldErrors.district }}</p>
              </div>

              <!-- PIN Code -->
              <div>
                <label for="pincode" class="block text-sm font-medium text-gray-700 mb-2">
                  PIN Code *
                </label>
                <input
                  id="pincode"
                  v-model="form.pincode"
                  type="text"
                  pattern="[0-9]{6}"
                  required
                  maxlength="6"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.pincode }"
                  placeholder="Enter 6-digit PIN code"
                  @input="validatePincode"
                />
                <p v-if="fieldErrors.pincode" class="text-red-600 text-sm mt-1">{{ fieldErrors.pincode }}</p>
              </div>

              <!-- Landmark -->
              <div class="md:col-span-2">
                <label for="landmark" class="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  v-model="form.landmark"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  placeholder="Nearby landmark for easy identification"
                />
              </div>

              <!-- Google Maps Link -->
              <div class="md:col-span-2">
                <label for="map_link" class="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link (Optional)
                </label>
                <input
                  id="map_link"
                  v-model="form.map_link"
                  type="url"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': fieldErrors.map_link }"
                  placeholder="https://maps.google.com/..."
                />
                <p v-if="fieldErrors.map_link" class="text-red-600 text-sm mt-1">{{ fieldErrors.map_link }}</p>
              </div>
            </div>
          </div>

          <!-- Step 3: Documents Upload -->
          <div v-show="currentStep === 3" class="p-8">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-gray-900 mb-2">Upload Documents</h2>
              <p class="text-gray-600">Upload required documents for temple verification</p>
            </div>

            <div class="space-y-6">
              <!-- Registration Certificate -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Registration Certificate *</h3>
                  <p class="text-gray-600 mb-4">Upload temple registration certificate</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'registration')" />
                    </label>
                  </div>
                  <p v-if="form.documents.registration" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.registration.name }}
                  </p>
                  <p v-if="fileErrors.registration" class="text-red-600 text-sm mt-2">{{ fileErrors.registration }}</p>
                </div>
              </div>

              <!-- Trust Deed -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Trust Deed *</h3>
                  <p class="text-gray-600 mb-4">Upload temple trust deed document</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'trustDeed')" />
                    </label>
                  </div>
                  <p v-if="form.documents.trustDeed" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.trustDeed.name }}
                  </p>
                  <p v-if="fileErrors.trustDeed" class="text-red-600 text-sm mt-2">{{ fileErrors.trustDeed }}</p>
                </div>
              </div>

              <!-- Property Documents -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Property Documents</h3>
                  <p class="text-gray-600 mb-4">Upload property ownership documents (Optional)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <span>Choose File</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileUpload($event, 'property')" />
                    </label>
                  </div>
                  <p v-if="form.documents.property" class="text-sm text-green-600 mt-2">
                    ✓ {{ form.documents.property.name }}
                  </p>
                  <p v-if="fileErrors.property" class="text-red-600 text-sm mt-2">{{ fileErrors.property }}</p>
                </div>
              </div>

              <!-- Additional Documents -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors duration-200">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Additional Documents</h3>
                  <p class="text-gray-600 mb-4">Upload any additional supporting documents (Optional)</p>
                  <div class="flex justify-center">
                    <label class="cursor-pointer bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <span>Choose Files</span>
                      <input type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png" multiple @change="handleFileUpload($event, 'additional')" />
                    </label>
                  </div>
                  <div v-if="form.documents.additional && form.documents.additional.length > 0" class="mt-2">
                    <p v-for="(file, index) in form.documents.additional" :key="index" class="text-sm text-green-600">
                      ✓ {{ file.name }}
                    </p>
                  </div>
                  <p v-if="fileErrors.additional" class="text-red-600 text-sm mt-2">{{ fileErrors.additional }}</p>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg">
              <label class="flex items-start">
                <input
                  v-model="form.acceptTerms"
                  type="checkbox"
                  class="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  required
                />
                <span class="text-sm text-gray-700">
                  I agree to the 
                  <router-link to="/terms" class="text-indigo-600 hover:text-indigo-800 underline">Terms and Conditions</router-link>
                  and 
                  <router-link to="/privacy" class="text-indigo-600 hover:text-indigo-800 underline">Privacy Policy</router-link>.
                  I confirm that all information provided is accurate and complete.
                </span>
              </label>
              <p v-if="fieldErrors.acceptTerms" class="text-red-600 text-sm mt-1">{{ fieldErrors.acceptTerms }}</p>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="previousStep"
              class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>
            <div v-else></div>

            <div class="flex space-x-3">
              <router-link
                to="/tenant/dashboard"
                class="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </router-link>

              <button
                v-if="currentStep < 3"
                type="button"
                @click="nextStep"
                class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Next
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button
                v-else
                type="submit"
                :disabled="isSubmitting"
                class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Submitting...' : 'Submit Temple Registration' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Help Section -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-blue-800 mb-1">Need Help?</h3>
            <p class="text-sm text-blue-700">
              If you need assistance with temple registration, please contact our support team at 
              <a href="mailto:support@templesaas.com" class="underline">support@templesaas.com</a> 
              or call us at <a href="tel:+91-800-123-4567" class="underline">+91-800-123-4567</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTempleStore } from '@/stores/temple'
import { useToast } from '@/composables/useToast'
import { validators } from '@/utils/validators'
import api from '@/plugins/axios'

const router = useRouter()
const templeStore = useTempleStore()
const toast = useToast()

// Form state
const currentStep = ref(1)
const isSubmitting = ref(false)
const error = ref(null)

// Error handling
const fieldErrors = ref({})
const fileErrors = ref({})

// Form data with snake_case field names to EXACTLY match backend
const form = reactive({
  name: '',
  main_deity: '',
  temple_type: '',
  established_year: '',
  phone: '',
  email: '',
  description: '',
  street_address: '',
  city: '',
  state: '',
  district: '',
  pincode: '',
  landmark: '',
  map_link: '',
  documents: {
    registration: null,
    trustDeed: null,
    property: null,
    additional: []
  },
  acceptTerms: false
})

// Clear field errors when user starts typing
const clearFieldError = (field) => {
  if (fieldErrors.value[field]) {
    delete fieldErrors.value[field]
  }
}

// Phone number formatting and validation
const formatPhoneNumber = (event) => {
  clearFieldError('phone')
  let value = event.target.value.replace(/\D/g, '') // Remove non-digits
  
  // Handle international format starting with country code
  if (value.startsWith('91') && value.length > 2) {
    value = '+91 ' + value.slice(2)
  } else if (value.length === 10) {
    value = '+91 ' + value
  } else if (value.length > 0 && !value.startsWith('+')) {
    // Add +91 prefix if not present
    if (value.length <= 10) {
      value = '+91 ' + value
    }
  }
  
  form.phone = value
}

// Pincode validation
const validatePincode = (event) => {
  clearFieldError('pincode')
  let value = event.target.value.replace(/\D/g, '') // Remove non-digits
  if (value.length > 6) {
    value = value.slice(0, 6)
  }
  form.pincode = value
}

// Enhanced validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  // Remove all non-digits to check length
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Should have country code + 10 digits (total 12 digits for India)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return true
  }
  
  // Or just 10 digits (we'll add +91)
  if (digitsOnly.length === 10) {
    return true
  }
  
  return false
}

const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validateYear = (year) => {
  const currentYear = new Date().getFullYear()
  const yearNum = parseInt(year)
  return yearNum >= 1800 && yearNum <= currentYear
}

// Enhanced step validation
const validateCurrentStep = () => {
  fieldErrors.value = {}
  let isValid = true

  if (currentStep.value === 1) {
    // Basic Information validation
    if (!form.name?.trim()) {
      fieldErrors.value.name = 'Temple name is required'
      isValid = false
    }

    if (!form.main_deity?.trim()) {
      fieldErrors.value.main_deity = 'Main deity is required'
      isValid = false
    }

    if (!form.temple_type) {
      fieldErrors.value.temple_type = 'Temple type is required'
      isValid = false
    }

    if (!form.established_year) {
      fieldErrors.value.established_year = 'Established year is required'
      isValid = false
    } else if (!validateYear(form.established_year)) {
      fieldErrors.value.established_year = 'Please enter a valid year between 1800 and current year'
      isValid = false
    }

    if (!form.phone?.trim()) {
      fieldErrors.value.phone = 'Phone number is required'
      isValid = false
    } else if (!validatePhone(form.phone)) {
      fieldErrors.value.phone = 'Please enter a valid phone number with country code (e.g., +91 9876543210)'
      isValid = false
    }

    if (!form.email?.trim()) {
      fieldErrors.value.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(form.email)) {
      fieldErrors.value.email = 'Please enter a valid email address'
      isValid = false
    }

  } else if (currentStep.value === 2) {
    // Address validation
    if (!form.street_address?.trim()) {
      fieldErrors.value.street_address = 'Street address is required'
      isValid = false
    }

    if (!form.city?.trim()) {
      fieldErrors.value.city = 'City is required'
      isValid = false
    }

    if (!form.state) {
      fieldErrors.value.state = 'State is required'
      isValid = false
    }

    if (!form.district?.trim()) {
      fieldErrors.value.district = 'District is required'
      isValid = false
    }

    if (!form.pincode?.trim()) {
      fieldErrors.value.pincode = 'PIN code is required'
      isValid = false
    } else if (!/^\d{6}$/.test(form.pincode)) {
      fieldErrors.value.pincode = 'PIN code must be exactly 6 digits'
      isValid = false
    }

    if (form.map_link?.trim() && !validateUrl(form.map_link)) {
      fieldErrors.value.map_link = 'Please enter a valid URL'
      isValid = false
    }

  } else if (currentStep.value === 3) {
    // Documents validation
    if (!form.documents.registration) {
      fileErrors.value.registration = 'Registration certificate is required'
      isValid = false
    }

    if (!form.documents.trustDeed) {
      fileErrors.value.trustDeed = 'Trust deed is required'
      isValid = false
    }

    if (!form.acceptTerms) {
      fieldErrors.value.acceptTerms = 'You must accept the terms and conditions'
      isValid = false
    }
  }

  if (!isValid) {
    error.value = 'Please fix the errors above before proceeding'
  } else {
    error.value = null
  }

  return isValid
}

// Methods
const nextStep = () => {
  if (validateCurrentStep()) {
    currentStep.value++
    // Scroll to top when changing steps
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousStep = () => {
  currentStep.value--
  error.value = null
  fieldErrors.value = {}
  fileErrors.value = {}
  // Scroll to top when changing steps
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Enhanced file upload handling
const handleFileUpload = (event, type) => {
  const files = Array.from(event.target.files)
  console.log(`📁 handleFileUpload called with type: ${type}`)
  console.log(`📁 Number of files selected: ${files.length}`)
  
  // Clear previous file errors for this type
  if (fileErrors.value[type]) {
    delete fileErrors.value[type]
  }
  
  if (files.length === 0) {
    console.log('📁 No files selected')
    return
  }
  
  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  const invalidFiles = files.filter(file => file.size > maxSize)
  
  if (invalidFiles.length > 0) {
    fileErrors.value[type] = `File size too large. Maximum size allowed is 10MB. Large files: ${invalidFiles.map(f => f.name).join(', ')}`
    console.error('📁 Files too large:', invalidFiles.map(f => f.name))
    return
  }
  
  // Validate file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  const invalidTypes = files.filter(file => !allowedTypes.includes(file.type))
  
  if (invalidTypes.length > 0) {
    fileErrors.value[type] = `Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed. Invalid files: ${invalidTypes.map(f => f.name).join(', ')}`
    console.error('📁 Invalid file types:', invalidTypes.map(f => f.name))
    return
  }
  
  // Handle different file types
  if (type === 'additional') {
    // For additional files, append to existing array or create new array
    if (!form.documents.additional) {
      form.documents.additional = []
    }
    form.documents.additional = [...form.documents.additional, ...files]
    console.log(`📁 Added ${files.length} additional files. Total: ${form.documents.additional.length}`)
  } else {
    // For single files (registration, trustDeed, property)
    form.documents[type] = files[0]
    console.log(`📁 Set ${type} file:`, files[0].name)
  }
  
  // Log current documents state
  console.log('📁 Current documents state:', {
    registration: form.documents.registration?.name || 'Not set',
    trustDeed: form.documents.trustDeed?.name || 'Not set',
    property: form.documents.property?.name || 'Not set',
    additional: form.documents.additional ? `${form.documents.additional.length} files` : 'Not set'
  })
  
  // Clear any global errors
  error.value = null
  
  // Show success message
  const fileCount = type === 'additional' ? files.length : 1
  const message = fileCount === 1 ? `File uploaded successfully: ${files[0].name}` : `${fileCount} files uploaded successfully`
  toast.success(message)
}

// Enhanced form submission
const handleSubmit = async () => {
  if (!validateCurrentStep()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  try {
    isSubmitting.value = true
    error.value = null

    console.log('🔍 FORM DATA AT SUBMISSION:')
    console.log('Form data:', form)
    console.log('Documents object:', form.documents)

    // Prepare phone number (ensure it's in correct format)
    let phoneNumber = form.phone.replace(/\D/g, '') // Remove non-digits
    if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
      phoneNumber = '+' + phoneNumber
    } else if (phoneNumber.length === 10) {
      phoneNumber = '+91' + phoneNumber
    }

    // Check if we have any files
    const hasFiles = form.documents && (
      form.documents.registration || 
      form.documents.trustDeed || 
      form.documents.property || 
      (form.documents.additional && form.documents.additional.length > 0)
    )

    console.log('📁 Has files:', hasFiles)

    if (hasFiles) {
      // Create FormData for multipart submission
      const formData = new FormData()
      
      // Add all text fields with EXACT backend field names
      formData.append('name', form.name?.trim() || '')
      formData.append('main_deity', form.main_deity?.trim() || '')
      formData.append('temple_type', form.temple_type || '')
      formData.append('established_year', form.established_year ? form.established_year.toString() : '')
      formData.append('phone', phoneNumber)
      formData.append('email', form.email?.trim() || '')
      formData.append('description', form.description?.trim() || '')
      formData.append('street_address', form.street_address?.trim() || '')
      formData.append('city', form.city?.trim() || '')
      formData.append('district', form.district?.trim() || '')
      formData.append('state', form.state || '')
      formData.append('pincode', form.pincode || '')
      formData.append('landmark', form.landmark?.trim() || '')
      formData.append('map_link', form.map_link?.trim() || '')
      formData.append('status', 'pending')

      // Add files with EXACT backend field names
      if (form.documents.registration) {
        formData.append('registration_cert', form.documents.registration)
        console.log('📎 Added registration_cert:', form.documents.registration.name)
      }
      
      if (form.documents.trustDeed) {
        formData.append('trust_deed', form.documents.trustDeed)
        console.log('📎 Added trust_deed:', form.documents.trustDeed.name)
      }
      
      if (form.documents.property) {
        formData.append('property_docs', form.documents.property)
        console.log('📎 Added property_docs:', form.documents.property.name)
      }
      
      if (form.documents.additional && form.documents.additional.length > 0) {
        form.documents.additional.forEach((file, index) => {
          formData.append(`additional_docs_${index}`, file)
          console.log(`📎 Added additional_docs_${index}:`, file.name)
        })
      }

      // Log FormData contents
      console.log('📋 FormData contents:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      // Make API call with FormData
      const response = await api.post('/entities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      })
      
      console.log('✅ Temple created successfully:', response.data)
    } else {
      // No files, send as JSON
      const payload = {
        name: form.name?.trim() || '',
        main_deity: form.main_deity?.trim() || '',
        temple_type: form.temple_type || '',
        established_year: parseInt(form.established_year || 0),
        phone: phoneNumber,
        email: form.email?.trim() || '',
        description: form.description?.trim() || '',
        street_address: form.street_address?.trim() || '',
        city: form.city?.trim() || '',
        district: form.district?.trim() || '',
        state: form.state || '',
        pincode: form.pincode || '',
        landmark: form.landmark?.trim() || '',
        map_link: form.map_link?.trim() || '',
        status: 'pending'
      }

      console.log('📦 JSON payload:', payload)

      const response = await api.post('/entities', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
      
      console.log('✅ Temple created successfully:', response.data)
    }

    toast.success('Temple registration submitted successfully! You will receive a confirmation email shortly.')
    
    // Clear form
    Object.keys(form).forEach(key => {
      if (key === 'documents') {
        form[key] = { registration: null, trustDeed: null, property: null, additional: [] }
      } else if (key === 'acceptTerms') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/tenant/dashboard')
    }, 2000)

  } catch (err) {
    console.error('Temple registration failed:', err)
    
    // Handle different types of errors
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      error.value = 'Request timed out. Please check your internet connection and try again.'
    } else if (err.response?.status === 413) {
      error.value = 'Files are too large. Please reduce file sizes and try again.'
    } else if (err.response?.status === 422) {
      // Validation errors from backend
      const backendErrors = err.response.data?.errors || {}
      fieldErrors.value = { ...fieldErrors.value, ...backendErrors }
      error.value = 'Please correct the validation errors and try again.'
    } else if (err.response?.status === 400) {
      error.value = err.response.data?.message || 'Invalid data submitted. Please check your inputs.'
    } else if (err.response?.status >= 500) {
      error.value = 'Server error occurred. Please try again later or contact support.'
    } else {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to submit temple registration. Please try again.'
    }
    
    toast.error(error.value)
    console.error('Error details:', err.response?.data || err.message)
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isSubmitting.value = false
  }
}
</script>