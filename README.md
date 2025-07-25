# 🪞 MirrorEditor

一个通用的编辑器与配置数据双向同步库，支持 Vue 3 + TypeScript。

## ✨ 特性

- 🔄 **双向数据同步** - 编辑器内容与配置对象自动同步
- 🎯 **多编辑器支持** - 支持 Monaco Editor、textarea、CodeMirror 等
- 🛡️ **防循环同步** - 内置标志位防止无限循环更新
- 📦 **开箱即用** - 提供完整的 TypeScript 类型定义
- 🎨 **高度可定制** - 支持自定义编辑器初始化
- 🔧 **调试模式** - 内置可视化调试面板
- 🌍 **跨框架兼容** - 核心思路适用于 React、Svelte 等框架

## 📦 安装

```bash
npm install @pori15/mirror-editor
# 或
yarn add @pori15/mirror-editor
# 或
pnpm add @pori15/mirror-editor
```

## 🚀 快速开始

### 1. 全局注册（推荐）

```typescript
// main.ts
import { createApp } from 'vue'
import MirrorEditor from '@pori15/mirror-editor'
import App from './App.vue'

const app = createApp(App)
app.use(MirrorEditor)
app.mount('#app')
```

### 2. 局部导入

```vue
<template>
  <MirrorEditor
    v-model="config.content"
    editor-type="textarea"
    height="300px"
    :debug="true"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { MirrorEditor } from '@pori15/mirror-editor'

const config = reactive({
  content: 'console.log("Hello MirrorEditor!");'
})
</script>
```

## 📖 API 文档

### MirrorEditor 组件

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 双向绑定的内容值 |
| `editorType` | `'monaco' \| 'textarea' \| 'codemirror' \| 'custom'` | `'textarea'` | 编辑器类型 |
| `height` | `string` | `'300px'` | 编辑器高度 |
| `width` | `string` | `'100%'` | 编辑器宽度 |
| `language` | `string` | `'javascript'` | 编程语言（Monaco Editor） |
| `theme` | `string` | `'vs'` | 主题（Monaco Editor） |
| `readonly` | `boolean` | `false` | 是否只读 |
| `debug` | `boolean` | `false` | 是否显示调试面板 |
| `monacoOptions` | `object` | `{}` | Monaco Editor 配置选项 |
| `customEditorInit` | `function` | `undefined` | 自定义编辑器初始化函数 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `value: string` | 内容更新时触发 |
| `content-change` | `{ value: string, source: 'editor' \| 'config' }` | 内容变化时触发 |
| `editor-ready` | `editor: any` | 编辑器初始化完成时触发 |

#### 暴露的方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `getContent` | - | `string` | 获取当前内容 |
| `setContent` | `content: string` | `void` | 设置内容 |
| `syncToEditor` | - | `void` | 手动同步配置到编辑器 |
| `syncToConfig` | - | `void` | 手动同步编辑器到配置 |
| `getEditor` | - | `any` | 获取编辑器实例 |

### useEditorSync 组合式函数

```typescript
import { useEditorSync } from '@pori15/mirror-editor'

const {
  syncToEditor,
  syncToConfig,
  cleanup
} = useEditorSync({
  configRef: ref(''),
  getValue: () => editor.getValue(),
  setValue: (value) => editor.setValue(value),
  onConfigChange: (newValue) => console.log('Config changed:', newValue),
  onEditorChange: (newValue) => console.log('Editor changed:', newValue)
})
```

### useMultiEditorSync 多编辑器管理

```typescript
import { useMultiEditorSync } from '@pori15/mirror-editor'

const configs = {
  html: ref('<div>Hello</div>'),
  css: ref('div { color: red; }'),
  js: ref('console.log("Hello");')
}

const { syncAll, cleanupAll } = useMultiEditorSync([
  {
    id: 'html',
    configRef: configs.html,
    getValue: () => htmlEditor.getValue(),
    setValue: (value) => htmlEditor.setValue(value)
  },
  {
    id: 'css',
    configRef: configs.css,
    getValue: () => cssEditor.getValue(),
    setValue: (value) => cssEditor.setValue(value)
  },
  {
    id: 'js',
    configRef: configs.js,
    getValue: () => jsEditor.getValue(),
    setValue: (value) => jsEditor.setValue(value)
  }
])
```

## 🎯 使用场景

### 1. 基础文本编辑器

```vue
<template>
  <MirrorEditor
    v-model="formData.description"
    editor-type="textarea"
    height="200px"
    placeholder="请输入描述..."
  />
</template>
```

### 2. 代码编辑器（Monaco）

```vue
<template>
  <MirrorEditor
    v-model="codeConfig.script"
    editor-type="monaco"
    language="typescript"
    theme="vs-dark"
    height="400px"
    :monaco-options="{
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false
    }"
  />
</template>
```

### 3. 自定义编辑器

```vue
<template>
  <MirrorEditor
    v-model="config.content"
    editor-type="custom"
    :custom-editor-init="initCustomEditor"
    height="300px"
  />
</template>

<script setup>
const initCustomEditor = (container, options) => {
  // 初始化你的自定义编辑器
  const editor = new YourCustomEditor(container, options)
  
  return {
    getValue: () => editor.getContent(),
    setValue: (value) => editor.setContent(value),
    onDidChangeContent: (callback) => editor.on('change', callback),
    dispose: () => editor.destroy()
  }
}
</script>
```

### 4. 多编辑器协同

```vue
<template>
  <div class="multi-editor">
    <MirrorEditor
      v-model="config.html"
      editor-type="monaco"
      language="html"
      height="200px"
    />
    <MirrorEditor
      v-model="config.css"
      editor-type="monaco"
      language="css"
      height="200px"
    />
    <MirrorEditor
      v-model="config.js"
      editor-type="monaco"
      language="javascript"
      height="200px"
    />
  </div>
</template>

<script setup>
const config = reactive({
  html: '<div class="container">Hello World</div>',
  css: '.container { color: blue; }',
  js: 'console.log("Hello from JS");'
})

// 配置对象的任何变化都会自动同步到对应的编辑器
watch(config, (newConfig) => {
  console.log('配置更新:', newConfig)
}, { deep: true })
</script>
```

## 🔧 高级配置

### 调试模式

启用调试模式可以查看同步状态和手动控制同步：

```vue
<MirrorEditor
  v-model="config.content"
  :debug="true"
  editor-type="monaco"
/>
```

调试面板显示：
- 当前配置值和编辑器值
- 同步状态指示器
- 手动同步按钮
- 同步方向指示

### 事件监听

```vue
<template>
  <MirrorEditor
    v-model="config.content"
    @content-change="onContentChange"
    @editor-ready="onEditorReady"
  />
</template>

<script setup>
const onContentChange = ({ value, source }) => {
  console.log(`内容从 ${source} 更新:`, value)
}

const onEditorReady = (editor) => {
  console.log('编辑器已就绪:', editor)
  // 可以直接操作编辑器实例
}
</script>
```

## 🌍 跨框架使用

虽然这个库是为 Vue 3 设计的，但核心的同步逻辑可以轻松适配到其他框架：

### React 适配示例

```typescript
// useEditorSync.ts (React 版本)
import { useEffect, useRef } from 'react'

export function useEditorSync({
  value,
  setValue,
  getValue,
  onValueChange
}) {
  const isUpdatingRef = useRef(false)
  
  // 配置 -> 编辑器
  useEffect(() => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    setValue(value)
    isUpdatingRef.current = false
  }, [value])
  
  // 编辑器 -> 配置
  const handleEditorChange = (newValue) => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    onValueChange(newValue)
    isUpdatingRef.current = false
  }
  
  return { handleEditorChange }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

