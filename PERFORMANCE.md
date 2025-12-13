# Performance Optimization Guide - Career Cockpit

## Overview

This guide covers performance optimization strategies for both frontend and backend.

---

## Frontend Performance

### 1. Bundle Size Optimization

#### Analyze Bundle Size

```bash
cd client

# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json scripts
"analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"

# Run analysis
npm run analyze
```

#### Code Splitting

```typescript
// Use React.lazy for route-based code splitting
import { lazy, Suspense } from 'react';

// Instead of:
// import JobDetailPage from './pages/JobDetailPage';

// Use:
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SharePage = lazy(() => import('./pages/SharePage'));
const AiSettingsPage = lazy(() => import('./pages/AiSettingsPage'));

// Wrap routes with Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/jobs/:id" element={<JobDetailPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    ...
  </Routes>
</Suspense>
```

#### Tree Shaking

```typescript
// Bad - imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// Good - imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);

// Or use lodash-es for better tree shaking
import { debounce } from 'lodash-es';
```

#### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove unused
npm uninstall unused-package
```

---

### 2. React Performance

#### Memoization

```typescript
// Memoize expensive components
import { memo, useMemo, useCallback } from 'react';

// Memoize component to prevent unnecessary re-renders
const JobCard = memo(function JobCard({ job, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(job.id)}>
      {job.title}
    </div>
  );
});

// Memoize expensive calculations
const FitAnalysis = ({ jobs }: Props) => {
  const averageScore = useMemo(() => {
    return jobs.reduce((sum, job) => sum + (job.aiAnalysis?.matchScore || 0), 0) / jobs.length;
  }, [jobs]);

  return <div>Average: {averageScore}%</div>;
};

// Memoize callbacks to prevent child re-renders
const JobsPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onSelect={handleSelect} />
      ))}
    </div>
  );
};
```

#### Virtualization for Long Lists

```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

const JobsList = ({ jobs }: { jobs: Job[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <JobCard job={jobs[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={jobs.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### Debounce User Input

```typescript
import { useDeferredValue, useState } from 'react';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs..."
      />
      <SearchResults query={deferredQuery} />
    </>
  );
};

// Or use custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### 3. API Optimization

#### Request Caching

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Usage
const jobs = await cachedFetch('jobs-page-1', () => careerCockpitService.getJobs(1));
```

#### Request Deduplication

```typescript
const pendingRequests = new Map<string, Promise<any>>();

async function deduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}
```

#### Optimistic Updates

```typescript
const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  const updateJobStatus = async (jobId: number, newStatus: string) => {
    // Optimistically update UI
    queryClient.setQueryData(['job', jobId], (old: Job) => ({
      ...old,
      status: newStatus,
    }));

    try {
      await careerCockpitService.updateJobStatus(jobId, newStatus);
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries(['job', jobId]);
      throw error;
    }
  };

  return { updateJobStatus };
};
```

---

### 4. Image Optimization

#### Lazy Loading Images

```typescript
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
};
```

#### Use WebP Format

```typescript
const OptimizedImage = ({ src, alt }: Props) => {
  const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={src} alt={alt} loading="lazy" />
    </picture>
  );
};
```

---

### 5. CSS Optimization

#### Purge Unused CSS (Tailwind)

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // This automatically purges unused styles in production
};
```

#### Critical CSS

```bash
# Install critical CSS extractor
npm install --save-dev critical

# Extract and inline critical CSS
npx critical build/index.html --inline --base build/
```

---

### 6. Build Optimization

#### Production Build Settings

```json
// package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx source-map-explorer 'build/static/js/*.js'"
  }
}
```

#### Compression

```bash
# Install compression plugins
npm install --save-dev compression-webpack-plugin

# Add to webpack config (if ejected)
new CompressionPlugin({
  algorithm: 'gzip',
  test: /\.(js|css|html|svg)$/,
  threshold: 8192,
  minRatio: 0.8,
})
```

---

## Backend Performance

### 1. Database Optimization

#### Indexing

```csharp
// Add indexes in OnModelCreating
modelBuilder.Entity<Job>()
    .HasIndex(j => j.UserId)
    .HasDatabaseName("IX_Jobs_UserId");

modelBuilder.Entity<Job>()
    .HasIndex(j => j.Status)
    .HasDatabaseName("IX_Jobs_Status");

modelBuilder.Entity<Job>()
    .HasIndex(j => new { j.UserId, j.Status })
    .HasDatabaseName("IX_Jobs_UserId_Status");

modelBuilder.Entity<Job>()
    .HasIndex(j => j.CreatedAt)
    .HasDatabaseName("IX_Jobs_CreatedAt");
```

#### Query Optimization

```csharp
// Bad - N+1 query problem
var jobs = await _context.Jobs.ToListAsync();
foreach (var job in jobs)
{
    var assets = await _context.Assets.Where(a => a.JobId == job.Id).ToListAsync();
}

// Good - eager loading
var jobs = await _context.Jobs
    .Include(j => j.Assets)
    .Include(j => j.AiAnalysis)
    .ToListAsync();

// Better - select only needed fields
var jobs = await _context.Jobs
    .Select(j => new JobSummaryDto
    {
        Id = j.Id,
        Title = j.Title,
        CompanyName = j.CompanyName,
        Status = j.Status,
        MatchScore = j.AiAnalysis != null ? j.AiAnalysis.MatchScore : 0
    })
    .ToListAsync();
```

#### Pagination

```csharp
// Always paginate large result sets
public async Task<PagedResult<Job>> GetJobs(int page, int pageSize)
{
    var query = _context.Jobs.AsQueryable();
    
    var total = await query.CountAsync();
    
    var items = await query
        .OrderByDescending(j => j.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResult<Job>
    {
        Items = items,
        Total = total,
        Page = page,
        PageSize = pageSize
    };
}
```

#### AsNoTracking for Read-Only Queries

```csharp
// For read-only queries, skip change tracking
var jobs = await _context.Jobs
    .AsNoTracking()
    .Where(j => j.UserId == userId)
    .ToListAsync();
```

---

### 2. Caching

#### In-Memory Cache

```csharp
// Program.cs
builder.Services.AddMemoryCache();

// Controller
public class JobsController : ControllerBase
{
    private readonly IMemoryCache _cache;
    
    public async Task<ActionResult<List<Job>>> GetJobs()
    {
        var cacheKey = $"jobs_{userId}";
        
        if (!_cache.TryGetValue(cacheKey, out List<Job> jobs))
        {
            jobs = await _context.Jobs
                .Where(j => j.UserId == userId)
                .ToListAsync();
            
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(30));
            
            _cache.Set(cacheKey, jobs, cacheOptions);
        }
        
        return Ok(jobs);
    }
}
```

#### Distributed Cache (Redis)

```csharp
// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "CareerCockpit_";
});

// Service
public class CacheService
{
    private readonly IDistributedCache _cache;
    
    public async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan expiration)
    {
        var cached = await _cache.GetStringAsync(key);
        
        if (cached != null)
        {
            return JsonSerializer.Deserialize<T>(cached);
        }
        
        var value = await factory();
        
        await _cache.SetStringAsync(key, JsonSerializer.Serialize(value), new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration
        });
        
        return value;
    }
}
```

---

### 3. Response Compression

```csharp
// Program.cs
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

// After app.Build()
app.UseResponseCompression();
```

---

### 4. Async Best Practices

```csharp
// Use async/await properly
public async Task<ActionResult<Job>> GetJob(int id)
{
    // Good - truly async
    var job = await _context.Jobs.FindAsync(id);
    
    // Bad - blocks thread
    // var job = _context.Jobs.Find(id);
    
    return Ok(job);
}

// Parallel async operations
public async Task<DashboardDto> GetDashboard()
{
    var jobsTask = _context.Jobs.CountAsync();
    var appliedTask = _context.Jobs.CountAsync(j => j.Status == "Applied");
    var interviewTask = _context.Jobs.CountAsync(j => j.Status == "Interview");
    
    await Task.WhenAll(jobsTask, appliedTask, interviewTask);
    
    return new DashboardDto
    {
        TotalJobs = await jobsTask,
        AppliedCount = await appliedTask,
        InterviewCount = await interviewTask
    };
}
```

---

### 5. Connection Pooling

```csharp
// appsettings.json - PostgreSQL
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=careercockpit;Username=user;Password=pass;Pooling=true;MinPoolSize=5;MaxPoolSize=100"
  }
}
```

---

### 6. Rate Limiting

```csharp
// Already implemented in RateLimitingMiddleware.cs
// Configure limits in appsettings.json
{
  "RateLimiting": {
    "PermitLimit": 100,
    "Window": 60,
    "QueueLimit": 10
  }
}
```

---

## Monitoring & Profiling

### Frontend Profiling

```typescript
// React DevTools Profiler
// 1. Install React DevTools browser extension
// 2. Open DevTools > Profiler tab
// 3. Record interactions
// 4. Analyze component render times

// Web Vitals
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

function reportWebVitals(metric: any) {
  console.log(metric);
  // Send to analytics
}

getCLS(reportWebVitals);
getFID(reportWebVitals);
getLCP(reportWebVitals);
```

### Backend Profiling

```csharp
// Add MiniProfiler
builder.Services.AddMiniProfiler(options =>
{
    options.RouteBasePath = "/profiler";
}).AddEntityFramework();

// View at /profiler/results-index
```

### Logging Performance

```csharp
// Log slow queries
public class SlowQueryLogger : IInterceptor
{
    public async ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(...)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = await next();
        stopwatch.Stop();
        
        if (stopwatch.ElapsedMilliseconds > 500)
        {
            _logger.LogWarning("Slow query ({ms}ms): {sql}", 
                stopwatch.ElapsedMilliseconds, command.CommandText);
        }
        
        return result;
    }
}
```

---

## Performance Checklist

### Frontend
- [ ] Bundle size < 200KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Code splitting implemented
- [ ] Images lazy loaded
- [ ] API calls cached
- [ ] Memoization used for expensive components

### Backend
- [ ] Database indexes created
- [ ] Queries optimized (no N+1)
- [ ] Response compression enabled
- [ ] Caching implemented
- [ ] Connection pooling configured
- [ ] Rate limiting in place
- [ ] Async patterns used correctly

### Infrastructure
- [ ] CDN for static assets
- [ ] Gzip/Brotli compression
- [ ] HTTP/2 enabled
- [ ] Database on SSD
- [ ] Monitoring alerts configured

---

## Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| API Response Time (P50) | < 100ms | < 500ms |
| API Response Time (P99) | < 500ms | < 2s |
| Page Load Time | < 2s | < 5s |
| Time to Interactive | < 3s | < 7s |
| Bundle Size (gzip) | < 200KB | < 500KB |
| Database Query Time | < 50ms | < 200ms |
| Memory Usage | < 512MB | < 1GB |
