import React from "react";
import { Components } from "react-markdown";

// Heading Component (Fix)
const Heading: React.FC<{ level: number; children?: React.ReactNode }> = ({ level, children, ...props }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={`heading-${level}`} {...props}>{children}</Tag>;
};

// Paragraph
const Paragraph: React.FC<{ children?: React.ReactNode }> = ({ children }) => <p className="paragraph">{children}</p>;

// Blockquote
const Blockquote: React.FC<{ children?: React.ReactNode }> = ({ children }) => <blockquote className="blockquote">{children}</blockquote>;

// List
const List: React.FC<{ ordered?: boolean; children?: React.ReactNode }> = ({ ordered, children }) => {
  const Tag = ordered ? "ol" : "ul";
  return <Tag className="list">{children}</Tag>;
};

// List Item
const ListItem: React.FC<{ children?: React.ReactNode }> = ({ children }) => <li className="list-item">{children}</li>;

// Code Block
const CodeBlock: React.FC<{ inline?: boolean; className?: string; children?: React.ReactNode }> = ({ inline, children }) => {
  return inline ? <code className="inline-code">{children}</code> : <pre className="code-block"><code>{children}</code></pre>;
};

// Table
const Table: React.FC<{ children?: React.ReactNode }> = ({ children }) => <table className="table">{children}</table>;

// Table Row
const TableRow: React.FC<{ children?: React.ReactNode }> = ({ children }) => <tr className="table-row">{children}</tr>;

// Table Cell
const TableCell: React.FC<{ isHeader?: boolean; children?: React.ReactNode }> = ({ isHeader, children }) => {
  const Tag = isHeader ? "th" : "td";
  return <Tag className="table-cell">{children}</Tag>;
};

// Anchor (Link)
const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ href, children, ...props }) => (
  <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

// Image
const Image: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, ...props }) => (
  <img src={src} alt={alt} className="markdown-image" {...props} />
);



// Markdown Components Mapping
export const MarkdownComponents: Components = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  h5: (props) => <Heading level={5} {...props} />,
  h6: (props) => <Heading level={6} {...props} />,
  p: Paragraph,
  blockquote: Blockquote,
  ul: (props) => <List ordered={false} {...props} />,
  ol: (props) => <List ordered={true} {...props} />,
  li: ListItem,
  code: CodeBlock,
  table: Table,
  tr: TableRow,
  th: (props) => <TableCell isHeader={true} {...props} />,
  td: (props) => <TableCell isHeader={false} {...props} />,
  a: Link,
  img: Image,
};
