# Job Inventory Manager

A modern, full-stack web application for tracking job applications. Built with React, ASP.NET Core, and deployed for free using Railway, Vercel, and Cloudflare.

## 🎯 Features

✅ **User Authentication** - JWT-based login/register
✅ **Job Tracking** - Create, read, update, delete job applications
✅ **Responsive Design** - Beautiful UI with Tailwind CSS
✅ **Rate Limiting** - Built-in API protection (100 req/min)
✅ **Global CDN** - Cloudflare edge caching
✅ **Auto-Deploy** - GitHub Actions CI/CD pipeline
✅ **Zero Cost** - Free tier deployment on Railway + Vercel + Cloudflare

## 🏗️ Architecture

```
Frontend (React 19)          Backend (.NET Core 9)       Database
    ↓                              ↓                         ↓
  Vercel          ←→    Railway         ←→      SQLite/PostgreSQL
  (Free)          JWT Auth              Automatic Blue-green
                  Rate Limiting         Deployments
                  CORS
                       ↓
                  Cloudflare
                  - CDN Caching
                  - DDoS Protection
                  - Security Headers
```

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) 18+
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/MohamedAhmedCS/job-inventory-manager.git
cd job-inventory-manager

# Terminal 1: Start backend (port 5132)
cd server
dotnet restore
dotnet run

# Terminal 2: Start frontend (port 3000)
cd client
npm install
npm start
```

Open http://localhost:3000 and login with:
- **Username**: testuser (min 3 characters)
- **Password**: testpass123 (min 6 characters)

## 📦 Deployment

### Free Deployment (Railway + Vercel)

1. **Create Free Accounts**
   - [Railway](https://railway.app) - Backend hosting
   - [Vercel](https://vercel.com) - Frontend hosting
   - [Cloudflare](https://cloudflare.com) - CDN (optional)

2. **Deploy Backend to Railway**
   ```bash
   # Push code to GitHub
   git push origin main
   
   # Railway automatically deploys when you connect repo
   # Set environment variables in Railway dashboard:
   # - Jwt__Secret=your-secret-key-32-chars-min
   # - Jwt__Issuer=job-inventory-manager
   # - Jwt__Audience=job-inventory-app
   # - ASPNETCORE_ENVIRONMENT=Production
   ```

3. **Deploy Frontend to Vercel**
   ```bash
   # Vercel auto-deploys from GitHub
   # Set environment variable:
   # - REACT_APP_API_BASE=https://your-railway-url/api
   ```

See [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📁 Project Structure

```
job-inventory-manager/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobForm.tsx     # Create/edit job form
│   │   │   └── Login.tsx       # Authentication UI
│   │   ├── services/
│   │   │   └── jobService.ts   # API client with JWT auth
│   │   ├── App.tsx             # Main app with routing
│   │   └── index.tsx           # Entry point
│   ├── package.json            # Dependencies
│   └── tailwind.config.js       # Styling configuration
│
├── server/                      # .NET Core Backend
│   ├── Controllers/
│   │   ├── AuthController.cs   # Login/register endpoints
│   │   └── JobApplicationsController.cs # CRUD endpoints
│   ├── Middleware/
│   │   └── RateLimitingMiddleware.cs    # Rate limiting
│   ├── Models/
│   │   └── JobApplication.cs   # Data model
│   ├── Data/
│   │   └── AppDbContext.cs     # Database context
│   ├── Program.cs              # Configuration
│   ├── Dockerfile              # Container setup
│   └── server.csproj           # Dependencies
│
├── infra/                       # Infrastructure as Code
│   ├── cloudflare-worker.ts    # Cloudflare Worker
│   ├── cloudflare-wrangler.toml# Cloudflare config
│   ├── main.bicep              # Azure Bicep (optional)
│   └── parameters.bicepparam   # Bicep parameters
│
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
│
├── FREE_DEPLOYMENT_GUIDE.md    # Deployment instructions
└── README.md                   # This file
```

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for stateless authentication:

```typescript
// Login
POST /api/auth/login
{ "username": "user", "password": "pass" }
→ { "token": "eyJhbGc...", "expiresIn": 86400 }

// API Request (includes token)
GET /api/jobapplications
Authorization: Bearer eyJhbGc...
```

**Token Details:**
- Generated on login/register
- Valid for 24 hours
- Signed with HS256 algorithm
- Contains username and user ID claims
- Auto-refreshes on API calls (in production)

## ⚡ Rate Limiting

**Backend Rate Limiting:**
- 100 requests per minute per IP
- Token bucket algorithm
- Returns 429 (Too Many Requests) when exceeded

**Cloudflare Rate Limiting (optional):**
- Additional 100 req/min via Workers
- Global DDoS protection included

## 🗄️ Database

**Development:**
- SQLite (local file-based)
- Database: `jobs.db`
- No setup required

**Production:**
- PostgreSQL (Railway)
- Automatic migrations
- Connection string via Railway

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login       - Login user
POST   /api/auth/register    - Create new account
```

### Jobs (Requires Authentication)
```
GET    /api/jobapplications        - List all jobs
POST   /api/jobapplications        - Create job
GET    /api/jobapplications/{id}   - Get job by ID
PUT    /api/jobapplications/{id}   - Update job
DELETE /api/jobapplications/{id}   - Delete job
```

## 🛠️ Technologies

### Frontend
- React 19.1.0
- TypeScript 4.9.5
- Tailwind CSS 3.4.17
- React Scripts 5.0.1

### Backend
- .NET 9.0
- ASP.NET Core Web API
- Entity Framework Core
- SQLite / PostgreSQL

### DevOps & Cloud
- GitHub Actions (CI/CD)
- Railway (Backend hosting)
- Vercel (Frontend hosting)
- Cloudflare (CDN & Security)
- Docker (Containerization)

## 📈 Scaling

**Free Tier Limits:**
- Railway: $5/month credits (covers most small apps)
- Vercel: Unlimited free tier
- Cloudflare: Free tier for most use cases

**When you need to scale:**
- Railway: $0.50/vCPU hour (~$10-20/month)
- Database: $0.25/GB/month (PostgreSQL)
- Vercel Pro: $20/month (faster builds)
- Cloudflare Pro: $20/month (advanced features)

## 🚀 CI/CD Pipeline

GitHub Actions automatically:
1. Runs tests on every push
2. Builds Docker image
3. Deploys to Railway (backend)
4. Triggers Vercel deployment (frontend)

See `.github/workflows/deploy.yml` for details.

## 📝 Resume-Ready Features

This project demonstrates:
✅ Full-stack web development (React + .NET Core)
✅ RESTful API design
✅ Authentication & authorization (JWT)
✅ Database design (Entity Framework)
✅ Responsive UI (Tailwind CSS)
✅ Cloud deployment (Railway, Vercel, Cloudflare)
✅ CI/CD pipelines (GitHub Actions)
✅ Containerization (Docker)
✅ Rate limiting & API management
✅ Security best practices

## 🐛 Troubleshooting

### Login doesn't work
- Check backend is running on port 5132
- Verify API URL in frontend (.env file)
- Check JWT secret in appsettings.json

### CORS errors
- Backend CORS is set to allow localhost:3000
- For production, update AllowedOrigins in appsettings.json

### Database migration fails
- Delete `jobs.db` and restart backend
- EF Core will recreate database schema

### Rate limit exceeded
- Default: 100 requests/minute per IP
- Verify you're not sending duplicate requests

## 📚 Documentation

- [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - What was built
- [API Documentation](./API.md) - Detailed endpoint reference
- [Architecture Guide](./ARCHITECTURE.md) - System design decisions

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

## 👨‍💻 Author

Built as a portfolio project to demonstrate full-stack web development skills.

---

**Questions?** Check the guides above or open an issue on GitHub.
