<script setup lang="ts">
import { ref } from 'vue'
import type { LoanApplication } from '../types/loan'
import { calculateMonthlyPayment } from '../services/loanService'
import DeleteModal from './DeleteModal.vue'

defineProps<{
  loans: LoanApplication[]
}>()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string]
  autoDecide: [id: string]
  delete: [id: string]
}>()

const showDeleteModal = ref(false)
const loanToDelete = ref<{ id: string; applicantName: string } | null>(null)

function openDeleteModal(id: string, applicantName: string) {
  loanToDelete.value = { id, applicantName }
  showDeleteModal.value = true
}

function confirmDelete() {
  if (loanToDelete.value) {
    emit('delete', loanToDelete.value.id)
  }
  closeDeleteModal()
}

function closeDeleteModal() {
  showDeleteModal.value = false
  loanToDelete.value = null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="loan-list card">
    <h2>Loan Applications</h2>
    
    <div v-if="loans.length === 0" class="empty-state">
      <p>No loan applications yet. Create one using the form.</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Amount</th>
            <th>Term</th>
            <th>Rate</th>
            <th>Monthly Payment</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in loans" :key="loan.id">
            <td>{{ loan.applicantName }}</td>
            <td>{{ formatCurrency(loan.amount) }}</td>
            <td>{{ loan.termMonths }} mo</td>
            <td>{{ formatPercent(loan.interestRate) }}</td>
            <td>{{ formatCurrency(calculateMonthlyPayment(loan)) }}</td>
            <td>
              <span :class="['status-badge', `status-${loan.status}`]">
                {{ loan.status }}
              </span>
            </td>
            <td>{{ formatDate(loan.createdAt) }}</td>
            <td class="actions">
              <button
                v-if="loan.status === 'pending'"
                class="action-btn success"
                @click="emit('approve', loan.id)"
                title="Approve"
              >
                ✓
              </button>
              <button
                v-if="loan.status === 'pending'"
                class="action-btn danger"
                @click="emit('reject', loan.id)"
                title="Reject"
              >
                ✗
              </button>
              <button
                v-if="loan.status === 'pending'"
                class="action-btn secondary"
                @click="emit('autoDecide', loan.id)"
                title="Auto-decide"
              >
                ⚡
              </button>
              <button
                v-if="loan.status === 'pending'"
                class="action-btn delete-icon-btn"
                @click="openDeleteModal(loan.id, loan.applicantName)"
                title="Delete"
              >
                <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
              </button>
              <span v-if="loan.status !== 'pending'" class="no-actions">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DeleteModal
      v-if="showDeleteModal && loanToDelete"
      :applicant-name="loanToDelete.applicantName"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<style scoped>
.loan-list {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.table-container {
  overflow-x: auto;
}

.actions {
  white-space: nowrap;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-right: 0.25rem;
}

.action-btn:last-child {
  margin-right: 0;
}

.delete-icon-btn {
  background-color: transparent;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.delete-icon-btn:hover {
  color: var(--danger-color);
  background-color: var(--danger-light);
}

.delete-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.no-actions {
  color: var(--text-secondary);
}
</style>
