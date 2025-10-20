'use client';

import React from 'react';
import { FiTarget, FiCpu } from 'react-icons/fi';

interface TinaRichTextNode {
  type: 'root' | 'element' | 'text';
  tag?: string;
  props?: Record<string, any>;
  children?: TinaRichTextNode[];
  text?: string;
}

interface TinaRichTextProps {
  content: TinaRichTextNode;
  className?: string;
}

const TinaRichText: React.FC<TinaRichTextProps> = ({ content, className }) => {
  const renderNode = (node: TinaRichTextNode, index: number = 0): React.ReactNode => {
    if (node.type === 'text') {
      return node.text;
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
                if (childNode.type === 'element' && childNode.tag === 'h2' && childNode.children) {
                  const headerText = childNode.children.find(c => c.type === 'text')?.text || '';
                  let icon = null;
                  
                  if (headerText === 'Our Mission') {
                    icon = <FiTarget className="h-5 w-5 text-cyan-300" />;
                  } else if (headerText === 'Our Technology') {
                    icon = <FiCpu className="h-5 w-5 text-cyan-300" />;
                  }
                  
                  if (icon) {
                    return (
                      <div key={childIndex} className="mb-6 inline-flex items-center gap-2 text-sm">
                        {icon}
                        <h2 className="text-2xl font-semibold mb-0">{headerText}</h2>
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
