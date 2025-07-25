import { defineConfig } from 'bumpp'

export default defineConfig({
  // 在发布前执行的命令
  execute: 'pnpm run check && pnpm run build',

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
  ]
})