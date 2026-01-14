# GitHub Stats 功能迁移说明

## 概述
将 GitHub 统计数据查询功能从独立的 REST API 端点迁移到 Agent 工具系统，实现智能化的数据查询。

## 变更内容

### 删除的组件
- `GitHubStatsController.java` - REST API 控制器
- `GitHubStatsService.java` - GraphQL 查询服务  
- `GitHubStatsTest.java` - 单元测试

### 新增功能
在 `GitHubTools.java` 中添加 `getGitHubStats()` 工具方法，提供以下数据：

| 字段 | 说明 |
|------|------|
| totalStars | 所有仓库的总 star 数 |
| totalForks | 所有仓库的总 fork 数 |
| followers | GitHub 关注者数量 |
| repositoryCount | 公开仓库数量 |
| ytdCommits | 年度提交数 |
| mergedPRs | 已合并的 PR 数量 |
| codeReviews | 代码审查数量 |
| currentStreak | 当前连续贡献天数 |
| longestStreak | 历史最长连续贡献天数 |
| languages | 前5种编程语言及占比 |
| topProjects | 前3个最活跃的项目 |

## 使用方式

### 通过 Chat API（推荐）
用户可以通过自然语言询问 GitHub 数据，Agent 会自动调用工具：

```bash
curl -X POST http://localhost:8080/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "展示你的 GitHub 统计数据"}'
```

**示例对话：**
```
用户: "你的 GitHub 有多少 stars？"
Agent: [自动调用 getGitHubStats]
Agent: "我的 GitHub 项目总共获得了 150 个 stars，分布在 15 个公开仓库中。"

用户: "你最近在做什么项目？"
Agent: [自动调用 getGitHubStats]
Agent: "我最近活跃的项目包括：
1. portfolio-backend - 智能 Portfolio 后端（Java）
2. MyNote - 笔记应用（JavaScript）
3. CS61B - 数据结构课程项目（Java）"
```

### 直接调用（开发/测试）
```java
import com.portfolio.tools.GitHubTools;
import java.util.Map;

Map<String, Object> stats = GitHubTools.getGitHubStats();
System.out.println("Total Stars: " + stats.get("totalStars"));
System.out.println("YTD Commits: " + stats.get("ytdCommits"));
System.out.println("Current Streak: " + stats.get("currentStreak") + " days");
```

## 迁移影响

### 优点
✅ **智能交互**：用户可以用自然语言询问，无需记住 API 端点  
✅ **简化架构**：减少 3 个文件，统一工具管理  
✅ **更好的用户体验**：Agent 可以根据上下文智能回答  
✅ **易于维护**：所有 GitHub 工具集中在一个类中

### 注意事项
⚠️ **API 端点移除**：原有的 `/api/v1/github/stats` 端点已被移除  
⚠️ **前端适配**：如果前端直接调用该端点，需要改为通过 Chat API 获取数据  
⚠️ **缓存策略**：目前没有缓存，频繁调用可能触发 GitHub API 限流

## 技术细节

### GraphQL 查询
使用单次 GraphQL 查询获取所有数据，减少 API 调用：
- 仓库统计（stars, forks, languages）
- 贡献统计（commits, PRs, reviews）
- 活动日历（用于计算连续贡献天数）
- 项目活跃度

### 错误处理
```java
try {
    // GraphQL 查询和数据解析
    return result;
} catch (Exception e) {
    return Map.of("error", "Failed to fetch GitHub stats: " + e.getMessage());
}
```

### 性能优化
- 限制返回的语言数量（前5个）
- 限制返回的项目数量（前3个）
- 按字节数排序语言统计
- 按最近提交数排序项目

## 测试验证

```bash
# 编译项目
./mvnw compile

# 运行工具测试
./mvnw test -Dtest=ToolsTest

# 运行知识库测试
./mvnw test -Dtest=KnowledgeToolsTest
```

**测试结果：**
- ✅ ToolsTest: 15/15 通过
- ✅ KnowledgeToolsTest: 7/7 通过
- ✅ 编译成功，无错误

## 后续优化建议

1. **添加缓存**：使用 Spring Cache 缓存 GitHub 数据，避免频繁 API 调用
   ```java
   @Cacheable(value = "github-stats", unless = "#result.containsKey('error')")
   public static Map<String, Object> getGitHubStats() { ... }
   ```

2. **增量更新**：只在数据过期时刷新
3. **更多指标**：添加 issue 统计、PR 审查时间等
4. **可视化支持**：返回适合图表展示的数据格式

## 相关文件

- `src/main/java/com/portfolio/tools/GitHubTools.java` - 工具实现
- `src/main/java/com/portfolio/agent/PortfolioAgents.java` - Agent 配置
- `README.md` - 项目文档

## 问题排查

### 问题：Agent 没有调用 getGitHubStats
**解决方案：**
1. 检查工具是否在 agent 中注册
2. 检查 agent 的 instruction 是否提到该工具
3. 查看日志确认工具调用情况

### 问题：返回错误信息
**解决方案：**
1. 检查 GITHUB_TOKEN 环境变量是否设置
2. 确认 token 有足够的权限（repo, read:user）
3. 检查 GitHub API 限流状态

### 问题：数据不准确
**解决方案：**
1. 检查 GraphQL 查询是否正确
2. 验证数据解析逻辑
3. 对比 GitHub 网页显示的数据

## 联系方式
如有问题，请查看项目 README 或提交 issue。
