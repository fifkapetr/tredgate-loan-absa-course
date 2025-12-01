<script setup lang="ts">
defineProps<{
  applicantName: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-content">
      <div class="modal-header">
        <span class="warning-icon">⚠</span>
        <h3>Delete Loan Application</h3>
      </div>
      <p class="modal-message">
        Are you sure you want to delete the loan application for <strong>{{ applicantName }}</strong>? This action cannot be undone.
      </p>
      <div class="modal-actions">
        <button class="ghost-btn" @click="emit('cancel')">Cancel</button>
        <button class="delete-btn" @click="emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  max-width: 400px;
  width: 90%;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.warning-icon {
  color: var(--danger-color);
  font-size: 1.5rem;
}

.modal-message {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.ghost-btn {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.ghost-btn:hover {
  background-color: var(--hover-background);
  color: var(--text-color);
}

.delete-btn {
  background-color: var(--danger-color);
  color: white;
}

.delete-btn:hover {
  background-color: var(--danger-hover);
}
</style>
