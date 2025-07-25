import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const pathResolve = (dir: string) => {
	return resolve(__dirname, ".", dir);
};

const alias: Record<string, string> = {
	"@": pathResolve("./src/"),
};

export default defineConfig(() => {
	return {
		plugins: [vue()],
		resolve: {
			alias: {
				...alias,
				"split-pane-v3": resolve(
					__dirname,
					"../src/components/SplitPane/index.vue",
				),
			},
		},
		server: {
			port: 3000,
			open: true,
			cors: true,
		},
	};
});
