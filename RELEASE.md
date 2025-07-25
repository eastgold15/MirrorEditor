# 发布指南

本项目使用 [bumpp](https://github.com/antfu/bumpp) 进行版本管理和发布。

## 本地发布

### 交互式发布并推送到 npm
```bash
pnpm run release
```
这将启动交互式发布流程，你可以选择版本类型（patch/minor/major），完成后自动推送到 npm。

### 指定版本类型发布并推送到 npm
```bash
# 补丁版本 (1.0.0 -> 1.0.1) 并发布到 npm
pnpm run release:patch

# 次要版本 (1.0.0 -> 1.1.0) 并发布到 npm
pnpm run release:minor

# 主要版本 (1.0.0 -> 2.0.0) 并发布到 npm
pnpm run release:major
```

### 兼容命令
```bash
# 与 release:patch 相同，发布补丁版本并推送到 npm
pnpm run release:publish
```

## GitHub Actions 自动发布

1. 访问 GitHub 仓库的 Actions 页面
2. 选择 "Release with Bumpp" 工作流
3. 点击 "Run workflow"
4. 选择发布类型（patch/minor/major）
5. 点击 "Run workflow" 开始自动发布

## 发布流程

每次发布都会自动执行以下步骤：

1. **代码检查**: 运行 `pnpm run check` 进行代码格式检查
2. **构建项目**: 运行 `pnpm run build` 构建生产版本
3. **版本更新**: 更新 `package.json` 中的版本号
4. **创建提交**: 创建版本发布提交
5. **创建标签**: 创建对应的 Git 标签
6. **推送代码**: 推送代码和标签到远程仓库
7. **发布到 npm**: 自动发布到 npm 仓库

## 配置文件

发布配置在 `bumpp.config.ts` 文件中定义，你可以根据需要修改：

- `before`: 发布前执行的命令
- `after`: 发布后执行的命令
- `commit`: 提交信息模板
- `tag`: 标签模板
- `push`: 是否推送到远程仓库
- `confirm`: 是否需要确认

## 注意事项

1. 确保你有推送到主分支的权限
2. 确保你已经配置了 npm 的发布权限（用于 `release:publish`）
3. 发布前会自动运行代码检查和构建，确保代码质量
4. 每次发布都会创建对应的 Git 标签，便于版本追踪