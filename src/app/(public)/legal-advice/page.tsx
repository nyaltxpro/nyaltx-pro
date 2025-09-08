'use client'

import React from 'react';
import Header from '../../../components/Header';

const LegalAdvice = () => {
  return (
    <div className="min-h-screen text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">NYALTX Legal Advice</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">
            All the contents of our Website and those to which its hyperlinks refer, as well as those that may result from applications, 
            forums, blogs, social network accounts and other platforms associated with NYALTXTools are intended solely to provide its 
            users with general information and in no case are aimed at the marketing of specific products.
          </p>
          
          <p className="mb-4">
            We cannot guarantee the accuracy of the data published or the accuracy and timeliness of such data. The publication of 
            information by NYALTXTools in no case involves or should be interpreted as financial, legal or any other kind of advice 
            regarding the opportunity to invest in the markets and products to which it refers.
          </p>
          
          <p className="mb-4">
            Any use or exploitation that users may make of the information provided will be at their own risk. The user interested in 
            investing must carry out his own research and analysis, reviewing and verifying such data and contents, before relying on them.
          </p>
          
          <p className="mb-4">
            The commercial transactions referred to in the information constitute a very high risk activity, which may entail serious 
            losses for the investor, and therefore the investor should seek appropriate advice before making any decision.
          </p>
          
          <p className="mb-4 font-semibold">
            Nothing on our Web Page constitutes or should be considered an invitation or an offer to carry out acts of investment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalAdvice;
