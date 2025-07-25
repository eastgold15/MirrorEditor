<template>
	<div style="height: 100%">
		<split-pane :min-percent="0" :default-percent="20" split="vertical" class-name="custom-splitter">
			<template v-slot:paneL>
				<div class="pane-content">
					<h2>左侧面板</h2>
					<p>这是一个垂直分割的左侧面板</p>
				</div>
			</template>
			<template v-slot:paneR>
				<split-pane split="horizontal" :default-percent="75">
					<template v-slot:paneL>
						<div class="pane-content">
							<h2>右上面板</h2>
							<p>这是一个水平分割的上部面板</p>
						</div>
					</template>
					<template v-slot:paneR>
						<split-pane split="vertical" :default-percent="75">
							<template v-slot:paneL>
								<div class="pane-content">
									<h2>右下左侧面板</h2>
									<p>这是一个垂直分割的左侧面板</p>
								</div>
							</template>
							<template v-slot:paneR>
								<div class="pane-content">
									<h2>右下右侧面板</h2>
									<p>这是一个垂直分割的右侧面板</p>
								</div>
							</template>
						</split-pane>
					</template>
				</split-pane>
			</template>
		</split-pane>
	</div>
</template>

<script setup lang="ts">
// 使用默认导入方式
import SplitPane from "split-pane-v3";
</script>

<style scoped>
.pane-content {
	padding: 20px;
	background-color: #f5f7fa;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
}

.pane-content h2 {
	margin-bottom: 10px;
	font-weight: bold;
	color: #409eff;
}

.custom-splitter {
	background-color: #67c23a;
}
</style>