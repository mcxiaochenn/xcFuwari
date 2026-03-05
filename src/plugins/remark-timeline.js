import { visit } from 'unist-util-visit';

export function remarkTimeline() {
  return (tree) => {
    visit(tree, 'root', (root) => {
      const newChildren = [];
      let i = 0;
      while (i < root.children.length) {
        const node = root.children[i];
        
        // 检查是否是 {% timeline ... %}
        let textContent = '';
        if (node.type === 'paragraph' && node.children[0]?.type === 'text') {
          textContent = node.children[0].value;
        } else if (node.type === 'text') {
          textContent = node.value;
        }

        const startMatch = textContent.match(/\{%\s*timeline\s*(.*?)\s*%\}/);
        if (startMatch) {
          const title = startMatch[1].trim();
          let j = i + 1;
          let depth = 1;
          const contentNodes = [];
          
          while (j < root.children.length) {
            const nextNode = root.children[j];
            let nextText = '';
            if (nextNode.type === 'paragraph' && nextNode.children[0]?.type === 'text') {
              nextText = nextNode.children[0].value;
            } else if (nextNode.type === 'text') {
              nextText = nextNode.value;
            }

            if (nextText.includes('{% timeline')) depth++;
            if (nextText.includes('{% endtimeline %}')) {
              depth--;
              if (depth === 0) break;
            }
            contentNodes.push(nextNode);
            j++;
          }

          if (j < root.children.length) {
            // 找到了结束标签
            newChildren.push({
              type: 'parent',
              data: {
                hName: 'div',
                hProperties: { className: ['timeline', 'anzhiyu-timeline'] }
              },
              children: [
                {
                  type: 'div',
                  data: {
                    hName: 'div',
                    hProperties: { className: ['timeline-title'] }
                  },
                  children: [{ type: 'text', value: title }]
                },
                {
                  type: 'div',
                  data: {
                    hName: 'div',
                    hProperties: { className: ['timeline-content'] }
                  },
                  children: processTimelineItems(contentNodes)
                }
              ]
            });
            i = j + 1;
            continue;
          }
        }
        
        newChildren.push(node);
        i++;
      }
      root.children = newChildren;
    });
  };
}

function processTimelineItems(nodes) {
  const items = [];
  let currentItem = null;
  let inItem = false;

  for (const node of nodes) {
    let textValue = '';
    if (node.type === 'paragraph' && node.children[0]?.type === 'text') {
      textValue = node.children[0].value;
    } else if (node.type === 'text') {
      textValue = node.value;
    } else if (node.type === 'html') {
      textValue = node.value;
    }

    const itemStartMatch = textValue.match(/<!--\s*timeline\s*(.*?)\s*-->/);
    const itemEndMatch = textValue.includes('<!-- endtimeline -->');

    if (itemStartMatch) {
      inItem = true;
      currentItem = {
        type: 'div',
        data: {
          hName: 'div',
          hProperties: { className: ['timeline-item'] }
        },
        children: [
          {
            type: 'div',
            data: {
              hName: 'div',
              hProperties: { className: ['timeline-item-title'] }
            },
            children: [{ type: 'text', value: itemStartMatch[1].trim() }]
          },
          {
            type: 'div',
            data: {
              hName: 'div',
              hProperties: { className: ['timeline-item-content'] }
            },
            children: []
          }
        ]
      };
      continue;
    }

    if (itemEndMatch) {
      if (currentItem) {
        items.push(currentItem);
      }
      currentItem = null;
      inItem = false;
      continue;
    }

    if (inItem && currentItem) {
      currentItem.children[1].children.push(node);
    } else if (!isWhitespace(node)) {
      // 忽略不在 item 里的空白，但保留其他内容
      items.push(node);
    }
  }

  return items;
}

function isWhitespace(node) {
  if (node.type === 'text') return node.value.trim() === '';
  if (node.type === 'paragraph') return node.children.every(isWhitespace);
  return false;
}
