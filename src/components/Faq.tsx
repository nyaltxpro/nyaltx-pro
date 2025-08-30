import React from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
interface FAQ {
    question: string;
    answer: string;
    isOpen: boolean;
  } 
const Faq = () => {
    const [faqs, setFaqs] = React.useState<FAQ[]>([
        {
            question: 'What are the benefits of using our platform?',
            answer: 'Our platform is easy to use, has low fees, and is trusted by thousands of projects. It makes creating a token simple and accessible to everyone.',
            isOpen: false
        },
        {
            question: 'How does token creation cost?',
            answer: 'Token creation costs vary by network. Ethereum has higher gas fees compared to other networks like BSC or Polygon. We charge a small platform fee in addition to network gas fees.',
            isOpen: false
        },
        {
            question: 'What is chain/network selection?',
            answer: 'Chain selection refers to choosing which blockchain your token will be deployed on. Different chains have different features, costs, and user bases.',
            isOpen: false
        },
        {
            question: "What should I do once I've created a token?",
            answer: "After creating your token, you can add liquidity to a DEX, create a website, build a community, and start marketing your project.",
            isOpen: false
        },
        {
            question: 'How can I get help?',
            answer: 'You can reach out to our support team via Discord or Telegram. We also have extensive documentation and guides available.',
            isOpen: false
        }
    ]);

    const toggleFAQ = (index: number) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index].isOpen = !updatedFaqs[index].isOpen;
        setFaqs(updatedFaqs);
    };
    return (
       
            <div className="bg-[#0f1923] my-5 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">What are the benefits of using our platform?</h2>

                <p className="text-gray-300 mb-4">
                    Our platform is easy to use, has low fees, and is trusted by thousands of projects.
                    It makes creating a token simple and accessible to everyone.
                </p>

                <div className="space-y-4 mt-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-800 pb-3">
                            <button
                                className="flex justify-between items-center w-full text-left text-gray-300 hover:text-white"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="font-medium">{faq.question}</span>
                                {faq.isOpen ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            {faq.isOpen && (
                                <p className="mt-2 text-gray-400 text-sm">
                                    {faq.answer}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
     
    )
}

export default Faq
