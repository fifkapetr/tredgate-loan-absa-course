import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import LoanForm from '../../src/components/LoanForm.vue'
import * as loanService from '../../src/services/loanService'

// Mock the loanService module
vi.mock('../../src/services/loanService', () => ({
  createLoanApplication: vi.fn()
}))

describe('LoanForm', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(LoanForm)
  })

  describe('Rendering', () => {
    it('renders the form title', () => {
      expect(wrapper.find('h2').text()).toBe('New Loan Application')
    })

    it('renders all required form fields', () => {
      expect(wrapper.find('#applicantName').exists()).toBe(true)
      expect(wrapper.find('#amount').exists()).toBe(true)
      expect(wrapper.find('#termMonths').exists()).toBe(true)
      expect(wrapper.find('#interestRate').exists()).toBe(true)
    })

    it('renders submit button', () => {
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
      expect(submitButton.text()).toBe('Create Application')
    })

    it('renders field labels correctly', () => {
      const labels = wrapper.findAll('label')
      expect(labels.length).toBe(4)
      expect(labels[0].text()).toBe('Applicant Name')
      expect(labels[1].text()).toBe('Loan Amount ($)')
      expect(labels[2].text()).toBe('Term (Months)')
      expect(labels[3].text()).toContain('Interest Rate')
    })
  })

  describe('Form validation', () => {
    it('shows error when applicant name is empty', async () => {
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Applicant name is required')
    })

    it('shows error when amount is empty or zero', async () => {
      await wrapper.find('#applicantName').setValue('John Doe')
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Amount must be greater than 0')
    })

    it('shows error when termMonths is empty or zero', async () => {
      await wrapper.find('#applicantName').setValue('John Doe')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Term months must be greater than 0')
    })

    it('shows error when interest rate is null', async () => {
      await wrapper.find('#applicantName').setValue('John Doe')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('#termMonths').setValue(12)
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Interest rate is required and cannot be negative')
    })

    it('does not show error when all fields are valid', async () => {
      vi.mocked(loanService.createLoanApplication).mockReturnValue({
        id: 'test-id',
        applicantName: 'John Doe',
        amount: 10000,
        termMonths: 12,
        interestRate: 0.05,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      await wrapper.find('#applicantName').setValue('John Doe')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('#termMonths').setValue(12)
      await wrapper.find('#interestRate').setValue(0.05)
      await wrapper.find('form').trigger('submit.prevent')
      
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
  })

  describe('Form submission', () => {
    it('calls createLoanApplication with correct data on valid submission', async () => {
      vi.mocked(loanService.createLoanApplication).mockReturnValue({
        id: 'test-id',
        applicantName: 'Alice Smith',
        amount: 25000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      await wrapper.find('#applicantName').setValue('Alice Smith')
      await wrapper.find('#amount').setValue(25000)
      await wrapper.find('#termMonths').setValue(24)
      await wrapper.find('#interestRate').setValue(0.08)
      await wrapper.find('form').trigger('submit.prevent')

      expect(loanService.createLoanApplication).toHaveBeenCalledWith({
        applicantName: 'Alice Smith',
        amount: 25000,
        termMonths: 24,
        interestRate: 0.08
      })
    })

    it('emits created event on successful submission', async () => {
      vi.mocked(loanService.createLoanApplication).mockReturnValue({
        id: 'test-id',
        applicantName: 'Bob',
        amount: 50000,
        termMonths: 36,
        interestRate: 0.06,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      await wrapper.find('#applicantName').setValue('Bob')
      await wrapper.find('#amount').setValue(50000)
      await wrapper.find('#termMonths').setValue(36)
      await wrapper.find('#interestRate').setValue(0.06)
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.emitted('created')).toBeTruthy()
      expect(wrapper.emitted('created')?.length).toBe(1)
    })

    it('resets form fields after successful submission', async () => {
      vi.mocked(loanService.createLoanApplication).mockReturnValue({
        id: 'test-id',
        applicantName: 'Charlie',
        amount: 15000,
        termMonths: 18,
        interestRate: 0.07,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      const applicantInput = wrapper.find('#applicantName')
      const amountInput = wrapper.find('#amount')
      const termInput = wrapper.find('#termMonths')
      const rateInput = wrapper.find('#interestRate')

      await applicantInput.setValue('Charlie')
      await amountInput.setValue(15000)
      await termInput.setValue(18)
      await rateInput.setValue(0.07)
      await wrapper.find('form').trigger('submit.prevent')

      expect((applicantInput.element as HTMLInputElement).value).toBe('')
      expect((amountInput.element as HTMLInputElement).value).toBe('')
      expect((termInput.element as HTMLInputElement).value).toBe('')
      expect((rateInput.element as HTMLInputElement).value).toBe('')
    })

    it('shows error message when createLoanApplication throws', async () => {
      vi.mocked(loanService.createLoanApplication).mockImplementation(() => {
        throw new Error('Custom error message')
      })

      await wrapper.find('#applicantName').setValue('Test User')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('#termMonths').setValue(12)
      await wrapper.find('#interestRate').setValue(0.05)
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Custom error message')
    })

    it('shows generic error when non-Error is thrown', async () => {
      vi.mocked(loanService.createLoanApplication).mockImplementation(() => {
        throw 'Some string error'
      })

      await wrapper.find('#applicantName').setValue('Test User')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('#termMonths').setValue(12)
      await wrapper.find('#interestRate').setValue(0.05)
      await wrapper.find('form').trigger('submit.prevent')

      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Failed to create loan application')
    })

    it('trims applicant name before submission', async () => {
      vi.mocked(loanService.createLoanApplication).mockReturnValue({
        id: 'test-id',
        applicantName: 'Trimmed Name',
        amount: 10000,
        termMonths: 12,
        interestRate: 0.05,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      await wrapper.find('#applicantName').setValue('  Trimmed Name  ')
      await wrapper.find('#amount').setValue(10000)
      await wrapper.find('#termMonths').setValue(12)
      await wrapper.find('#interestRate').setValue(0.05)
      await wrapper.find('form').trigger('submit.prevent')

      expect(loanService.createLoanApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantName: 'Trimmed Name'
        })
      )
    })
  })
})
