import type { AuditLogEntry, AuditActionType } from '../types/auditLog'
import type { LoanApplication, LoanStatus } from '../types/loan'

const AUDIT_STORAGE_KEY = 'tredgate_audit_logs'

/**
 * Generate a simple unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

/**
 * Load audit logs from localStorage
 */
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(AUDIT_STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as AuditLogEntry[]
  } catch {
    return []
  }
}

/**
 * Persist audit logs to localStorage
 */
export function saveAuditLogs(logs: AuditLogEntry[]): void {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs))
}

/**
 * Clear all audit logs from localStorage
 */
export function clearAuditLogs(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY)
}

/**
 * Create a new audit log entry (pure function - returns the entry without saving)
 */
export function createAuditLogEntry(
  actionType: AuditActionType,
  loan: Pick<LoanApplication, 'id' | 'applicantName' | 'amount'>,
  description: string,
  previousStatus?: LoanStatus,
  newStatus?: LoanStatus
): AuditLogEntry {
  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    actionType,
    loanId: loan.id,
    applicantName: loan.applicantName,
    amount: loan.amount,
    previousStatus,
    newStatus,
    description
  }
}

/**
 * Log an audit event (side effect - saves to localStorage)
 */
export function logAudit(entry: AuditLogEntry): void {
  const logs = getAuditLogs()
  logs.push(entry)
  saveAuditLogs(logs)
}

/**
 * Log a loan creation event
 */
export function logLoanCreated(loan: LoanApplication): void {
  const entry = createAuditLogEntry(
    'LOAN_CREATED',
    loan,
    `Loan application created for ${loan.applicantName} with amount $${loan.amount.toLocaleString()}`
  )
  logAudit(entry)
}

/**
 * Log a manual status change event
 */
export function logManualStatusChange(
  loan: Pick<LoanApplication, 'id' | 'applicantName' | 'amount'>,
  previousStatus: LoanStatus,
  newStatus: LoanStatus
): void {
  const entry = createAuditLogEntry(
    'STATUS_CHANGED_MANUAL',
    loan,
    `Loan for ${loan.applicantName} manually changed from ${previousStatus} to ${newStatus}`,
    previousStatus,
    newStatus
  )
  logAudit(entry)
}

/**
 * Log an auto-decision event
 */
export function logAutoDecision(
  loan: Pick<LoanApplication, 'id' | 'applicantName' | 'amount'>,
  previousStatus: LoanStatus,
  newStatus: LoanStatus
): void {
  const entry = createAuditLogEntry(
    'STATUS_CHANGED_AUTO',
    loan,
    `Loan for ${loan.applicantName} auto-decided from ${previousStatus} to ${newStatus}`,
    previousStatus,
    newStatus
  )
  logAudit(entry)
}

/**
 * Log a loan deletion event
 */
export function logLoanDeleted(loan: LoanApplication): void {
  const entry = createAuditLogEntry(
    'LOAN_DELETED',
    loan,
    `Loan application for ${loan.applicantName} deleted (was ${loan.status})`
  )
  logAudit(entry)
}

/**
 * Filter audit logs by action type
 */
export function filterByActionType(
  logs: AuditLogEntry[],
  actionType: AuditActionType
): AuditLogEntry[] {
  return logs.filter(log => log.actionType === actionType)
}

/**
 * Search audit logs by text (searches in description, applicant name, and loan ID)
 */
export function searchAuditLogs(
  logs: AuditLogEntry[],
  searchText: string
): AuditLogEntry[] {
  const normalizedSearch = searchText.toLowerCase().trim()
  if (!normalizedSearch) {
    return logs
  }
  return logs.filter(log =>
    log.description.toLowerCase().includes(normalizedSearch) ||
    log.applicantName.toLowerCase().includes(normalizedSearch) ||
    log.loanId.toLowerCase().includes(normalizedSearch)
  )
}

/**
 * Filter and search audit logs combined
 */
export function filterAndSearchAuditLogs(
  logs: AuditLogEntry[],
  actionType?: AuditActionType,
  searchText?: string
): AuditLogEntry[] {
  let filtered = logs

  if (actionType) {
    filtered = filterByActionType(filtered, actionType)
  }

  if (searchText) {
    filtered = searchAuditLogs(filtered, searchText)
  }

  return filtered
}
