# Tredgate Loan

A simple loan application management demo built with Vue 3, TypeScript, and Vite.

## Overview

Tredgate Loan is a frontend-only demo application used for training on GitHub Copilot features. It demonstrates a small, realistic frontend project without any backend server or external database.

## Features

- Create loan applications with applicant name, amount, term, and interest rate
- View all loan applications in a table
- Approve or reject loan applications manually
- Auto-decide loans based on simple business rules:
  - Approved if amount ≤ $100,000 AND term ≤ 60 months
  - Rejected otherwise
- Calculate monthly payments
- View summary statistics
- **Audit Log** - Track all loan-related events with search and filter capabilities

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── assets/           # Global CSS styles
├── components/       # Vue components
│   ├── AuditLogViewer.vue  # Audit log display with search/filter
│   ├── DeleteModal.vue     # Confirmation modal for loan deletion
│   ├── LoanForm.vue        # Form to create new loans
│   ├── LoanList.vue        # Table of loan applications
│   └── LoanSummary.vue     # Statistics display
├── services/         # Business logic
│   ├── auditLogService.ts  # Audit log operations
│   └── loanService.ts      # Loan operations
├── types/            # TypeScript definitions
│   ├── auditLog.ts         # Audit log types
│   └── loan.ts             # Loan domain types
├── App.vue           # Main application component
└── main.ts           # Application entry point
tests/
├── auditLogService.test.ts  # Audit log unit tests
├── loanService.test.ts      # Loan service unit tests
└── components/              # Component unit tests
```

## Data Persistence

All data is stored in the browser's localStorage under the key `tredgate_loans`. No backend server or external database is used.

## Audit Log

The application includes an audit log feature that records all significant loan-related events.

### What is Logged

- **Loan Created** - When a new loan application is submitted
- **Manual Status Change** - When a loan is manually approved or rejected
- **Auto-Decision** - When the auto-decide feature is used
- **Loan Deleted** - When a loan application is deleted

Each log entry includes:
- Timestamp
- Action type
- Loan ID
- Applicant name
- Amount
- Previous and new status (for status changes)
- Human-readable description

### Viewing and Filtering Logs

The audit log viewer is located in the main application view below the loan list. It provides:

- **Text Search** - Search by applicant name, loan ID, or description
- **Action Filter** - Filter by specific action types (Created, Manual Change, Auto-Decision, Deleted)

Logs are displayed in reverse chronological order (newest first).

### Storage

Audit logs are stored in localStorage under the key `tredgate_audit_logs`.

## License

MIT
