// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

const JAPANESE_SUBSETS = Array.from({ length: 120 }, (_, i) => `[${i}]`);

// https://astro.build/config
export default defineConfig({
	site: 'https://ahrimak.github.io',
	integrations: [mdx(), sitemap()],
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
