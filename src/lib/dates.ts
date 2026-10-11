// astro:content に依存しないので、ブラウザ側のスクリプト (検索ページ) からも使える

// ビルド環境のタイムゾーンに左右されないよう、日付はすべて日本時間で扱う
const TIME_ZONE = 'Asia/Tokyo';

export function dateParts(date: Date) {
	const parts = new Intl.DateTimeFormat('ja-JP', {
		timeZone: TIME_ZONE,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		weekday: 'short',
	}).formatToParts(date);
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? '';
	return { y: get('year'), m: Number(get('month')), d: Number(get('day')), wd: get('weekday') };
}
