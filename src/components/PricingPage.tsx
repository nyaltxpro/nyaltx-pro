'use client';

import React from 'react';
import { usePricingContent } from '@/hooks/useTinaContent';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaCheck, FaStar } from 'react-icons/fa';

const PricingPage: React.FC = () => {
  const { content, loading, error } = usePricingContent();

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
            <h1 className="text-4xl font-bold mb-4">Pricing</h1>
            <p className="text-gray-400">
              Sorry, we couldn't load the pricing information. Please try again later.
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
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            {content?.hero?.title || "Choose Your Plan"}
          </h1>
          {content?.hero?.subtitle && (
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              {content.hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content?.plans?.map((plan: any, index: number) => (
              <div
                key={index}
                className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-cyan-500 bg-gradient-to-b from-cyan-500/10 to-indigo-500/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <FaStar className="w-3 h-3" />
                      {plan.badge || "Most Popular"}
                    </span>
                  </div>
                )}

                {plan.badge && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-700 text-gray-300 px-4 py-1 rounded-full text-sm font-medium">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-2">/ {plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features?.map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <FaCheck className="text-green-500 w-4 h-4 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.ctaLink || '#'}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-600 hover:to-indigo-600'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.ctaText || "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
