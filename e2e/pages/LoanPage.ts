import { expect, Page, Locator, test } from '@playwright/test';
import { TEXTS } from '../constants/texts';

/**
 * Page Object Model for the Tredgate Loan Application
 * Contains all locators, atomic actions, and grouped actions for E2E tests
 */
export class LoanPage {
  readonly page: Page;

  // Header locators
  readonly appTitle: Locator;
  readonly appTagline: Locator;
  readonly logo: Locator;

  // Form locators
  readonly formTitle: Locator;
  readonly applicantNameInput: Locator;
  readonly amountInput: Locator;
  readonly termMonthsInput: Locator;
  readonly interestRateInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  // Loan list locators
  readonly listTitle: Locator;
  readonly emptyState: Locator;
  readonly loanTable: Locator;
  readonly tableRows: Locator;

  // Summary locators
  readonly summaryTotal: Locator;
  readonly summaryPending: Locator;
  readonly summaryApproved: Locator;
  readonly summaryRejected: Locator;
  readonly summaryTotalApproved: Locator;

  // Modal locators
  readonly deleteModal: Locator;
  readonly modalTitle: Locator;
  readonly modalMessage: Locator;
  readonly cancelButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.appTitle = page.getByRole('heading', { name: TEXTS.APP_TITLE });
    this.appTagline = page.getByText(TEXTS.APP_TAGLINE);
    this.logo = page.getByAltText('Tredgate Logo');

    // Form
    this.formTitle = page.getByRole('heading', { name: TEXTS.FORM_TITLE });
    this.applicantNameInput = page.getByLabel(TEXTS.LABEL_APPLICANT_NAME);
    this.amountInput = page.getByLabel(TEXTS.LABEL_LOAN_AMOUNT);
    this.termMonthsInput = page.getByLabel(TEXTS.LABEL_TERM_MONTHS);
    this.interestRateInput = page.getByLabel(TEXTS.LABEL_INTEREST_RATE);
    this.submitButton = page.getByRole('button', { name: TEXTS.BUTTON_CREATE });
    this.errorMessage = page.locator('.error-message');

    // Loan list
    this.listTitle = page.getByRole('heading', { name: TEXTS.LIST_TITLE });
    this.emptyState = page.getByText(TEXTS.EMPTY_STATE);
    this.loanTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');

    // Summary cards - using the stat-label class and text content
    this.summaryTotal = page.locator('.stat-card').filter({ hasText: TEXTS.SUMMARY_TOTAL });
    this.summaryPending = page.locator('.stat-card.pending');
    this.summaryApproved = page.locator('.stat-card.approved');
    this.summaryRejected = page.locator('.stat-card.rejected');
    this.summaryTotalApproved = page.locator('.stat-card.amount');

    // Delete modal
    this.deleteModal = page.locator('.modal-overlay');
    this.modalTitle = page.locator('.modal-header h3');
    this.modalMessage = page.locator('.modal-message');
    this.cancelButton = page.getByRole('button', { name: TEXTS.BUTTON_CANCEL });
    this.confirmDeleteButton = page.locator('.delete-btn');
  }

  // ==================== Atomic Actions ====================

  /**
   * Navigate to the application
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Clear localStorage to reset application state
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Fill the applicant name field
   */
  async fillApplicantName(name: string): Promise<void> {
    await this.applicantNameInput.fill(name);
  }

  /**
   * Fill the loan amount field
   */
  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.fill(amount);
  }

  /**
   * Fill the term months field
   */
  async fillTermMonths(months: string): Promise<void> {
    await this.termMonthsInput.fill(months);
  }

  /**
   * Fill the interest rate field
   */
  async fillInterestRate(rate: string): Promise<void> {
    await this.interestRateInput.fill(rate);
  }

  /**
   * Click the submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Get action buttons for a specific loan row
   */
  getApproveButton(row: Locator): Locator {
    return row.getByRole('button', { name: '✓' });
  }

  getRejectButton(row: Locator): Locator {
    return row.getByRole('button', { name: '✗' });
  }

  getAutoDecideButton(row: Locator): Locator {
    return row.getByRole('button', { name: '⚡' });
  }

  getDeleteButton(row: Locator): Locator {
    return row.locator('.delete-icon-btn');
  }

  /**
   * Get a loan row by applicant name
   */
  getLoanRowByName(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  /**
   * Get the status badge for a loan row
   */
  getStatusBadge(row: Locator): Locator {
    return row.locator('.status-badge');
  }

  /**
   * Get summary card value
   */
  getSummaryValue(card: Locator): Locator {
    return card.locator('.stat-value');
  }

  // ==================== Grouped Actions (with test.step) ====================

  /**
   * Create a new loan application
   */
  async createLoanApplication(data: {
    applicantName: string;
    amount: string;
    termMonths: string;
    interestRate: string;
  }): Promise<void> {
    await test.step(`Create loan application for ${data.applicantName}`, async () => {
      await this.fillApplicantName(data.applicantName);
      await this.fillAmount(data.amount);
      await this.fillTermMonths(data.termMonths);
      await this.fillInterestRate(data.interestRate);
      await this.clickSubmit();
    });
  }

  /**
   * Approve a loan by applicant name
   */
  async approveLoan(applicantName: string): Promise<void> {
    await test.step(`Approve loan for ${applicantName}`, async () => {
      const row = this.getLoanRowByName(applicantName);
      await this.getApproveButton(row).click();
    });
  }

  /**
   * Reject a loan by applicant name
   */
  async rejectLoan(applicantName: string): Promise<void> {
    await test.step(`Reject loan for ${applicantName}`, async () => {
      const row = this.getLoanRowByName(applicantName);
      await this.getRejectButton(row).click();
    });
  }

  /**
   * Auto-decide a loan by applicant name
   */
  async autoDecideLoan(applicantName: string): Promise<void> {
    await test.step(`Auto-decide loan for ${applicantName}`, async () => {
      const row = this.getLoanRowByName(applicantName);
      await this.getAutoDecideButton(row).click();
    });
  }

  /**
   * Open delete modal for a loan by applicant name
   */
  async openDeleteModal(applicantName: string): Promise<void> {
    await test.step(`Open delete modal for ${applicantName}`, async () => {
      const row = this.getLoanRowByName(applicantName);
      await this.getDeleteButton(row).click();
    });
  }

  /**
   * Confirm deletion in the modal
   */
  async confirmDelete(): Promise<void> {
    await test.step('Confirm deletion in modal', async () => {
      await this.confirmDeleteButton.click();
    });
  }

  /**
   * Cancel deletion in the modal
   */
  async cancelDelete(): Promise<void> {
    await test.step('Cancel deletion in modal', async () => {
      await this.cancelButton.click();
    });
  }

  /**
   * Delete a loan by applicant name (full flow)
   */
  async deleteLoan(applicantName: string): Promise<void> {
    await test.step(`Delete loan for ${applicantName}`, async () => {
      await this.openDeleteModal(applicantName);
      await this.confirmDelete();
    });
  }

  // ==================== Assertions ====================

  /**
   * Verify the page header is displayed correctly
   */
  async expectHeaderVisible(): Promise<void> {
    await expect(this.appTitle, 'App title should be visible').toBeVisible();
    await expect(this.appTagline, 'App tagline should be visible').toBeVisible();
    await expect(this.logo, 'Logo should be visible').toBeVisible();
  }

  /**
   * Verify the loan form is displayed correctly
   */
  async expectFormVisible(): Promise<void> {
    await expect(this.formTitle, 'Form title should be visible').toBeVisible();
    await expect(this.applicantNameInput, 'Applicant name input should be visible').toBeVisible();
    await expect(this.amountInput, 'Amount input should be visible').toBeVisible();
    await expect(this.termMonthsInput, 'Term months input should be visible').toBeVisible();
    await expect(this.interestRateInput, 'Interest rate input should be visible').toBeVisible();
    await expect(this.submitButton, 'Submit button should be visible').toBeVisible();
  }

  /**
   * Verify the empty state is displayed
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState, 'Empty state message should be visible when no loans exist').toBeVisible();
  }

  /**
   * Verify the loan list is displayed
   */
  async expectLoanListVisible(): Promise<void> {
    await expect(this.listTitle, 'Loan list title should be visible').toBeVisible();
  }

  /**
   * Verify a loan exists in the table by applicant name
   */
  async expectLoanVisible(applicantName: string): Promise<void> {
    const row = this.getLoanRowByName(applicantName);
    await expect(row, `Loan for ${applicantName} should be visible in the table`).toBeVisible();
  }

  /**
   * Verify a loan does not exist in the table
   */
  async expectLoanNotVisible(applicantName: string): Promise<void> {
    const row = this.getLoanRowByName(applicantName);
    await expect(row, `Loan for ${applicantName} should not be visible in the table`).not.toBeVisible();
  }

  /**
   * Verify the loan has a specific status
   */
  async expectLoanStatus(applicantName: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const row = this.getLoanRowByName(applicantName);
    const statusBadge = this.getStatusBadge(row);
    await expect(statusBadge, `Loan for ${applicantName} should have status: ${status}`).toHaveText(status);
  }

  /**
   * Verify action buttons are visible for a pending loan
   */
  async expectActionButtonsVisible(applicantName: string): Promise<void> {
    const row = this.getLoanRowByName(applicantName);
    await expect(this.getApproveButton(row), `Approve button for ${applicantName} should be visible`).toBeVisible();
    await expect(this.getRejectButton(row), `Reject button for ${applicantName} should be visible`).toBeVisible();
    await expect(this.getAutoDecideButton(row), `Auto-decide button for ${applicantName} should be visible`).toBeVisible();
    await expect(this.getDeleteButton(row), `Delete button for ${applicantName} should be visible`).toBeVisible();
  }

  /**
   * Verify action buttons are hidden for decided loans
   */
  async expectActionButtonsHidden(applicantName: string): Promise<void> {
    const row = this.getLoanRowByName(applicantName);
    await expect(this.getApproveButton(row), `Approve button for ${applicantName} should be hidden`).not.toBeVisible();
    await expect(this.getRejectButton(row), `Reject button for ${applicantName} should be hidden`).not.toBeVisible();
    await expect(this.getAutoDecideButton(row), `Auto-decide button for ${applicantName} should be hidden`).not.toBeVisible();
    await expect(this.getDeleteButton(row), `Delete button for ${applicantName} should be hidden`).not.toBeVisible();
  }

  /**
   * Verify the delete modal is visible
   */
  async expectDeleteModalVisible(applicantName: string): Promise<void> {
    await expect(this.deleteModal, 'Delete modal should be visible').toBeVisible();
    await expect(this.modalTitle, 'Modal title should show "Delete Loan Application"').toHaveText(TEXTS.MODAL_DELETE_TITLE);
    await expect(this.modalMessage, `Modal message should mention ${applicantName}`).toContainText(applicantName);
  }

  /**
   * Verify the delete modal is not visible
   */
  async expectDeleteModalHidden(): Promise<void> {
    await expect(this.deleteModal, 'Delete modal should be hidden').not.toBeVisible();
  }

  /**
   * Verify the form is cleared after submission
   */
  async expectFormCleared(): Promise<void> {
    await expect(this.applicantNameInput, 'Applicant name should be empty after submission').toHaveValue('');
    await expect(this.amountInput, 'Amount should be empty after submission').toHaveValue('');
    await expect(this.termMonthsInput, 'Term months should be empty after submission').toHaveValue('');
    await expect(this.interestRateInput, 'Interest rate should be empty after submission').toHaveValue('');
  }

  /**
   * Verify an error message is displayed
   */
  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage, `Error message "${message}" should be visible`).toHaveText(message);
  }

  /**
   * Verify summary statistics
   */
  async expectSummaryStats(stats: {
    total: string;
    pending: string;
    approved: string;
    rejected: string;
  }): Promise<void> {
    await expect(this.getSummaryValue(this.summaryTotal), `Total should be ${stats.total}`).toHaveText(stats.total);
    await expect(this.getSummaryValue(this.summaryPending), `Pending should be ${stats.pending}`).toHaveText(stats.pending);
    await expect(this.getSummaryValue(this.summaryApproved), `Approved should be ${stats.approved}`).toHaveText(stats.approved);
    await expect(this.getSummaryValue(this.summaryRejected), `Rejected should be ${stats.rejected}`).toHaveText(stats.rejected);
  }

  /**
   * Verify the number of loans in the table
   */
  async expectLoanCount(count: number): Promise<void> {
    await expect(this.tableRows, `There should be ${count} loans in the table`).toHaveCount(count);
  }
}
