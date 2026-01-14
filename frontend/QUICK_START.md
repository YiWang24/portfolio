# Quick Start Guide - Engineering Telemetry

## Frontend (Already Done! ✅)

Your Next.js frontend is ready to go. Just start the dev server:

```bash
npm run dev
```

Visit http://localhost:3000 to see the Engineering Telemetry section.

## Backend (5 Minutes Setup)

### Step 1: Get GitHub Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `read:user`, `public_repo`
4. Copy the token

### Step 2: Set Environment Variable

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### Step 3: Add to Spring Boot

Copy these files to your Spring Boot project:

```
backend-code/GitHubStatsService.java     → src/main/java/com/yourpackage/service/
backend-code/GitHubStatsController.java  → src/main/java/com/yourpackage/controller/
backend-code/CacheConfig.java            → src/main/java/com/yourpackage/config/
```

### Step 4: Add Dependencies to pom.xml

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

### Step 5: Update application.yml

```yaml
github:
  token: ${GITHUB_TOKEN}
```

### Step 6: Update CORS

In `GitHubStatsController.java`, line 11:

```java
@CrossOrigin(origins = {"http://localhost:3000"})
```

### Step 7: Start Backend

```bash
./mvnw spring-boot:run
```

### Step 8: Test

```bash
curl http://localhost:8080/api/v1/github/stats
```

## That's It! 🎉

Your Engineering Telemetry feature is now live with:

- ✅ Real-time GitHub stats
- ✅ YTD commits
- ✅ Total PRs
- ✅ Language distribution with colors
- ✅ 1-hour cache
- ✅ Error handling

## Troubleshooting

**Backend not responding?**

- Check Spring Boot is running on port 8080
- Verify GITHUB_TOKEN is set: `echo $GITHUB_TOKEN`

**Frontend shows fallback data?**

- Check browser console for errors
- Verify backend URL in `.env.local`
- Test backend: `curl http://localhost:8080/api/v1/github/stats`

**CORS errors?**

- Update `@CrossOrigin` annotation with your frontend URL

## Full Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `GITHUB_STATS_SETUP.md` - Detailed setup guide
- `backend-code/README.md` - Backend-specific guide
- `backend-code/IMPLEMENTATION_CHECKLIST.md` - Step-by-step checklist
