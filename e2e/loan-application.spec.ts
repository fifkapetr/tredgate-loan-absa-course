import { test } from '@playwright/test';
import { LoanPage } from './pages/LoanPage';
import { TEST_DATA } from './constants/texts';

test.describe('Tredgate Loan Application - Regression Tests', () => {
  let loanPage: LoanPage;

  test.beforeEach(async ({ page }) => {
    loanPage = new LoanPage(page);
    await loanPage.goto();
    await loanPage.clearStorage();
    await loanPage.goto();
  });

  test.describe('Page Layout', () => {
    test('should display the application header correctly', async () => {
      await loanPage.expectHeaderVisible();
    });

    test('should display the loan form correctly', async () => {
      await loanPage.expectFormVisible();
    });

    test('should display the loan list with empty state', async () => {
      await loanPage.expectLoanListVisible();
      await loanPage.expectEmptyState();
    });

    test('should display summary statistics with zero values initially', async () => {
      await loanPage.expectSummaryStats({
        total: '0',
        pending: '0',
        approved: '0',
        rejected: '0',
      });
    });
  });

  test.describe('Loan Creation', () => {
    test('should create a new loan application successfully', async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
      await loanPage.expectLoanVisible(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.SIMPLE_LOAN.applicantName, 'pending');
      await loanPage.expectFormCleared();
    });

    test('should update summary statistics after creating a loan', async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
      await loanPage.expectSummaryStats({
        total: '1',
        pending: '1',
        approved: '0',
        rejected: '0',
      });
    });

    test('should display action buttons for pending loans', async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
      await loanPage.expectActionButtonsVisible(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should create multiple loan applications', async () => {
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_APPROVED);
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_REJECTED);
      await loanPage.expectLoanCount(2);
      await loanPage.expectSummaryStats({
        total: '2',
        pending: '2',
        approved: '0',
        rejected: '0',
      });
    });
  });

  test.describe('Loan Approval', () => {
    test.beforeEach(async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
    });

    test('should approve a pending loan', async () => {
      await loanPage.approveLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.SIMPLE_LOAN.applicantName, 'approved');
    });

    test('should hide action buttons after approval', async () => {
      await loanPage.approveLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectActionButtonsHidden(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should update summary statistics after approval', async () => {
      await loanPage.approveLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectSummaryStats({
        total: '1',
        pending: '0',
        approved: '1',
        rejected: '0',
      });
    });
  });

  test.describe('Loan Rejection', () => {
    test.beforeEach(async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
    });

    test('should reject a pending loan', async () => {
      await loanPage.rejectLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.SIMPLE_LOAN.applicantName, 'rejected');
    });

    test('should hide action buttons after rejection', async () => {
      await loanPage.rejectLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectActionButtonsHidden(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should update summary statistics after rejection', async () => {
      await loanPage.rejectLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectSummaryStats({
        total: '1',
        pending: '0',
        approved: '0',
        rejected: '1',
      });
    });
  });

  test.describe('Auto-Decide Loan', () => {
    test('should auto-approve a loan meeting criteria (amount <= 100000 AND term <= 60)', async () => {
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_APPROVED);
      await loanPage.autoDecideLoan(TEST_DATA.VALID_LOAN_APPROVED.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.VALID_LOAN_APPROVED.applicantName, 'approved');
    });

    test('should auto-reject a loan not meeting criteria', async () => {
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_REJECTED);
      await loanPage.autoDecideLoan(TEST_DATA.VALID_LOAN_REJECTED.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.VALID_LOAN_REJECTED.applicantName, 'rejected');
    });

    test('should update summary statistics after auto-decide', async () => {
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_APPROVED);
      await loanPage.autoDecideLoan(TEST_DATA.VALID_LOAN_APPROVED.applicantName);
      await loanPage.expectSummaryStats({
        total: '1',
        pending: '0',
        approved: '1',
        rejected: '0',
      });
    });
  });

  test.describe('Loan Deletion', () => {
    test.beforeEach(async () => {
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);
    });

    test('should open delete confirmation modal', async () => {
      await loanPage.openDeleteModal(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectDeleteModalVisible(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should close modal when cancel is clicked', async () => {
      await loanPage.openDeleteModal(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.cancelDelete();
      await loanPage.expectDeleteModalHidden();
      await loanPage.expectLoanVisible(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should delete loan when confirmed', async () => {
      await loanPage.deleteLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectDeleteModalHidden();
      await loanPage.expectLoanNotVisible(TEST_DATA.SIMPLE_LOAN.applicantName);
    });

    test('should update summary statistics after deletion', async () => {
      await loanPage.deleteLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectSummaryStats({
        total: '0',
        pending: '0',
        approved: '0',
        rejected: '0',
      });
    });

    test('should show empty state after deleting last loan', async () => {
      await loanPage.deleteLoan(TEST_DATA.SIMPLE_LOAN.applicantName);
      await loanPage.expectEmptyState();
    });
  });

  test.describe('Combined Workflows', () => {
    test('should handle multiple operations on different loans', async () => {
      // Create multiple loans
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_APPROVED);
      await loanPage.createLoanApplication(TEST_DATA.VALID_LOAN_REJECTED);
      await loanPage.createLoanApplication(TEST_DATA.SIMPLE_LOAN);

      // Verify initial state
      await loanPage.expectLoanCount(3);
      await loanPage.expectSummaryStats({
        total: '3',
        pending: '3',
        approved: '0',
        rejected: '0',
      });

      // Approve one loan
      await loanPage.approveLoan(TEST_DATA.VALID_LOAN_APPROVED.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.VALID_LOAN_APPROVED.applicantName, 'approved');

      // Reject another loan
      await loanPage.rejectLoan(TEST_DATA.VALID_LOAN_REJECTED.applicantName);
      await loanPage.expectLoanStatus(TEST_DATA.VALID_LOAN_REJECTED.applicantName, 'rejected');

      // Verify updated stats
      await loanPage.expectSummaryStats({
        total: '3',
        pending: '1',
        approved: '1',
        rejected: '1',
      });

      // Delete the remaining pending loan
      await loanPage.deleteLoan(TEST_DATA.SIMPLE_LOAN.applicantName);

      // Verify final state
      await loanPage.expectLoanCount(2);
      await loanPage.expectSummaryStats({
        total: '2',
        pending: '0',
        approved: '1',
        rejected: '1',
      });
    });
  });
});
