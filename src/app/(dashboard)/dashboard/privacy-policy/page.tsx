'use client'

import React from 'react';
import Header from '../../../../components/Header';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen  text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">PRIVACY POLICY</h1>
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduction</h2>
          <p>
            At New York Alt Exchange, we are committed to protecting the privacy of our users. 
            This privacy policy describes how we collect, use, and protect the personal information 
            you provide through our application.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
          <p>We collect the following data from our users:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Wallet address: Used as a unique user identifier.</li>
            <li>Email or Telegram username: Used for sending notifications.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Use of Information</h2>
          <p>The collected information is used exclusively for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>User identification and authentication.</li>
            <li>Sending relevant notifications via email or Telegram.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Information Storage and Protection</h2>
          <p>
            All collected information is stored in our secure database and is not shared with third parties. 
            We implement appropriate security measures to protect your data against unauthorized access, 
            alteration, disclosure, or destruction.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">5. User Rights</h2>
          <p>
            You have the right to access, rectify, or delete your personal information at any time. 
            To exercise these rights, please contact us by sending a e-mail to 
            <a href="mailto:info@nyaltx.com" className="text-blue-500 hover:underline ml-1">info@nyaltx.com</a>
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Changes to the Privacy Policy</h2>
          <p>
            We reserve the right to update this privacy policy at any time. We will notify you of any changes 
            through our application or via email.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">7. Contact</h2>
          <p>
            If you have any questions or concerns about our privacy policy, please contact us by sending an e-mail to 
            <a href="mailto:info@nyaltx.com" className="text-blue-500 hover:underline ml-1">info@nyaltx.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
