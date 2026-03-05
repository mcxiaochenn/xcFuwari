import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext) {
	const blog = await getSortedPosts();
	const site = context.site ?? siteConfig.url;

	const entries = blog.map((post) => {
		const raw =
			typeof post.body === "string" ? post.body : String(post.body || "");

		const cleaned = stripInvalidXmlChars(raw);

		const html = sanitizeHtml(parser.render(cleaned), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
		});

		const postUrl = `${site}${url(`/posts/${post.slug}/`)}`;

		// 🔥 处理分类（支持字符串或数组）
		const categories = post.data.category
			? Array.isArray(post.data.category)
				? post.data.category
				: [post.data.category]
			: [];

		const categoryXml = categories
			.map((cat: string) => `<category term="${cat}" />`)
			.join("\n    ");

		return `
  <entry>
    <title><![CDATA[${post.data.title}]]></title>
    <link href="${postUrl}" />
    <id>${postUrl}</id>
    <updated>${new Date(post.data.published).toISOString()}</updated>
    ${categoryXml}
    <summary><![CDATA[${post.data.description || ""}]]></summary>
    <content type="html"><![CDATA[${html}]]></content>
  </entry>`;
	});

	const updated =
		blog.length > 0
			? new Date(blog[0].data.published).toISOString()
			: new Date().toISOString();

	const xml = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/feed/atom.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title><![CDATA[${siteConfig.title}]]></title>
  <subtitle><![CDATA[${siteConfig.subtitle || ""}]]></subtitle>
  <link href="${site}" />
  <link href="${site}/atom.xml" rel="self" />
  <updated>${updated}</updated>
  <id>${site}</id>
  <author>
    <name><![CDATA[${siteConfig.title}]]></name>
  </author>
  ${entries.join("\n")}
</feed>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
}
