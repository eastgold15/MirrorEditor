# 📖 MirrorEditor 使用文档

## 🌟 简介

MirrorEditor 是一个专为 Vue 3 设计的通用编辑器与配置数据双向同步库。它解决了在开发过程中编辑器内容与配置对象之间同步的痛点，支持多种编辑器类型，提供开箱即用的双向数据绑定能力。

### 核心特性

- 🔄 **智能双向同步** - 编辑器内容与配置对象自动同步，无需手动处理
- 🎯 **多编辑器支持** - 支持 Monaco Editor、textarea、CodeMirror 等主流编辑器
- 🛡️ **防循环机制** - 内置防循环同步机制，避免无限更新
- 📦 **TypeScript 支持** - 完整的 TypeScript 类型定义
- 🎨 **高度可定制** - 支持自定义编辑器初始化和配置
- 🔧 **调试模式** - 内置可视化调试面板，方便开发调试
- 🌍 **跨框架兼容** - 核心思路可适配到 React、Svelte 等其他框架

## 📦 安装

### 使用 npm
```bash
npm install @pori15/mirror-editor
```

### 使用 yarn
```bash
yarn add @pori15/mirror-editor
```

### 使用 pnpm
```bash
pnpm add @pori15/mirror-editor
```

## 🚀 快速开始

### 方式一：全局注册（推荐）

```typescript
// main.ts
import { createApp } from 'vue'
import MirrorEditor from '@pori15/mirror-editor'
import App from './App.vue'

const app = createApp(App)
app.use(MirrorEditor)
app.mount('#app')
```

### 方式二：局部导入

```vue
<template>
  <div class="editor-container">
    <MirrorEditor
      v-model="config.content"
      editor-type="textarea"
      height="300px"
      :debug="true"
      placeholder="请输入内容..."
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { MirrorEditor } from '@pori15/mirror-editor'

const config = reactive({
  content: 'console.log("Hello MirrorEditor!");'
})
</script>
```

## 📚 详细使用指南

### 1. 基础文本编辑器

最简单的使用方式，适用于表单输入、备注编辑等场景：

```vue
<template>
  <div class="form-item">
    <label>项目描述：</label>
    <MirrorEditor
      v-model="formData.description"
      editor-type="textarea"
      height="200px"
      width="100%"
      placeholder="请输入项目描述..."
      :readonly="false"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const formData = reactive({
  description: ''
})

// 表单数据会自动与编辑器内容同步
watch(() => formData.description, (newValue) => {
  console.log('描述已更新:', newValue)
})
</script>
```

### 2. Monaco Editor 代码编辑器

适用于代码编辑、脚本配置等专业开发场景：

```vue
<template>
  <div class="code-editor">
    <h3>JavaScript 代码编辑器</h3>
    <MirrorEditor
      v-model="codeConfig.script"
      editor-type="monaco"
      language="javascript"
      theme="vs-dark"
      height="400px"
      :monaco-options="monacoOptions"
      @editor-ready="onEditorReady"
      @content-change="onContentChange"
    />
    
    <!-- 实时预览配置内容 -->
    <div class="config-preview">
      <h4>当前配置：</h4>
      <pre>{{ JSON.stringify(codeConfig, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const codeConfig = reactive({
  script: `function greet(name) {
  console.log('Hello, ' + name + '!');
  return 'Hello, ' + name + '!';
}

greet('MirrorEditor');`
})

// Monaco Editor 配置选项
const monacoOptions = {
  fontSize: 14,
  wordWrap: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true
}

// 编辑器就绪回调
const onEditorReady = (editor: any) => {
  console.log('Monaco Editor 已就绪:', editor)
  // 可以直接操作编辑器实例
  editor.focus()
}

// 内容变化回调
const onContentChange = ({ value, source }: { value: string, source: 'editor' | 'config' }) => {
  console.log(`内容从 ${source} 更新:`, value)
}
</script>

<style scoped>
.code-editor {
  max-width: 800px;
  margin: 0 auto;
}

.config-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.config-preview pre {
  margin: 0;
  font-size: 12px;
  color: #666;
}
</style>
```

### 3. 自定义编辑器

如果你需要集成其他编辑器（如 CodeMirror、Ace Editor 等），可以使用自定义编辑器模式：

```vue
<template>
  <div class="custom-editor">
    <MirrorEditor
      v-model="config.content"
      editor-type="custom"
      :custom-editor-init="initCustomEditor"
      height="300px"
      @editor-ready="onCustomEditorReady"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
// 假设你使用 CodeMirror
// import { EditorView, basicSetup } from 'codemirror'
// import { javascript } from '@codemirror/lang-javascript'

const config = reactive({
  content: 'console.log("Custom Editor");'
})

// 自定义编辑器初始化函数
const initCustomEditor = (container: HTMLElement, options: any) => {
  // 这里以 CodeMirror 为例
  /*
  const editor = new EditorView({
    doc: options.initialValue || '',
    extensions: [
      basicSetup,
      javascript()
    ],
    parent: container
  })
  
  return {
    getValue: () => editor.state.doc.toString(),
    setValue: (value: string) => {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: value
        }
      })
    },
    onDidChangeContent: (callback: (value: string) => void) => {
      // 监听内容变化
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          callback(update.state.doc.toString())
        }
      })
      editor.dispatch({
        effects: StateEffect.appendConfig.of(updateListener)
      })
    },
    dispose: () => {
      editor.destroy()
    }
  }
  */
  
  // 简单示例：使用原生 textarea
  const textarea = document.createElement('textarea')
  textarea.style.width = '100%'
  textarea.style.height = '100%'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.resize = 'none'
  textarea.style.fontFamily = 'monospace'
  textarea.value = options.initialValue || ''
  container.appendChild(textarea)
  
  return {
    getValue: () => textarea.value,
    setValue: (value: string) => {
      textarea.value = value
    },
    onDidChangeContent: (callback: (value: string) => void) => {
      textarea.addEventListener('input', () => {
        callback(textarea.value)
      })
    },
    dispose: () => {
      container.removeChild(textarea)
    }
  }
}

const onCustomEditorReady = (editor: any) => {
  console.log('自定义编辑器已就绪:', editor)
}
</script>
```

### 4. 多编辑器协同工作

在复杂的应用中，你可能需要同时管理多个编辑器：

```vue
<template>
  <div class="multi-editor-container">
    <div class="editor-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="editor-content">
      <!-- HTML 编辑器 -->
      <div v-show="activeTab === 'html'" class="editor-panel">
        <MirrorEditor
          v-model="config.html"
          editor-type="monaco"
          language="html"
          height="300px"
          :monaco-options="{ theme: 'vs-dark' }"
        />
      </div>
      
      <!-- CSS 编辑器 -->
      <div v-show="activeTab === 'css'" class="editor-panel">
        <MirrorEditor
          v-model="config.css"
          editor-type="monaco"
          language="css"
          height="300px"
          :monaco-options="{ theme: 'vs-dark' }"
        />
      </div>
      
      <!-- JavaScript 编辑器 -->
      <div v-show="activeTab === 'js'" class="editor-panel">
        <MirrorEditor
          v-model="config.js"
          editor-type="monaco"
          language="javascript"
          height="300px"
          :monaco-options="{ theme: 'vs-dark' }"
        />
      </div>
    </div>
    
    <!-- 实时预览 -->
    <div class="preview-panel">
      <h4>实时预览</h4>
      <iframe 
        ref="previewFrame"
        :srcdoc="previewContent"
        style="width: 100%; height: 200px; border: 1px solid #ccc;"
      ></iframe>
    </div>
    
    <!-- 配置状态 -->
    <div class="config-status">
      <h4>当前配置状态</h4>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'

const activeTab = ref('html')

const tabs = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JavaScript' }
]

const config = reactive({
  html: `<div class="container">
  <h1>Hello MirrorEditor!</h1>
  <p>这是一个多编辑器协同示例</p>
  <button onclick="sayHello()">点击我</button>
</div>`,
  css: `.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}`,
  js: `function sayHello() {
  alert('Hello from MirrorEditor!');
  console.log('按钮被点击了!');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面已加载完成');
});`
})

// 生成预览内容
const previewContent = computed(() => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>${config.css}</style>
</head>
<body>
  ${config.html}
  <script>${config.js}</script>
</body>
</html>
  `.trim()
})

// 监听配置变化
watch(config, (newConfig) => {
  console.log('配置已更新:', newConfig)
}, { deep: true })
</script>

<style scoped>
.multi-editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.editor-tabs {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
}

.editor-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.editor-tabs button.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.editor-content {
  margin-bottom: 20px;
}

.preview-panel,
.config-status {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.config-status pre {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #666;
  max-height: 200px;
  overflow-y: auto;
}
</style>
```

## 🔧 高级功能

### 调试模式

启用调试模式可以实时查看同步状态，方便开发调试：

```vue
<template>
  <MirrorEditor
    v-model="config.content"
    editor-type="monaco"
    :debug="true"
    height="400px"
  />
</template>
```

调试面板会显示：
- 当前配置值和编辑器值
- 同步状态指示器
- 手动同步按钮
- 同步方向指示
- 同步历史记录

### 事件监听

```vue
<template>
  <MirrorEditor
    v-model="config.content"
    @content-change="onContentChange"
    @editor-ready="onEditorReady"
    @sync-start="onSyncStart"
    @sync-complete="onSyncComplete"
  />
</template>

<script setup lang="ts">
const onContentChange = ({ value, source }: { value: string, source: 'editor' | 'config' }) => {
  console.log(`内容从 ${source} 更新:`, value)
  
  // 可以在这里添加自定义逻辑
  if (source === 'editor') {
    // 编辑器内容变化
    validateCode(value)
  } else {
    // 配置对象变化
    updateUI(value)
  }
}

const onEditorReady = (editor: any) => {
  console.log('编辑器已就绪:', editor)
  // 可以直接操作编辑器实例
  editor.focus()
}

const onSyncStart = (direction: 'toEditor' | 'toConfig') => {
  console.log('开始同步:', direction)
}

const onSyncComplete = (direction: 'toEditor' | 'toConfig') => {
  console.log('同步完成:', direction)
}
</script>
```

### 使用 Composable 函数

对于更复杂的同步需求，可以直接使用底层的 Composable 函数：

```typescript
import { useEditorSync, useMultiEditorSync } from '@pori15/mirror-editor'

// 单个编辑器同步
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

// 多编辑器同步
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

## 🌍 跨框架使用

虽然 MirrorEditor 是为 Vue 3 设计的，但核心的同步思路可以适配到其他框架：

### React 适配示例

```typescript
// useEditorSync.ts (React 版本)
import { useEffect, useRef, useCallback } from 'react'

export function useEditorSync({
  value,
  setValue,
  getValue,
  onValueChange
}: {
  value: string
  setValue: (value: string) => void
  getValue: () => string
  onValueChange: (value: string) => void
}) {
  const isUpdatingRef = useRef(false)
  
  // 配置 -> 编辑器
  useEffect(() => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    setValue(value)
    isUpdatingRef.current = false
  }, [value, setValue])
  
  // 编辑器 -> 配置
  const handleEditorChange = useCallback((newValue: string) => {
    if (isUpdatingRef.current) return
    isUpdatingRef.current = true
    onValueChange(newValue)
    isUpdatingRef.current = false
  }, [onValueChange])
  
  return { handleEditorChange }
}
```

## 📋 API 参考

### MirrorEditor 组件 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|---------|
| `modelValue` | `string` | `''` | 双向绑定的内容值 |
| `editorType` | `'monaco' \| 'textarea' \| 'codemirror' \| 'custom'` | `'textarea'` | 编辑器类型 |
| `height` | `string` | `'300px'` | 编辑器高度 |
| `width` | `string` | `'100%'` | 编辑器宽度 |
| `language` | `string` | `'javascript'` | 编程语言（Monaco Editor） |
| `theme` | `string` | `'vs'` | 主题（Monaco Editor） |
| `readonly` | `boolean` | `false` | 是否只读 |
| `debug` | `boolean` | `false` | 是否显示调试面板 |
| `placeholder` | `string` | `''` | 占位符文本 |
| `monacoOptions` | `object` | `{}` | Monaco Editor 配置选项 |
| `customEditorInit` | `function` | `undefined` | 自定义编辑器初始化函数 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|---------|
| `update:modelValue` | `value: string` | 内容更新时触发 |
| `content-change` | `{ value: string, source: 'editor' \| 'config' }` | 内容变化时触发 |
| `editor-ready` | `editor: any` | 编辑器初始化完成时触发 |
| `sync-start` | `direction: 'toEditor' \| 'toConfig'` | 开始同步时触发 |
| `sync-complete` | `direction: 'toEditor' \| 'toConfig'` | 同步完成时触发 |

### 暴露的方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|---------|
| `getContent` | - | `string` | 获取当前内容 |
| `setContent` | `content: string` | `void` | 设置内容 |
| `syncToEditor` | - | `void` | 手动同步配置到编辑器 |
| `syncToConfig` | - | `void` | 手动同步编辑器到配置 |
| `getEditor` | - | `any` | 获取编辑器实例 |

## 🔍 常见问题

### Q: 如何解决循环同步问题？

A: MirrorEditor 内置了防循环同步机制，使用标志位来防止无限循环更新。如果你在使用 Composable 函数时遇到循环问题，请确保正确使用 `isUpdating` 标志位。

### Q: Monaco Editor 主题如何自定义？

A: 你可以通过 `theme` 属性设置内置主题，或者通过 `monacoOptions` 传入自定义主题配置：

```vue
<MirrorEditor
  v-model="content"
  editor-type="monaco"
  theme="vs-dark"
  :monaco-options="{
    theme: 'my-custom-theme'
  }"
/>
```

### Q: 如何监听编辑器的特定事件？

A: 可以通过 `@editor-ready` 事件获取编辑器实例，然后直接监听编辑器的原生事件：

```vue
<MirrorEditor
  @editor-ready="onEditorReady"
/>

<script setup>
const onEditorReady = (editor) => {
  // Monaco Editor 示例
  editor.onDidChangeCursorPosition((e) => {
    console.log('光标位置变化:', e)
  })
}
</script>
```

### Q: 如何实现代码格式化？

A: 对于 Monaco Editor，可以调用其内置的格式化方法：

```vue
<script setup>
const editorRef = ref()

const formatCode = () => {
  const editor = editorRef.value?.getEditor()
  if (editor) {
    editor.getAction('editor.action.formatDocument').run()
  }
}
</script>

<template>
  <div>
    <button @click="formatCode">格式化代码</button>
    <MirrorEditor
      ref="editorRef"
      v-model="content"
      editor-type="monaco"
    />
  </div>
</template>
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！如果你想为 MirrorEditor 做出贡献，请：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

如果这个文档对你有帮助，请给我们一个 ⭐️！