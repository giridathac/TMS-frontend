<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Back to SuperAdmin Reports button -->
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
            <h1 class="text-2xl font-bold text-gray-900">Temple Activities Report</h1>
            <p class="text-gray-600 mt-1">
              Download event, seva, and booking activity data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants: {{ tenantIds.length }} selected)
              </span>
              <span v-else-if="effectiveTenantId" class="text-indigo-600 font-medium">
                (Tenant ID: {{ effectiveTenantId }})
              </span>
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
              <span class="text-indigo-800 font-medium">{{ userStore.user?.name || 'Tenant User' }}</span>
              <span class="text-indigo-600 text-sm ml-2">{{ fromSuperadmin ? '(Super Admin)' : '(Tenant)' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span class="text-gray-900 font-medium">Loading data...</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
          <div class="ml-auto pl-3">
            <button @click="clearError" class="text-red-400 hover:text-red-500">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div v-if="debugMode" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm">
        <h4 class="font-medium text-yellow-800">Debug Info:</h4>
        <p><strong>From Superadmin:</strong> {{ fromSuperadmin }}</p>
        <p><strong>Effective Tenant ID:</strong> {{ effectiveTenantId }}</p>
        <p><strong>Tenant IDs:</strong> {{ JSON.stringify(tenantIds) }}</p>
        <p><strong>Available Temples:</strong> {{ availableTemples.length }}</p>
        <p><strong>Route Query:</strong> {{ JSON.stringify(route.query) }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Temple Activities</h3>
          <p class="text-gray-600 mt-1">Configure filters and download your temple activity data</p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-gray-700 font-medium">Select Temple</label>
              <button 
                @click="manualRefreshTemples"
                :disabled="loading"
                class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="mr-1 h-3 w-3" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ loading ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                @change="handleTempleChange"
                :disabled="loading"
              >
                <option value="all">All Temples</option>
                <option v-for="temple in availableTemples" :key="temple.id" :value="temple.id">
                 {{ temple.name }} 
                 <span v-if="temple.tenant_id" class="text-gray-500">(Tenant: {{ temple.tenant_id }})</span>
                </option>
              </select>
            </div>
            <div v-if="availableTemples.length === 0 && !loading" class="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
              <div class="flex items-center">
                <svg class="h-4 w-4 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                No temples found for selected tenant(s). Please check tenant access or try refreshing.
              </div>
            </div>
            <div v-else-if="availableTemples.length > 0" class="mt-2 text-sm text-green-600">
              {{ availableTemples.length }} temple{{ availableTemples.length !== 1 ? 's' : '' }} available
              <span v-if="fromSuperadmin && tenantIds.length > 1">
                across {{ tenantIds.length }} tenant{{ tenantIds.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Activity Type Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Activity Type</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="type in activityTypes" 
                :key="type.value"
                @click="setActivityType(type.value)"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="activityType === type.value ? 
                  'bg-indigo-600 text-white' : 
                  'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Filter Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Date Range</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.value"
                  @click="setActiveFilter(filter.value)"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  :class="activeFilter === filter.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div v-if="activeFilter === 'custom'" class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                <input 
                  type="date" 
                  v-model="startDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  @change="handleDateChange"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  @change="handleDateChange"
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
                <div class="relative">
                  <select 
                    v-model="selectedFormat" 
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>

                <button 
                  @click="downloadReport"
                  :disabled="isDownloading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ isDownloading ? 'Downloading...' : 'Download' }}
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
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">
                {{ fromSuperadmin && tenantIds.length > 1 ? 'Tenants:' : 'Tenant:' }}
              </span>
              <span v-if="fromSuperadmin && tenantIds.length > 1">
                {{ tenantIds.length }} selected
              </span>
              <span v-else>
                {{ effectiveTenantId }}
              </span>
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Activity:</span>
              {{ getActivityTypeLabel(activityType) }}
            </div>
            
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom'">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>
            
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
import api from '@/plugins/axios';

// Composables & stores
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const reportsStore = useReportsStore();
const { showToast } = useToast();

// Reactive state
const selectedTemple = ref('all');
const activityType = ref('events');
const activeFilter = ref('monthly');
const selectedFormat = ref('pdf');
const debugMode = ref(false); // Set to true for debugging

// Fixed: Proper date initialization
const initializeDates = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return {
    start: thirtyDaysAgo.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
};

const { start: initialStartDate, end: initialEndDate } = initializeDates();
const startDate = ref(initialStartDate);
const endDate = ref(initialEndDate);

const loading = ref(false);
const error = ref(null);
const allTemples = ref([]); // For multi-tenant temple lists
const isDownloading = ref(false);

// Options
const activityTypes = [
  { label: 'Events Report', value: 'events' },
  { label: 'Seva Reports', value: 'sevas' },
  { label: 'Seva Bookings', value: 'bookings' },
  { label: 'Donations Reports', value: 'donations' },
];

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

// Role detection
const isSuperAdmin = computed(() => {
  const u = userStore?.user || {};
  const role = (u.role || u.userType || '').toString().toLowerCase();
  const roles = Array.isArray(u.roles) ? u.roles.map(r => (r || '').toString().toLowerCase()) : [];
  const flag = Boolean(u.isSuperAdmin || u.is_super_admin);
  return role === 'superadmin' || roles.includes('superadmin') || flag || route?.query?.from === 'superadmin';
});

const fromSuperadmin = computed(() => !!isSuperAdmin.value);

// Fixed: Tenant resolution with proper fallback chain
const effectiveTenantId = computed(() => {
  // If superadmin with multiple tenants, return null for multi-tenant scenario
  if (fromSuperadmin.value && route.query.tenants) {
    const tenantList = String(route.query.tenants).split(',').filter(Boolean);
    if (tenantList.length > 1) {
      return null; // Multi-tenant scenario
    } else if (tenantList.length === 1) {
      return tenantList[0].trim();
    }
  }
  
  // Single tenant resolution with proper priority
  return route.params.tenantId
    || route.query.tenantId
    || route.query.tenant_id
    || userStore.user?.tenantId
    || userStore.user?.tenant_id
    || (typeof localStorage !== 'undefined' ? localStorage.getItem('current_tenant_id') : null)
    || null;
});

const tenantIds = computed(() => {
  if (fromSuperadmin.value && route.query.tenants) {
    return String(route.query.tenants).split(',').map(s => s.trim()).filter(Boolean);
  }
  const singleTenant = effectiveTenantId.value;
  return singleTenant ? [singleTenant] : [];
});

// Temple list logic implementing the 3 rules
const availableTemples = computed(() => {
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    return allTemples.value || [];
  } else {
    return templeStore.temples || [];
  }
});

// UI helpers
const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  const temple = availableTemples.value.find(t => t.id?.toString() === templeId?.toString());
  return temple ? temple.name : 'Unknown Temple';
};

const getActivityTypeLabel = (type) => {
  const found = activityTypes.find(t => t.value === type);
  return found ? found.label : 'Unknown';
};

const getTimeFilterLabel = (filter) => {
  const found = timeFilters.find(f => f.value === filter);
  return found ? found.label : 'Unknown';
};

const getFormatLabel = (format) => {
  const found = formats.find(f => f.value === format);
  return found ? found.label : 'Unknown';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const clearError = () => {
  error.value = null;
};

// Handlers
const setActivityType = (type) => {
  activityType.value = type;
};

// Fixed: Date range calculation
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  const now = new Date();
  
  if (filter === 'weekly') {
    const start = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  } else if (filter === 'monthly') {
    const start = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  } else if (filter === 'yearly') {
    const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    startDate.value = start.toISOString().split('T')[0];
    endDate.value = now.toISOString().split('T')[0];
  }
};

const handleTempleChange = () => {
  // Optional: Add any temple change logic here
};

const handleDateChange = () => {
  // Optional: Add any date validation logic here
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    error.value = 'Start date cannot be after end date';
  } else {
    clearError();
  }
};

// Fixed: Enhanced tenant parameter building
const buildTenantQueryParams = (tenantId) => {
  if (!tenantId) return {};
  
  return {
    tenant_id: tenantId,
    tenantId: tenantId,
    entity_id: tenantId,
    entityId: tenantId,
  };
};

const buildTenantHeaders = (tenantId) => {
  if (!tenantId) return {};
  
  return {
    'X-Tenant-ID': String(tenantId),
    'X-Entity-ID': String(tenantId),
    //'Tenant-ID': String(tenantId),
  };
};

// Fixed: Build report parameters with proper tenant handling
const buildReportParams = () => {
  const params = {
    type: activityType.value,
    dateRange: activeFilter.value,
    startDate: startDate.value,
    endDate: endDate.value,
    format: selectedFormat.value,
    isSuperAdmin: fromSuperadmin.value
  };

  // Temple selection logic
  if (selectedTemple.value === 'all') {
    // All temples selected
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      // Multi-tenant scenario
      params.tenantIds = tenantIds.value.slice();
      params.entityIds = tenantIds.value.slice();
    } else if (effectiveTenantId.value) {
      // Single tenant scenario
      params.tenantId = effectiveTenantId.value;
      params.entityId = effectiveTenantId.value;
    }
  } else {
    // Specific temple selected
    params.templeId = selectedTemple.value;
    params.temple_id = selectedTemple.value;
    
    // Always include tenant info for proper scoping
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      // Multi-tenant: find temple's owning tenant
      const temple = allTemples.value.find(t => String(t.id) === String(selectedTemple.value));
      const owningTenant = temple?.tenant_id || temple?.created_by || temple?.entityId;
      
      if (owningTenant) {
        params.tenantId = owningTenant;
        params.entityId = owningTenant;
      } else {
        // Use first available tenant as fallback
        params.tenantId = tenantIds.value[0];
        params.entityId = tenantIds.value[0];
      }
    } else if (effectiveTenantId.value) {
      // Single tenant scenario
      params.tenantId = effectiveTenantId.value;
      params.entityId = effectiveTenantId.value;
    }
  }

  return params;
};

// Fixed: Download function with proper error handling
const downloadReport = async () => {
  if (isDownloading.value) return;
  
  // Validation
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates';
    return;
  }
  
  if (new Date(startDate.value) > new Date(endDate.value)) {
    error.value = 'Start date cannot be after end date';
    return;
  }

  if (tenantIds.value.length === 0) {
    error.value = 'No tenant selected for report generation';
    return;
  }
  
  isDownloading.value = true;
  error.value = null;
  
  try {
    const params = buildReportParams();
    console.log('Download params:', params); // Debug logging
    
    let result;

    if (reportsStore && typeof reportsStore.downloadActivitiesReport === 'function') {
      result = await reportsStore.downloadActivitiesReport(params);
    } else {
      // Direct API call with proper headers
      const headers = {};
      
      // Add tenant headers for single tenant scenario
      if (effectiveTenantId.value && tenantIds.value.length === 1) {
        Object.assign(headers, buildTenantHeaders(effectiveTenantId.value));
      }
      
      const response = await api.post('/v1/reports/activities/download', params, {
        responseType: 'blob',
        headers
      });
      
      // Handle blob response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const activityLabel = getActivityTypeLabel(activityType.value).toLowerCase().replace(/\s+/g, '-');
      link.download = `${activityLabel}-report-${timestamp}.${params.format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      result = { success: true };
    }
    
    if (result && result.success) {
      showToast(`${getActivityTypeLabel(activityType.value)} downloaded successfully as ${getFormatLabel(selectedFormat.value)}`, 'success');
    } else {
      throw new Error(result?.message || 'Failed to download report');
    }
  } catch (err) {
    console.error('Error downloading report:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
    error.value = `Failed to download report: ${errorMessage}`;
    showToast('Failed to download report. Please try again.', 'error');
  } finally {
    isDownloading.value = false;
  }
};

// Fixed: Fetch temples with proper tenant scoping and error handling
const fetchTemples = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Clear existing data
    templeStore.temples = [];
    allTemples.value = [];

    if (tenantIds.value.length === 0) {
      console.warn('No tenant IDs available for fetching temples');
      error.value = 'No tenant selected to load temples.';
      return;
    }

    // MULTI-TENANT (superadmin with multiple tenants)
    if (fromSuperadmin.value && tenantIds.value.length > 1) {
      console.log('Fetching temples for multiple tenants:', tenantIds.value);
      
      const requests = tenantIds.value.map(tenantId => 
        fetchTemplesForSingleTenant(tenantId).catch(err => {
          console.warn(`Failed to fetch temples for tenant ${tenantId}:`, err);
          return [];
        })
      );

      const results = await Promise.allSettled(requests);
      
      const aggregated = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          aggregated.push(...result.value);
        }
      }

      // Deduplicate by id
      const seen = new Set();
      allTemples.value = aggregated.filter(temple => {
        if (seen.has(temple.id)) return false;
        seen.add(temple.id);
        return true;
      });
      
      console.log(`Loaded ${allTemples.value.length} temples from ${tenantIds.value.length} tenants`);

    // SINGLE-TENANT
    } else if (effectiveTenantId.value) {
      console.log('Fetching temples for single tenant:', effectiveTenantId.value);
      
      const temples = await fetchTemplesForSingleTenant(effectiveTenantId.value);
      templeStore.temples = temples;
      
      console.log(`Loaded ${templeStore.temples.length} temples for tenant ${effectiveTenantId.value}`);
    } else {
      console.warn('No tenant ID available to fetch temples');
      error.value = 'No tenant selected to load temples.';
    }
    
  } catch (err) {
    console.error('Error in fetchTemples:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
    error.value = `Failed to load temple data: ${errorMessage}`;
  } finally {
    loading.value = false;
  }
};

// New helper function to fetch temples for a single tenant
const fetchTemplesForSingleTenant = async (tenantId) => {
  console.log(`Fetching temples for tenant: ${tenantId}`);
  
  try {
    // Strategy 1: Try temples endpoint with tenant filtering
    try {
      const templesResponse = await api.get('/v1/temples', {
        params: {
          tenant_id: tenantId,
          entityId: tenantId,
          entity_id: tenantId
        },
        headers: buildTenantHeaders(tenantId)
      });
      
      let temples = [];
      if (Array.isArray(templesResponse.data)) {
        temples = templesResponse.data;
      } else if (templesResponse.data && Array.isArray(templesResponse.data.data)) {
        temples = templesResponse.data.data;
      } else if (templesResponse.data && Array.isArray(templesResponse.data.temples)) {
        temples = templesResponse.data.temples;
      }
      
      if (temples.length > 0) {
        return temples.map(temple => ({
          id: temple.id,
          name: temple.name || temple.temple_name || temple.entity_name || 'Unknown Temple',
          status: temple.status || 'active',
          tenant_id: temple.tenant_id || temple.entityId || temple.created_by || tenantId,
          created_by: temple.created_by || tenantId,
          entityId: temple.entityId || temple.tenant_id || tenantId
        }));
      }
    } catch (templesErr) {
      console.log('Temples endpoint failed, trying entities endpoint:', templesErr.message);
    }

    // Strategy 2: Try entities endpoint with tenant filtering
    try {
      const entitiesResponse = await api.get('/entities', {
        params: {
          tenant_id: tenantId,
          entityId: tenantId,
          entity_id: tenantId,
          created_by: tenantId
        },
        headers: buildTenantHeaders(tenantId)
      });

      let entities = [];
      if (Array.isArray(entitiesResponse.data)) {
        entities = entitiesResponse.data;
      } else if (entitiesResponse.data && Array.isArray(entitiesResponse.data.data)) {
        entities = entitiesResponse.data.data;
      } else if (entitiesResponse.data && Array.isArray(entitiesResponse.data.entities)) {
        entities = entitiesResponse.data.entities;
      }

      // Filter entities that belong to this tenant
      const tenantEntities = entities.filter(entity => 
        String(entity.created_by) === String(tenantId) ||
        String(entity.tenant_id) === String(tenantId) ||
        String(entity.entityId) === String(tenantId)
      );

      return tenantEntities.map(entity => ({
        id: entity.id,
        name: entity.name || entity.temple_name || entity.entity_name || 'Unknown Temple',
        status: entity.status || 'active',
        tenant_id: entity.tenant_id || entity.entityId || entity.created_by || tenantId,
        created_by: entity.created_by || tenantId,
        entityId: entity.entityId || entity.tenant_id || tenantId
      }));

    } catch (entitiesErr) {
      console.log('Entities endpoint also failed:', entitiesErr.message);
    }

    // Strategy 3: Try getting all entities and filter client-side (fallback)
    try {
      const allResponse = await api.get('/entities', {
        headers: buildTenantHeaders(tenantId)
      });

      let allEntities = [];
      if (Array.isArray(allResponse.data)) {
        allEntities = allResponse.data;
      } else if (allResponse.data && Array.isArray(allResponse.data.data)) {
        allEntities = allResponse.data.data;
      }

      const filteredEntities = allEntities.filter(entity => 
        String(entity.created_by) === String(tenantId) ||
        String(entity.tenant_id) === String(tenantId) ||
        String(entity.entityId) === String(tenantId)
      );

      return filteredEntities.map(entity => ({
        id: entity.id,
        name: entity.name || entity.temple_name || entity.entity_name || 'Unknown Temple',
        status: entity.status || 'active',
        tenant_id: entity.tenant_id || entity.entityId || entity.created_by || tenantId,
        created_by: entity.created_by || tenantId,
        entityId: entity.entityId || entity.tenant_id || tenantId
      }));

    } catch (fallbackErr) {
      console.error('All strategies failed for tenant:', tenantId, fallbackErr);
      return [];
    }

  } catch (err) {
    console.error(`Error fetching temples for tenant ${tenantId}:`, err);
    return [];
  }
};

// Manual refresh function
const manualRefreshTemples = async () => {
  await fetchTemples();
};

// Lifecycle
onMounted(async () => {
  console.log('Component mounted with tenant context:', {
    fromSuperadmin: fromSuperadmin.value,
    effectiveTenantId: effectiveTenantId.value,
    tenantIds: tenantIds.value,
    routeQuery: route.query,
    routeParams: route.params
  });
  
  await fetchTemples();
});

// Watch for tenant changes
watch(tenantIds, async (newIds, oldIds) => {
  if (newIds && newIds.length > 0 && JSON.stringify(newIds) !== JSON.stringify(oldIds)) {
    console.log('Tenant IDs changed, refetching temples:', { old: oldIds, new: newIds });
    await fetchTemples();
  }
}, { deep: true });

// Also watch single-tenant transitions
watch(effectiveTenantId, async (newTenantId, oldTenantId) => {
  if (newTenantId !== oldTenantId) {
    console.log('Effective tenant ID changed, refetching temples:', { old: oldTenantId, new: newTenantId });
    await fetchTemples();
  }
});

// Watch route changes for tenant context updates
watch(() => route.query, async (newQuery, oldQuery) => {
  if (newQuery.tenants !== oldQuery.tenants || newQuery.tenantId !== oldQuery.tenantId) {
    console.log('Route query changed, updating tenant context:', { old: oldQuery, new: newQuery });
    await fetchTemples();
  }
}, { deep: true });
</script>