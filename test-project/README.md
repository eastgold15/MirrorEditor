# Split Pane V3 测试项目

这是一个用于测试 Split Pane V3 组件的示例项目。Split Pane V3 是一个基于 Vue 3 的分割面板组件，支持垂直和水平分割，可以嵌套使用。

## 功能特点

- 支持垂直和水平分割
- 可调整分割比例
- 支持嵌套使用
- 支持自定义样式
- 使用 TypeScript 开发

## 项目结构

```
├── public/            # 静态资源
├── src/               # 源代码
│   ├── assets/        # 资源文件
│   ├── App.vue        # 主应用组件
│   ├── main.ts        # 入口文件
│   ├── style.css      # 全局样式
│   └── vite-env.d.ts  # 类型声明
├── index.html         # HTML 模板
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
├── tsconfig.node.json # Node TypeScript 配置
└── vite.config.ts     # Vite 配置
```

## 开发指南

### 安装依赖

```bash
npm install
# 或
yarn
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 使用示例

```vue
<template>
  <div style="height: 100%">
    <split-pane :min-percent="0" :default-percent="20" split="vertical">
      <template v-slot:paneL> 左侧面板 </template>
      <template v-slot:paneR> 右侧面板 </template>
    </split-pane>
  </div>
</template>

<script setup lang="ts">
import { SplitPane } from "split-pane-v3";
</script>
```

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| split | string | 必填 | 分割方向，可选值：'vertical'、'horizontal' |
| min-percent | number | 10 | 最小百分比 |
| default-percent | number | 50 | 默认百分比 |
| className | string | - | 自定义类名 |

## 插槽

| 名称 | 说明 |
| --- | --- |
| paneL | 左侧或上方面板内容 |
| paneR | 右侧或下方面板内容 |