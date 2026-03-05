import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { glob } from "glob";
import matter from "gray-matter";

const CONTENT_DIR = "src/content/posts";
const OUTPUT_FILE = "src/json/git-history.json";
const MAX_CONCURRENCY = Math.max(1, os.cpus().length - 1);

const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

function getGitHistoryAsync(filePath) {
	return new Promise((resolve) => {
		const git = spawn("git", [
			"log",
			"--follow",
			"--pretty=format:%H|%ad|%s",
			"--date=iso",
			"--",
			filePath,
		]);

		let output = "";
		let error = "";

		git.stdout.on("data", (data) => {
			output += data.toString();
		});

		git.stderr.on("data", (data) => {
			error += data.toString();
		});

		git.on("close", (code) => {
			if (code !== 0) {
				console.warn(`Git history failed for ${filePath}: ${error}`);
				resolve([]);
				return;
			}

			if (!output) {
				resolve([]);
				return;
			}

			const history = output
				.split("\n")
				.filter(Boolean)
				.map((line) => {
					const firstPipe = line.indexOf("|");
					const secondPipe = line.indexOf("|", firstPipe + 1);
					if (firstPipe === -1 || secondPipe === -1) return null;

					return {
						hash: line.substring(0, firstPipe),
						date: line.substring(firstPipe + 1, secondPipe),
						message: line.substring(secondPipe + 1),
					};
				})
				.filter(Boolean);

			resolve(history);
		});

		git.on("error", () => resolve([]));
	});
}

async function main() {
	console.log("Generating git history by abbrlink...");
	console.log(`Using concurrency: ${MAX_CONCURRENCY}`);

	const files = glob.sync(`${CONTENT_DIR}/**/*.{md,mdx}`);
	const historyMap = {};
	let processedCount = 0;

	for (let i = 0; i < files.length; i += MAX_CONCURRENCY) {
		const chunk = files.slice(i, i + MAX_CONCURRENCY);

		const promises = chunk.map(async (file) => {
			try {
				const fileContent = fs.readFileSync(file, "utf-8");
				const { data } = matter(fileContent);

				if (!data.abbrlink) {
					console.warn(`⚠ Missing abbrlink in ${file}`);
					return;
				}

				const history = await getGitHistoryAsync(file);

				// 👇 关键：使用 abbrlink 作为 key
				historyMap[String(data.abbrlink)] = history;

				processedCount++;
				if (processedCount % 10 === 0 || processedCount === files.length) {
					process.stdout.write(
						`\rProcessed ${processedCount}/${files.length} files...`,
					);
				}
			} catch (err) {
				console.warn(`Failed processing ${file}:`, err.message);
			}
		});

		await Promise.all(promises);
	}

	process.stdout.write("\n");

	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(historyMap, null, 2));

	console.log(`Git history generated for ${processedCount} files.`);
	console.log(`Output saved to ${OUTPUT_FILE}`);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
