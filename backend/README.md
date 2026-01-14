# Portfolio Backend

基于 Google Agent Development Kit (ADK) 的智能 Portfolio 后端，采用星型拓扑的多 Agent 架构。

## 架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Router Agent                                 │
│                    (意图识别 & 请求分发)                              │
└──────┬──────────────┬──────────────────┬──────────────┬────────────┘
       │              │                  │              │
┌──────▼─────────┐ ┌──▼──────────┐ ┌─────▼─────────┐ ┌─▼────────────┐
│  Digital Twin  │ │  Tech Lead  │ │   Knowledge   │ │   Contact    │
│  (简历/经历)    │ │ (GitHub/代码)│ │  (搜索/联网)   │ │  (邮件发送)   │
│                │ │             │ │               │ │              │
│  Tools:        │ │  Tools:     │ │  Tools:       │ │  Tools:      │
│  - queryInfo   │ │  - getRepo  │ │  - semantic   │ │  - sendEmail │
│  - getContact  │ │  - readFile │ │  - webSearch  │ │              │
└────────────────┘ └─────────────┘ └───────────────┘ └──────────────┘
```

## 技术栈

- Java 21
- Spring Boot 3.2
- Google ADK 0.5.0
- WebFlux (响应式)
- Tavily API (联网搜索)

## 快速开始

### 1. 配置环境变量

编辑 `.env` 文件：

```env
# Google AI API Key (https://aistudio.google.com/app/apikey)
GOOGLE_API_KEY=your-google-api-key

# GitHub 配置 (https://github.com/settings/tokens)
GITHUB_TOKEN=your-github-token
GITHUB_USERNAME=your-github-username

# Tavily API (https://tavily.com - 联网搜索)
TAVILY_API_KEY=your-tavily-api-key

# Resend API (https://resend.com - 邮件发送)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=contact@yourdomain.com
CONTACT_SUBJECT=New Portfolio Contact Message

# 联系信息
CONTACT_EMAIL=your@email.com
LINKEDIN_URL=https://linkedin.com/in/yourprofile
CALENDLY_URL=https://calendly.com/yourprofile
```

**重要：** Google ADK 需要环境变量，不是 Java 系统属性。启动时必须将 `.env` 中的变量导出到环境。

### 2. 知识库目录

知识库位于项目根目录的 `content/` 文件夹（与 `backend/` 同级）：

```
portfolio/
├── content/                 ← 知识库目录
│   ├── personal/           # 个人信息
│   │   ├── resume.md
│   │   └── contact.md
│   ├── projects/           # 项目描述
│   │   ├── mynote.md
│   │   └── cs61b.md
│   └── blog/               # 技术博客
│       ├── microservices.md
│       ├── vector-search.md
│       └── ai-llm.md
└── backend/                 ← 后端代码
```

**文件监控**：Knowledge Agent 会自动监控 `content/` 目录变化，新增/修改/删除文件时自动更新索引。

### 3. 运行

```bash
# 编译
./mvnw compile

# 运行（使用启动脚本加载环境变量）
./run.sh

# 或者手动导出环境变量后运行
export GOOGLE_API_KEY=your-key
export GITHUB_TOKEN=your-token
export TAVILY_API_KEY=your-key
./mvnw spring-boot:run

# 运行测试
./mvnw test

# 运行 ADK Web UI
./mvnw compile exec:java -Dexec.mainClass="com.google.adk.web.AdkWebServer" \
  -Dexec.args="--adk.agents.source-directory=src/main/java/com/portfolio/agent"
```

**Docker 部署：**

```bash
# 使用 docker-compose（推荐）
cd ..  # 回到项目根目录
docker compose up -d

# 访问
# 前端: http://localhost:3000
# 后端: http://localhost:8080
```

## API 端点

### POST /api/v1/chat/message

同步消息处理

```bash
curl -X POST http://localhost:8080/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "介绍一下你自己"}'
```

响应：
```json
{
  "sessionId": "session-1234567890",
  "response": "你好，我是Yi Wang..."
}
```

### POST /api/v1/chat/stream

SSE 流式响应

```bash
curl -X POST http://localhost:8080/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session-123", "message": "展示你的GitHub项目"}'
```

**SSE 事件类型：**

| 事件类型 | 说明 | 示例 |
|---------|------|------|
| `function` | 工具调用状态 | `{"type":"function","name":"semanticSearch","status":"calling"}` |
| `function` | 工具调用完成 | `{"type":"function","name":"semanticSearch","status":"complete"}` |
| `thinking_complete` | 所有工具调用完成，开始输出正文 | `{"type":"thinking_complete"}` |
| `token` | 正文内容流式输出 | `{"type":"token","content":"你好，我是..."}` |
| `complete` | 响应完成 | `{"type":"complete"}` |
| `error` | 错误 | `{"type":"error","message":"错误信息"}` |

**SSE 格式：**
```
data:{"type":"function","name":"semanticSearch","status":"calling"}

data:{"type":"function","name":"semanticSearch","status":"complete"}

data:{"type":"thinking_complete"}

data:{"type":"token","content":"你好"}

data:{"type":"complete"}
```

### DELETE /api/v1/chat/session/{sessionId}

清除会话

## Agent 说明

| Agent | 触发场景 | 能力 |
|-------|---------|------|
| Router | 所有请求入口 | 意图识别，路由到专家 Agent |
| Digital Twin | "你是谁"、"工作经历"、"联系方式" | RAG 检索简历，返回联系卡片 |
| Tech Lead | "GitHub"、"项目"、"代码" | GitHub API 获取统计、搜索项目、读取代码 |
| Knowledge | "搜索"、"最新"、技术问题 | 向量语义搜索 + Tavily 联网搜索 |
| Contact | "联系你"、"发消息"、"留言" | 通过 Resend API 发送邮件 |

## Tools 说明

### GitHubTools

| Tool | 功能 |
|------|------|
| `getGitHubStats` | 获取综合 GitHub 统计数据 (stars, commits, streaks, languages, top projects) |
| `getDeveloperProfile` | 获取开发者统计 (stars, languages, repos) |
| `listAllRepos` | 列出所有仓库 |
| `searchProjects` | 按关键词搜索项目 |
| `getRepoDetails` | 获取仓库详情 (stars, forks, topics) |
| `getRepoLanguages` | 语言占比分析 |
| `getRepoCommits` | 最近提交记录 |
| `listRepoContents` | 浏览仓库文件结构 |
| `readRepoFile` | 读取代码文件内容 |
| `getContributionStats` | GitHub 活跃度统计 |

### KnowledgeTools

| Tool | 功能 |
|------|------|
| `semanticSearch` | 向量相似度搜索知识库 |
| `searchByCategory` | 按分类搜索 (personal/projects/blog) |
| `listKnowledgeBase` | 列出所有已索引文档 |
| `webSearch` | Tavily API 联网搜索 |
| `refreshIndex` | 手动刷新知识库索引 |

### ContactTools

| Tool | 功能 |
|------|------|
| `sendContactMessage` | 通过 Resend API 发送联系邮件 |

### RAGTools

| Tool | 功能 |
|------|------|
| `queryPersonalInfo` | 检索个人信息/简历 |
| `queryProjects` | 检索项目描述 |
| `queryBlogPosts` | 检索技术博客 |
| `searchAllContent` | 全局搜索 |

## 安全措施

- **文件白名单**: `.md`, `.java`, `.ts`, `.tsx`, `.js`, `.json`, `.py`
- **文件黑名单**: `.env`, 包含 `secret` 的文件
- **大文件截断**: 超过 200 行自动截断
- **防注入**: Router Agent 包含 anti-jailbreak 规则

## 测试

```bash
# 运行所有测试
./mvnw test

# 工具测试
./mvnw test -Dtest=ToolsTest
./mvnw test -Dtest=KnowledgeToolsTest

# Agent 集成测试 (需要 GOOGLE_API_KEY)
./mvnw test -Dtest=AgentIntegrationTest

# API 测试
./mvnw test -Dtest=ApiTest
```

测试覆盖：
- ToolsTest: 15 个测试 (GitHub + RAG 工具)
- KnowledgeToolsTest: 7 个测试 (语义搜索 + 文件监控)
- AgentIntegrationTest: 30 个测试 (全 Agent 功能)
- ApiTest: 5 个测试 (REST API)

## 项目结构

```
src/main/java/com/portfolio/
├── PortfolioApplication.java
├── config/
│   └── EnvConfig.java
├── agent/
│   └── PortfolioAgents.java    # Router, DigitalTwin, TechLead, Knowledge
├── tools/
│   ├── GitHubTools.java        # GitHub API
│   ├── RAGTools.java           # 知识库检索
│   ├── KnowledgeTools.java     # 向量搜索 + 联网
│   └── UtilityTools.java       # 联系卡片
├── service/
│   └── AgentService.java
└── controller/
    └── ChatController.java
```

## 部署

```dockerfile
FROM eclipse-temurin:21-jre
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```bash
./mvnw package -DskipTests
docker build -t portfolio-backend .
docker run -p 8080:8080 --env-file .env portfolio-backend
```
