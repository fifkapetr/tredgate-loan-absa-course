import type { LoanStatus } from './loan'

/**
 * Types of audit events that can be logged
 */
export type AuditActionType = 
  | 'LOAN_CREATED'
  | 'STATUS_CHANGED_MANUAL'
  | 'STATUS_CHANGED_AUTO'
  | 'LOAN_DELETED'

/**
 * Represents a single audit log entry
 */
export interface AuditLogEntry {
  id: string
  timestamp: string        // ISO timestamp
  actionType: AuditActionType
  loanId: string
  applicantName: string
  amount: number
  previousStatus?: LoanStatus
  newStatus?: LoanStatus
  description: string
}
