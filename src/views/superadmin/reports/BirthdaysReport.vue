<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back to SuperAdmin Reports button (when viewed from superadmin) -->
    <div v-if="fromSuperadmin" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <router-link 
        to="/superadmin/reports" 
        class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to SuperAdmin Reports
      </router-link>
    </div>

    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200 rounded-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Devotee Reports</h1>
            <p class="text-gray-600 mt-1">
              Download devotee data for your temples
              <span v-if="fromSuperadmin && safeTenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants Selected: {{ safeTenantIds.length }})
              </span>
              <span v-else-if="fromSuperadmin && safeTenantIds.length === 1" class="text-indigo-600 font-medium">
                (Tenant ID: {{ safeTenantIds[0] }})
              </span>
              <span v-else-if="safeTenantId" class="text-indigo-600 font-medium">
                (Tenant ID: {{ safeTenantId }})
              </span>
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
              <span class="text-indigo-800 font-medium">{{ safeUserName }}</span>
              <span class="text-indigo-600 text-sm ml-2">{{ isSuperAdmin ? '(Super Admin)' : '(Tenant)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Debug Info (remove in production) -->
      
      

      <!-- Error Display -->
      <div v-if="safeError" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              {{ safeError }}
            </div>
            <div class="mt-4">
              <button 
                @click="clearError"
                class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Type Selector -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Select Report Type</h3>
          <div class="flex space-x-4 flex-wrap">
            <button 
              @click="activeReportType = 'birthdays'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'birthdays' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee Birthdays
            </button>
            <button 
              @click="activeReportType = 'devotees'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'devotees' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee List
            </button>
            <button 
              @click="activeReportType = 'statusActive'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'statusActive' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Active Devotees  
            </button>
            <button 
              @click="activeReportType = 'statusInactive'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'statusInactive' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Inactive Devotees
            </button>
            <button 
              @click="activeReportType = 'profile'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                activeReportType === 'profile' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              Devotee Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ getReportTypeTitle() }}
          </h3>
          <p class="text-gray-600 mt-1">
            Configure filters and download {{ getReportTypeDescription() }}
          </p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Select Temple</label>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                :disabled="isLoading"
                @change="onTempleChange"
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <!--option value="all">All Temples</option-->
                <option v-for="temple in filteredTemples" :key="temple.id" :value="temple.id">
                  {{ temple.name }} ({{ temple.sourceTenantId || temple.tenant_id || 'Unknown Tenant' }})
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"></div>
            </div>
            <div v-if="filteredTemples.length === 0" class="mt-2 text-sm text-orange-600">
              No temples found for selected tenant(s). Please check your tenant selection.
            </div>
          </div>

          <!-- Filter Section based on report type -->
          <div v-if="activeReportType === 'birthdays'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Birthday Date Range Filter -->
              <div>
                <label class="block text-gray-700 font-medium mb-2">Birthday Period</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="filter in timeFilters" 
                    :key="filter.value"
                    @click="setActiveFilter(filter.value)"
                    :disabled="isLoading"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="activeFilter === filter.value ? 
                      'bg-indigo-600 text-white' : 
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="['devotees', 'statusActive', 'statusInactive'].includes(activeReportType)">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Join Date Range Filter -->
              <div>
                <label class="block text-gray-700 font-medium mb-2">Join Date Period</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="filter in timeFilters" 
                    :key="filter.value"
                    @click="setActiveFilter(filter.value)"
                    :disabled="isLoading"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="activeFilter === filter.value ? 
                      'bg-indigo-600 text-white' : 
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>
              
              <!-- Devotee Status Filter (only show for general devotee list) -->
              <div v-if="activeReportType === 'devotees'">
                <label class="block text-gray-700 font-medium mb-2">Devotee Status</label>
                <div class="relative">
                  <select 
                    v-model="devoteeStatus" 
                    :disabled="isLoading"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="new">New Members</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"></div>
                </div>
              </div>
              
              <!-- Status Info for Active/Inactive buttons -->
              <div v-else-if="activeReportType === 'statusActive' || activeReportType === 'statusInactive'">
                <label class="block text-gray-700 font-medium mb-2">Status Filter</label>
                <div class="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  <span class="text-gray-700">
                    {{ activeReportType === 'statusActive' ? 'Active Devotees Only' : 'Inactive Devotees Only' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="activeReportType === 'profile'">
            <p class="text-gray-600 mb-6">This report includes detailed profile information for devotees.</p>
          </div>

          <!-- Custom Date Range (shown only when custom date range is selected) -->
          <div v-if="activeFilter === 'custom'" class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                <input 
                  type="date" 
                  v-model="startDate"
                  :disabled="isLoading"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  :disabled="isLoading"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <!-- Download Section -->
          <div class="border-t border-gray-200 pt-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="mb-4 md:mb-0">
                <h4 class="text-lg font-medium text-gray-900">Download Report</h4>
                <p class="text-sm text-gray-600">Select a format and click download</p>
              </div>
              <div class="flex items-center space-x-3">
                <!-- Format Selection -->
                <div class="relative">
                  <select 
                    v-model="selectedFormat" 
                    :disabled="isLoading"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"></div>
                </div>

                <!-- Download Button -->
                <button 
                  @click="downloadReport"
                  :disabled="isLoading || filteredTemples.length === 0"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isDownloadLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ isDownloadLoading ? 'Downloading...' : 'Download' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Applied Filters -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Applied Filters</h3>
          
          <div class="flex flex-wrap gap-2">
            <!-- Report Type Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Report Type:</span>
              {{ getReportTypeTitle() }}
            </div>
            
            <!-- Tenant Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-purple-100 text-purple-800">
              <span class="font-medium mr-1">
                {{ fromSuperadmin ? 'Tenant(s):' : 'Tenant:' }}
              </span>
              <span v-if="fromSuperadmin && safeTenantIds.length > 1">
                {{ safeTenantIds.length }} selected ({{ safeTenantIds.join(', ') }})
              </span>
              <span v-else-if="fromSuperadmin && safeTenantIds.length === 1">
                {{ safeTenantIds[0] }}
              </span>
              <span v-else>
                {{ safeTenantId }}
              </span>
            </div>
            
            <!-- Temple Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            
            <!-- Period Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">{{ ['birthdays', 'profile'].includes(activeReportType) ? 'Birthday' : 'Join Date' }} Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom'">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>

            <!-- Devotee Status Filter -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Status:</span>
              {{ getActiveDevoteeStatusLabel() }}
            </div>
            
            <!-- Format -->
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Format:</span>
              {{ getFormatLabel(selectedFormat) }}
            </div>
          </div>
          
          <p class="mt-4 text-sm text-gray-600">
            Your report will include data based on the filters above. Click Download to generate and download the report.
          </p>
        </div>
      </div>

      <!-- Report Preview (if available) -->
      <div v-if="hasValidReportData" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Report Preview</h3>
          <p class="text-sm text-gray-600 mt-1">
            Showing {{ safeReportPreview.totalRecords || reportPreviewData.length }} records
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="column in reportPreviewColumns" :key="column.key" 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, index) in reportPreviewData.slice(0, 10)" :key="index">
                <td v-for="column in reportPreviewColumns" :key="column.key" 
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ row?.[column.key] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="reportPreviewData.length > 10" class="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
          Showing first 10 records. Download the full report to see all {{ safeReportPreview.totalRecords || reportPreviewData.length }} records.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTempleStore } from '@/stores/temple';
import { useAuthStore } from '@/stores/auth';
import { useReportsStore } from '@/stores/reports';
import { useToast } from '@/composables/useToast';

// Composables
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const reportsStore = useReportsStore();
const { showToast } = useToast();

// Reactive state
const activeReportType = ref('birthdays');
const selectedTemple = ref('all');
const activeFilter = ref('monthly');
const selectedFormat = ref('pdf');
const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
const endDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
const devoteeStatus = ref('all');
const debugMode = ref(true); // Set to false in production

// Filter options
const timeFilters = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

const devoteeStatusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'New Members', value: 'new' },
];

// Role helpers
const isSuperAdmin = computed(() => {
  try {
    const u = userStore?.user || {};
    const role = (u.role || u.userType || '').toString().toLowerCase();
    const roles = Array.isArray(u.roles) ? u.roles.map(r => (r || '').toString().toLowerCase()) : [];
    const flag = Boolean(u.isSuperAdmin || u.is_super_admin);
    return role === 'superadmin' || roles.includes('superadmin') || flag || route?.query?.from === 'superadmin';
  } catch {
    return route?.query?.from === 'superadmin';
  }
});

// Enhanced safe computed properties
const safeTenantId = computed(() => {
  try {
    return route?.params?.tenantId ||
           route?.query?.tenantId ||
           userStore?.user?.tenantId ||
           userStore?.user?.tenant_id ||
           (typeof localStorage !== 'undefined' ? localStorage.getItem('current_tenant_id') : null) ||
           '';
  } catch {
    return '';
  }
});

const fromSuperadmin = computed(() => {
  try {
    return !!isSuperAdmin.value;
  } catch {
    return false;
  }
});

const safeTenantIds = computed(() => {
  try {
    if (fromSuperadmin.value) {
      if (route?.query?.tenants) {
        const tenants = route.query.tenants
          .split(',')
          .map(t => String(t).trim())
          .filter(Boolean);
        return Array.from(new Set(tenants));
      }
      if (route?.query?.tenantId) {
        return [String(route.query.tenantId).trim()].filter(Boolean);
      }
      if (route?.params?.tenantId) {
        return [String(route.params.tenantId).trim()].filter(Boolean);
      }
      // superadmin without explicit selection falls back to own tenant context if present
      const t = safeTenantId.value;
      return t ? [String(t)] : [];
    } else {
      const t = safeTenantId.value;
      return t ? [String(t)] : [];
    }
  } catch {
    return [];
  }
});

const safeUserName = computed(() => {
  try {
    return userStore?.user?.name || userStore?.user?.username || 'Tenant User';
  } catch {
    return 'User';
  }
});

const safeError = computed(() => {
  try {
    return reportsStore?.error || null;
  } catch {
    return null;
  }
});

const safeTemples = computed(() => {
  try {
    return templeStore?.temples || [];
  } catch {
    return [];
  }
});

// Filter temples based on selected tenant(s)
const filteredTemples = computed(() => {
  try {
    const temples = safeTemples.value;
    if (!temples || temples.length === 0) return [];
    
    const targetTenantIds = safeTenantIds.value;
    if (!targetTenantIds || targetTenantIds.length === 0) return [];
    
    return temples.filter(temple => {
      // Check various possible tenant ID fields
      const templeCreatedBy = String(temple.created_by || temple.createdBy || '');
      const templeTenantId = String(temple.tenant_id || temple.tenantId || temple.sourceTenantId || '');
      
      return targetTenantIds.some(tenantId => 
        templeCreatedBy === String(tenantId) || templeTenantId === String(tenantId)
      );
    });
  } catch {
    return [];
  }
});

const isGeneralLoading = computed(() => {
  try {
    return reportsStore?.loading || false;
  } catch {
    return false;
  }
});

const isDownloadLoading = computed(() => {
  try {
    return reportsStore?.downloadLoading || false;
  } catch {
    return false;
  }
});

const isLoading = computed(() => {
  return isGeneralLoading.value || isDownloadLoading.value;
});

const safeReportPreview = computed(() => {
  try {
    return reportsStore?.reportPreview || {};
  } catch {
    return {};
  }
});

const hasValidReportData = computed(() => {
  try {
    const preview = safeReportPreview.value;
    return preview &&
           preview.data &&
           Array.isArray(preview.data) &&
           preview.data.length > 0;
  } catch {
    return false;
  }
});

const reportPreviewColumns = computed(() => {
  try {
    return safeReportPreview.value?.columns || [];
  } catch {
    return [];
  }
});

const reportPreviewData = computed(() => {
  try {
    return safeReportPreview.value?.data || [];
  } catch {
    return [];
  }
});

// Methods
const clearError = () => {
  try {
    if (reportsStore && typeof reportsStore.clearError === 'function') {
      reportsStore.clearError();
    }
  } catch {}
};

const onTempleChange = () => {
  fetchPreview();
};

const getReportTypeTitle = () => {
  try {
    switch (activeReportType.value) {
      case 'birthdays':
        return 'Devotee Birthdays';
      case 'devotees':
        return 'Devotee List';
      case 'statusActive':
        return 'Active Devotees';
      case 'statusInactive':
        return 'Inactive Devotees';
      case 'profile':
        return 'Devotee Profile';
      default:
        return 'Report';
    }
  } catch {
    return 'Report';
  }
};

const getReportTypeDescription = () => {
  try {
    switch (activeReportType.value) {
      case 'birthdays':
        return 'devotee birthday data';
      case 'devotees':
        return 'devotee list data';
      case 'statusActive':
        return 'active devotee data';
      case 'statusInactive':
        return 'inactive devotee data';
      case 'profile':
        return 'devotee profile data';
      default:
        return 'report data';
    }
  } catch {
    return 'report data';
  }
};

const getActiveDevoteeStatusLabel = () => {
  try {
    switch (activeReportType.value) {
      case 'statusActive':
        return 'Active Only';
      case 'statusInactive':
        return 'Inactive Only';
      case 'devotees':
        return getDevoteeStatusLabel(devoteeStatus.value);
      default:
        return 'All';
    }
  } catch {
    return 'All';
  }
};

// Set active filter and auto-fetch preview (fixed ranges)
const setActiveFilter = (filter) => {
  try {
    activeFilter.value = filter;

    const today = new Date();

    if (filter === 'weekly') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6); // last 7 days including today
      startDate.value = start.toISOString().split('T')[0];
      endDate.value = end.toISOString().split('T')[0];
    } else if (filter === 'monthly') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startDate.value = start.toISOString().split('T')[0];
      endDate.value = end.toISOString().split('T')[0];
    } else if (filter === 'yearly') {
      const currentYear = today.getFullYear();
      startDate.value = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      endDate.value = new Date(currentYear, 11, 31).toISOString().split('T')[0];
    }
    // For custom, leave dates as is

    fetchPreview();
  } catch (error) {
    console.error('Error setting active filter:', error);
    showToast('Failed to set filter. Please try again.', 'error');
  }
};

const getTempleName = (templeId) => {
  try {
    if (templeId === 'all') return 'All Temples';
    if (!filteredTemples.value || !Array.isArray(filteredTemples.value)) {
      return 'Unknown Temple';
    }
    const temple = filteredTemples.value.find(t => t?.id?.toString() === templeId?.toString());
    return temple?.name || 'Unknown Temple';
  } catch {
    return 'Unknown Temple';
  }
};

const getTimeFilterLabel = (filter) => {
  try {
    const found = timeFilters.find(f => f.value === filter);
    return found ? found.label : 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const getFormatLabel = (format) => {
  try {
    const found = formats.find(f => f.value === format);
    return found ? found.label : 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const getDevoteeStatusLabel = (status) => {
  try {
    const found = devoteeStatusOptions.find(s => s.value === status);
    return found ? found.label : 'Unknown';
  } catch {
    return 'Unknown';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString || '';
  }
};

// Build report params with proper tenant filtering
const buildReportParams = () => {
  try {
    const params = {
      dateRange: activeFilter.value || 'monthly',
      startDate: startDate.value,
      endDate: endDate.value,
      format: selectedFormat.value || 'pdf'
    };

    // Determine if this is a superadmin request
    if (fromSuperadmin.value) {
      params.isSuperAdmin = true;
      
      if (safeTenantIds.value && safeTenantIds.value.length > 1) {
        // Multiple tenants selected
        params.entityIds = safeTenantIds.value.filter(id => id && String(id).trim());
        if (params.entityIds.length === 0) {
          throw new Error('No valid tenants selected for report generation');
        }
      } else if (safeTenantIds.value && safeTenantIds.value.length === 1) {
        // Single tenant selected
        params.entityId = String(safeTenantIds.value[0]).trim();
        if (!params.entityId) {
          throw new Error('Invalid tenant ID for report generation');
        }
      } else {
        throw new Error('No tenants selected for report generation');
      }
    } else {
      // Regular tenant user
      if (!safeTenantId.value || !String(safeTenantId.value).trim()) {
        throw new Error('Tenant ID is required for report generation');
      }
      params.entityId = String(safeTenantId.value).trim();
    }

    // Temple selection - ensure it belongs to selected tenant(s)
    if (selectedTemple.value && selectedTemple.value !== 'all') {
      // Validate that selected temple belongs to the tenant(s)
      const selectedTempleObj = filteredTemples.value.find(t => 
        String(t.id) === String(selectedTemple.value)
      );
      
      if (!selectedTempleObj) {
        throw new Error('Selected temple is not available for the current tenant selection');
      }
      
      params.templeId = selectedTemple.value.toString();
    }

    // Devotee status
    if (activeReportType.value === 'statusActive') {
      params.status = 'active';
    } else if (activeReportType.value === 'statusInactive') {
      params.status = 'inactive';
    } else if (activeReportType.value === 'devotees' && devoteeStatus.value && devoteeStatus.value !== 'all') {
      params.status = devoteeStatus.value;
    }

    return params;
  } catch (error) {
    console.error('Error building report params:', error);
    throw error;
  }
};

const fetchPreview = async () => {
  try {
    // Only fetch if we have proper tenant setup
    if (!fromSuperadmin.value && !safeTenantId.value) {
      console.warn('No tenant ID available for preview');
      return;
    }
    if (fromSuperadmin.value && (!safeTenantIds.value || safeTenantIds.value.length === 0)) {
      console.warn('No tenant IDs available for superadmin preview');
      return;
    }

    // Only fetch if we have temples available
    if (filteredTemples.value.length === 0) {
      console.warn('No temples available for preview');
      return;
    }

    let previewParams;
    try {
      //const params = buildReportParams();
      const params = buildReportParams_ext(true);
      previewParams = { ...params };
      delete previewParams.format; // Remove format for preview
    } catch (error) {
      console.error('Error building preview params:', error);
      showToast(error?.message || 'Error building parameters', 'error');
      return;
    }

    if (!reportsStore) {
      showToast('Reports store is not available', 'error');
      return;
    }

    let result = null;
    switch (activeReportType.value) {
      case 'birthdays':
        if (typeof reportsStore.getDevoteeBirthdaysPreview === 'function') {
          result = await reportsStore.getDevoteeBirthdaysPreview(previewParams);
        } else {
          showToast('Birthday reports preview is not available', 'error');
        }
        break;

      case 'devotees':
      case 'statusActive':
      case 'statusInactive':
        if (typeof reportsStore.getDevoteeListPreview === 'function') {
          result = await reportsStore.getDevoteeListPreview(previewParams);
        } else {
          showToast('Devotee list preview is not available', 'error');
        }
        break;

      case 'profile':
        if (typeof reportsStore.getDevoteeProfilePreview === 'function') {
          result = await reportsStore.getDevoteeProfilePreview(previewParams);
        } else {
          showToast('Devotee profile preview is not available yet', 'warning');
        }
        break;

      default:
        showToast('Unknown report type selected', 'error');
        break;
    }
  } catch (error) {
    console.error('Error fetching preview:', error);
    const errorMessage = error?.message || 'Unknown error';
    showToast(`Failed to fetch report preview: ${errorMessage}`, 'error');
  }
};

const downloadReport = async () => {
  try {
    clearError();

    if (!fromSuperadmin.value && !safeTenantId.value) {
      showToast('Tenant information is missing. Please refresh the page.', 'error');
      return;
    }
    if (fromSuperadmin.value && (!safeTenantIds.value || safeTenantIds.value.length === 0)) {
      showToast('Tenant selection is required. Please go back and select tenants.', 'error');
      return;
    }

    if (filteredTemples.value.length === 0) {
      showToast('No temples available for the selected tenant(s). Please check your tenant selection.', 'error');
      return;
    }

    if (activeFilter.value === 'custom' && (!startDate.value || !endDate.value)) {
      showToast('Please select both start and end dates for custom range', 'error');
      return;
    }

    if (new Date(startDate.value) > new Date(endDate.value)) {
      showToast('Start date must be before end date', 'error');
      return;
    }

    if (!selectedFormat.value) {
      showToast('Please select a format for the report', 'error');
      return;
    }

    let params;
    try {
      params = buildReportParams();
    } catch (error) {
      showToast(error?.message || 'Error building parameters', 'error');
      return;
    }

    if (!params.entityId && !params.entityIds) {
      showToast('Entity ID is required for report generation', 'error');
      return;
    }

    if (!params.format) {
      showToast('Format is required for report generation', 'error');
      return;
    }

    if (!reportsStore) {
      showToast('Reports store is not available', 'error');
      return;
    }

    let result;
    try {
      switch (activeReportType.value) {
        case 'birthdays':
          if (typeof reportsStore.downloadDevoteeBirthdaysReport === 'function') {
            result = await reportsStore.downloadDevoteeBirthdaysReport(params);
          } else {
            throw new Error('Birthday report download functionality is not available');
          }
          break;
        case 'devotees':
        case 'statusActive':
        case 'statusInactive':
          if (typeof reportsStore.downloadDevoteeListReport === 'function') {
            result = await reportsStore.downloadDevoteeListReport(params);
          } else {
            throw new Error('Devotee list report download functionality is not available');
          }
          break;
        case 'profile':
          if (typeof reportsStore.downloadDevoteeProfileReport === 'function') {
            result = await reportsStore.downloadDevoteeProfileReport(params);
          } else {
            throw new Error('Devotee profile download is not available yet');
          }
          break;
        default:
          throw new Error('Unknown report type selected');
      }
    } catch (downloadError) {
      console.error('Download error details:', downloadError);
      throw downloadError;
    }

    const reportTypeName = getReportTypeTitle();
    showToast(
      `${reportTypeName} Report downloaded successfully in ${getFormatLabel(selectedFormat.value)} format`,
      'success'
    );

    console.log('Download completed successfully:', result);
  } catch (error) {
    console.error('Error downloading report:', error);
    const errorMessage = error?.message || 'Unknown error';
    showToast(`Failed to download report: ${errorMessage}`, 'error');
  }
};

// Enhanced temple loading with proper tenant filtering
const loadTemplesForTenants = async () => {
  try {
    if (!templeStore) {
      console.error('Temple store is not available');
      return;
    }

    // Clear existing temples
    if (typeof templeStore.clearTempleData === 'function') {
      templeStore.clearTempleData();
    } else {
      templeStore.temples = [];
    }

    // Determine tenant ID(s) to use
    const tenantIds = fromSuperadmin.value && safeTenantIds.value.length > 0 
      ? safeTenantIds.value 
      : [safeTenantId.value];

    if (!tenantIds || tenantIds.length === 0 || tenantIds.every(id => !id)) {
      throw new Error('No valid tenant IDs available');
    }

    // Import API directly
    const api = await import('@/plugins/axios').then(m => m.default);
    let allTemples = [];

    // Fetch temples for each tenant
    for (const tenantId of tenantIds) {
      if (!tenantId) continue;
      
      try {
        // Method 1: Try entities endpoint with tenant filtering
        const entityResponse = await api.get('/entities', {
          params: { 
            tenant_id: tenantId,
            created_by: tenantId,
            _cache_bust: Date.now()
          },
          headers: {
            'X-Tenant-ID': tenantId
          }
        });
        
        let entities = [];
        if (entityResponse.data && Array.isArray(entityResponse.data)) {
          entities = entityResponse.data;
        } else if (entityResponse.data && Array.isArray(entityResponse.data.data)) {
          entities = entityResponse.data.data;
        }
        
        // Filter entities that belong to this tenant
        const tenantTemples = entities.filter(entity => {
          const createdBy = String(entity.created_by || '');
          const entityTenantId = String(entity.tenant_id || '');
          return createdBy === String(tenantId) || entityTenantId === String(tenantId);
        }).map(temple => ({
          id: temple.id,
          name: temple.name || temple.temple_name || temple.templeName || 'Unknown Temple',
          status: temple.status || 'active',
          created_by: temple.created_by,
          tenant_id: temple.tenant_id,
          sourceTenantId: tenantId // Add source tenant for tracking
        }));
        
        allTemples.push(...tenantTemples);
        
      } catch (entityError) {
        console.warn(`Failed to fetch entities for tenant ${tenantId}:`, entityError);
        
        try {
          // Method 2: Try temples endpoint as fallback
          const templeResponse = await api.get('/temples', {
            params: { 
              entity_id: tenantId,
              _cache_bust: Date.now()
            },
            headers: {
              'X-Tenant-ID': tenantId
            }
          });
          
          const temples = Array.isArray(templeResponse.data) 
            ? templeResponse.data 
            : Array.isArray(templeResponse.data?.data) 
            ? templeResponse.data.data 
            : [];
            
          const mappedTemples = temples.map(t => ({
            id: t.id,
            name: t.name || t.temple_name || t.templeName || 'Unknown Temple',
            status: t.status || 'active',
            created_by: t.created_by || tenantId,
            tenant_id: t.tenant_id || tenantId,
            sourceTenantId: tenantId
          }));
          
          allTemples.push(...mappedTemples);
          
        } catch (templeError) {
          console.error(`Failed to fetch temples for tenant ${tenantId}:`, templeError);
        }
      }
    }

    // Remove duplicates based on ID
    const uniqueTemples = [];
    const seenIds = new Set();
    
    for (const temple of allTemples) {
      const templeId = String(temple.id);
      if (!seenIds.has(templeId)) {
        seenIds.add(templeId);
        uniqueTemples.push(temple);
      }
    }

    templeStore.temples = uniqueTemples;
    
    if (uniqueTemples.length === 0) {
      showToast('No temples found for the selected tenant(s)', 'warning');
    }
    
  } catch (error) {
    console.error('Error loading temples:', error);
    templeStore.temples = [];
    showToast('Failed to load temple data', 'error');
  }
};

const checkReportsStoreHealth = () => {
  if (!reportsStore) {
    showToast('Reports store is not available. Please refresh the page.', 'error');
    return false;
  }

  const requiredMethods = [
    'getDevoteeBirthdaysPreview',
    'downloadDevoteeBirthdaysReport', 
    'getDevoteeListPreview',
    'downloadDevoteeListReport',
    'clearError',
    'clearReportData'
  ];

  const missingMethods = requiredMethods.filter(method =>
    typeof reportsStore[method] !== 'function'
  );

  if (missingMethods.length > 0) {
    console.warn(`Reports functionality incomplete. Missing: ${missingMethods.join(', ')}`);
    // Don't show error for missing methods, just log warning
    return true; // Allow continuation
  }

  return true;
};

// Watchers
watch(activeReportType, () => {
  if (reportsStore && typeof reportsStore.clearReportData === 'function') {
    reportsStore.clearReportData();
  }
  if (activeReportType.value === 'statusActive' || activeReportType.value === 'statusInactive') {
    devoteeStatus.value = 'all';
  }
  fetchPreview();
});

watch([selectedTemple, devoteeStatus], () => {
  fetchPreview();
});

watch(activeFilter, () => {
  // fetchPreview is called inside setActiveFilter
});

watch(safeTenantIds, async (newIds, oldIds) => {
  if (newIds && newIds.length > 0 && JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
    await loadTemplesForTenants();
    selectedTemple.value = 'all'; // Reset temple selection
    fetchPreview();
  }
}, { deep: true });

// Lifecycle hook
onMounted(async () => {
  if (!reportsStore || !templeStore || !userStore) {
    showToast('Initialization error. Please refresh the page.', 'error');
    return;
  }

  const storeHealthy = checkReportsStoreHealth();
  if (!storeHealthy) return;

  if (typeof reportsStore.clearReportData === 'function') {
    reportsStore.clearReportData();
  }

  try {
    await loadTemplesForTenants();

    if ((fromSuperadmin.value && safeTenantIds.value && safeTenantIds.value.length > 0) ||
        (!fromSuperadmin.value && safeTenantId.value)) {
      await fetchPreview();
    } else {
      showToast('Tenant information is missing. Please refresh the page or go back and select tenants.', 'warning');
    }
  } catch (error) {
    console.error('Error in component initialization:', error);
    showToast('Failed to initialize reports page. Please refresh and try again.', 'error');
  }
});
</script>