'use client'

import React from 'react';
import Header from '../../components/Header';

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Legal Notice</h1>
        
        <div className="max-w-4xl mx-auto prose prose-invert">
          <p className="text-gray-300 mb-6">Last Updated: August 28, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
            <p className="mb-4">
              Cryptic Inc.<br />
              123 Blockchain Street<br />
              Crypto Valley, CA 94103<br />
              United States
            </p>
            <p className="mb-4">
              Email: legal@cryptic.com<br />
              Phone: +1 (555) 123-4567
            </p>
            <p>
              Registered in Delaware<br />
              Company Registration Number: DE 12345678<br />
              Tax ID: 98-7654321
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Legal Representatives</h2>
            <p>
              John Doe, Chief Executive Officer<br />
              Jane Smith, Chief Financial Officer
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Regulatory Compliance</h2>
            <p>
              Cryptic operates in compliance with applicable laws and regulations. We are not a regulated financial institution, investment advisor, or broker-dealer. The information provided on our platform is for informational purposes only and does not constitute financial advice.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Copyright Notice</h2>
            <p>
              © 2025 Cryptic Inc. All rights reserved. The content, design, graphics, and other materials on this website are protected by copyright and other intellectual property laws. Reproduction, distribution, or use of the content, in whole or in part, is prohibited without prior written consent from Cryptic Inc.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Trademark Notice</h2>
            <p>
              Cryptic™, the Cryptic logo, and other marks indicated on our website are trademarks or registered trademarks of Cryptic Inc. in the United States and other countries. Other company names, product names, and logos mentioned herein may be trademarks of their respective owners.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
            <p>
              Any disputes arising out of or related to the use of our services shall be resolved through arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in San Francisco, California, and shall be conducted in English.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Applicable Law</h2>
            <p>
              These legal notices and any disputes arising out of or related to the use of our services shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
