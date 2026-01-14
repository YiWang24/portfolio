# Rate Limiting 防攻击保护

## 概述

基础限流保护系统，防止 API 滥用和 token 消耗。

## 功能特性

✅ **全局限流** - 整个网站的总请求数限制  
✅ **IP 限流** - 每个 IP 地址的请求数限制  
✅ **滑动窗口** - 精确的时间窗口统计，平滑流量峰值  
✅ **内存存储** - 轻量级，无需外部依赖  
✅ **可配置** - 所有参数通过 .env 配置  

### 滑动窗口 vs 固定窗口

**滑动窗口（当前实现）：**
- ✅ 精确统计过去 N 秒/分钟/小时的请求
- ✅ 低谷时段的配额可以累积到峰值使用
- ✅ 防止窗口边界突发流量
- ✅ 更公平的限流策略

**示例：**
```
限制：10 次/小时

固定窗口：
  10:00-11:00: 10 次 ✅
  11:00-11:01: 10 次 ✅ (窗口重置，瞬间 20 次)
  
滑动窗口：
  10:00-11:00: 10 次 ✅
  11:00-11:01: 0 次 ❌ (过去 60 分钟已有 10 次)
  11:06-11:07: 10 次 ✅ (10:00-10:06 的请求已过期)
```  

## 配置参数

在 `.env` 文件中配置：

```env
# Rate Limiting
RATE_LIMIT_ENABLED=true                 # 启用/禁用限流
RATE_LIMIT_GLOBAL_DAILY=1000            # 全局每天最多1000次请求
RATE_LIMIT_GLOBAL_HOURLY=100            # 全局每小时最多100次请求
RATE_LIMIT_IP_DAILY=50                  # 每个IP每天最多50次
RATE_LIMIT_IP_HOURLY=10                 # 每个IP每小时最多10次
RATE_LIMIT_MESSAGE_MAX_LENGTH=500       # 消息最大长度
```

### 推荐配置

**个人网站（默认）：**
- 全局：100/小时，1000/天
- IP：10/小时，50/天

**生产环境（高流量）：**
```env
RATE_LIMIT_GLOBAL_DAILY=10000
RATE_LIMIT_GLOBAL_HOURLY=1000
RATE_LIMIT_IP_DAILY=100
RATE_LIMIT_IP_HOURLY=20
```

**开发测试：**
```env
RATE_LIMIT_ENABLED=false
```

## 使用方式

### 1. 查看限流统计

```bash
curl http://localhost:8080/api/v1/chat/stats
```

响应：
```json
{
  "enabled": true,
  "globalHourly": "45/100",
  "globalDaily": "320/1000",
  "uniqueIPs": 12
}
```

### 2. 超限响应

当请求超过限制时，返回 HTTP 429：

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

### 3. IP 识别

系统按以下优先级识别客户端 IP：
1. `X-Forwarded-For` header（代理/负载均衡）
2. `X-Real-IP` header
3. `RemoteAddr`（直连）

## 工作原理

### 滑动窗口算法

系统使用滑动窗口算法，精确追踪每个请求的时间戳：

```
时间轴: ←────────────────────────────────────→
        [过期请求] | [有效窗口(3600秒)] | 现在
                   ↑                    ↑
                 cutoff               now

每次检查：
1. 移除窗口外的过期请求
2. 统计窗口内的请求数
3. 判断是否超过限制
```

**优势：**
- 精确到秒级的时间窗口
- 自动清理过期数据
- 流量平滑，无突发峰值
- 低谷配额可累积使用

### 限流逻辑

```
请求到达
  ↓
检查全局小时限制 → 超限 → 返回 429
  ↓
检查全局天限制 → 超限 → 返回 429
  ↓
检查 IP 小时限制 → 超限 → 返回 429
  ↓
检查 IP 天限制 → 超限 → 返回 429
  ↓
允许请求，计数器 +1
```

### 时间窗口

- **滑动窗口**：每个请求独立追踪时间戳
- **自动清理**：窗口外的请求自动移除
- **精确统计**：过去 N 秒内的实际请求数
- **内存优化**：只保留有效窗口内的数据

## 监控和调试

### 查看日志

```bash
tail -f logs/portfolio-backend.log | grep RateLimit
```

日志示例：
```
[RateLimitService] enabled=true, global=100/1000, ip=10/50
[RateLimitFilter] IP 192.168.1.100 hourly limit exceeded
[RateLimitFilter] Global hourly limit exceeded
```

### 测试限流

```bash
# 快速发送多个请求测试
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/v1/chat/message \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' | jq -r '.error // "OK"'
done
```

## 常见问题

### Q: 如何临时禁用限流？
A: 设置 `RATE_LIMIT_ENABLED=false` 并重启应用

### Q: 限流计数器何时重置？
A: 
- 滑动窗口：不需要重置，自动移除过期请求
- 小时窗口：过去 3600 秒内的请求
- 天窗口：过去 86400 秒内的请求
- 应用重启：所有计数器清零

### Q: 如何为特定 IP 设置白名单？
A: 当前版本不支持，可以升级到方案 B

### Q: 限流会影响性能吗？
A: 影响极小，使用内存计数器，每次检查 < 1ms

### Q: 如何处理负载均衡后的 IP？
A: 确保负载均衡器设置 `X-Forwarded-For` header

## 架构

```
ChatController
     ↓
RateLimitFilter (拦截器)
     ↓
RateLimitService (限流逻辑)
     ↓
Counter (计数器)
```

## 升级路径

当前实现：**方案 A - 基础限流保护**

如需更多功能，可升级到：
- **方案 B**：白名单/黑名单、端点级限制
- **方案 C**：Redis 持久化、请求指纹、渐进式惩罚

## 安全建议

1. ✅ 在生产环境启用限流
2. ✅ 根据实际流量调整限制
3. ✅ 监控限流日志，识别攻击
4. ✅ 配合 Cloudflare/AWS WAF 使用
5. ✅ 定期审查限流统计

## 相关文件

- `RateLimitService.java` - 限流逻辑
- `RateLimitFilter.java` - 请求拦截器
- `ChatController.java` - 统计端点
- `.env` - 配置参数
