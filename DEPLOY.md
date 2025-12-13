# Deployment Guide - Career Cockpit

## Prerequisites

- Node.js 18+ (for frontend)
- .NET 10.0 SDK (for backend)
- SQLite or PostgreSQL (for database)

---

## Local Development

### 1. Backend Setup

```bash
cd server

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run development server
dotnet run
```

Backend will start at: `http://localhost:5132`

### 2. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start at: `http://localhost:3000`

### 3. Environment Variables

**Backend (`server/appsettings.Development.json`):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=career_cockpit.db"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-at-least-32-chars",
    "Issuer": "career-cockpit",
    "Audience": "career-cockpit-app"
  },
  "AllowedOrigins": ["http://localhost:3000"]
}
```

**Frontend (`.env` file in client folder):**
```env
REACT_APP_API_URL=http://localhost:5132/api
```

---

## Production Deployment

### Option 1: Railway (Recommended)

#### Backend Deployment

1. **Create Railway Account**: https://railway.app

2. **Connect GitHub Repository**

3. **Add Backend Service**:
   - Root Directory: `server`
   - Build Command: `dotnet publish -c Release -o out`
   - Start Command: `dotnet out/server.dll`

4. **Set Environment Variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=<your-db-connection>
   Jwt__Secret=<production-secret-key>
   AllowedOrigins__0=https://your-frontend-url.com
   ```

5. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "PostgreSQL"
   - Copy connection string to backend env vars

#### Frontend Deployment

1. **Add Frontend Service**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s build -l 3000`

2. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

---

### Option 2: Docker Deployment

#### Backend Dockerfile (already exists)

```dockerfile
# server/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["server.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 80
ENTRYPOINT ["dotnet", "server.dll"]
```

#### Frontend Dockerfile

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5132:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=db;Database=careercockpit;Username=postgres;Password=postgres
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:5132/api

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=careercockpit
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres

volumes:
  postgres_data:
```

#### Run with Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: Azure Deployment

#### Backend to Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name careercockpit-rg --location eastus

# Create App Service plan
az appservice plan create --name careercockpit-plan --resource-group careercockpit-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group careercockpit-rg --plan careercockpit-plan --name careercockpit-api --runtime "DOTNET|10.0"

# Deploy
cd server
dotnet publish -c Release
az webapp deploy --resource-group careercockpit-rg --name careercockpit-api --src-path bin/Release/net10.0/publish
```

#### Frontend to Azure Static Web Apps

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Build frontend
cd client
npm run build

# Deploy
swa deploy ./build --deployment-token <your-token>
```

---

## Database Migration

### Development (SQLite)

```bash
cd server

# Create migration
dotnet ef migrations add MigrationName

# Apply migration
dotnet ef database update

# Rollback
dotnet ef database update PreviousMigration
```

### Production (PostgreSQL)

1. Update connection string in production:
```
Host=your-host;Database=careercockpit;Username=user;Password=pass;SSL Mode=Require
```

2. Apply migrations:
```bash
dotnet ef database update --connection "your-production-connection-string"
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Linux/Docker)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        root /var/www/careercockpit/frontend;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5132;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Health Checks

### Backend Health Endpoint

```bash
curl https://your-api.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

### Monitoring Setup

1. **Application Insights** (Azure):
   - Add package: `Microsoft.ApplicationInsights.AspNetCore`
   - Configure in Program.cs

2. **Sentry** (Error tracking):
   - Install: `npm install @sentry/react`
   - Initialize in App.tsx

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] JWT secret is production-grade (32+ chars)
- [ ] CORS origins updated for production URLs
- [ ] HTTPS enabled
- [ ] Database migrations applied
- [ ] Health check endpoint responding
- [ ] Error monitoring configured
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] Logging configured

---

## Troubleshooting

### Backend won't start

1. Check connection string
2. Verify .NET runtime installed
3. Check port availability (5132)
4. Review logs: `dotnet run --verbosity detailed`

### Frontend build fails

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node version: `node --version` (need 18+)
3. Verify env variables set

### Database connection issues

1. Verify database is running
2. Check connection string format
3. Test connection manually
4. Check firewall rules

### CORS errors

1. Verify AllowedOrigins includes frontend URL
2. Check protocol (http vs https)
3. Include port if non-standard
