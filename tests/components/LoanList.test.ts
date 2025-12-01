import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanList from '../../src/components/LoanList.vue'
import type { LoanApplication } from '../../src/types/loan'

// Mock the calculateMonthlyPayment function
vi.mock('../../src/services/loanService', () => ({
  calculateMonthlyPayment: vi.fn((loan: LoanApplication) => {
    const total = loan.amount * (1 + loan.interestRate)
    return total / loan.termMonths
  })
}))

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

describe('LoanList', () => {
  describe('Rendering with no loans', () => {
    it('renders empty state when no loans', () => {
      const wrapper = mount(LoanList, {
        props: { loans: [] }
      })

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state p').text()).toBe('No loan applications yet. Create one using the form.')
    })

    it('does not render table when no loans', () => {
      const wrapper = mount(LoanList, {
        props: { loans: [] }
      })

      expect(wrapper.find('table').exists()).toBe(false)
    })
  })

  describe('Rendering with loans', () => {
    it('renders table when loans exist', () => {
      const loans = [createMockLoan()]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })

    it('renders correct table headers', () => {
      const loans = [createMockLoan()]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(8)
      expect(headers[0].text()).toBe('Applicant')
      expect(headers[1].text()).toBe('Amount')
      expect(headers[2].text()).toBe('Term')
      expect(headers[3].text()).toBe('Rate')
      expect(headers[4].text()).toBe('Monthly Payment')
      expect(headers[5].text()).toBe('Status')
      expect(headers[6].text()).toBe('Created')
      expect(headers[7].text()).toBe('Actions')
    })

    it('renders loan data correctly', () => {
      const loans = [createMockLoan({
        applicantName: 'Alice Smith',
        amount: 75000,
        termMonths: 36,
        interestRate: 0.10
      })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const cells = wrapper.findAll('tbody td')
      expect(cells[0].text()).toBe('Alice Smith')
      expect(cells[1].text()).toBe('$75,000.00')
      expect(cells[2].text()).toBe('36 mo')
      expect(cells[3].text()).toBe('10.0%')
    })

    it('renders multiple loans', () => {
      const loans = [
        createMockLoan({ id: '1', applicantName: 'User One' }),
        createMockLoan({ id: '2', applicantName: 'User Two' }),
        createMockLoan({ id: '3', applicantName: 'User Three' })
      ]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(3)
    })
  })

  describe('Status badges', () => {
    it('renders pending status badge', () => {
      const loans = [createMockLoan({ status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const badge = wrapper.find('.status-badge')
      expect(badge.exists()).toBe(true)
      expect(badge.classes()).toContain('status-pending')
      expect(badge.text()).toBe('pending')
    })

    it('renders approved status badge', () => {
      const loans = [createMockLoan({ status: 'approved' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const badge = wrapper.find('.status-badge')
      expect(badge.classes()).toContain('status-approved')
      expect(badge.text()).toBe('approved')
    })

    it('renders rejected status badge', () => {
      const loans = [createMockLoan({ status: 'rejected' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const badge = wrapper.find('.status-badge')
      expect(badge.classes()).toContain('status-rejected')
      expect(badge.text()).toBe('rejected')
    })
  })

  describe('Action buttons', () => {
    it('shows action buttons for pending loans', () => {
      const loans = [createMockLoan({ status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const actionButtons = wrapper.findAll('.action-btn')
      expect(actionButtons.length).toBe(4) // approve, reject, auto-decide, delete
    })

    it('shows approve button with checkmark', () => {
      const loans = [createMockLoan({ status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const approveBtn = wrapper.find('.action-btn.success')
      expect(approveBtn.exists()).toBe(true)
      expect(approveBtn.text()).toBe('✓')
      expect(approveBtn.attributes('title')).toBe('Approve')
    })

    it('shows reject button with X', () => {
      const loans = [createMockLoan({ status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const rejectBtn = wrapper.find('.action-btn.danger')
      expect(rejectBtn.exists()).toBe(true)
      expect(rejectBtn.text()).toBe('✗')
      expect(rejectBtn.attributes('title')).toBe('Reject')
    })

    it('shows auto-decide button', () => {
      const loans = [createMockLoan({ status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const autoDecideBtn = wrapper.find('.action-btn.secondary')
      expect(autoDecideBtn.exists()).toBe(true)
      expect(autoDecideBtn.text()).toBe('⚡')
      expect(autoDecideBtn.attributes('title')).toBe('Auto-decide')
    })

    it('does not show action buttons for approved loans', () => {
      const loans = [createMockLoan({ status: 'approved' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const actionButtons = wrapper.findAll('.action-btn')
      expect(actionButtons.length).toBe(0)
      expect(wrapper.find('.no-actions').exists()).toBe(true)
    })

    it('does not show action buttons for rejected loans', () => {
      const loans = [createMockLoan({ status: 'rejected' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const actionButtons = wrapper.findAll('.action-btn')
      expect(actionButtons.length).toBe(0)
      expect(wrapper.find('.no-actions').exists()).toBe(true)
    })
  })

  describe('Events', () => {
    it('emits approve event when approve button is clicked', async () => {
      const loans = [createMockLoan({ id: 'loan-123', status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      await wrapper.find('.action-btn.success').trigger('click')

      expect(wrapper.emitted('approve')).toBeTruthy()
      expect(wrapper.emitted('approve')?.[0]).toEqual(['loan-123'])
    })

    it('emits reject event when reject button is clicked', async () => {
      const loans = [createMockLoan({ id: 'loan-456', status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      await wrapper.find('.action-btn.danger').trigger('click')

      expect(wrapper.emitted('reject')).toBeTruthy()
      expect(wrapper.emitted('reject')?.[0]).toEqual(['loan-456'])
    })

    it('emits autoDecide event when auto-decide button is clicked', async () => {
      const loans = [createMockLoan({ id: 'loan-789', status: 'pending' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      await wrapper.find('.action-btn.secondary').trigger('click')

      expect(wrapper.emitted('autoDecide')).toBeTruthy()
      expect(wrapper.emitted('autoDecide')?.[0]).toEqual(['loan-789'])
    })
  })

  describe('Formatting functions', () => {
    it('formats currency correctly', () => {
      const loans = [createMockLoan({ amount: 123456.78 })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const cells = wrapper.findAll('tbody td')
      expect(cells[1].text()).toBe('$123,456.78')
    })

    it('formats percentage correctly', () => {
      const loans = [createMockLoan({ interestRate: 0.075 })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const cells = wrapper.findAll('tbody td')
      expect(cells[3].text()).toBe('7.5%')
    })

    it('formats date correctly', () => {
      const loans = [createMockLoan({ createdAt: '2024-03-25T14:30:00.000Z' })]
      const wrapper = mount(LoanList, {
        props: { loans }
      })

      const cells = wrapper.findAll('tbody td')
      // Date format depends on locale, just check it contains expected parts
      expect(cells[6].text()).toContain('2024')
      expect(cells[6].text()).toContain('25')
    })
  })
})
