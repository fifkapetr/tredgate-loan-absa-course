import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import type { LoanApplication } from '../src/types/loan'

// Mock the loanService module
vi.mock('../src/services/loanService', () => ({
  getLoans: vi.fn(() => []),
  updateLoanStatus: vi.fn(),
  autoDecideLoan: vi.fn(),
  calculateMonthlyPayment: vi.fn((loan: LoanApplication) => {
    const total = loan.amount * (1 + loan.interestRate)
    return total / loan.termMonths
  })
}))

// Import after mocking
import * as loanService from '../src/services/loanService'

const createMockLoan = (overrides: Partial<LoanApplication> = {}): LoanApplication => ({
  id: 'test-id',
  applicantName: 'John Doe',
  amount: 50000,
  termMonths: 24,
  interestRate: 0.08,
  status: 'pending',
  createdAt: '2024-01-15T10:30:00.000Z',
  ...overrides
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(loanService.getLoans).mockReturnValue([])
  })

  describe('Rendering', () => {
    it('renders the app header with logo', () => {
      const wrapper = mount(App)
      
      expect(wrapper.find('.app-header').exists()).toBe(true)
      expect(wrapper.find('.logo').exists()).toBe(true)
    })

    it('renders the app title', () => {
      const wrapper = mount(App)
      
      expect(wrapper.find('h1').text()).toBe('Tredgate Loan')
    })

    it('renders the tagline', () => {
      const wrapper = mount(App)
      
      expect(wrapper.find('.tagline').text()).toBe('Simple loan application management')
    })

    it('renders LoanSummary component', () => {
      const wrapper = mount(App)
      
      expect(wrapper.findComponent({ name: 'LoanSummary' }).exists()).toBe(true)
    })

    it('renders LoanForm component', () => {
      const wrapper = mount(App)
      
      expect(wrapper.findComponent({ name: 'LoanForm' }).exists()).toBe(true)
    })

    it('renders LoanList component', () => {
      const wrapper = mount(App)
      
      expect(wrapper.findComponent({ name: 'LoanList' }).exists()).toBe(true)
    })
  })

  describe('Loading loans on mount', () => {
    it('calls getLoans on mount', () => {
      mount(App)
      
      expect(loanService.getLoans).toHaveBeenCalled()
    })

    it('passes loans to LoanSummary', async () => {
      const mockLoans = [
        createMockLoan({ id: '1' }),
        createMockLoan({ id: '2' })
      ]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      await wrapper.vm.$nextTick()
      const loanSummary = wrapper.findComponent({ name: 'LoanSummary' })
      
      expect(loanSummary.props('loans')).toEqual(mockLoans)
    })

    it('passes loans to LoanList', async () => {
      const mockLoans = [createMockLoan()]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      await wrapper.vm.$nextTick()
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      expect(loanList.props('loans')).toEqual(mockLoans)
    })
  })

  describe('Approve action', () => {
    it('calls updateLoanStatus with approved status', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-to-approve', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      await loanList.vm.$emit('approve', 'loan-to-approve')
      
      expect(loanService.updateLoanStatus).toHaveBeenCalledWith('loan-to-approve', 'approved')
    })

    it('refreshes loans after approve', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-1', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      // Clear the initial call
      vi.mocked(loanService.getLoans).mockClear()
      
      await loanList.vm.$emit('approve', 'loan-1')
      
      expect(loanService.getLoans).toHaveBeenCalled()
    })
  })

  describe('Reject action', () => {
    it('calls updateLoanStatus with rejected status', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-to-reject', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      await loanList.vm.$emit('reject', 'loan-to-reject')
      
      expect(loanService.updateLoanStatus).toHaveBeenCalledWith('loan-to-reject', 'rejected')
    })

    it('refreshes loans after reject', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-1', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      // Clear the initial call
      vi.mocked(loanService.getLoans).mockClear()
      
      await loanList.vm.$emit('reject', 'loan-1')
      
      expect(loanService.getLoans).toHaveBeenCalled()
    })
  })

  describe('Auto-decide action', () => {
    it('calls autoDecideLoan with loan id', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-to-auto', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      await loanList.vm.$emit('autoDecide', 'loan-to-auto')
      
      expect(loanService.autoDecideLoan).toHaveBeenCalledWith('loan-to-auto')
    })

    it('refreshes loans after auto-decide', async () => {
      const mockLoans = [createMockLoan({ id: 'loan-1', status: 'pending' })]
      vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)
      
      const wrapper = mount(App)
      const loanList = wrapper.findComponent({ name: 'LoanList' })
      
      // Clear the initial call
      vi.mocked(loanService.getLoans).mockClear()
      
      await loanList.vm.$emit('autoDecide', 'loan-1')
      
      expect(loanService.getLoans).toHaveBeenCalled()
    })
  })

  describe('Created event', () => {
    it('refreshes loans when LoanForm emits created event', async () => {
      const wrapper = mount(App)
      const loanForm = wrapper.findComponent({ name: 'LoanForm' })
      
      // Clear the initial call
      vi.mocked(loanService.getLoans).mockClear()
      
      await loanForm.vm.$emit('created')
      
      expect(loanService.getLoans).toHaveBeenCalled()
    })
  })
})
