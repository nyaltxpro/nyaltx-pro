'use client'

import React from 'react';
import Header from '../../components/Header';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="max-w-4xl mx-auto prose prose-invert">
          <p className="text-gray-300 mb-6">Last Updated: August 28, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              At Cryptic, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="mb-4">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2"><strong>Personal Information:</strong> Email address, wallet addresses, and other similar information when you voluntarily provide it.</li>
              <li className="mb-2"><strong>Usage Data:</strong> Information on how you access and use our services, including your browser type, IP address, and device information.</li>
              <li className="mb-2"><strong>Blockchain Data:</strong> Public blockchain data related to transactions and wallet addresses you connect to our platform.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Providing and maintaining our services</li>
              <li className="mb-2">Improving and personalizing user experience</li>
              <li className="mb-2">Analyzing usage patterns and optimizing our platform</li>
              <li className="mb-2">Communicating with you about updates and changes</li>
              <li className="mb-2">Ensuring the security and integrity of our platform</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>
              Our service may contain links to third-party websites or services that are not owned or controlled by Cryptic. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Access to your personal data</li>
              <li className="mb-2">Correction of inaccurate data</li>
              <li className="mb-2">Deletion of your data</li>
              <li className="mb-2">Restriction of processing</li>
              <li className="mb-2">Data portability</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our Contact page or at privacy@cryptic.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
