import type { Component, Slot, VNode } from "vue";

/**
 * 模板使用函数的类型定义
 */
export type TemplateRenderer = (
	props: Record<string, any>,
) => VNode | VNode[] | undefined;

/**
 * 模板系统返回类型
 */
export type TemplateSystem = [DefineTemplateComponent, TemplateRenderer];

/**
 * 定义模板组件的类型
 */
export type DefineTemplateComponent = Component;

/**
 * 创建可重用的Vue模板系统
 *
 * 这个函数利用闭包创建一个可重用的模板机制，允许在一个组件中定义模板，
 * 然后在其他地方重用该模板。主要用于高级组件设计模式，如插槽传递和模板复用。
 *
 * @returns 返回一个包含两个元素的数组：[DefineTemplate组件, useTemplate函数]
 */
export function createReuseableTemplate(): TemplateSystem {
	// 存储插槽渲染函数的闭包变量
	let render: Slot | undefined;

	// 定义一个组件，用于捕获插槽内容
	const DefineTemplate: Component = {
		setup(_, { slots }) {
			// 返回渲染函数，将默认插槽保存到闭包变量中
			return () => {
				render = slots.default;
			};
		},
	};

	/**
	 * 使用保存的模板渲染函数
	 * @param props - 传递给模板的属性
	 * @returns 渲染的VNode节点
	 */
	const useTemplate = (
		props: Record<string, any> = {},
	): VNode | VNode[] | undefined => {
		if (!render) {
			console.warn(
				"Template not defined yet. Make sure DefineTemplate is mounted before using useTemplate.",
			);
			return undefined;
		}
		try {
			return render(props);
		} catch (error) {
			console.error("Error rendering template:", error);
			return undefined;
		}
	};

	return [DefineTemplate, useTemplate];
}
