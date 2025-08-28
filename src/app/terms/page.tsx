'use client'

import React from 'react';
import Header from '../components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>
        
        <div className="max-w-4xl mx-auto prose prose-invert">
          <p className="text-gray-300 mb-6">Last Updated: August 28, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Cryptic platform, website, and services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p>
              Cryptic provides a platform for tracking cryptocurrency prices, viewing charts, analyzing market data, and connecting digital wallets for portfolio tracking. Our Services are provided on an "as is" and "as available" basis.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              Some features of our Services may require you to connect a digital wallet or create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Maintaining the confidentiality of your account information</li>
              <li className="mb-2">Restricting access to your account</li>
              <li className="mb-2">All activities that occur under your account</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="mb-4">
              You agree not to use our Services to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Violate any applicable laws or regulations</li>
              <li className="mb-2">Infringe upon the rights of others</li>
              <li className="mb-2">Distribute malware or other harmful code</li>
              <li className="mb-2">Interfere with or disrupt the Services</li>
              <li className="mb-2">Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, and software, are owned by Cryptic or its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Links and Services</h2>
            <p>
              Our Services may contain links to third-party websites or services. We are not responsible for the content or practices of these third-party sites and services. Your interactions with any third-party website or service are solely between you and that third party.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE UNDER APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRYPTIC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the updated Terms on our website. Your continued use of our Services after such modifications constitutes your acceptance of the revised Terms.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Cryptic is established, without regard to its conflict of law provisions.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us through our Contact page or at legal@cryptic.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
