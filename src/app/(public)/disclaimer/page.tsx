'use client'

import React from 'react';
import Header from '../../../components/Header';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">General Disclaimer</h1>
        
        <div className="max-w-4xl mx-auto prose prose-invert">
          <p className="text-gray-300 mb-6">Last Updated: August 28, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Not Financial Advice</h2>
            <p>
              The information provided on Cryptic is for general informational purposes only. The content on our platform does not constitute financial, investment, legal, or tax advice. You should not make any financial decisions based solely on the information provided on our platform.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Investment Risks</h2>
            <p>
              Cryptocurrency investments are subject to high market risk. The cryptocurrency market is volatile and unpredictable. The value of cryptocurrencies can fluctuate significantly in a short period, and you may lose a substantial portion or all of your investment. Past performance is not indicative of future results.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Accuracy of Information</h2>
            <p>
              While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on our platform. Any reliance you place on such information is strictly at your own risk.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Content</h2>
            <p>
              Our platform may include content from third-party sources. We do not control, endorse, or guarantee the accuracy of any third-party content. We are not responsible for any loss or damage that may arise from your use of third-party content.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Technical Risks</h2>
            <p>
              Blockchain technology and cryptocurrencies involve technical risks, including but not limited to software vulnerabilities, network failures, and security breaches. We are not responsible for any loss or damage resulting from these technical risks.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Regulatory Risks</h2>
            <p>
              The regulatory landscape for cryptocurrencies and blockchain technology is evolving. Changes in laws, regulations, or policies may adversely affect the use, transfer, exchange, or value of cryptocurrencies. You are responsible for complying with all applicable laws and regulations in your jurisdiction.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">No Guarantee of Returns</h2>
            <p>
              We do not guarantee any returns on investments made based on information provided on our platform. Any projections, forecasts, or predictions are for illustrative purposes only and should not be relied upon as a guarantee of future performance.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Do Your Own Research</h2>
            <p>
              Before making any investment decisions, we strongly recommend that you conduct your own research and consult with a qualified financial advisor. You should carefully consider your investment objectives, level of experience, and risk appetite.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Cryptic and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of our platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
