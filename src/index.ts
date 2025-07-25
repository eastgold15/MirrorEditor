// MirrorEditor 库的主入口文件

// 导出主要组件
export { default as MirrorEditor } from './components/MirrorEditor/index.vue'

// 导出 Composables
export {
  useEditorSync,
  useMultiEditorSync,
  type EditorSyncOptions,
  type EditorSyncReturn,
  type MultiEditorSyncConfig
} from './composables/useEditorSync'

// 导出组件类型定义
export type {
  MirrorEditorProps,
  MirrorEditorEmits
} from './components/MirrorEditor/index.vue'

// 版本信息
export const version = '1.0.0'

// 库信息
export const libraryInfo = {
  name: 'MirrorEditor',
  version: '1.0.0',
  description: '一个通用的编辑器与配置数据双向同步库，支持 Monaco Editor、textarea、CodeMirror 等多种编辑器',
  author: 'pori',
  license: 'MIT'
}

// 默认导出（用于 Vue 插件安装）
import type { App } from 'vue'
import MirrorEditor from './components/MirrorEditor/index.vue'

/**
 * Vue 插件安装函数
 * @param app Vue 应用实例
 * @param options 插件选项
 */
export function install(app: App, options?: any) {
  // 注册全局组件
  app.component('MirrorEditor', MirrorEditor)

  // 可以在这里添加全局配置
  if (options?.globalConfig) {
    app.config.globalProperties.$mirrorEditor = options.globalConfig
  }
}

// 默认导出插件对象
export default {
  install,
  version,
  MirrorEditor
}