import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAuditLogs,
  saveAuditLogs,
  clearAuditLogs,
  createAuditLogEntry,
  logAudit,
  logLoanCreated,
  logManualStatusChange,
  logAutoDecision,
  logLoanDeleted,
  filterByActionType,
  searchAuditLogs,
  filterAndSearchAuditLogs
} from '../src/services/auditLogService'
import type { AuditLogEntry } from '../src/types/auditLog'
import type { LoanApplication } from '../src/types/loan'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('auditLogService', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getAuditLogs', () => {
    it('returns empty array when nothing is stored', () => {
      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })

    it('returns stored logs', () => {
      const storedLogs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'LOAN_CREATED',
          loanId: 'loan1',
          applicantName: 'John Doe',
          amount: 50000,
          description: 'Loan created'
        }
      ]
      localStorageMock.setItem('tredgate_audit_logs', JSON.stringify(storedLogs))

      const logs = getAuditLogs()
      expect(logs).toEqual(storedLogs)
    })

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorageMock.setItem('tredgate_audit_logs', 'invalid json{{{')

      const logs = getAuditLogs()
      expect(logs).toEqual([])
    })
  })

  describe('saveAuditLogs', () => {
    it('saves logs to localStorage', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'LOAN_CREATED',
          loanId: 'loan1',
          applicantName: 'Jane Doe',
          amount: 75000,
          description: 'Loan created'
        }
      ]

      saveAuditLogs(logs)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tredgate_audit_logs',
        JSON.stringify(logs)
      )
    })
  })

  describe('clearAuditLogs', () => {
    it('removes logs from localStorage', () => {
      localStorageMock.setItem('tredgate_audit_logs', '[]')

      clearAuditLogs()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tredgate_audit_logs')
    })
  })

  describe('createAuditLogEntry', () => {
    it('creates entry with required fields', () => {
      const loan = { id: 'loan1', applicantName: 'Test User', amount: 10000 }
      const entry = createAuditLogEntry('LOAN_CREATED', loan, 'Test description')

      expect(entry.actionType).toBe('LOAN_CREATED')
      expect(entry.loanId).toBe('loan1')
      expect(entry.applicantName).toBe('Test User')
      expect(entry.amount).toBe(10000)
      expect(entry.description).toBe('Test description')
      expect(entry.id).toBeDefined()
      expect(entry.timestamp).toBeDefined()
    })

    it('creates entry with status change fields', () => {
      const loan = { id: 'loan1', applicantName: 'Test User', amount: 10000 }
      const entry = createAuditLogEntry(
        'STATUS_CHANGED_MANUAL',
        loan,
        'Status changed',
        'pending',
        'approved'
      )

      expect(entry.previousStatus).toBe('pending')
      expect(entry.newStatus).toBe('approved')
    })
  })

  describe('logAudit', () => {
    it('appends entry to existing logs', () => {
      const existingLog: AuditLogEntry = {
        id: 'existing',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'LOAN_CREATED',
        loanId: 'loan1',
        applicantName: 'First User',
        amount: 10000,
        description: 'First entry'
      }
      saveAuditLogs([existingLog])

      const newEntry: AuditLogEntry = {
        id: 'new',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'LOAN_DELETED',
        loanId: 'loan2',
        applicantName: 'Second User',
        amount: 20000,
        description: 'Second entry'
      }

      logAudit(newEntry)

      const logs = getAuditLogs()
      expect(logs.length).toBe(2)
      expect(logs[1]).toEqual(newEntry)
    })
  })

  describe('logLoanCreated', () => {
    it('logs loan creation event', () => {
      const loan: LoanApplication = {
        id: 'loan1',
        applicantName: 'John Doe',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      logLoanCreated(loan)

      const logs = getAuditLogs()
      expect(logs.length).toBe(1)
      expect(logs[0]?.actionType).toBe('LOAN_CREATED')
      expect(logs[0]?.loanId).toBe('loan1')
      expect(logs[0]?.applicantName).toBe('John Doe')
      expect(logs[0]?.description).toContain('John Doe')
      expect(logs[0]?.description).toContain('50,000')
    })
  })

  describe('logManualStatusChange', () => {
    it('logs manual status change event', () => {
      const loan = { id: 'loan1', applicantName: 'Jane Doe', amount: 25000 }

      logManualStatusChange(loan, 'pending', 'approved')

      const logs = getAuditLogs()
      expect(logs.length).toBe(1)
      expect(logs[0]?.actionType).toBe('STATUS_CHANGED_MANUAL')
      expect(logs[0]?.previousStatus).toBe('pending')
      expect(logs[0]?.newStatus).toBe('approved')
      expect(logs[0]?.description).toContain('manually changed')
    })
  })

  describe('logAutoDecision', () => {
    it('logs auto-decision event', () => {
      const loan = { id: 'loan1', applicantName: 'Auto User', amount: 30000 }

      logAutoDecision(loan, 'pending', 'rejected')

      const logs = getAuditLogs()
      expect(logs.length).toBe(1)
      expect(logs[0]?.actionType).toBe('STATUS_CHANGED_AUTO')
      expect(logs[0]?.previousStatus).toBe('pending')
      expect(logs[0]?.newStatus).toBe('rejected')
      expect(logs[0]?.description).toContain('auto-decided')
    })
  })

  describe('logLoanDeleted', () => {
    it('logs loan deletion event', () => {
      const loan: LoanApplication = {
        id: 'loan1',
        applicantName: 'Delete User',
        amount: 40000,
        termMonths: 36,
        interestRate: 0.06,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      }

      logLoanDeleted(loan)

      const logs = getAuditLogs()
      expect(logs.length).toBe(1)
      expect(logs[0]?.actionType).toBe('LOAN_DELETED')
      expect(logs[0]?.description).toContain('deleted')
    })
  })

  describe('filterByActionType', () => {
    it('filters logs by action type', () => {
      const logs: AuditLogEntry[] = [
        {
          id: '1',
          timestamp: '2024-01-01T00:00:00.000Z',
          actionType: 'LOAN_CREATED',
          loanId: 'loan1',
          applicantName: 'User 1',
          amount: 10000,
          description: 'Created'
        },
        {
          id: '2',
          timestamp: '2024-01-02T00:00:00.000Z',
          actionType: 'STATUS_CHANGED_MANUAL',
          loanId: 'loan1',
          applicantName: 'User 1',
          amount: 10000,
          description: 'Changed',
          previousStatus: 'pending',
          newStatus: 'approved'
        },
        {
          id: '3',
          timestamp: '2024-01-03T00:00:00.000Z',
          actionType: 'LOAN_CREATED',
          loanId: 'loan2',
          applicantName: 'User 2',
          amount: 20000,
          description: 'Created'
        }
      ]

      const filtered = filterByActionType(logs, 'LOAN_CREATED')

      expect(filtered.length).toBe(2)
      expect(filtered.every(log => log.actionType === 'LOAN_CREATED')).toBe(true)
    })
  })

  describe('searchAuditLogs', () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'LOAN_CREATED',
        loanId: 'abc123',
        applicantName: 'John Smith',
        amount: 10000,
        description: 'Loan created for John Smith'
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'LOAN_CREATED',
        loanId: 'def456',
        applicantName: 'Jane Doe',
        amount: 20000,
        description: 'Loan created for Jane Doe'
      }
    ]

    it('returns all logs when search is empty', () => {
      const result = searchAuditLogs(logs, '')
      expect(result.length).toBe(2)
    })

    it('searches by applicant name', () => {
      const result = searchAuditLogs(logs, 'john')
      expect(result.length).toBe(1)
      expect(result[0]?.applicantName).toBe('John Smith')
    })

    it('searches by loan ID', () => {
      const result = searchAuditLogs(logs, 'def456')
      expect(result.length).toBe(1)
      expect(result[0]?.loanId).toBe('def456')
    })

    it('searches by description', () => {
      const result = searchAuditLogs(logs, 'Jane Doe')
      expect(result.length).toBe(1)
      expect(result[0]?.description).toContain('Jane Doe')
    })

    it('is case insensitive', () => {
      const result = searchAuditLogs(logs, 'JOHN')
      expect(result.length).toBe(1)
    })
  })

  describe('filterAndSearchAuditLogs', () => {
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00.000Z',
        actionType: 'LOAN_CREATED',
        loanId: 'loan1',
        applicantName: 'John Smith',
        amount: 10000,
        description: 'Created'
      },
      {
        id: '2',
        timestamp: '2024-01-02T00:00:00.000Z',
        actionType: 'STATUS_CHANGED_MANUAL',
        loanId: 'loan1',
        applicantName: 'John Smith',
        amount: 10000,
        description: 'Changed',
        previousStatus: 'pending',
        newStatus: 'approved'
      },
      {
        id: '3',
        timestamp: '2024-01-03T00:00:00.000Z',
        actionType: 'LOAN_CREATED',
        loanId: 'loan2',
        applicantName: 'Jane Doe',
        amount: 20000,
        description: 'Created'
      }
    ]

    it('returns all logs when no filters are applied', () => {
      const result = filterAndSearchAuditLogs(logs)
      expect(result.length).toBe(3)
    })

    it('filters by action type only', () => {
      const result = filterAndSearchAuditLogs(logs, 'LOAN_CREATED')
      expect(result.length).toBe(2)
    })

    it('searches only', () => {
      const result = filterAndSearchAuditLogs(logs, undefined, 'Jane')
      expect(result.length).toBe(1)
    })

    it('combines filter and search', () => {
      const result = filterAndSearchAuditLogs(logs, 'LOAN_CREATED', 'John')
      expect(result.length).toBe(1)
      expect(result[0]?.applicantName).toBe('John Smith')
      expect(result[0]?.actionType).toBe('LOAN_CREATED')
    })
  })
})
