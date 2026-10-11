import { type CollectionEntry, getCollection } from 'astro:content';
import { dateParts } from './dates';

export { dateParts };

export type Post = CollectionEntry<'blog'>;

/** 新しい順に並べた全記事 */
export async function getPosts(): Promise<Post[]> {
	return (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

/** 例: 2026年10月8日（木） */
export function jpDate(date: Date) {
	const { y, m, d, wd } = dateParts(date);
	return `${y}年${m}月${d}日（${wd}）`;
}

/** アーカイブのキー。例: 2026-10 */
export function monthKey(date: Date) {
	const { y, m } = dateParts(date);
	return `${y}-${String(m).padStart(2, '0')}`;
}

/** 例: 2026年10月 */
export function monthLabel(key: string) {
	const [y, m] = key.split('-');
	return `${y}年${Number(m)}月`;
}

/** 1 分あたり 500 文字として読了時間を見積もる */
export function readMinutes(post: Post) {
	const text = (post.body ?? '').replace(/<[^>]+>|[#>*_`~\-[\]()!]/g, '').replace(/\s+/g, '');
	return Math.max(1, Math.round(text.length / 500));
}

/** 新しい順のアーカイブ月と記事数 */
export function archiveMonths(posts: Post[]) {
	const counts = new Map<string, number>();
	for (const p of posts) {
		const k = monthKey(p.data.pubDate);
		counts.set(k, (counts.get(k) ?? 0) + 1);
	}
	return [...counts];
}

/** 新しい記事に付いている順のタグ一覧 */
export function allTags(posts: Post[]) {
	return [...new Set(posts.flatMap((p) => p.data.tags))];
}

export const postUrl = (post: Post) => `/blog/${post.id}/`;
export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tag)}/`;
export const monthUrl = (key: string) => `/archive/${key}/`;
