import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

// 解决 __dirname 在 ESM 中不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== 配置路径 =====
const sourceFile = path.resolve(__dirname, "./link.yml"); // 根据你目录结构调整
const outputDir = path.resolve(__dirname, "./flink");

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取 YAML
const fileContent = fs.readFileSync(sourceFile, "utf8");
const data = yaml.load(fileContent);

// 文件名安全处理
function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").trim();
}

// 遍历数据
for (const group of data) {
  if (!group.link_list) continue;

  for (const item of group.link_list) {
    const jsonData = {
      name: item.name,
      avatar: item.avatar || "",
      description: item.descr || "",
      url: item.link
    };

    const fileName = safeFileName(item.name) + ".json";
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(
      filePath,
      JSON.stringify(jsonData, null, 2),
      "utf8"
    );

    console.log("已生成:", fileName);
  }
}

console.log("全部转换完成 ✔");
