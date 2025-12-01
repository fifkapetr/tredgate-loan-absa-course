# Testing Guide

This document describes the testing setup for the Tredgate Loan application.

## Test Framework

The project uses [Vitest](https://vitest.dev/) as the testing framework with the following features:

- Fast test execution with Vite's native ESM support
- Component testing with [@vue/test-utils](https://vue-test-utils.vuejs.org/)
- Code coverage with V8 provider
- HTML test report generation
- jsdom environment for DOM testing

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with HTML report and coverage
npm run test:report
```

### Viewing Reports

After running `npm run test:report`, you can view the HTML report:

```bash
npx vite preview --outDir test-report
```

Then open http://localhost:4173 in your browser.

## Test Structure

Tests are organized by feature:

```
tests/
├── loanService.test.ts        # Service layer tests
├── App.test.ts                # Main App component tests
└── components/
    ├── LoanForm.test.ts       # Form component tests
    ├── LoanList.test.ts       # List component tests
    └── LoanSummary.test.ts    # Summary component tests
```

## Test Coverage

The test suite covers:

### Service Layer (`loanService.ts`)

| Function | Description |
|----------|-------------|
| `getLoans()` | Loading loans from localStorage |
| `saveLoans()` | Persisting loans to localStorage |
| `createLoanApplication()` | Creating new loans with validation |
| `updateLoanStatus()` | Updating loan status |
| `calculateMonthlyPayment()` | Calculating monthly payments |
| `autoDecideLoan()` | Automatic loan approval/rejection |

### Components

| Component | Tests |
|-----------|-------|
| `LoanForm` | Form rendering, validation, submission, error handling |
| `LoanList` | Table rendering, status badges, action buttons, events |
| `LoanSummary` | Statistics calculation, formatting, reactivity |
| `App` | Component integration, event handling, data flow |

## Writing Tests

### Test Conventions

1. **Use descriptive test names**: Describe what behavior is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies**: Use `vi.mock()` for service functions
4. **Test edge cases**: Include tests for error handling and boundary conditions

### Example Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../src/components/MyComponent.vue'

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.find('h1').text()).toBe('Expected Title')
  })

  it('handles user interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

### Mocking localStorage

The test setup includes a mock for localStorage:

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })
```

## CI/CD Integration

Tests run automatically on every pull request to the `main` branch via GitHub Actions:

1. **Linting**: Code style checks
2. **Testing**: Full test suite with coverage
3. **Reporting**: HTML report uploaded as artifact

### Viewing CI Results

1. Go to the Actions tab in GitHub
2. Select the workflow run
3. Download the `test-report` artifact
4. Extract and open `index.html` for test results
5. Open `coverage/index.html` for coverage report

## Configuration

### Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/failing_heal.spec.ts'
    ],
    reporters: ['default', 'html'],
    outputFile: {
      html: './test-report/index.html'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './test-report/coverage',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/main.ts', 'src/assets/**']
    }
  }
})
```

## Troubleshooting

### Common Issues

1. **Tests fail with localStorage errors**: Ensure localStorage mock is set up in test file
2. **Vue component not mounting**: Check that jsdom environment is configured
3. **Coverage report not generating**: Run with `--coverage` flag

### Debugging Tests

```bash
# Run specific test file
npx vitest run tests/loanService.test.ts

# Run tests matching pattern
npx vitest run -t "createLoanApplication"

# Debug mode
npx vitest --inspect-brk
```
