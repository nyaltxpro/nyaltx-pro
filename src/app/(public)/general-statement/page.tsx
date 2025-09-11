'use client'

import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import { motion } from 'framer-motion';
import { FiShield, FiAlertTriangle } from 'react-icons/fi';

const GeneralStatement = () => {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white">
      <PublicHeader />
      
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(56,189,248,0.12),rgba(67,56,202,0)_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_80%_10%,rgba(99,102,241,0.18),rgba(14,165,233,0)_60%)]" />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-start gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <FiShield className="h-4 w-4 text-cyan-300" />
            <span>Compliance & Transparency</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              NYALTX Legal Advice
            </span>
          </h1>
          <p className="max-w-3xl text-white/70">
            Please review our general terms, severe risk warnings, and responsibilities when interacting with cryptoassets and related information services.
          </p>
        </motion.div>
      </section>

      {/* Content Card */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-[10px]" />

          <div className="relative p-6 md:p-10">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300 ring-1 ring-cyan-500/30">Updated</span>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-indigo-300 ring-1 ring-indigo-500/30">Legal</span>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-300 ring-1 ring-sky-500/30">Web3</span>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed">
          <h2 className="text-2xl font-semibold mt-6 mb-4">GENERAL TERMS AND CONDITIONS OF USE OF THE WEBSITE</h2>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Acceptance of terms and conditions of use</h3>
          <p className="mb-4">
            Any person accessing this website and make use of it declares to know and also accepts these "General Conditions", 
            fully accessible to any user through its "Legal Notice". Knowledge and acceptance of these "General Conditions" 
            constitute a necessary prerequisite for accessing the information society services offered by Corporate Roadshow, Inc. 
            and its wholly owned subsidiary NYALTX and benefiting from their provision. Therefore, any person who does not agree 
            with what is stipulated therein shall not have the right to make use of this Website.
          </p>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Web Site Ownership</h3>
          <p className="mb-4">
            This Web Page (www.nyaltx.com) is the property of Corporate Roadshow, Inc. The intellectual property rights and rights 
            of exploitation and reproduction of said Web Site, as well as its content, appearance and design, are the exclusive 
            property of this Company, unless expressly specified otherwise. Any improper use of this Web site or its contents may 
            be prosecuted in accordance with applicable law.
          </p>
          <p className="mb-4">
            Corporate Roadshow, Inc. reserves the right to modify, update, expand and delete at any time, without prior notice, 
            the content of this Website, including its own conditions of use. Likewise, it may restrict or remove access to this 
            Website, for the reasons it deems appropriate and at its sole discretion.
          </p>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Scope of the Website</h3>
          <p className="mb-4">
            All information made available to the user through this website constitutes its "Content" and shall be for information 
            purposes only.
          </p>
          <p className="mb-4">
            It is not the intention of the Company to use this Web Site as a means or instrument, directly or indirectly, of 
            conducting business or contracting for services. Under no circumstances should this Web Site be used or considered 
            as an offer to enter into a contract, a solicitation of an offer to enter into a contract, or as an offer to enter 
            into any other type of transaction, unless expressly stated otherwise.
          </p>
          <p className="mb-4">
            The content of this Website does not entail any kind of legal, financial or any other kind of advice by the Company 
            in relation to the performance in the cryptocurrency market, being its purpose exclusively informative. Consequently, 
            the information contained therein should not be taken as a basis or recommendation to make investments or investment 
            decisions, being the personal responsibility of the user to obtain adequate information and advice on the risks, the 
            applicable regulations and the operation of the crypto-asset investment markets. Likewise, it is up to the user to 
            assess and, if necessary, assume the risks associated with the contracting in such markets.
          </p>
          <p className="mb-4">
            This Web Site may contain information provided by entities other than Corporate Roadshow, Inc. shall not be liable 
            for the accuracy of such information nor shall it assume any responsibility for any possible damages that may arise 
            from the use of such information.
          </p>
          <p className="mb-4">
            This website contains links to other websites with the intention of facilitating and providing the user with better 
            information about the matters and activities that constitute the corporate purpose of the Company. It is the user's 
            responsibility to evaluate the content and usefulness of the information published on these other websites, without 
            the Company assuming any responsibility for the security or privacy of these links or the content of such websites.
          </p>
          <p className="mb-4">
            Third parties wishing to establish links to this Website must obtain prior written authorization from Corporate 
            Roadshow, Inc.
          </p>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Website Usage</h3>
          <p className="mb-4">
            The contents of this website may be downloaded, if available, copied and printed for personal use only. The Company 
            is not responsible for any discrepancies that may arise between the printed version and the electronic version of 
            the information contained in this website.
          </p>
          <p className="mb-4">
            Without prejudice to the provisions of the preceding paragraph, the copying, duplication, redistribution, electronic 
            reproduction, printing, commercialization, marketing or any other use that may be made of the contents of this Web 
            site, in whole or in part, whether in the form of written or graphic documents, is forbidden, even when citing the 
            written or graphic documents; The content of this Web site, in whole or in part, whether in the form of written or 
            graphic documents, may not be reproduced, reproduced electronically, printed, marketed, sold, traded, or otherwise 
            exploited in any way, even if the source is cited, without the prior written consent of the Company.
          </p>
          
          <h3 className="text-xl font-semibold mt-5 mb-3 inline-flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-amber-300" />
            <span>Severe warning</span>
          </h3>
          <p className="mb-4">
            Corporate Roadshow, Inc. wishes to expressly inform the users of its website of the following circumstances related 
            to the activity carried out in connection with the cryptocurrency and other cryptoassets markets:
          </p>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>
              Investments in crypto-assets and the yield obtained therefrom may experience significant changes in value, both 
              upward and downward, and the entire amount invested may even be lost.
            </li>
            <li>
              In particular, investments made in projects that are in the initial stages of development or «start-up» always 
              involve a high level of risk, so it is necessary to properly understand their business model.
            </li>
            <li>
              As an investment object, cryptoassets are not covered by customer protection mechanisms such as the Deposit 
              Guarantee Fund or the Investor Guarantee Fund. Their prices are constituted in the absence of mechanisms that 
              ensure their correct formation, such as those used in the regulated securities markets.
            </li>
            <li>
              The lack of liquidity of many cryptoassets can make it difficult and even impossible for investors to unwind 
              their investments without suffering significant losses, as their circulation among both retail and professional 
              investors can be very limited.
            </li>
            <li>
              Distributed log technologies are still at an early stage of maturity, with many of these networks having been 
              created only recently, so they may not be sufficiently tested and there may be significant flaws in their 
              operation and security.
            </li>
            <li>
              The recording of transactions in networks based on distributed registry technology works through consensus 
              protocols that may be susceptible to attacks that attempt to modify the registry, and in the event of success, 
              there would be no alternative registry to support such transactions and therefore the balances corresponding 
              to the public keys, and all cryptoassets could be lost.
            </li>
            <li>
              The anonymity facilities that cryptoassets can provide make them a target for cybercriminals, since in the case 
              of stealing credentials or private keys they can transfer the cryptoassets to addresses that make it difficult 
              or impossible to recover them.
            </li>
            <li>
              The custody of crypto-assets is a very important responsibility since they can be lost in their entirety in the 
              event of theft or loss of the private keys. It is therefore necessary for investors to make sure about the entity 
              in charge of the custody of the crypto-assets advertised, the country in which it is carried out and the applicable 
              legal framework.
            </li>
            <li>
              The acceptance of cryptoassets as a means of payment is still very limited and there is no legal obligation to 
              accept them.
            </li>
            <li>
              When the information society service provider is not located in a European Union country, the resolution of any 
              dispute may be costly and fall outside the jurisdiction of the authorities of the investor's home state.
            </li>
          </ol>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Privacy policy</h3>
          <p className="mb-4">
            Users of this website are informed that Corporate Roadshow, Inc. does not collect or process their personal data in 
            connection with the provision of its information service. Under no circumstances shall the activity carried out by 
            the Company entail the collection, storage or processing of such personal data, nor shall it give rise to any use or 
            assignment of the same, beyond the duties imposed on it by the applicable legislation as a provider of information 
            society services. Apart from this assumption, Corporate Roadshow, Inc. guarantees the confidentiality of the connections 
            and personal data of the users of its web site, adopting for this purpose the security measures legally provided for 
            in accordance with the current state.
          </p>
          
          <h3 className="text-xl font-semibold mt-5 mb-3">Responsibilities</h3>
          <p className="mb-4">
            The Company makes no warranty and shall not be liable for any damages, losses, losses, claims or expenses of any 
            nature whatsoever arising out of or in connection with the use, inability to use or the unlawful, negligent or 
            fraudulent use of this Web Site.
          </p>
          <p className="mb-4">
            In order to provide a better service to users, the Company may carry out updates and improvements to the content of 
            this Website. However, given the free and open nature of the operation of the markets to which it refers, the 
            information contained in this Website shall in no case have an official nature.
          </p>
          <p className="mb-4">
            Corporate Roadshow, Inc. makes the information contained in its Web Site available to the user in accordance with 
            the current state of the art, which does not guarantee the total security and privacy of said Web Site, nor does it 
            avoid the risk that the same or its information service may suffer temporary interruptions, partial unavailability 
            or other alterations. The user must also be aware that information received or sent through this Web site is 
            susceptible to interception.
          </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default GeneralStatement;

