/**
 * Text constants used in E2E tests
 * Centralized text library for maintainability and consistency
 */
export const TEXTS = {
  // Header
  APP_TITLE: 'Tredgate Loan',
  APP_TAGLINE: 'Simple loan application management',

  // Form labels and placeholders
  FORM_TITLE: 'New Loan Application',
  LABEL_APPLICANT_NAME: 'Applicant Name',
  LABEL_LOAN_AMOUNT: 'Loan Amount ($)',
  LABEL_TERM_MONTHS: 'Term (Months)',
  LABEL_INTEREST_RATE: 'Interest Rate (e.g., 0.08 for 8%)',
  PLACEHOLDER_APPLICANT_NAME: 'Enter applicant name',
  PLACEHOLDER_LOAN_AMOUNT: 'Enter loan amount',
  PLACEHOLDER_TERM_MONTHS: 'Enter term in months',
  PLACEHOLDER_INTEREST_RATE: 'Enter interest rate',
  BUTTON_CREATE: 'Create Application',

  // Validation errors
  ERROR_NAME_REQUIRED: 'Applicant name is required',
  ERROR_AMOUNT_REQUIRED: 'Amount must be greater than 0',
  ERROR_TERM_REQUIRED: 'Term months must be greater than 0',
  ERROR_INTEREST_REQUIRED: 'Interest rate is required and cannot be negative',

  // Loan list
  LIST_TITLE: 'Loan Applications',
  EMPTY_STATE: 'No loan applications yet. Create one using the form.',

  // Table headers
  TABLE_APPLICANT: 'Applicant',
  TABLE_AMOUNT: 'Amount',
  TABLE_TERM: 'Term',
  TABLE_RATE: 'Rate',
  TABLE_MONTHLY_PAYMENT: 'Monthly Payment',
  TABLE_STATUS: 'Status',
  TABLE_CREATED: 'Created',
  TABLE_ACTIONS: 'Actions',

  // Status labels
  STATUS_PENDING: 'pending',
  STATUS_APPROVED: 'approved',
  STATUS_REJECTED: 'rejected',

  // Summary labels
  SUMMARY_TOTAL: 'Total Applications',
  SUMMARY_PENDING: 'Pending',
  SUMMARY_APPROVED: 'Approved',
  SUMMARY_REJECTED: 'Rejected',
  SUMMARY_TOTAL_APPROVED: 'Total Approved',

  // Delete modal
  MODAL_DELETE_TITLE: 'Delete Loan Application',
  MODAL_DELETE_MESSAGE_PREFIX: 'Are you sure you want to delete the loan application for',
  MODAL_DELETE_MESSAGE_SUFFIX: '? This action cannot be undone.',
  BUTTON_CANCEL: 'Cancel',
  BUTTON_DELETE: 'Delete',
} as const;

/**
 * Test data constants for creating loan applications
 */
export const TEST_DATA = {
  // Valid loan data that will be auto-approved (amount <= 100000 AND termMonths <= 60)
  VALID_LOAN_APPROVED: {
    applicantName: 'John Doe',
    amount: '50000',
    termMonths: '24',
    interestRate: '0.08',
  },
  // Valid loan data that will be auto-rejected (amount > 100000 OR termMonths > 60)
  VALID_LOAN_REJECTED: {
    applicantName: 'Jane Smith',
    amount: '150000',
    termMonths: '72',
    interestRate: '0.05',
  },
  // Simple test loan
  SIMPLE_LOAN: {
    applicantName: 'Test User',
    amount: '10000',
    termMonths: '12',
    interestRate: '0.1',
  },
} as const;
