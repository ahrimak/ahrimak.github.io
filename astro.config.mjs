// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { fileURLToPath } from 'node:url';
import * as pagefind from 'pagefind';

/** ビルド後の dist から記事の検索用の索引を作り、dist/pagefind/ に書き出す */
function pagefindIndex() {
	return {
		name: 'pagefind-index',
		hooks: {
			/** @param {{ dir: URL, logger: import('astro').AstroIntegrationLogger }} options */
			'astro:build:done': async ({ dir, logger }) => {
				const { index, errors: createErrors } = await pagefind.createIndex();
				if (!index) throw new Error(createErrors.join('\n'));
				const { page_count, errors } = await index.addDirectory({ path: fileURLToPath(dir) });
				if (errors.length) throw new Error(errors.join('\n'));
				await index.writeFiles({ outputPath: fileURLToPath(new URL('pagefind/', dir)) });
				await pagefind.close();
				logger.info(`${page_count} ページを読み込み、検索用の索引を作りました`);
			},
		},
	};
}

const JAPANESE_SUBSETS = Array.from({ length: 120 }, (_, i) => `[${i}]`);

// https://astro.build/config
export default defineConfig({
	site: 'https://ahrimak.github.io',
	integrations: [mdx(), sitemap(), pagefindIndex()],
	vite: {
		plugins: [tailwindcss()],
	},
	// Shiki はインラインの style 属性を使い CSP と両立しないため、クラスベースの Prism を使う
	markdown: {
		syntaxHighlight: 'prism',
	},
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
				'upgrade-insecure-requests',
			],
			// 検索 (Pagefind) が /pagefind/ のスクリプトを動的に読み込み、WASM を実行するため
			scriptDirective: {
				resources: ["'self'", "'wasm-unsafe-eval'"],
			},
		},
	},
	redirects: {
		'/blog': '/',
	},
	// Google Fonts はビルド時にダウンロードして自前配信する（CSP の font-src を 'self' のままにするため）。
	// 日本語フォントは unicode-range ごとに "[0]"〜"[119]" の subset に分割されている
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Zen Old Mincho',
			cssVariable: '--font-zen-old-mincho',
			weights: [500, 700],
			styles: ['normal'],
			subsets: [...JAPANESE_SUBSETS, 'latin'],
			fallbacks: ['Hiragino Mincho ProN', 'Yu Mincho', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Zen Kaku Gothic New',
			cssVariable: '--font-zen-kaku-gothic-new',
			weights: [400, 500, 700],
			styles: ['normal'],
			subsets: [...JAPANESE_SUBSETS, 'latin'],
			fallbacks: ['Hiragino Sans', 'Yu Gothic', 'sans-serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'IBM Plex Mono',
			cssVariable: '--font-ibm-plex-mono',
			weights: [400, 500],
			styles: ['normal'],
			fallbacks: ['Menlo', 'monospace'],
		},
	],
});
