import { defineConfig } from 'bumpp'

export default defineConfig({
  // 在发布前执行的命令
  beforeBump: [
    'pnpm run check', // 代码检查
    'pnpm run build'  // 构建项目
  ],
  
  // 在发布后执行的命令
  after: [
    'git add .',
    'git commit -m "chore: update build files"'
  ],
  
  // 提交信息模板
  commit: 'chore: release v%s',
  
  // 标签模板
  tag: 'v%s',
  
  // 推送到远程仓库
  push: true,
  
  // 确认发布
  confirm: true,
  
  // 递归更新依赖包的版本
  recursive: false,
  
  // 要更新版本号的文件
  files: [
    'package.json'
  ],
  
  // 是否创建标签
  createTag: true,
  
  // 是否推送标签
  pushTag: true
})