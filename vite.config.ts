import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig, type LibraryOptions } from "vite";

const pathResolve = (dir: string) => {
	return resolve(__dirname, ".", dir);
};

const alias: Record<string, string> = {
	"@": pathResolve("./src/"),
	// "#": join(__dirname, "types"),
};

// 库构建配置
const libOptions: LibraryOptions = {
	entry: pathResolve("./src/index.ts"),
	name: "MirrorEditor",
	fileName: (format) => `mirror-editor.${format}.js`,
	formats: ["es", "umd"],
};

// 确保类型定义文件被正确生成和包含

const viteConfig = defineConfig(() => {
	return {
		plugins: [
			vue(),
			AutoImport({
				resolvers: [ElementPlusResolver()],
				dts: "./types/generated/auto-imports.d.ts",
			}),
			Components({
				resolvers: [ElementPlusResolver()],
				dts: "./types/generated/components.d.ts",
			}),
		],
		resolve: { alias },
		base: "/mirror-editor/",
		// Monaco Editor worker 配置
		define: {
			global: 'globalThis',
		},
		optimizeDeps: {
			include: [
				'monaco-editor/esm/vs/editor/editor.worker?worker',
				'monaco-editor/esm/vs/language/json/json.worker?worker',
				'monaco-editor/esm/vs/language/css/css.worker?worker',
				'monaco-editor/esm/vs/language/html/html.worker?worker',
				'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
			],
		},
		worker: {
			format: "es"
		},
		build: {
			outDir: "dist",
			lib: libOptions,
			rollupOptions: {
				external: ["vue"],
				output: {
					globals: {
						vue: "Vue",
					},
				},
			},
		},
	};
});
// https://vitejs.dev/config/
export default viteConfig;
