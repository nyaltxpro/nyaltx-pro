'use client';

import React from 'react';
import { FiTarget, FiCpu, FiAlertTriangle } from 'react-icons/fi';

interface TinaRichTextNode {
  type: 'root' | 'element' | 'text' | 'doc' | 'paragraph' | 'heading' | 'bulletList' | 'listItem';
  tag?: string;
  props?: Record<string, any>;
  children?: TinaRichTextNode[];
  text?: string;
  attrs?: { level?: number };
  content?: TinaRichTextNode[];
  marks?: Array<{ type: string }>;
}

interface RichTextRendererProps {
  content: TinaRichTextNode | string | null | undefined;
  className?: string;
}

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

/** Quill often embeds black text colors — strip so dark theme CSS can apply. */
const sanitizeBlogHtml = (html: string) =>
  html
    .replace(/color\s*:\s*[^;"]+;?/gi, '')
    .replace(/background(-color)?\s*:\s*[^;"]+;?/gi, '')
    .replace(/\sstyle="\s*"/gi, '');

const simpleMarkdownToHtml = (markdown: string) => {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      const line = block.trim();
      if (!line) return '';
      const heading = /^(#{1,6})\s+(.+)$/.exec(line);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2].replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return `<h${level}>${text}</h${level}>`;
      }
      const withBold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
      return `<p>${withBold}</p>`;
    })
    .join('\n');
};

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  const wrapperClass = ['blog-prose', className].filter(Boolean).join(' ');

  if (typeof content === 'string') {
    const html = looksLikeHtml(content)
      ? sanitizeBlogHtml(content)
      : simpleMarkdownToHtml(content);

    return (
      <div
        className={wrapperClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const renderNode = (node: TinaRichTextNode, index: number = 0): React.ReactNode => {
    if (node.type === 'text') {
      let textNode: React.ReactNode = node.text;
      if (node.marks?.some((m) => m.type === 'bold' || m.type === 'strong')) {
        textNode = <strong key={index}>{node.text}</strong>;
      }
      if (node.marks?.some((m) => m.type === 'italic' || m.type === 'em')) {
        textNode = <em key={`em-${index}`}>{textNode}</em>;
      }
      return textNode;
    }

    if (node.type === 'doc' && node.content) {
      return (
        <div className={wrapperClass}>
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );
    }

    if (node.type === 'paragraph' && node.content) {
      return (
        <p key={index} className="mb-4">
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </p>
      );
    }

    if (node.type === 'heading' && node.attrs?.level && node.content) {
      const level = Math.min(6, Math.max(1, node.attrs.level));
      return React.createElement(
        `h${level}` as keyof JSX.IntrinsicElements,
        { key: index },
        node.content.map((child, childIndex) => renderNode(child, childIndex)),
      );
    }

    if (node.type === 'bulletList' && node.content) {
      return (
        <ul key={index}>
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </ul>
      );
    }

    if (node.type === 'listItem' && node.content) {
      return (
        <li key={index}>
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </li>
      );
    }

    if (node.type === 'element' && node.tag) {
      const Tag = node.tag as keyof JSX.IntrinsicElements;
      const props = { ...(node.props || {}) };
      delete props.style;

      let elementClassName = props.className || '';

      switch (node.tag) {
        case 'section':
          elementClassName =
            'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl mb-8';
          break;
        default:
          break;
      }

      const children = node.children?.map((child, childIndex) => renderNode(child, childIndex));

      return React.createElement(
        Tag,
        {
          key: index,
          ...props,
          className: elementClassName.trim() || undefined,
        },
        node.tag === 'section' ? (
          <div className="relative p-6 md:p-10">
            <div className="relative">
              {node.children?.map((childNode, childIndex) => {
                if (
                  childNode.type === 'element' &&
                  (childNode.tag === 'h2' || childNode.tag === 'h3') &&
                  childNode.children
                ) {
                  const headerText = childNode.children.find((c) => c.type === 'text')?.text || '';
                  let icon = null;

                  if (headerText === 'Our Mission') {
                    icon = <FiTarget className="h-5 w-5 text-cyan-300" />;
                  } else if (headerText === 'Our Technology') {
                    icon = <FiCpu className="h-5 w-5 text-cyan-300" />;
                  } else if (headerText === 'Severe warning') {
                    icon = <FiAlertTriangle className="h-5 w-5 text-amber-300" />;
                  }

                  if (icon) {
                    const HeaderTag = childNode.tag as 'h2' | 'h3';
                    return (
                      <div key={childIndex} className="mb-6 inline-flex items-center gap-2 text-sm">
                        {icon}
                        <HeaderTag>{headerText}</HeaderTag>
                      </div>
                    );
                  }
                }
                return <div key={childIndex}>{renderNode(childNode, childIndex)}</div>;
              })}
            </div>
          </div>
        ) : (
          children
        ),
      );
    }

    if (node.type === 'root' && node.children) {
      return (
        <div className={wrapperClass}>
          {node.children.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );
    }

    return null;
  };

  return <>{renderNode(content)}</>;
};

export default RichTextRenderer;
