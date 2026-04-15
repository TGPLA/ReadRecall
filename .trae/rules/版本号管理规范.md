# 版本号管理规范

## 单一来源

`package.json` 是版本号唯一权威来源

## 同步更新

部署时必须同时更新 `package.json` 和 `public/changelog.json`

## 禁止硬编码

前端从 `changelog.json` 动态读取版本号
