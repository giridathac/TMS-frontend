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
            <h1 class="text-2xl font-bold text-gray-900">Temple Register Report</h1>
            <p class="text-gray-600 mt-1">
              Download registration data for your temples
              <span v-if="fromSuperadmin && tenantIds.length > 1" class="text-indigo-600 font-medium">
                (Multiple Tenants Selected)
              </span>
              <span v-else-if="tenantId" class="text-indigo-600 font-medium">
                (Tenant ID: {{ tenantId }})
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

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filter & Download Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Temple Register</h3>
          <p class="text-gray-600 mt-1">Configure filters and download your temple registration data</p>
        </div>

        <div class="p-6">
          <!-- Temple Selection -->
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Select Temple</label>
            <div class="relative">
              <select 
                v-model="selectedTemple" 
                @change="onTempleChange"
                class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Temples</option>
                <option v-for="temple in filteredTemples" :key="temple.id" :value="temple.id">
                  {{ temple.name }}
                </option>
              </select>
            </div>
            <div v-if="debugMode" class="mt-2 text-xs text-gray-500">
              Found {{ filteredTemples.length }} temples for tenant(s): {{ tenantIds.join(', ') }}
            </div>
          </div>

          <!-- Filter Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Registration Date Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Registration Date</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="filter in timeFilters" 
                  :key="filter.value"
                  @click="setActiveFilter(filter.value)"
                  :disabled="isDownloading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeFilter === filter.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <!-- Temple Status Filter -->
            <div>
              <label class="block text-gray-700 font-medium mb-2">Temple Status</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="status in statusFilters" 
                  :key="status.value"
                  @click="setActiveStatus(status.value)"
                  :disabled="isDownloading"
                  class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="activeStatus === status.value ? 
                    'bg-indigo-600 text-white' : 
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  {{ status.label }}
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
                  :disabled="isDownloading"
                  :max="endDate"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  v-model="endDate"
                  :disabled="isDownloading"
                  :min="startDate"
                  :max="today"
                  class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    :disabled="isDownloading"
                    class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option v-for="format in formats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </select>
                </div>

                <!-- Download Button -->
                <button 
                  @click="downloadReport"
                  :disabled="isDownloading || !isFormValid"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg v-if="isDownloading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          <!-- Error Display -->
          <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
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
            <div v-if="fromSuperadmin && tenantIds.length > 1" class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Tenants:</span>
              {{ tenantIds.length }} selected
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Temple:</span>
              {{ selectedTemple === 'all' ? 'All Temples' : getTempleName(selectedTemple) }}
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Period:</span>
              {{ getTimeFilterLabel(activeFilter) }}
              <span v-if="activeFilter === 'custom' && startDate && endDate">
                ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})
              </span>
            </div>
            <div class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-indigo-100 text-indigo-800">
              <span class="font-medium mr-1">Status:</span>
              {{ getStatusFilterLabel(activeStatus) }}
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
import { useToast } from '@/composables/useToast';
import ReportsService from '@/services/reports.service';

// Composables
const route = useRoute();
const router = useRouter();
const templeStore = useTempleStore();
const userStore = useAuthStore();
const { showToast } = useToast();

// Reactive state
const selectedTemple = ref('all');
const activeFilter = ref('weekly');
const activeStatus = ref('all');
const selectedFormat = ref('pdf');
const startDate = ref('');
const endDate = ref('');
const isDownloading = ref(false);
const errorMessage = ref('');
const allTemples = ref([]); // Store temples from all tenants
const debugMode = ref(true); // Enable for troubleshooting

// Initialize dates
const initializeDates = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  endDate.value = today.toISOString().split('T');
  startDate.value = weekAgo.toISOString().split('T');
};

// Filter options
const timeFilters = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom Range', value: 'custom' },
];

const statusFilters = [
  { label: 'All Status', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

const formats = [
  { label: 'PDF', value: 'pdf' },
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'excel' },
];

// Computed properties
const tenantId = computed(() => {
  if (route.query.tenants) {
    const tenantIdArray = route.query.tenants.split(',');
    return tenantIdArray;
  }
  return route.params.tenantId || userStore.user?.id || localStorage.getItem('current_tenant_id');
});

// Check for tenants parameter from superadmin
const fromSuperadmin = computed(() => route.query.from === 'superadmin');
const tenantIds = computed(() => {
  if (route.query.tenants) {
    return route.query.tenants.split(',').map(id => id.trim());
  }
  return [tenantId.value]; // Default to current tenant only
});

const today = computed(() => {
  return new Date().toISOString().split('T');
});

const entityId = computed(() => {
  return selectedTemple.value === 'all' ? 'all' : selectedTemple.value;
});

const isFormValid = computed(() => {
  if (activeFilter.value === 'custom') {
    return startDate.value && endDate.value && new Date(startDate.value) <= new Date(endDate.value);
  }
  return true;
});

// Track the fully-resolved selected temple object to derive its tenant
const selectedTempleObj = computed(() => {
  const idStr = String(selectedTemple.value);
  const fromAll = allTemples.value.find(t => String(t.id) === idStr);
  if (fromAll) return fromAll;
  return templeStore.temples.find(t => String(t.id) === idStr);
});

// Filtered temples for dropdown (approved/active only)
const filteredTemples = computed(() => {
  let templesForDropdown = [];
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    templesForDropdown = allTemples.value;
  } else {
    templesForDropdown = templeStore.temples;
  }

  if (!fromSuperadmin.value) {
    return templesForDropdown.filter(temple => {
      const status = (temple.status || '').toLowerCase();
      return status === 'approved' || status === 'active';
    });
  }

  return templesForDropdown.filter(temple => {
    const createdBy = String(temple.created_by || temple.createdBy || '');
    const templeTenantId = String(temple.tenant_id || temple.tenantId || temple.sourceTenantId || '');
    const belongsToSelectedTenant = tenantIds.value.some(tid => createdBy === tid || templeTenantId === tid);
    const status = (temple.status || '').toLowerCase();
    const isApproved = status === 'approved' || status === 'active';
    return belongsToSelectedTenant && isApproved;
  });
});

// Methods
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  clearError();
  const today = new Date();
  const start = new Date();
  if (filter === 'weekly') start.setDate(today.getDate() - 7);
  else if (filter === 'monthly') start.setDate(today.getDate() - 30);
  else if (filter === 'yearly') start.setDate(today.getDate() - 365);
  if (filter !== 'custom') {
    startDate.value = start.toISOString().split('T');
    endDate.value = today.toISOString().split('T');
  }
};

const setActiveStatus = (status) => {
  activeStatus.value = status;
  clearError();
};

const onTempleChange = () => {
  clearError();
};

const clearError = () => {
  errorMessage.value = '';
};

const getTempleName = (templeId) => {
  if (templeId === 'all') return 'All Temples';
  const idStr = String(templeId);
  const inAll = allTemples.value.find(t => String(t.id) === idStr);
  if (inAll) return inAll.name;
  const t = templeStore.temples.find(t => String(t.id) === idStr);
  return t ? t.name : 'Unknown Temple';
};

const getTimeFilterLabel = (filter) => {
  const found = timeFilters.find(f => f.value === filter);
  return found ? found.label : 'Unknown';
};

const getStatusFilterLabel = (status) => {
  const found = statusFilters.find(s => s.value === status);
  return found ? found.label : 'Unknown';
};

const getFormatLabel = (format) => {
  const found = formats.find(f => f.value === format);
  return found ? found.label : 'Unknown';
};

// Build robust parameters for ReportsService
const buildReportParams = () => {
  const isSuperAdmin = 
    userStore.user?.roleId === 1 || 
    userStore.user?.role === 'superadmin' || 
    fromSuperadmin.value || 
    route.path.includes('/superadmin/');

  // Resolve the tenant owning the selected temple (if any)
  let selectedTempleTenant = null;
  if (selectedTemple.value !== 'all' && selectedTempleObj.value) {
    selectedTempleTenant = String(
      selectedTempleObj.value.sourceTenantId ||
      selectedTempleObj.value.tenant_id ||
      selectedTempleObj.value.tenantId ||
      selectedTempleObj.value.created_by ||
      selectedTempleObj.value.createdBy ||
      ''
    );
  }

  // Multi-tenant (superadmin selecting multiple tenants)
  if (isSuperAdmin && tenantIds.value.length > 1) {
    // If a single temple is chosen, scope both entityId (for path) and entityIds (for compatibility) to that temple’s tenant
    if (selectedTemple.value !== 'all' && selectedTempleTenant) {
      const params = {
        entityId: selectedTempleTenant,           // helps service fill /superadmin/tenants/{tenantId}/...
        entityIds: [selectedTempleTenant],        // preserved for any bulk code paths
        tenantId: selectedTempleTenant,           // extra hint in case service checks this
        dateRange: activeFilter.value,
        format: selectedFormat.value,
        templeId: selectedTemple.value,
        isSuperAdmin: true,
      };
      if (activeStatus.value !== 'all') params.status = activeStatus.value;
      if (activeFilter.value === 'custom') {
        params.startDate = startDate.value;
        params.endDate = endDate.value;
      }
      return params;
    }

    // All temples across selected tenants
    const params = {
      entityIds: tenantIds.value.map(String),
      dateRange: activeFilter.value,
      format: selectedFormat.value,
      templeId: 'all',
      isSuperAdmin: true,
    };
    if (activeStatus.value !== 'all') params.status = activeStatus.value;
    if (activeFilter.value === 'custom') {
      params.startDate = startDate.value;
      params.endDate = endDate.value;
    }
    return params;
  }

  // Single-tenant (either superadmin with one tenant, or tenant user)
  const params = {
    entityId: String(tenantId.value),
    dateRange: activeFilter.value,
    format: selectedFormat.value,
    templeId: selectedTemple.value === 'all' ? 'all' : selectedTemple.value,
    isSuperAdmin,
  };
  if (activeStatus.value !== 'all') params.status = activeStatus.value;
  if (activeFilter.value === 'custom') {
    params.startDate = startDate.value;
    params.endDate = endDate.value;
  }
  return params;
};

const downloadReport = async () => {
  if (isDownloading.value || !isFormValid.value) return;
  clearError();
  isDownloading.value = true;

  try {
    const params = buildReportParams();

    // Ensure templeId reflects dropdown precisely
    if (selectedTemple.value !== 'all') {
      params.templeId = selectedTemple.value;
    }

    // Ensure tenant header for tenant users
    if (!fromSuperadmin.value) {
      params.entityId = String(tenantId.value);
      params.headers = { 'X-Tenant-ID': String(tenantId.value) };
    }

    const validation = ReportsService.validateReportParams({
      ...params,
      type: 'temple-registered'
    });
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const result = await ReportsService.downloadTempleRegisteredReport(params);
    showToast(`Report downloaded successfully: ${result.filename}`, 'success');
  } catch (error) {
    console.error('Download failed:', error);
    let errorMsg = 'Failed to download report. Please try again.';
    if (error.message?.toLowerCase().includes('network error')) {
      errorMsg = 'Network error. Please check your connection and try again.';
    } else if (error.response?.status === 404) {
      errorMsg = 'Report endpoint not found. The report may not be available for this configuration.';
    } else if (error.response?.status === 403) {
      errorMsg = 'You do not have permission to download this report.';
    } else if (error.response?.status === 400) {
      errorMsg = 'Invalid report parameters. Please check your selections.';
    }
    errorMessage.value = errorMsg;
    showToast(`Download failed: ${errorMsg}`, 'error');
  } finally {
    isDownloading.value = false;
  }
};

// Deduplicate by ID
const deduplicateTemplesByID = (temples) => {
  const uniqueTemples = [];
  const seenIds = new Set();
  for (const temple of temples) {
    const templeId = temple.id?.toString();
    if (!templeId) continue;
    if (!seenIds.has(templeId)) {
      seenIds.add(templeId);
      uniqueTemples.push(temple);
    }
  }
  return uniqueTemples;
};

// Store-backed fetch per tenant with fallback
const fetchTemplesForTenant = async (tenantId) => {
  try {
    if (templeStore.clearTemples) templeStore.clearTemples();
    else templeStore.temples = [];

    const originalTenantId = localStorage.getItem('current_tenant_id');
    localStorage.setItem('current_tenant_id', String(tenantId));
    localStorage.setItem('X-Tenant-ID', String(tenantId));

    try {
      await templeStore.fetchDirectByTenant(tenantId); // may try /v1/entities/by-creator and fail 403
      if ((templeStore.temples || []).length === 0) {
        await templeStore.fetchTemples(tenantId); // fallback to /v1/entities?tenant_id=... which succeeds
      }
    } catch {
      await templeStore.fetchTemples(tenantId);
    }

    if (originalTenantId) localStorage.setItem('current_tenant_id', originalTenantId);
    else localStorage.removeItem('current_tenant_id');
    localStorage.removeItem('X-Tenant-ID');

    const templesWithTenantId = (templeStore.temples || []).map(t => ({
      ...t,
      sourceTenantId: String(tenantId),
    }));
    return templesWithTenantId;
  } catch (e) {
    return [];
  }
};

// Direct API fetch with JSON guard
const fetchTemplesDirectly = async (tenantId) => {
  if (!tenantId) return [];
  try {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'X-Tenant-ID': String(tenantId),
    };
    // Use API base to avoid SPA HTML responses in dev
    const url = `/api/v1/entities?tenant_id=${tenantId}&_=${Date.now()}`;
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      return [];
    }
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      // Don’t attempt JSON parse on HTML/text
      return [];
    }
    const data = await response.json();
    let temples = Array.isArray(data) ? data :
                  data.data ? data.data :
                  data.entities ? data.entities :
                  data.items ? data.items : [];
    const filtered = temples
      .filter(t => {
        const createdBy = String(t.created_by || t.createdBy || '');
        const templeTenantId = String(t.tenant_id || t.tenantId || '');
        return createdBy === String(tenantId) || templeTenantId === String(tenantId);
      })
      .map(t => ({ ...t, sourceTenantId: String(tenantId) }));
    return filtered;
  } catch {
    return [];
  }
};

// Lifecycle
onMounted(async () => {
  initializeDates();

  const currentTenantId = tenantIds.value;

  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    let collectedTemples = [];
    for (const tid of tenantIds.value) {
      const viaStore = await fetchTemplesForTenant(tid);
      if (viaStore.length > 0) {
        collectedTemples.push(...viaStore);
        continue;
      }
      const direct = await fetchTemplesDirectly(tid);
      collectedTemples.push(...direct);
    }
    allTemples.value = deduplicateTemplesByID(collectedTemples);
    if (filteredTemples.value.length === 0) {
      errorMessage.value = 'No approved temples found for the selected tenants.';
    }
  } else {
    try {
      if (!currentTenantId) {
        errorMessage.value = 'Could not determine your tenant ID. Please refresh or contact support.';
        return;
      }
      const directResult = await fetchTemplesDirectly(currentTenantId);
      if (directResult.length > 0) {
        templeStore.temples = directResult;
      } else {
        await templeStore.fetchDirectByTenant(currentTenantId);
        if ((templeStore.temples || []).length === 0) {
          await templeStore.fetchTemples(currentTenantId);
        }
      }
      if (filteredTemples.value.length === 0) {
        errorMessage.value = 'Could not load temples for your tenant. Please try again later.';
      }
    } catch {
      errorMessage.value = 'Failed to load temple data. Some features may not work correctly.';
    }
  }
});

// React to tenant multi-select changes
watch(() => route.query.tenants, async () => {
  if (fromSuperadmin.value && tenantIds.value.length > 1) {
    let collectedTemples = [];
    for (const tid of tenantIds.value) {
      const viaStore = await fetchTemplesForTenant(tid);
      if (viaStore.length > 0) {
        collectedTemples.push(...viaStore);
        continue;
      }
      const direct = await fetchTemplesDirectly(tid);
      collectedTemples.push(...direct);
    }
    allTemples.value = deduplicateTemplesByID(collectedTemples);
    errorMessage.value = filteredTemples.value.length === 0
      ? 'No approved temples found for the selected tenants.'
      : '';
    selectedTemple.value = 'all';
  }
});
</script>
