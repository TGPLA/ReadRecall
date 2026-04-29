---
name: "部署运维"
description: "阅读回响项目的部署与运维技能入口。涵盖Docker容器化、Nginx配置、SSH隧道、服务器管理、数据库运维等。当任务涉及部署、服务器配置、环境搭建时加载此技能。"
---

# 部署运维技能入口 (L2)

## 部署架构概览

```
用户浏览器
    ↓ HTTPS
Nginx (反向代理 + SSL)
    ↓ :80/443 → :3000
前端 (React静态文件)
    ↓ API请求 /api/*
Nginx反向代理
    ↓ :8080
后端 (Go Gin服务)
    ↓ :3306
MySQL数据库
```

**服务器信息：**
- 域名：linyubo.top
- 前端端口：3000（开发）/ 80（生产）
- 后端端口：8080
- 数据库端口：3306

---

## 模块导航 (L3)

### 01-Docker容器化

#### Dockerfile (backend/Dockerfile)

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o readrecall-backend main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/readrecall-backend .
COPY --from=builder /app/config ./config
COPY --from=builder /app/uploads ./uploads
EXPOSE 8080
CMD ["./readrecall-backend"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=readrecall
    volumes:
      - ./backend/uploads:/root/uploads
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: readrecall
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3307:3306"

volumes:
  mysql_data:
```

**常用命令：**
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f backend

# 进入容器
docker-compose exec backend sh

# 停止并删除
docker-compose down

# 清理未使用的镜像
docker system prune -a
```

---

### 02-Nginx配置

#### 配置位置
- 开发环境：本地配置
- 生产环境：服务器 `/etc/nginx/conf.d/readrecall.conf`

#### 核心配置

```nginx
server {
    listen 80;
    server_name linyubo.top;

    # HTTP重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name linyubo.top;

    # SSL证书配置
    ssl_certificate     /etc/nginx/cert/fullchain.pem;
    ssl_certificate_key /etc/nginx/cert/privkey.pem;

    # 前端静态文件
    location / {
        root /var/www/readrecall/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # EPUB文件下载
    location /uploads/ {
        alias /root/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

**常用操作：**
```bash
# 测试配置语法
nginx -t

# 重载配置（不中断服务）
nginx -s reload

# 重启Nginx
systemctl restart nginx

# 查看错误日志
tail -f /var/log/nginx/error.log
```

---

### 03-SSH隧道与远程连接

#### 本地开发连接远程数据库

```bash
# 建立SSH隧道（将远程3306映射到本地3307）
ssh -f -N -L 3307:127.0.0.1:3306 root@<服务器IP>

# 验证隧道建立
netstat -an | findstr 3307

# 本地连接远程数据库（使用3307端口）
mysql -h 127.0.0.1 -P 3307 -u root -p
```

#### SSH配置 (~/.ssh/config)

```
Host readrecall-server
    HostName <服务器IP>
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

**使用方式：**
```bash
ssh readrecall-server  # 直接连接

# SCP传输文件
scp localfile.txt readrecall-server:/remote/path/

# 同步整个目录
rsync -avz ./dist/ readrecall-server:/var/www/readrecall/dist/
```

---

### 04-环境变量管理

#### 前端 (.env, .env.production)

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8080/api

# 生产环境
VITE_API_BASE_URL=https://linyubo.top/api
```

#### 后端 (backend/.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=readrecall
ZHIPU_API_KEY=your_zhipu_key
JWT_SECRET=your_jwt_secret
PORT=8080
```

**安全注意事项：**
- ⚠️ `.env` 文件已加入 `.gitignore`，不要提交到仓库
- ⚠️ 生产环境的密码使用强密码
- ⚠️ 定期轮换JWT密钥和API Key

---

### 05-数据库运维

#### 数据库初始化

```bash
# 首次部署时执行
cd backend
mysql -u root -p < 数据库初始化.sql
```

#### 数据库迁移

```bash
# 版本升级时执行迁移脚本
mysql -u root -p readrecall < 数据库迁移_v7.0.sql
```

#### 常用SQL操作

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE books;

-- 备份单个表
mysqldump -u root -p readrecall books > books_backup.sql

-- 恢复数据
mysql -u root -p readrecall < books_backup.sql

-- 清理测试数据（注意顺序：先子表后父表）
DELETE FROM practice_records WHERE user_id = 'test_user';
DELETE FROM questions WHERE user_id = 'test_user';
DELETE FROM annotations WHERE user_id = 'test_user';
DELETE FROM books WHERE user_id = 'test_user';
```

#### 性能监控

```sql
-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 慢查询日志
SHOW VARIABLES LIKE 'slow_query_log';

-- 表大小
SELECT
    table_name,
    ROUND(data_length/1024/1024, 2) AS "Size MB"
FROM information_schema.tables
WHERE table_schema = 'readrecall'
ORDER BY data_length DESC;
```

---

### 06-自动化部署脚本

#### deploy.ps1 (Windows PowerShell)

```powershell
# 前端构建与部署
npm run build
# 上传dist到服务器
scp -r dist/* user@server:/var/www/readrecall/dist/
# 重载Nginx
ssh user@server "nginx -s reload"
```

#### 一键部署流程

```bash
# 1. 构建前端
npm run build

# 2. 构建后端Docker镜像
cd backend
docker build -t readrecall-backend:latest .

# 3. 推送到服务器
docker save readrecall-backend:latest | ssh user@server docker load

# 4. 在服务器上重启容器
ssh user@server "cd /opt/readrecall && docker-compose up -d"
```

---

## 常见问题速查 (L4)

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| **502 Bad Gateway** | 后端未启动或端口错误 | 检查后端进程、确认8080端口监听 |
| **504 Gateway Timeout** | 后端响应超时 | 增加Nginx的proxy_timeout设置 |
| **SSL证书错误** | 证书过期或路径错误 | 使用Let's Encrypt续期或检查路径 |
| **CORS跨域错误** | Nginx未配置Access-Control | 添加CORS相关头信息 |
| **Docker容器无法启动** | 端口冲突或依赖未就绪 | `docker logs <container>`查看日志 |
| **SSH连接超时** | 防火墙阻止或网络问题 | 检查22端口开放状态 |
| **数据库连接失败** | 密码错误或防火墙 | 验证凭据、检查MySQL端口 |
| **静态资源404** | 路径配置错误 | 检查nginx root路径和try_files |

---

## 监控与维护清单

### 每日检查
- [ ] 访问 `https://linyubo.top` 确认网站可访问
- [ ] 检查后端健康接口 `/health`
- [ ] 查看 Nginx 错误日志有无异常

### 每周维护
- [ ] 备份数据库（mysqldump）
- [ ] 检查磁盘空间使用率
- [ ] 更新Docker镜像（如有安全更新）

### 每月检查
- [ ] SSL证书有效期（Let's Encrypt自动续期）
- [ ] 审计访问日志，排查异常请求
- [ ] 更新依赖版本（npm update / go mod tidy）
