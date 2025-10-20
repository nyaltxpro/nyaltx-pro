'use client';

import React, { useState } from 'react';
import { useFAQContent } from '@/hooks/useTinaContent';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQPage: React.FC = () => {
  const { content, loading, error } = useFAQContent();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleFAQ = (categoryIndex: number, questionIndex: number) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <PublicHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">FAQ</h1>
            <p className="text-gray-400">
              Sorry, we couldn't load the FAQ content. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            {content?.title || "Frequently Asked Questions"}
          </h1>
          {content?.description && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {content?.categories?.map((category: any, categoryIndex: number) => (
            <div key={categoryIndex} className="mb-8">
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full text-left mb-4 p-4 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-gray-400 text-sm">
                        {category.description}
                      </p>
                    )}
                  </div>
                  {openCategory === category.name ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              {openCategory === category.name && (
                <div className="space-y-4">
                  {category.questions?.map((question: any, questionIndex: number) => {
                    const faqIndex = `${categoryIndex}-${questionIndex}`;
                    return (
                      <div key={questionIndex} className="border border-gray-700 rounded-lg overflow-hidden">
                        <button
                          className="w-full px-6 py-4 text-left bg-gray-800 hover:bg-gray-750 flex justify-between items-center transition-colors"
                          onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        >
                          <span className="font-medium text-lg">{question.question}</span>
                          {openIndex === faqIndex ? <FaChevronUp /> : <FaChevronDown />}
                        </button>

                        {openIndex === faqIndex && (
                          <div className="px-6 py-4 bg-gray-850 border-t border-gray-700">
                            <div className="prose prose-invert max-w-none">
                              <TinaRichText content={question.answer} />
                            </div>
                            {question.tags && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {question.tags.split(',').map((tag: string, tagIndex: number) => (
                                  <span
                                    key={tagIndex}
                                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Simple rich text renderer for FAQ answers
const TinaRichText: React.FC<{ content: any }> = ({ content }) => {
  if (!content || !content.content) return null;

  const renderNode = (node: any, index: number) => {
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-gray-300 leading-relaxed">
            {node.content?.map((child: any, childIndex: number) => renderNode(child, childIndex))}
          </p>
        );
      
      case 'text':
        let text = node.text || '';
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === 'bold') {
              return <strong key={index} className="font-semibold text-white">{text}</strong>;
            }
            if (mark.type === 'italic') {
              return <em key={index}>{text}</em>;
            }
          });
        }
        return text;
      
      default:
        return null;
    }
  };

  return (
    <div>
      {content.content.map((node: any, index: number) => renderNode(node, index))}
    </div>
  );
};

export default FAQPage;
