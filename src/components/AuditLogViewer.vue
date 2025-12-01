<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AuditLogEntry, AuditActionType } from '../types/auditLog'
import { getAuditLogs, filterAndSearchAuditLogs } from '../services/auditLogService'

const allLogs = ref<AuditLogEntry[]>([])
const searchText = ref('')
const selectedActionType = ref<AuditActionType | ''>('')

const actionTypes: { value: AuditActionType | '', label: string }[] = [
  { value: '', label: 'All Actions' },
  { value: 'LOAN_CREATED', label: 'Loan Created' },
  { value: 'STATUS_CHANGED_MANUAL', label: 'Manual Status Change' },
  { value: 'STATUS_CHANGED_AUTO', label: 'Auto-Decision' },
  { value: 'LOAN_DELETED', label: 'Loan Deleted' }
]

const filteredLogs = computed(() => {
  return filterAndSearchAuditLogs(
    allLogs.value,
    selectedActionType.value || undefined,
    searchText.value || undefined
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

function refreshLogs() {
  allLogs.value = getAuditLogs()
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatActionType(actionType: AuditActionType): string {
  const mapping: Record<AuditActionType, string> = {
    'LOAN_CREATED': 'Created',
    'STATUS_CHANGED_MANUAL': 'Manual Change',
    'STATUS_CHANGED_AUTO': 'Auto-Decision',
    'LOAN_DELETED': 'Deleted'
  }
  return mapping[actionType]
}

function getActionTypeClass(actionType: AuditActionType): string {
  const mapping: Record<AuditActionType, string> = {
    'LOAN_CREATED': 'action-created',
    'STATUS_CHANGED_MANUAL': 'action-manual',
    'STATUS_CHANGED_AUTO': 'action-auto',
    'LOAN_DELETED': 'action-deleted'
  }
  return mapping[actionType]
}

onMounted(() => {
  refreshLogs()
})

defineExpose({ refreshLogs })
</script>

<template>
  <div class="audit-log-viewer card">
    <h2>Audit Log</h2>
    
    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchText"
          type="text"
          placeholder="Search by applicant, loan ID, or description..."
          class="search-input"
        />
      </div>
      <div class="action-filter">
        <select v-model="selectedActionType" class="action-select">
          <option v-for="action in actionTypes" :key="action.value" :value="action.value">
            {{ action.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="filteredLogs.length === 0" class="empty-state">
      <p v-if="allLogs.length === 0">No audit log entries yet. Actions will be logged here.</p>
      <p v-else>No matching audit log entries found.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Loan ID</th>
            <th>Applicant</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td class="timestamp-cell">{{ formatDate(log.timestamp) }}</td>
            <td>
              <span :class="['action-badge', getActionTypeClass(log.actionType)]">
                {{ formatActionType(log.actionType) }}
              </span>
            </td>
            <td class="loan-id-cell">{{ log.loanId.substring(0, 8) }}...</td>
            <td>{{ log.applicantName }}</td>
            <td class="description-cell">{{ log.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.audit-log-viewer {
  width: 100%;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
}

.action-filter {
  flex-shrink: 0;
  min-width: 200px;
}

.action-select {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
}

.timestamp-cell {
  white-space: nowrap;
  font-size: 0.875rem;
}

.loan-id-cell {
  font-family: monospace;
  font-size: 0.875rem;
}

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.action-created {
  background-color: #d4edda;
  color: #155724;
}

.action-manual {
  background-color: #cce5ff;
  color: #004085;
}

.action-auto {
  background-color: #fff3cd;
  color: #856404;
}

.action-deleted {
  background-color: #f8d7da;
  color: #721c24;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .action-filter {
    width: 100%;
  }
}
</style>
