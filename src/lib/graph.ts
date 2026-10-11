import type { Post } from './posts';
import { postUrl } from './posts';

export interface GraphNode {
	id: string;
	title: string;
	url: string;
	tags: string[];
}

export interface GraphEdge {
	/** nodes の添字 */
	source: number;
	target: number;
	/** 共通するタグの数 */
	sharedTags: number;
	/** どちらかの本文が、もう一方の記事にリンクしている */
	linked: boolean;
}

/** 本文中の /blog/<id>/ へのリンク (Markdown と HTML の両方) から、リンク先の記事 id を集める */
function linkedIds(post: Post): Set<string> {
	const ids = new Set<string>();
	for (const match of (post.body ?? '').matchAll(/(?:\]\(|href=["'])\/blog\/([^/"'#?)\s]+)/g)) {
		if (match[1] !== post.id) ids.add(match[1]);
	}
	return ids;
}

/** 記事を点、共通のタグか記事間のリンクがある記事どうしを線にしたグラフ */
export function relatedGraph(posts: Post[]) {
	const nodes: GraphNode[] = posts.map((post) => ({
		id: post.id,
		title: post.data.title,
		url: postUrl(post),
		tags: post.data.tags,
	}));
	const links = posts.map(linkedIds);
	const edges: GraphEdge[] = [];
	for (let i = 0; i < posts.length; i++) {
		for (let j = i + 1; j < posts.length; j++) {
			const sharedTags = nodes[i].tags.filter((tag) => nodes[j].tags.includes(tag)).length;
			const linked = links[i].has(nodes[j].id) || links[j].has(nodes[i].id);
			if (sharedTags > 0 || linked) edges.push({ source: i, target: j, sharedTags, linked });
		}
	}
	return { nodes, edges };
}
