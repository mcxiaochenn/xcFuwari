---
title: Astro框架Fuwari主题实现仿hexo-abbrlink功能
published: 2026-02-26
description: '实现仿hexo-abbrlink功能，就是不知道改的史山有没有副作用，自己目前用着没发现问题就分享出来了，建议先自行本地部署测试后再并入生产力'
image: ''
tags: [教程,博客,Astro,Fuwari,实战]
category: '教程'
draft: false 
lang: ''
abbrlink: p403bf94e
---

:::tip
修改前必读：

- 本帖基于 ``Astro框架`` 进行修改方案编写，因此请读者优先掌握 [Astro Docs](https://docs.astro.build/) 的内容后再来进行魔改。
- 由于修改内容较多，以及可能会导致意料之外的事情，推荐使用 ``Github`` 配合 ``VSCode`` 进行修改，方便随时备份恢复
:::

## 前言

好久没写文章都生疏了，好在这个框架上手挺快的，配合ai一下午就实现了短链的功能，代码拼拼改改，也不知道有没有隐藏的bug，反正我用到现在一切正常，想要在自己的博客可以接着读下去

## 解析

先来讲一下这到底是个什么玩意，如果你不知道hexo-abbrlink的话，当然我也只是个草台班子，所以尽量讲的简单点

默认情况下，Astro 生成文章链接通常会基于文件路径或 slug。例如你有一篇文章文件：

```
src/content/blog/how-to-build.md
```

默认情况下生成出来的访问地址是：

```
/web/post/how-to-build/
```

这种链接可读性强，但有两个问题：

- 文件名一旦改动，会影响链接
- 链接长度不固定，SEO 迁移时不够稳定

而 ``hexo-abbrlink`` 的思路是：给每篇文章生成一个固定的短 ID 作为访问路径，以后不管文件名或者内容怎么改，链接都不变。

比如原本地址是：

```
/web/post/how-to-build/
```

改造后变成：

```
/web/post/p2wt8g7/
```

那么 ``p2wt8g7`` 就是这篇文章的唯一标识符。

### 生产力环境下

假设你写了一篇文章：Astro框架Fuwari主题实现仿hexo-abbrlink功能

然后文件名是 ``astro-fuwari-theme-implement-hexo-abbrlink-feature.md``

```
/web/post/astro-fuwari-theme-implement-hexo-abbrlink-feature/
```

问题就很明显了：

- 链接非常长
- 分享时不好看
- 以后如果你想简化文件名，路径就会变

如果你后期重命名文件，改成：

```
astro-abbrlink.md
```

那访问地址就会变成：

```
/web/post/astro-abbrlink/
```

原来的链接：

```
/web/post/astro-fuwari-theme-implement-hexo-abbrlink-feature/
```

就直接 404 了。

如果已经被搜索引擎收录，或者别人引用过，就会造成失效链接。

### 引入 abbrlink 后的效果

构建时在 frontmatter 加入：

```yaml
abbrlink: p403bf94e
```

访问地址就会变成：

```
/web/post/p403bf94e/
```

此时无论你修改标题、文件名、内容、标签、分类等，路径都不会变，这就是 ``abbrlink`` 的优势所在。

## 修改

那么废话说了那么多，相信你已经理解了 ``abbrlink`` 究竟是什么东西，有什么作用，接下来就是教程了。

### 安装依赖

我们需要一个生成哈希值的库，这里推荐使用 `crc-32`，它生成的 ID 简短且碰撞率低。

```bash
pnpm add crc-32
```

### 定义内容 Schema

```diff lang="ts"
// src/content/config.ts
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
+		abbrlink: z.string(),

		/* For internal use */
		prevTitle: z.string().default(""),
```

### 编写自动生成脚本

为了不用手动去写那个复杂的 ID，我们可以写一个脚本，在开发或构建时自动扫描没有 `abbrlink` 的文章并为其生成。

创建文件：

```mjs
// scripts/generate-abbrlink.mjs
import fs from "fs";
import path from "path";
import crc32 from "crc-32";

const POSTS_DIR = "./src/content/posts";

// 收集已有 abbrlink（用于冲突检测）
const usedAbbrlinks = new Set();

function walk(dir) {
  return fs.readdirSync(dir).flatMap(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      return walk(fullPath);
    }
    return fullPath.endsWith(".md") ? [fullPath] : [];
  });
}

const files = walk(POSTS_DIR);

// 先扫描所有已有 abbrlink
for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  const match = content.match(/abbrlink:\s*(\S+)/);
  if (match) {
    usedAbbrlinks.add(match[1]);
  }
}

// 开始处理
for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");

  if (content.includes("abbrlink:")) continue;

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    console.log(`⚠ 跳过无 frontmatter 文件: ${file}`);
    continue;
  }

  // 生成唯一 hash
  let salt = 0;
  let hash;
  let finalAbbr;

  do {
    const base = path.basename(file) + (salt || "");
    hash = (crc32.str(base) >>> 0).toString(16);
    finalAbbr = "p" + hash;
    salt++;
  } while (usedAbbrlinks.has(finalAbbr));

  usedAbbrlinks.add(finalAbbr);

  const newFrontmatter = `---\n${match[1].trimEnd()}\nabbrlink: ${finalAbbr}\n---`;

  const newContent = content.replace(match[0], newFrontmatter);

  fs.writeFileSync(file, newContent);

  console.log(`✓ Generated ${finalAbbr} for ${file}`);
}
```

然后在 `package.json` 中配置脚本，确保每次运行前都执行生成：

```json
"scripts": {
  "gen:abbr": "node scripts/generate-abbrlink.mjs",
  "dev": "pnpm gen:abbr && astro dev",
  "build": "pnpm gen:abbr && astro build"
}
```

### 修改路由逻辑

这是最关键的一步。我们需要让 Astro 使用 `abbrlink` 而不是文件名作为路由。

修改 `src/pages/posts/[...slug].astro`：

```diff lang="astro"
// src/pages/posts/[...slug].astro
export async function getStaticPaths() {
	const blogEntries = await getSortedPosts();
-	return blogEntries.map((entry) => ({
-		params: { slug: entry.slug },
-		props: { entry },
-	}));
+	return blogEntries.flatMap((entry) => {
+		if (!entry.data.abbrlink) {
+			throw new Error(
+				`Post "${entry.id}" missing abbrlink`
+			);
+		}
+
+		return [
+			// 新短链
+			{
+				params: { slug: entry.data.abbrlink },
+				props: { entry },
+			},
+		];
+	});
+}

...

                <Content />
            </Markdown>

-            {licenseConfig.enable && <License title={entry.data.title} slug={entry.slug} pubDate={entry.data.published} class="mb-6 rounded-xl license-container onload-animation"></License>}
+            {licenseConfig.enable && <License title={entry.data.title} slug={entry.data.abbrlink || entry.slug} pubDate={entry.data.published} class="mb-6 rounded-xl license-container onload-animation"></License>}

        </div>
    </div>
```

### 适配工具函数

由于 Fuwari 主题内部很多地方（如分类、标签、上下篇文章）都依赖 `slug`，我们需要在 `src/utils/content-utils.ts` 中统一将 `slug` 替换为 `abbrlink`。

```diff lang="ts"
// src/utils/content-utils.ts
export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

+	for (let i = 0; i < sorted.length; i++) {
+		sorted[i].slug = sorted[i].data.abbrlink ?? sorted[i].slug;
+	}
+
	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
-		slug: post.slug,
+		slug: post.data.abbrlink ?? post.slug,
		data: post.data,
	}));

```

同时，确保 `src/utils/url-utils.ts` 中的 `getPostUrlBySlug` 函数能够正确处理这些短链：

```ts
export function getPostUrlBySlug(slug: string): string {
    return url(`/posts/${slug}/`);
}
```

## 写在最后

通过以上几步，我们就成功在 Astro 的 Fuwari 主题中实现了类似 Hexo 的 `abbrlink` 功能。

**这样做的好处显而易见：**
1. **链接永久化**：无论你怎么折腾文件名，外部链接永远有效。
2. **美观性**：短小精悍的 ID 比一长串中文转义字符好看得多。
3. **自动化**：配合脚本，几乎不需要手动干预。

当然，如果你是中途切换到这种模式，记得给旧链接做 301 跳转，希望这篇教程能帮到正在折腾 Astro 的你！

最后，新年第一更，在新的一年，愿你眼中有光，心中有爱，脚下有路；

愿所有努力都有回响，所有期待都不被辜负；

在平凡的日子里收获踏实的幸福，在忙碌的时光中守住内心的从容，让过去成为底气，让未来充满希望，带着勇气与热情，奔赴下一场山海。

新年快乐！Happy new Year!!!
