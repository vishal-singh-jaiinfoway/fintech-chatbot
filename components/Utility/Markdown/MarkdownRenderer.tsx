import React from "react";
import ReactMarkdown from "react-markdown";
import { MarkdownComponents } from "./MarkdownComponents";
import './MarkdownRenderer.css'

interface MarkdownRendererProps {
  content: string; // Define content as a required string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>;
};

export default MarkdownRenderer;
