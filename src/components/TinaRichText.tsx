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
}

interface TinaRichTextProps {
  content: TinaRichTextNode | string | null | undefined;
  className?: string;
}

const TinaRichText: React.FC<TinaRichTextProps> = ({ content, className }) => {
  if (!content) {
    return null;
  }

  if (typeof content === "string") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const renderNode = (node: TinaRichTextNode, index: number = 0): React.ReactNode => {
    if (node.type === 'text') {
      return node.text;
    }

    // Handle Tina document format
    if (node.type === 'doc' && node.content) {
      return (
        <div className={className}>
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );
    }

    if (node.type === 'paragraph' && node.content) {
      return (
        <p key={index} className="mb-4 text-white/80">
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </p>
      );
    }

    if (node.type === 'heading' && node.attrs?.level && node.content) {
      const level = node.attrs.level;
      const headingClass = level === 2 ? 'text-2xl font-semibold mt-8 mb-4' : 'text-xl font-semibold mt-6 mb-3';
      
      return React.createElement(
        `h${level}` as keyof JSX.IntrinsicElements,
        {
          key: index,
          className: headingClass,
        },
        node.content.map((child, childIndex) => renderNode(child, childIndex))
      );
    }

    if (node.type === 'bulletList' && node.content) {
      return (
        <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </ul>
      );
    }

    if (node.type === 'listItem' && node.content) {
      return (
        <li key={index} className="mb-2">
          {node.content.map((child, childIndex) => renderNode(child, childIndex))}
        </li>
      );
    }

    if (node.type === 'element' && node.tag) {
      const Tag = node.tag as keyof JSX.IntrinsicElements;
      const props = node.props || {};
      
      // Apply specific styling based on the tag
      let elementClassName = props.className || '';
      
      switch (node.tag) {
        case 'h1':
          elementClassName += ' text-4xl md:text-5xl font-extrabold tracking-tight mb-6';
          break;
        case 'h2':
          elementClassName += ' text-2xl font-semibold mb-4';
          break;
        case 'h3':
          elementClassName += ' text-xl font-semibold mb-3';
          break;
        case 'p':
          elementClassName += ' mb-4 text-white/80';
          break;
        case 'ol':
          elementClassName += ' list-decimal pl-6 mb-4 space-y-2';
          break;
        case 'li':
          elementClassName += ' mb-2';
          break;
        case 'section':
          elementClassName = 'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl mb-8';
          break;
      }

      const children = node.children?.map((child, childIndex) => 
        renderNode(child, childIndex)
      );

      return React.createElement(
        Tag,
        {
          key: index,
          ...props,
          className: elementClassName.trim() || undefined,
        },
        // Wrap section content in proper div structure
        node.tag === 'section' ? (
          <div className="relative p-6 md:p-10">
            <div className="pointer-events-none absolute -inset-px rounded-2xl blur-[10px]" />
            <div className="relative">
              {node.children?.map((childNode, childIndex) => {
                // Add icons to section headers
                if (childNode.type === 'element' && (childNode.tag === 'h2' || childNode.tag === 'h3') && childNode.children) {
                  const headerText = childNode.children.find(c => c.type === 'text')?.text || '';
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
                    const headerClass = childNode.tag === 'h2' ? 'text-2xl font-semibold mb-0' : 'text-xl font-semibold mb-0';
                    return (
                      <div key={childIndex} className="mb-6 inline-flex items-center gap-2 text-sm">
                        {icon}
                        <HeaderTag className={headerClass}>{headerText}</HeaderTag>
                      </div>
                    );
                  }
                }
                return <div key={childIndex}>{renderNode(childNode, childIndex)}</div>;
              })}
            </div>
          </div>
        ) : children
      );
    }

    if (node.type === 'root' && node.children) {
      return (
        <div className={className}>
          {node.children.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );
    }

    return null;
  };

  return <>{renderNode(content)}</>;
};

export default TinaRichText;
