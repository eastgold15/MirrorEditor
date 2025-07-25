declare module "split-pane-v3" {
	import { DefineComponent } from "vue";

	export const SplitPane: DefineComponent<
		{
			minPercent?: number;
			defaultPercent?: number;
			split: "vertical" | "horizontal";
			className?: string;
		},
		{},
		any
	>;

	// 导出组件的默认导出，以支持直接导入
	const component: DefineComponent<
		{
			minPercent?: number;
			defaultPercent?: number;
			split: "vertical" | "horizontal";
			className?: string;
		},
		{},
		any
	>;

	export default component;
}
