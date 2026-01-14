# Engineering Telemetry Feature - Setup Guide

This guide covers the complete setup for the GitHub Stats feature with Spring Boot backend and Next.js frontend.

## Architecture Overview

```
Frontend (Next.js) → Backend (Spring Boot) → GitHub GraphQL API
     ↓                      ↓
  useGitHubStats      @Cacheable (1hr TTL)
```

## Backend Setup (Spring Boot)

### 1. Add Dependencies to `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

### 2. Copy Backend Files

Copy all files from `backend-code/` directory to your Spring Boot project:

- `GitHubStatsService.java` → `src/main/java/com/yourpackage/service/`
- `GitHubStatsController.java` → `src/main/java/com/yourpackage/controller/`
- `CacheConfig.java` → `src/main/java/com/yourpackage/config/`

**Important:** Update package names to match your project structure.

### 3. Configure GitHub Token

Add to `application.yml`:

```yaml
github:
  token: ${GITHUB_TOKEN}
```

Set environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### 4. Update CORS Settings

In `GitHubStatsController.java`, update the `@CrossOrigin` annotation:

```java
@CrossOrigin(origins = {"http://localhost:3000", "https://your-domain.com"})
```

### 5. Test Backend

Start your Spring Boot app and test:

```bash
curl http://localhost:8080/api/v1/github/stats
```

## Frontend Setup (Next.js)

### 1. Files Already Created

The following files have been created in your project:

- ✅ `src/hooks/useGitHubStats.ts` - Custom hook for fetching stats
- ✅ `src/components/EngineeringTelemetry.tsx` - UI component
- ✅ `src/components/ProfilePanel.tsx` - Updated to use new component

### 2. Configure Backend URL

Update `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

For production, update to your backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
```

### 3. Test Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` and check the Engineering Telemetry section.

## Features Implemented

### Backend

- ✅ GraphQL query to GitHub API v4
- ✅ Fetches `totalCommitContributions` (YTD)
- ✅ Fetches `totalPullRequestContributions`
- ✅ Aggregates language usage across all repos
- ✅ Calculates language percentages
- ✅ 1-hour cache with Caffeine
- ✅ Proper error handling

### Frontend

- ✅ Custom `useGitHubStats` hook
- ✅ Loading state with spinner
- ✅ Error handling with fallback data
- ✅ Real-time data display
- ✅ Dynamic language bars with GitHub colors
- ✅ Responsive design

## API Response Format

```json
{
  "totalCommits": 136,
  "totalPRs": 3,
  "languages": [
    {
      "name": "TypeScript",
      "percent": 63,
      "color": "#3178c6"
    },
    {
      "name": "Python",
      "percent": 12,
      "color": "#3572A5"
    },
    {
      "name": "Java",
      "percent": 10,
      "color": "#b07219"
    }
  ]
}
```

## Troubleshooting

### Backend Issues

**Problem:** 401 Unauthorized from GitHub

- **Solution:** Check `GITHUB_TOKEN` is set and valid
- Verify token has `read:user` and `repo` scopes

**Problem:** Rate limit exceeded

- **Solution:** Cache is working. Wait 1 hour or restart app to clear cache
- Check you're not making direct GitHub API calls elsewhere

**Problem:** CORS errors

- **Solution:** Update `@CrossOrigin` annotation with correct frontend URL

### Frontend Issues

**Problem:** "Failed to fetch GitHub stats"

- **Solution:** Verify backend is running on correct port
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Verify CORS is configured correctly

**Problem:** Shows fallback data

- **Solution:** Check browser console for errors
- Verify backend endpoint returns valid JSON
- Test backend endpoint directly with curl

## Production Deployment

### Backend

1. Set `GITHUB_TOKEN` in production environment
2. Update CORS to allow production frontend domain
3. Consider using Redis for distributed caching
4. Monitor GitHub API rate limits

### Frontend

1. Update `NEXT_PUBLIC_BACKEND_URL` to production API
2. Build and deploy: `npm run build && npm start`
3. Verify environment variables are set correctly

## Cache Management

The cache automatically expires after 1 hour. To manually clear:

1. Restart the Spring Boot application
2. Or implement a cache eviction endpoint (optional)

## GitHub Token Scopes Required

Minimum scopes needed:

- `read:user` - Read user profile data
- `public_repo` - Read public repository data

For private repos, use `repo` instead of `public_repo`.

## Performance Notes

- First request: ~500-1000ms (GitHub API call)
- Cached requests: <10ms
- Cache TTL: 1 hour
- Rate limit: 5,000 requests/hour (authenticated)
