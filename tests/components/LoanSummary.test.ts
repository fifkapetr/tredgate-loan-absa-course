import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanSummary from '../../src/components/LoanSummary.vue'
import type { LoanApplication } from '../../src/types/loan'

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

describe('LoanSummary', () => {
  describe('Rendering with no loans', () => {
    it('renders summary cards with zero values', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues.length).toBe(5)
      expect(statValues[0].text()).toBe('0')
      expect(statValues[1].text()).toBe('0')
      expect(statValues[2].text()).toBe('0')
      expect(statValues[3].text()).toBe('0')
      expect(statValues[4].text()).toBe('$0')
    })

    it('renders all stat labels', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statLabels = wrapper.findAll('.stat-label')
      expect(statLabels.length).toBe(5)
      expect(statLabels[0].text()).toBe('Total Applications')
      expect(statLabels[1].text()).toBe('Pending')
      expect(statLabels[2].text()).toBe('Approved')
      expect(statLabels[3].text()).toBe('Rejected')
      expect(statLabels[4].text()).toBe('Total Approved')
    })
  })

  describe('Total applications count', () => {
    it('counts single loan', () => {
      const loans = [createMockLoan()]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('1')
    })

    it('counts multiple loans', () => {
      const loans = [
        createMockLoan({ id: '1' }),
        createMockLoan({ id: '2' }),
        createMockLoan({ id: '3' }),
        createMockLoan({ id: '4' }),
        createMockLoan({ id: '5' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('5')
    })
  })

  describe('Pending loans count', () => {
    it('counts pending loans correctly', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'pending' }),
        createMockLoan({ id: '2', status: 'pending' }),
        createMockLoan({ id: '3', status: 'approved' }),
        createMockLoan({ id: '4', status: 'rejected' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[1].text()).toBe('2')
    })

    it('shows zero when no pending loans', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'approved' }),
        createMockLoan({ id: '2', status: 'rejected' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[1].text()).toBe('0')
    })
  })

  describe('Approved loans count', () => {
    it('counts approved loans correctly', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'approved' }),
        createMockLoan({ id: '2', status: 'approved' }),
        createMockLoan({ id: '3', status: 'approved' }),
        createMockLoan({ id: '4', status: 'pending' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[2].text()).toBe('3')
    })

    it('shows zero when no approved loans', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'pending' }),
        createMockLoan({ id: '2', status: 'rejected' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[2].text()).toBe('0')
    })
  })

  describe('Rejected loans count', () => {
    it('counts rejected loans correctly', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'rejected' }),
        createMockLoan({ id: '2', status: 'rejected' }),
        createMockLoan({ id: '3', status: 'approved' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[3].text()).toBe('2')
    })

    it('shows zero when no rejected loans', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'pending' }),
        createMockLoan({ id: '2', status: 'approved' })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[3].text()).toBe('0')
    })
  })

  describe('Total approved amount', () => {
    it('calculates total approved amount correctly', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'approved', amount: 50000 }),
        createMockLoan({ id: '2', status: 'approved', amount: 75000 }),
        createMockLoan({ id: '3', status: 'pending', amount: 100000 }),
        createMockLoan({ id: '4', status: 'rejected', amount: 25000 })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      // 50000 + 75000 = 125000
      expect(statValues[4].text()).toBe('$125,000')
    })

    it('shows $0 when no approved loans', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'pending', amount: 50000 }),
        createMockLoan({ id: '2', status: 'rejected', amount: 75000 })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      expect(statValues[4].text()).toBe('$0')
    })

    it('handles large approved amounts', () => {
      const loans = [
        createMockLoan({ id: '1', status: 'approved', amount: 1000000 }),
        createMockLoan({ id: '2', status: 'approved', amount: 2500000 })
      ]
      const wrapper = mount(LoanSummary, {
        props: { loans }
      })

      const statValues = wrapper.findAll('.stat-value')
      // 1000000 + 2500000 = 3500000
      expect(statValues[4].text()).toBe('$3,500,000')
    })
  })

  describe('Card styling', () => {
    it('applies pending class to pending stat card', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards[1].classes()).toContain('pending')
    })

    it('applies approved class to approved stat card', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards[2].classes()).toContain('approved')
    })

    it('applies rejected class to rejected stat card', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards[3].classes()).toContain('rejected')
    })

    it('applies amount class to total approved stat card', () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      const statCards = wrapper.findAll('.stat-card')
      expect(statCards[4].classes()).toContain('amount')
    })
  })

  describe('Reactivity', () => {
    it('updates stats when loans prop changes', async () => {
      const wrapper = mount(LoanSummary, {
        props: { loans: [] }
      })

      let statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('0')

      await wrapper.setProps({
        loans: [
          createMockLoan({ id: '1', status: 'pending' }),
          createMockLoan({ id: '2', status: 'approved', amount: 50000 })
        ]
      })

      statValues = wrapper.findAll('.stat-value')
      expect(statValues[0].text()).toBe('2')
      expect(statValues[1].text()).toBe('1')
      expect(statValues[2].text()).toBe('1')
      expect(statValues[4].text()).toBe('$50,000')
    })
  })
})
