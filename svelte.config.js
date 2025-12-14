import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// 使用 static 适配器
		adapter: adapter({
			// pages: 'build',  // 输出目录，默认是 build
			// assets: 'build', // 静态资源目录，默认是 build
			
			// 【关键配置】
			// 将 fallback 设置为 'index.html'。
			// 这意味着生成的 build 文件夹里会有一个 index.html，
			// 所有的动态路由都会由这个文件承载。
			fallback: 'index.html', 
			
			precompress: false,
			strict: true
		})
	}
};

export default config;