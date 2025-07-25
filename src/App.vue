<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🪞 MirrorEditor 演示</h1>
      <p>一个通用的编辑器与配置数据双向同步库</p>
    </header>

    <main class="app-main">
      <!-- 基础示例 -->
      <section class="demo-section">
        <h2>📝 基础 Textarea 编辑器</h2>
        <div class="demo-container">
          <div class="editor-wrapper">
            <MirrorEditor v-model="textareaConfig.content" editor-type="textarea" height="250px" :debug="true"
              @content-change="onContentChange" @editor-ready="onEditorReady" />
          </div>
          <div class="config-display">
            <h3>配置对象内容（可编辑）：</h3>
            <textarea v-model="textareaConfig.content" class="config-editor" placeholder="在此直接编辑配置内容..."
              @input="addLog('config-edit', '配置对象被直接编辑')"></textarea>
          </div>
        </div>
      </section>

      <!-- Monaco Editor 示例 -->
      <section class="demo-section">
        <h2>⚡ Monaco Editor (如果可用)</h2>
        <div class="demo-container">
          <div class="editor-wrapper">
            <MirrorEditor v-model="monacoConfig.script" editor-type="monaco" language="javascript" theme="vs-dark"
              height="350px" :debug="true" :monaco-options="{
                fontSize: 14,
                wordWrap: 'on',
                minimap: { enabled: false }
              }" />
          </div>
          <div class="config-display">
            <h3>配置对象内容（可编辑）：</h3>
            <textarea v-model="monacoConfig.script" class="config-editor" placeholder="在此直接编辑配置内容..."
              @input="addLog('config-edit', '配置对象被直接编辑')"></textarea>
          </div>
        </div>
      </section>

      <!-- 多编辑器示例 -->
      <section class="demo-section">
        <h2>🔄 多编辑器同步示例</h2>
        <div class="multi-editor-container">
          <div class="editor-group">
            <h3>编辑器 1 (HTML)</h3>
            <MirrorEditor v-model="multiConfig.html" editor-type="textarea" height="180px" :debug="false" />
          </div>
          <div class="editor-group">
            <h3>编辑器 2 (CSS)</h3>
            <MirrorEditor v-model="multiConfig.css" editor-type="textarea" height="180px" :debug="false" />
          </div>
          <div class="editor-group">
            <h3>编辑器 3 (JavaScript)</h3>
            <MirrorEditor v-model="multiConfig.js" editor-type="textarea" height="180px" :debug="false" />
          </div>
        </div>
        <div class="config-display">
          <h3>多编辑器配置对象（只读显示）：</h3>
          <pre class="config-readonly">{{ JSON.stringify(multiConfig, null, 2) }}</pre>
        </div>
      </section>

      <!-- 控制按钮 -->
      <section class="demo-section">
        <h2>🎮 控制操作</h2>
        <div class="control-buttons">
          <button @click="loadTemplate" class="btn btn-primary">
            📋 加载模板
          </button>
          <button @click="resetAll" class="btn btn-secondary">
            🔄 重置所有
          </button>
          <button @click="exportConfig" class="btn btn-success">
            💾 导出配置
          </button>
          <button @click="importConfig" class="btn btn-warning">
            📥 导入配置
          </button>
        </div>
      </section>

      <!-- 事件日志 -->
      <section class="demo-section">
        <h2>📊 事件日志</h2>
        <div class="event-log">
          <div v-for="(event, index) in eventLog" :key="index" class="log-item">
            <span class="log-time">{{ event.time }}</span>
            <span class="log-type" :class="event.type">{{ event.type }}</span>
            <span class="log-message">{{ event.message }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import MirrorEditor from '@/components/MirrorEditor/index.vue'

// 配置对象
const textareaConfig = reactive({
  content: '// 这是一个基础的 textarea 编辑器\n// 修改这里的内容，配置对象会自动同步\nconsole.log("Hello MirrorEditor!");'
})

const monacoConfig = reactive({
  script: `// Monaco Editor 示例\n// 支持语法高亮、智能提示等高级功能\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));`
})

const multiConfig = reactive({
  html: '<div class="container">\n  <h1>Hello World</h1>\n  <p>这是一个多编辑器示例</p>\n</div>',
  css: '.container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n  text-align: center;\n}',
  js: 'document.addEventListener("DOMContentLoaded", function() {\n  console.log("页面加载完成");\n  \n  const container = document.querySelector(".container");\n  if (container) {\n    container.style.opacity = "1";\n  }\n});'
})

// 事件日志
const eventLog = ref<Array<{ time: string, type: string, message: string }>>([])

// 添加日志
const addLog = (type: string, message: string) => {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift({ time, type, message })
  if (eventLog.value.length > 20) {
    eventLog.value.pop()
  }
}

// 事件处理
const onContentChange = (event: any) => {
  try {
    if (event && typeof event === 'object') {
      const source = event.source || 'unknown'
      const valueLength = event.value ? event.value.length : 0
      addLog('content-change', `内容变化: ${source} -> ${valueLength} 字符`)
    } else {
      addLog('content-change', '内容变化事件')
    }
  } catch (error) {
    console.warn('处理内容变化事件时出错:', error)
    addLog('content-change', '内容变化事件（处理异常）')
  }
}

const onEditorReady = (editor: any) => {
  try {
    if (editor) {
      addLog('editor-ready', '编辑器初始化完成')
    } else {
      addLog('editor-ready', '编辑器初始化完成（无实例）')
    }
  } catch (error) {
    console.warn('处理编辑器就绪事件时出错:', error)
    addLog('editor-ready', '编辑器初始化完成（处理异常）')
  }
}

// 控制操作
const loadTemplate = () => {
  textareaConfig.content = '// 模板代码\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("MirrorEditor"));'
  monacoConfig.script = '// 高级模板\nclass Calculator {\n  constructor() {\n    this.result = 0;\n  }\n  \n  add(num) {\n    this.result += num;\n    return this;\n  }\n  \n  multiply(num) {\n    this.result *= num;\n    return this;\n  }\n  \n  getResult() {\n    return this.result;\n  }\n}\n\nconst calc = new Calculator();\nconsole.log(calc.add(5).multiply(2).getResult());'
  addLog('template', '模板加载完成')
}

const resetAll = () => {
  textareaConfig.content = ''
  monacoConfig.script = ''
  multiConfig.html = ''
  multiConfig.css = ''
  multiConfig.js = ''
  addLog('reset', '所有配置已重置')
}

const exportConfig = () => {
  const config = {
    textarea: textareaConfig,
    monaco: monacoConfig,
    multi: multiConfig
  }
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mirror-editor-config.json'
  a.click()
  URL.revokeObjectURL(url)
  addLog('export', '配置导出完成')
}

const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        try {
          const config = JSON.parse(e.target.result)
          if (config.textarea) Object.assign(textareaConfig, config.textarea)
          if (config.monaco) Object.assign(monacoConfig, config.monaco)
          if (config.multi) Object.assign(multiConfig, config.multi)
          addLog('import', '配置导入完成')
        } catch (error) {
          addLog('error', '配置导入失败: ' + error)
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 初始化日志
addLog('init', 'MirrorEditor 演示应用启动')
</script>


<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.app-main {
  max-width: 1600px;
  margin: 0 auto;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.demo-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: stretch;
  min-height: 60vh;
}

.editor-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-display h3 {
  color: #555;
  margin-bottom: 12px;
  font-size: 1rem;
}

.config-display pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
}

.config-editor {
  width: 100%;
  height: auto;
  min-height: 200px;
  max-height: 80vh;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Monaco, Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  background: #f8f9fa;
  color: #333;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  overflow-y: auto;
}

.config-editor:focus {
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.config-readonly {
  background: #2d3748;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow: auto;
  max-height: 300px;
}

.multi-editor-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.editor-group h3 {
  color: #555;
  margin-bottom: 8px;
  font-size: 1rem;
}

.control-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #007acc;
  color: white;
}

.btn-primary:hover {
  background: #005a9e;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.event-log {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6c757d;
  font-family: monospace;
  min-width: 80px;
}

.log-type {
  font-weight: 600;
  min-width: 100px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  text-transform: uppercase;
}

.log-type.content-change {
  background: #e3f2fd;
  color: #1976d2;
}

.log-type.editor-ready {
  background: #e8f5e8;
  color: #2e7d32;
}

.log-type.template {
  background: #fff3e0;
  color: #f57c00;
}

.log-type.reset {
  background: #fce4ec;
  color: #c2185b;
}

.log-type.export {
  background: #e0f2f1;
  color: #00695c;
}

.log-type.import {
  background: #f3e5f5;
  color: #7b1fa2;
}

.log-type.error {
  background: #ffebee;
  color: #d32f2f;
}

.log-type.init {
  background: #e8eaf6;
  color: #3f51b5;
}

.log-message {
  color: #495057;
  flex: 1;
}

@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
  }

  .multi-editor-container {
    grid-template-columns: 1fr;
  }

  .control-buttons {
    justify-content: center;
  }

  .app-header h1 {
    font-size: 2rem;
  }
}
</style>
