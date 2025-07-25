<template>
  <div class="mirror-editor-container">
    <!-- 编辑器容器 -->
    <div ref="editorContainer" class="editor-container" :style="editorStyle"></div>

    <!-- 调试信息面板（仅在debug模式下显示） -->
    <div v-if="debug && showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <h4>调试信息</h4>
        <button @click="showDebugPanel = false" class="close-btn">×</button>
      </div>
      <div class="debug-content">
        <div class="debug-item">
          <label>配置值:</label>
          <pre>{{ configValue }}</pre>
        </div>
        <div class="debug-item">
          <label>编辑器内容:</label>
          <pre>{{ editorContent }}</pre>
        </div>
        <div class="debug-item">
          <label>同步状态:</label>
          <span :class="{ 'syncing': isUpdating }">{{ isUpdating ? '同步中' : '已同步' }}</span>
        </div>
        <div class="debug-actions">
          <button @click="syncToConfig" class="debug-btn">同步到配置</button>
          <button @click="syncToEditor" class="debug-btn">同步到编辑器</button>
        </div>
      </div>
    </div>

    <!-- 调试按钮 -->
    <button v-if="debug && !showDebugPanel" @click="showDebugPanel = true" class="debug-toggle" title="显示调试面板">
      🐛
    </button>
  </div>
</template>

<script setup lang="ts">
import { useEditorSync, type EditorSyncOptions } from '@/composables/useEditorSync'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type CSSProperties
} from 'vue'

/**
 * MirrorEditor 组件属性接口
 */
export interface MirrorEditorProps {
  /** 编辑器内容的响应式配置对象 */
  modelValue: string
  /** 编辑器类型 */
  editorType?: 'monaco' | 'textarea' | 'codemirror'
  /** 编程语言 */
  language?: string
  /** 编辑器主题 */
  theme?: string
  /** 是否只读 */
  readonly?: boolean
  /** 编辑器高度 */
  height?: string | number
  /** 编辑器宽度 */
  width?: string | number
  /** 是否启用调试模式 */
  debug?: boolean
  /** 同步选项 */
  syncOptions?: EditorSyncOptions
  /** Monaco Editor 特定选项 */
  monacoOptions?: any
  /** 自定义编辑器初始化函数 */
  customEditorInit?: (container: HTMLElement) => {
    getValue: () => string
    setValue: (value: string) => void
    onDidChangeContent: (callback: () => void) => void
    destroy?: () => void
  }
}

/**
 * 组件事件接口
 */
export interface MirrorEditorEmits {
  /** 内容变化事件 */
  'update:modelValue': [value: string]
  /** 编辑器准备就绪事件 */
  'editor-ready': [editor: any]
  /** 内容变化事件（带详细信息） */
  'content-change': [{
    value: string
    oldValue: string
    source: 'editor' | 'config'
  }]
  /** 同步状态变化事件 */
  'sync-status-change': [isUpdating: boolean]
}

// 定义组件属性
const props = withDefaults(defineProps<MirrorEditorProps>(), {
  editorType: 'textarea',
  language: 'javascript',
  theme: 'vs-dark',
  readonly: false,
  height: '300px',
  width: '100%',
  debug: false,
  syncOptions: () => ({ immediate: true })
})

// 定义组件事件
const emit = defineEmits<MirrorEditorEmits>()

// 响应式状态
const editorContainer = ref<HTMLElement | null>(null)
const editorInstance = ref<any>(null)
const isUpdating = ref(false)
const showDebugPanel = ref(false)
const editorContent = ref('')

// 内部配置值
const internalValue = ref(props.modelValue)

// 配置值的计算属性（用于调试面板显示）
const configValue = computed(() => internalValue.value)

// 监听外部modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== internalValue.value) {
    internalValue.value = newValue
  }
})

// 监听内部值变化，发出事件
watch(internalValue, (newValue, oldValue) => {
  emit('update:modelValue', newValue)
  emit('content-change', {
    value: newValue,
    oldValue: oldValue || '',
    source: isUpdating.value ? 'config' : 'editor'
  })
})

// 监听同步状态变化
watch(isUpdating, (status) => {
  emit('sync-status-change', status)
})

// 计算编辑器样式
const editorStyle = computed<CSSProperties>(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  border: '1px solid #ccc',
  borderRadius: '4px',
  overflow: 'hidden'
}))

// 编辑器操作接口
let editorOperations: {
  getValue: () => string
  setValue: (value: string) => void
  onDidChangeContent: (callback: () => void) => void
  destroy?: () => void
} | null = null

// 同步器实例
let syncController: ReturnType<typeof useEditorSync> | null = null

/**
 * 初始化 Textarea 编辑器
 */
const initTextareaEditor = (container: HTMLElement) => {
  const textarea = document.createElement('textarea')
  textarea.value = internalValue.value
  textarea.style.width = '100%'
  textarea.style.height = '100%'
  textarea.style.border = 'none'
  textarea.style.outline = 'none'
  textarea.style.resize = 'none'
  textarea.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace'
  textarea.style.fontSize = '14px'
  textarea.style.padding = '10px'

  if (props.readonly) {
    textarea.readOnly = true
  }

  container.appendChild(textarea)

  const changeCallbacks: (() => void)[] = []

  textarea.addEventListener('input', () => {
    editorContent.value = textarea.value
    changeCallbacks.forEach(cb => cb())
  })

  return {
    getValue: () => textarea.value,
    setValue: (value: string) => {
      textarea.value = value
      editorContent.value = value
    },
    onDidChangeContent: (callback: () => void) => {
      changeCallbacks.push(callback)
    },
    destroy: () => {
      container.removeChild(textarea)
    }
  }
}

/**
 * 初始化 Monaco Editor
 */
const initMonacoEditor = async (container: HTMLElement) => {
  try {
    // 配置 Monaco Editor worker - 使用官方推荐的禁用worker方式
    if (typeof window !== 'undefined') {
      // 根据Monaco Editor官方文档，设置MonacoEnvironment来禁用worker
      (window as any).MonacoEnvironment = {
        getWorker: function (workerId: string, label: string) {
          // 返回一个简单的worker来避免toUrl错误
          // 这种方式可以让Monaco Editor在主线程中运行，避免worker相关问题
          const workerCode = 'self.onmessage = function() { /* no-op */ };';
          return new Worker(
            URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' }))
          );
        }
      }
    }

    // 动态导入 Monaco Editor - 使用具名导入（推荐方式）
    const { editor } = await import('monaco-editor')

    const monacoEditor = editor.create(container, {
      value: internalValue.value,
      language: props.language,
      theme: props.theme,
      readOnly: props.readonly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      ...props.monacoOptions
    })

    editorInstance.value = monacoEditor
    editorContent.value = monacoEditor.getValue()

    return {
      getValue: () => monacoEditor.getValue(),
      setValue: (value: string) => {
        monacoEditor.setValue(value)
        editorContent.value = value
      },
      onDidChangeContent: (callback: () => void) => {
        monacoEditor.onDidChangeModelContent(() => {
          editorContent.value = monacoEditor.getValue()
          callback()
        })
      },
      destroy: () => {
        monacoEditor.dispose()
      }
    }
  } catch (error) {
    console.warn('Monaco Editor 加载失败，回退到 Textarea:', error)
    return initTextareaEditor(container)
  }
}

/**
 * 初始化 CodeMirror 编辑器
 */
const initCodeMirrorEditor = async (container: HTMLElement) => {
  try {
    // 这里可以添加 CodeMirror 的初始化逻辑
    console.warn('CodeMirror 支持尚未实现，回退到 Textarea')
    return initTextareaEditor(container)
  } catch (error) {
    console.warn('CodeMirror 加载失败，回退到 Textarea:', error)
    return initTextareaEditor(container)
  }
}

/**
 * 初始化编辑器
 */
const initEditor = async () => {
  if (!editorContainer.value) return

  try {
    // 使用自定义初始化函数或默认初始化
    if (props.customEditorInit) {
      editorOperations = props.customEditorInit(editorContainer.value)
    } else {
      switch (props.editorType) {
        case 'monaco':
          editorOperations = await initMonacoEditor(editorContainer.value)
          break
        case 'codemirror':
          editorOperations = await initCodeMirrorEditor(editorContainer.value)
          break
        case 'textarea':
        default:
          editorOperations = initTextareaEditor(editorContainer.value)
          break
      }
    }

    if (editorOperations) {
      // 初始化同步器
      syncController = useEditorSync(
        editorOperations.getValue,
        editorOperations.setValue,
        internalValue,
        isUpdating,
        {
          ...props.syncOptions,
          debug: props.debug,
          configKey: 'MirrorEditor'
        }
      )

      // 监听编辑器内容变化
      editorOperations.onDidChangeContent(() => {
        if (syncController) {
          syncController.onEditorChange()
        }
      })

      // 发出编辑器准备就绪事件
      emit('editor-ready', editorInstance.value || editorOperations)
    }
  } catch (error) {
    console.error('编辑器初始化失败:', error)
  }
}

/**
 * 手动同步到配置
 */
const syncToConfig = () => {
  if (syncController) {
    syncController.syncToConfig()
  }
}

/**
 * 手动同步到编辑器
 */
const syncToEditor = () => {
  if (syncController) {
    syncController.syncToEditor()
  }
}

/**
 * 获取编辑器实例
 */
const getEditorInstance = () => {
  return editorInstance.value || editorOperations
}

/**
 * 获取编辑器内容
 */
const getEditorContent = () => {
  return editorOperations?.getValue() || ''
}

/**
 * 设置编辑器内容
 */
const setEditorContent = (content: string) => {
  if (editorOperations) {
    editorOperations.setValue(content)
  }
}

// 暴露方法给父组件
defineExpose({
  getEditorInstance,
  getEditorContent,
  setEditorContent,
  syncToConfig,
  syncToEditor
})

// 生命周期
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  // 清理资源
  if (syncController) {
    syncController.destroy()
  }
  if (editorOperations?.destroy) {
    editorOperations.destroy()
  }
})
</script>

<style scoped>
.mirror-editor-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.editor-container {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: 350px;
}

/* 调试面板样式 */
.debug-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  border-radius: 6px 6px 0 0;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.debug-content {
  padding: 12px;
}

.debug-item {
  margin-bottom: 8px;
}

.debug-item label {
  display: block;
  font-weight: bold;
  color: #555;
  margin-bottom: 2px;
}

.debug-item pre {
  background: #f8f8f8;
  padding: 4px 6px;
  border-radius: 3px;
  margin: 0;
  font-size: 11px;
  max-height: 60px;
  overflow: auto;
  word-break: break-all;
}

.debug-item span.syncing {
  color: #ff6b35;
  font-weight: bold;
}

.debug-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.debug-btn {
  flex: 1;
  padding: 4px 8px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.debug-btn:hover {
  background: #005a9e;
}

.debug-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-toggle:hover {
  background: #005a9e;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .debug-panel {
    background: #2d2d2d;
    border-color: #555;
    color: #fff;
  }

  .debug-header {
    background: #3a3a3a;
    border-color: #555;
  }

  .debug-header h4 {
    color: #fff;
  }

  .debug-item label {
    color: #ccc;
  }

  .debug-item pre {
    background: #1e1e1e;
    color: #fff;
  }
}
</style>