import { ref, watch, type Ref } from 'vue'

/**
 * 编辑器同步选项接口
 */
export interface EditorSyncOptions {
  /** 是否在初始化时立即同步编辑器内容 */
  immediate?: boolean
  /** 自定义配置键名，用于日志和调试 */
  configKey?: string
  /** 是否启用调试日志 */
  debug?: boolean
}

/**
 * 编辑器同步返回值接口
 */
export interface EditorSyncReturn {
  /** 编辑器内容变化时调用的方法 */
  onEditorChange: () => void
  /** 手动同步编辑器内容到配置 */
  syncToConfig: () => void
  /** 手动同步配置到编辑器 */
  syncToEditor: () => void
  /** 销毁同步器，清理资源 */
  destroy: () => void
}

/**
 * 绑定编辑器与配置数据的双向同步
 * 
 * @param getValue 从编辑器获取内容的方法，比如 () => monacoEditor.getValue()
 * @param setValue 设置编辑器内容的方法，比如 (v: string) => monacoEditor.setValue(v)
 * @param configValue 响应式的配置值，比如 nodeConfig.script
 * @param isUpdatingFlag 防止循环的标志位，比如 isUpdatingFromScript
 * @param options 同步选项配置
 * @returns 编辑器同步控制器
 * 
 * @example
 * ```typescript
 * const nodeConfig = reactive({ script: '' })
 * const isUpdatingFromScript = ref(false)
 * const monacoEditor = ref<any>(null)
 * 
 * const { onEditorChange } = useEditorSync(
 *   () => monacoEditor.value.getValue(),
 *   (v) => monacoEditor.value.setValue(v),
 *   toRef(nodeConfig, 'script'),
 *   isUpdatingFromScript,
 *   { immediate: true, configKey: 'script', debug: true }
 * )
 * 
 * // 监听编辑器内容变化
 * monacoEditor.value.onDidChangeModelContent(() => {
 *   onEditorChange()
 * })
 * ```
 */
export function useEditorSync(
  getValue: () => string,
  setValue: (value: string) => void,
  configValue: Ref<string>,
  isUpdatingFlag: Ref<boolean>,
  options: EditorSyncOptions = {}
): EditorSyncReturn {
  const {
    immediate = true,
    configKey = 'unknown',
    debug = false
  } = options

  // 日志工具函数
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[EditorSync:${configKey}] ${message}`, ...args)
    }
  }

  // 停止监听器的函数
  let stopWatcher: (() => void) | null = null

  // 1. 监听编辑器内容变化 → 更新配置
  const onEditorChange = () => {
    if (isUpdatingFlag.value) {
      log('跳过编辑器变化同步（正在更新中）')
      return
    }
    
    try {
      const editorContent = getValue()
      if (editorContent !== configValue.value) {
        log('编辑器内容变化，同步到配置', { from: configValue.value, to: editorContent })
        configValue.value = editorContent
      }
    } catch (error) {
      console.error(`[EditorSync:${configKey}] 获取编辑器内容失败:`, error)
    }
  }

  // 2. 监听配置变化 → 更新编辑器内容
  const startWatching = () => {
    stopWatcher = watch(
      () => configValue.value,
      (newValue, oldValue) => {
        if (isUpdatingFlag.value) {
          log('跳过配置变化同步（正在更新中）')
          return
        }
        
        try {
          const currentValueInEditor = getValue()
          if (currentValueInEditor !== newValue) {
            log('配置变化，同步到编辑器', { from: oldValue, to: newValue })
            isUpdatingFlag.value = true
            setValue(newValue)
            isUpdatingFlag.value = false
          }
        } catch (error) {
          console.error(`[EditorSync:${configKey}] 设置编辑器内容失败:`, error)
          isUpdatingFlag.value = false
        }
      },
      { immediate }
    )
  }

  // 手动同步方法
  const syncToConfig = () => {
    try {
      const editorContent = getValue()
      log('手动同步编辑器内容到配置', editorContent)
      configValue.value = editorContent
    } catch (error) {
      console.error(`[EditorSync:${configKey}] 手动同步到配置失败:`, error)
    }
  }

  const syncToEditor = () => {
    try {
      log('手动同步配置到编辑器', configValue.value)
      isUpdatingFlag.value = true
      setValue(configValue.value)
      isUpdatingFlag.value = false
    } catch (error) {
      console.error(`[EditorSync:${configKey}] 手动同步到编辑器失败:`, error)
      isUpdatingFlag.value = false
    }
  }

  // 销毁方法
  const destroy = () => {
    if (stopWatcher) {
      log('销毁编辑器同步器')
      stopWatcher()
      stopWatcher = null
    }
  }

  // 开始监听
  startWatching()

  log('编辑器同步器初始化完成', {
    immediate,
    configKey,
    debug,
    initialValue: configValue.value
  })

  return {
    onEditorChange,
    syncToConfig,
    syncToEditor,
    destroy
  }
}

/**
 * 多编辑器同步管理器
 * 用于管理多个编辑器实例的同步
 */
export interface MultiEditorSyncConfig {
  /** 编辑器标识 */
  id: string
  /** 获取编辑器内容的方法 */
  getValue: () => string
  /** 设置编辑器内容的方法 */
  setValue: (value: string) => void
  /** 配置值的响应式引用 */
  configValue: Ref<string>
  /** 防循环标志位 */
  isUpdatingFlag: Ref<boolean>
  /** 同步选项 */
  options?: EditorSyncOptions
}

/**
 * 多编辑器同步管理器
 * 
 * @param configs 编辑器配置数组
 * @returns 管理器实例
 * 
 * @example
 * ```typescript
 * const manager = useMultiEditorSync([
 *   {
 *     id: 'editor1',
 *     getValue: () => editor1.getValue(),
 *     setValue: (v) => editor1.setValue(v),
 *     configValue: toRef(config1, 'script'),
 *     isUpdatingFlag: isUpdating1
 *   },
 *   {
 *     id: 'editor2', 
 *     getValue: () => editor2.getValue(),
 *     setValue: (v) => editor2.setValue(v),
 *     configValue: toRef(config2, 'script'),
 *     isUpdatingFlag: isUpdating2
 *   }
 * ])
 * ```
 */
export function useMultiEditorSync(configs: MultiEditorSyncConfig[]) {
  const syncers = new Map<string, EditorSyncReturn>()

  // 初始化所有同步器
  configs.forEach(config => {
    const syncer = useEditorSync(
      config.getValue,
      config.setValue,
      config.configValue,
      config.isUpdatingFlag,
      { ...config.options, configKey: config.id }
    )
    syncers.set(config.id, syncer)
  })

  // 获取指定编辑器的同步器
  const getSyncer = (id: string) => syncers.get(id)

  // 手动触发指定编辑器的内容变化
  const triggerEditorChange = (id: string) => {
    const syncer = syncers.get(id)
    if (syncer) {
      syncer.onEditorChange()
    }
  }

  // 同步所有编辑器到配置
  const syncAllToConfig = () => {
    syncers.forEach(syncer => syncer.syncToConfig())
  }

  // 同步所有配置到编辑器
  const syncAllToEditor = () => {
    syncers.forEach(syncer => syncer.syncToEditor())
  }

  // 销毁所有同步器
  const destroyAll = () => {
    syncers.forEach(syncer => syncer.destroy())
    syncers.clear()
  }

  return {
    getSyncer,
    triggerEditorChange,
    syncAllToConfig,
    syncAllToEditor,
    destroyAll,
    syncers: syncers as ReadonlyMap<string, EditorSyncReturn>
  }
}