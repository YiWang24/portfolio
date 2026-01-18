// Prevent MDX from parsing { } in code blocks
export default function remarkCodeBlockEscape() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node.type === "code") {
        // Ensure code content is treated as plain text
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.className = node.data.hProperties.className || [];
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };
    visit(tree);
  };
}
