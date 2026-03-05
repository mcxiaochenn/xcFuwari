import { visit } from 'unist-util-visit';

export default function remarkAnzhiyuFolding() {
  return (tree) => {
    const foldingStartRegex = /{%-?\s*folding\s*(.*?)\s*-?%}/;
    const foldingEndRegex = /{%-?\s*endfolding\s*-?%}/;

    const newRootChildren = [];
    const stack = [];

    const pushToCurrent = (node) => {
      if (stack.length > 0) {
        stack[stack.length - 1].children[1].children.push(node);
      } else {
        newRootChildren.push(node);
      }
    };

    // 辅助函数：刷新待处理的行内节点到段落
    let pendingInlines = [];
    const flushInlines = () => {
      if (pendingInlines.length > 0) {
        pushToCurrent({ type: 'paragraph', children: [...pendingInlines] });
        pendingInlines = [];
      }
    };

    // 递归打碎包含标签的容器节点
    const shatter = (node) => {
      if (node.type === 'text') {
        const parts = node.value.split(/({%-?\s*(?:folding|endfolding).*?-?%})/g);
        const result = [];
        for (const part of parts) {
          if (foldingStartRegex.test(part)) {
            result.push({ type: 'foldingStart', value: part });
          } else if (foldingEndRegex.test(part)) {
            result.push({ type: 'foldingEnd', value: part });
          } else if (part) {
            result.push({ type: 'text', value: part });
          }
        }
        return result;
      }
      
      if (node.children) {
        let hasTag = false;
        visit(node, (n) => {
          if (n.type === 'text' && (foldingStartRegex.test(n.value) || foldingEndRegex.test(n.value))) {
            hasTag = true;
          }
        });

        if (hasTag) {
          const flattened = [];
          for (const child of node.children) {
            flattened.push(...shatter(child));
          }
          return flattened;
        }
      }
      return [node];
    };

    for (const child of tree.children) {
      const shattered = shatter(child);
      
      for (const node of shattered) {
        if (node.type === 'foldingStart') {
          flushInlines();
          const match = node.value.match(foldingStartRegex);
          const args = match[1].split(',').map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));
          let style = '', title = '';
          if (args.length > 1) { style = args[0]; title = args[1]; }
          else if (args.length > 0) { title = args[0]; }

          stack.push({
            type: 'folding',
            data: { hName: 'details', hProperties: { className: ['folding-tag'], ...(style ? { [style]: true } : {}) } },
            children: [
              { type: 'summary', data: { hName: 'summary' }, children: [{ type: 'text', value: title }] },
              { type: 'content', data: { hName: 'div', hProperties: { className: ['content'] } }, children: [] }
            ]
          });
        } else if (node.type === 'foldingEnd') {
          flushInlines();
          if (stack.length > 0) {
            const finished = stack.pop();
            pushToCurrent(finished);
          }
        } else {
          // 判断是否为行内节点
          const isInline = ['text', 'strong', 'emphasis', 'link', 'inlineCode', 'image', 'html'].includes(node.type);
          if (isInline) {
            pendingInlines.push(node);
          } else {
            flushInlines();
            pushToCurrent(node);
          }
        }
      }
    }
    flushInlines();

    while (stack.length > 0) {
      const unfinished = stack.pop();
      newRootChildren.push(unfinished);
    }

    tree.children = newRootChildren;
  };
}
