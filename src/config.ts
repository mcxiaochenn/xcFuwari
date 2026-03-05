import type {
	CommentConfig,
	ExpressiveCodeConfig,
	GitHubEditConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "辰渊尘站",
	subtitle: "ChenDusk",
	description:
		"《辰渊尘站》是一个专注于IT/互联网技术分享与实践的个人技术博客，同时也会更新日常生活琐事，在这里你不仅可以找到众多前沿技术的分享与实践经验，还可以看到站长本人的生活经历琐事经验分享。",
	keywords: [
		"辰渊尘",
		"辰渊尘官网",
		"辰渊尘站",
		"辰渊尘の博客",
		"尘",
		"渊尘",
		"辰渊",
		"博客",
		"ChenDusk Blog",
		"ChenDusk",
		"Blog",
		"chendusk blog",
		"chendusk",
		"blog",
	],
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 170, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
			src: "/favicon.png", // Path of the favicon, relative to the /public directory
			// theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
			// sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "友链",
			url: "/link/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		{
			name: "赞助",
			url: "/sponsors/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		{
			name: "留言板",
			url: "/envelope/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
		},
		// LinkPreset.About,
		{
			name: "统计",
			url: "https://umami.mcxiaochen.top/share/JQO3UR9vAhjfqs96", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
		{
			name: "开往",
			url: "https://www.travellings.cn/go.html", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/img/congyu/touxiang.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "辰渊尘",
	bio: "05后，高中生，内容偏技术向，同时也会更新生活日常，希望能对你有用QwQ",
	links: [
		{
			name: "QQ",
			icon: "mdi:qqchat", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://qm.qq.com/q/KZKEcWKVSq",
		},
		{
			name: "哔哩哔哩",
			icon: "ri:bilibili-fill",
			url: "https://space.bilibili.com/123757127",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/mcxiaochenn",
		},
		{
			name: "Mail",
			icon: "material-symbols:mail",
			url: "mailto:mcxiaochenn_yyds@163.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	twikoo: {
		envId: "https://twikoo.mcxiaochen.top/",
		lang: "zh-CN",
	},
};

export const gitHubEditConfig: GitHubEditConfig = {
	enable: true,
	baseUrl: "https://github.com/mcxiaochenn/xcBlog/blob/main/src/content/posts",
};
