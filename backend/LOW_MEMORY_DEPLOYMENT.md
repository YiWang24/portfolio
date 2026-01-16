# 1GB 内存服务器部署指南

本文档专门针对 1GB 内存的 Azure/AWS/DigitalOcean VPS 部署优化。

## 内存分配方案

| 组件 | 内存分配 | 说明 |
|------|----------|------|
| 系统 (OS) | ~200MB | Linux 基础系统开销 |
| Docker 守护进程 | ~100MB | Docker 运行时 |
| 后端容器 | 700MB (limit) / 200MB (reservation) | Spring Boot 应用 |
| **总计** | **~1000MB** | 适配 1GB 服务器 |

## 配置文件已优化

### Dockerfile JVM 选项

```dockerfile
-XX:MaxRAMPercentage=60.0          # 最大堆内存为容器限制的 60%
-XX:MinRAMPercentage=40.0          # 最小堆内存
-XX:+UseG1GC                      # 使用 G1 垃圾回收器 (低延迟)
-XX:+UseStringDeduplication        # 字符串去重减少内存
-XX:MaxGCPauseMillis=200           # GC 最大暂停时间
-XX:+ExplicitGCInvokesConcurrent   # 并发 GC
-XX:+HeapDumpOnOutOfMemoryError    # OOM 时生成堆转储
```

### docker-compose.yml 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '0.75'      # 限制 CPU 使用
      memory: 700M      # 硬限制 700MB
    reservations:
      cpus: '0.1'
      memory: 200M      # 保证最少 200MB
```

## 部署步骤

### 1. SSH 连接到服务器

```bash
ssh user@your-server-ip
```

### 2. 安装 Docker (如果未安装)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 3. 克隆代码

```bash
git clone https://github.com/YiWang24/portfolio.git
cd portfolio
```

### 4. 配置环境变量

```bash
cp backend/.env.example backend/.env
nano backend/.env  # 或使用 vi
```

### 5. 启动服务

```bash
docker compose up -d
```

### 6. 验证部署

```bash
# 检查容器状态
docker ps

# 查看内存使用
docker stats portfolio-backend

# 健康检查
curl http://localhost:8080/api/v1/health
```

## 内存监控

### 实时监控容器内存

```bash
# 实时统计
docker stats portfolio-backend

# 系统整体内存
free -h

# 详细内存信息
cat /proc/meminfo
```

### 设置告警脚本

```bash
# 创建监控脚本 ~/check-memory.sh
cat > ~/check-memory.sh << 'EOF'
#!/bin/bash
THRESHOLD=90
MEM_USAGE=$(free | awk '/Mem/{printf("%.0f"), $3/$2*100}')
if [ $MEM_USAGE -gt $THRESHOLD ]; then
    echo "WARNING: Memory usage is ${MEM_USAGE}%"
    # 发送告警通知 (可选)
fi
EOF

chmod +x ~/check-memory.sh

# 添加到 crontab (每 5 分钟检查)
crontab -e
# 添加: */5 * * * * ~/check-memory.sh
```

## OOM 问题排查

如果容器因内存不足被终止：

### 1. 检查日志

```bash
docker logs portfolio-backend --tail 100
docker inspect portfolio-backend | jq '.[0].State.OOMKilled'
```

### 2. 查看堆转储 (如果配置了)

```bash
docker exec portfolio-backend ls -lh /tmp/heapdump.hprof
docker cp portfolio-backend:/tmp/heapdump.hprof .
```

### 3. 调整内存限制

如果经常 OOM，可以适当增加限制（但要注意系统总内存）：

```yaml
# docker-compose.yml
memory: 800M  # 从 700M 增加到 800M
```

## 性能优化建议

### 1. 减少并发连接

修改 `.env` 中的限流配置：

```bash
RATE_LIMIT_GLOBAL_HOURLY=50     # 从 100 减少到 50
RATE_LIMIT_IP_HOURLY=5          # 从 10 减少到 5
```

### 2. 禁用不必要的功能

如果不需要某些功能，可以在启动时禁用：

```bash
# docker-compose.yml 添加环境变量
- SPRING_JMX_ENABLED=false
- SPRING_ACTIVATE_PROFILES=production
```

### 3. 使用 Swap

```bash
# 创建 2GB swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. 定期清理

```bash
# 添加到 crontab
0 2 * * * docker system prune -f --volumes
```

## 生产环境建议

对于 1GB 服务器，建议：

1. **使用反向代理**: Nginx/Caddy 占用内存小 (~20-50MB)
2. **启用缓存**: 减少 API 调用
3. **监控告警**: 设置内存使用告警
4. **定期重启**: 每周重启一次释放内存

```bash
# 添加到 crontab (每周日凌晨 3 点重启)
0 3 * * 0 docker compose restart
```

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 容器反复重启 | 检查 `docker logs`，可能是 OOM |
| 响应缓慢 | 检查 CPU/内存使用 `docker stats` |
| 内存持续增长 | 可能是内存泄漏，检查堆转储 |
| 连接被拒绝 | 检查健康状态和防火墙 |
