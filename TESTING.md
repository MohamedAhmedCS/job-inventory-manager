# Testing Guide - Career Cockpit

## Overview

This guide covers testing strategies for both frontend and backend components.

---

## Backend Testing (.NET)

### Setup

```bash
cd server

# Create test project (if not exists)
dotnet new xunit -n server.Tests
dotnet add server.Tests reference server.csproj
dotnet add server.Tests package Moq
dotnet add server.Tests package FluentAssertions
dotnet add server.Tests package Microsoft.EntityFrameworkCore.InMemory
```

### Unit Tests

#### Controller Tests

```csharp
// Tests/Controllers/JobsControllerTests.cs
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using server.Controllers;
using server.Data;
using server.Models;

public class JobsControllerTests
{
    private readonly Mock<AppDbContext> _mockContext;
    private readonly JobsController _controller;

    public JobsControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _mockContext = new Mock<AppDbContext>(options);
        _controller = new JobsController(_mockContext.Object, Mock.Of<ILogger<JobsController>>());
    }

    [Fact]
    public async Task GetJobs_ReturnsOkResult_WithListOfJobs()
    {
        // Arrange
        var jobs = new List<Job>
        {
            new Job { Id = 1, Title = "Software Engineer", CompanyName = "Tech Corp" },
            new Job { Id = 2, Title = "Data Analyst", CompanyName = "Data Inc" }
        };
        
        // Act
        var result = await _controller.GetJobs();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetJob_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        int invalidId = 999;

        // Act
        var result = await _controller.GetJob(invalidId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task CreateJob_WithValidData_ReturnsCreatedResult()
    {
        // Arrange
        var newJob = new CreateJobDto
        {
            Title = "New Position",
            CompanyName = "New Company",
            Description = "Job description"
        };

        // Act
        var result = await _controller.CreateJob(newJob);

        // Assert
        result.Should().BeOfType<CreatedAtActionResult>();
    }
}
```

#### Service Tests

```csharp
// Tests/Services/AiServiceTests.cs
using Xunit;
using Moq;
using server.Services;

public class AiServiceTests
{
    [Fact]
    public async Task AnalyzeJobFit_ReturnsValidAnalysis()
    {
        // Arrange
        var service = new DummyAiService();
        var jobDescription = "Looking for a software engineer with 5 years experience...";
        var profileSummary = "Experienced developer with expertise in...";

        // Act
        var result = await service.AnalyzeJobFit(jobDescription, profileSummary);

        // Assert
        Assert.NotNull(result);
        Assert.InRange(result.MatchScore, 0, 100);
    }

    [Fact]
    public async Task GenerateResume_ReturnsNonEmptyContent()
    {
        // Arrange
        var service = new DummyAiService();

        // Act
        var result = await service.GenerateTailoredResume(1, 1);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Content);
    }
}
```

### Integration Tests

```csharp
// Tests/Integration/ApiIntegrationTests.cs
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using Xunit;

public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Jobs_RequiresAuthentication()
    {
        // Act
        var response = await _client.GetAsync("/api/jobs");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var loginData = new { username = "testuser", password = "password123" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginData);

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotEmpty(result.Token);
    }
}
```

### Running Backend Tests

```bash
cd server.Tests

# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test
dotnet test --filter "FullyQualifiedName~JobsControllerTests"

# Run with verbose output
dotnet test -v detailed
```

---

## Frontend Testing (React)

### Setup

```bash
cd client

# Install testing libraries (already included with CRA)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev msw  # Mock Service Worker for API mocking
```

### Component Tests

```typescript
// src/components/__tests__/FitAnalysis.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FitAnalysis } from '../FitAnalysis';

describe('FitAnalysis', () => {
  const defaultProps = {
    matchScore: 75,
    strengths: 'Strong communication skills',
    gaps: 'Needs more cloud experience',
    highlights: 'Led team of 5 developers',
    skillGaps: 'AWS, Kubernetes',
    isLoading: false,
    onRunAnalysis: jest.fn(),
  };

  it('renders match score correctly', () => {
    render(<FitAnalysis {...defaultProps} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows green color for high scores', () => {
    render(<FitAnalysis {...defaultProps} matchScore={85} />);
    const scoreElement = screen.getByText('85%');
    expect(scoreElement).toHaveClass('text-green-400');
  });

  it('shows yellow color for medium scores', () => {
    render(<FitAnalysis {...defaultProps} matchScore={60} />);
    const scoreElement = screen.getByText('60%');
    expect(scoreElement).toHaveClass('text-yellow-400');
  });

  it('shows red color for low scores', () => {
    render(<FitAnalysis {...defaultProps} matchScore={30} />);
    const scoreElement = screen.getByText('30%');
    expect(scoreElement).toHaveClass('text-red-400');
  });

  it('calls onRunAnalysis when button clicked', () => {
    const mockFn = jest.fn();
    render(<FitAnalysis {...defaultProps} onRunAnalysis={mockFn} />);
    
    fireEvent.click(screen.getByText('Run Analysis'));
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<FitAnalysis {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });
});
```

```typescript
// src/components/__tests__/Toast.test.tsx
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../../context/ToastContext';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Test message', 'success')}>
      Show Toast
    </button>
  );
};

describe('Toast', () => {
  it('shows toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(await screen.findByText('Test message')).toBeInTheDocument();
  });

  it('auto-dismisses after timeout', async () => {
    jest.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    
    jest.useRealTimers();
  });
});
```

### Page Tests

```typescript
// src/pages/__tests__/JobsPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import JobsPage from '../JobsPage';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockJobs = [
  { id: 1, title: 'Software Engineer', companyName: 'Tech Corp', status: 'Applied' },
  { id: 2, title: 'Data Analyst', companyName: 'Data Inc', status: 'Interview' },
];

const server = setupServer(
  rest.get('/api/jobs', (req, res, ctx) => {
    return res(ctx.json({ data: mockJobs, total: 2 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('JobsPage', () => {
  const renderPage = () => {
    return render(
      <BrowserRouter>
        <ToastProvider>
          <JobsPage />
        </ToastProvider>
      </BrowserRouter>
    );
  };

  it('shows loading state initially', () => {
    renderPage();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('displays jobs after loading', async () => {
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Data Analyst')).toBeInTheDocument();
    });
  });

  it('shows empty state when no jobs', async () => {
    server.use(
      rest.get('/api/jobs', (req, res, ctx) => {
        return res(ctx.json({ data: [], total: 0 }));
      })
    );

    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    server.use(
      rest.get('/api/jobs', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderPage();
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

### Service Tests

```typescript
// src/services/__tests__/careerCockpitService.test.ts
import careerCockpitService from '../careerCockpitService';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('careerCockpitService', () => {
  describe('getJobs', () => {
    it('fetches jobs successfully', async () => {
      const mockData = { data: [{ id: 1, title: 'Test Job' }], total: 1 };
      
      server.use(
        rest.get('*/api/jobs', (req, res, ctx) => {
          return res(ctx.json(mockData));
        })
      );

      const result = await careerCockpitService.getJobs();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Job');
    });

    it('handles network errors', async () => {
      server.use(
        rest.get('*/api/jobs', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      await expect(careerCockpitService.getJobs()).rejects.toThrow();
    });
  });

  describe('createJob', () => {
    it('creates job with valid data', async () => {
      const newJob = { title: 'New Job', companyName: 'Company', description: 'Desc' };
      
      server.use(
        rest.post('*/api/jobs', (req, res, ctx) => {
          return res(ctx.json({ id: 1, ...newJob }));
        })
      );

      const result = await careerCockpitService.createJob(newJob);
      expect(result.id).toBe(1);
      expect(result.title).toBe('New Job');
    });
  });
});
```

### Hook Tests

```typescript
// src/hooks/__tests__/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value when available', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });

    expect(localStorage.getItem('key')).toBe(JSON.stringify('updated'));
    expect(result.current[0]).toBe('updated');
  });
});
```

### Running Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- FitAnalysis.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests once (CI mode)
CI=true npm test

# Update snapshots
npm test -- --updateSnapshot
```

---

## End-to-End Testing (Playwright)

### Setup

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install
```

### E2E Tests

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
    
    // Fill login form
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to jobs page
    await expect(page).toHaveURL('/jobs');
    await expect(page.locator('h1')).toContainText('Jobs');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.fill('[name="username"]', 'wronguser');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

```typescript
// e2e/jobs.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Jobs Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/jobs');
  });

  test('can create a new job', async ({ page }) => {
    await page.click('text=Add Job');
    
    await page.fill('[name="title"]', 'Test Engineer');
    await page.fill('[name="companyName"]', 'Test Company');
    await page.fill('[name="description"]', 'Test job description');
    await page.click('button[type="submit"]');
    
    // Should show success toast
    await expect(page.locator('.toast-success')).toBeVisible();
    
    // Job should appear in list
    await expect(page.locator('text=Test Engineer')).toBeVisible();
  });

  test('can filter jobs by status', async ({ page }) => {
    await page.selectOption('[name="status"]', 'Applied');
    
    // Only Applied jobs should be visible
    const jobs = page.locator('.job-card');
    for (const job of await jobs.all()) {
      await expect(job.locator('.status-badge')).toContainText('Applied');
    }
  });

  test('can search jobs', async ({ page }) => {
    await page.fill('[name="search"]', 'Software');
    await page.keyboard.press('Enter');
    
    // Only matching jobs should be visible
    const jobs = page.locator('.job-card');
    for (const job of await jobs.all()) {
      const title = await job.locator('.job-title').textContent();
      expect(title?.toLowerCase()).toContain('software');
    }
  });
});
```

```typescript
// e2e/ai-features.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to job detail
    await page.goto('http://localhost:3000');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.click('.job-card >> nth=0');
  });

  test('can run AI analysis', async ({ page }) => {
    await page.click('text=AI Analysis');
    await page.click('text=Run Analysis');
    
    // Should show loading state
    await expect(page.locator('text=Analyzing...')).toBeVisible();
    
    // Should show results
    await expect(page.locator('.match-score')).toBeVisible({ timeout: 30000 });
  });

  test('can generate cover letter', async ({ page }) => {
    await page.click('text=AI Analysis');
    await page.click('text=Generate Cover Letter');
    
    // Should show loading state
    await expect(page.locator('text=Generating...')).toBeVisible();
    
    // Should show preview
    await expect(page.locator('.asset-preview')).toBeVisible({ timeout: 30000 });
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run specific test file
npx playwright test e2e/login.spec.ts

# Generate test report
npx playwright show-report

# Debug mode
npx playwright test --debug
```

---

## Test Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| Backend Controllers | 80% | - |
| Backend Services | 90% | - |
| Frontend Components | 75% | - |
| Frontend Pages | 70% | - |
| E2E Critical Paths | 100% | - |

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: cd server && dotnet test --collect:"XPlat Code Coverage"
      - uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd client && npm ci
      - run: cd client && npm test -- --coverage --watchAll=false
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd client && npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how
2. **Use Realistic Data**: Mock data should mirror production
3. **Test Error States**: Always test failure scenarios
4. **Keep Tests Fast**: Unit tests < 100ms, E2E < 30s
5. **Isolate Tests**: Each test should be independent
6. **Use Descriptive Names**: Test names should explain the scenario
7. **Don't Test Framework Code**: Focus on your business logic
