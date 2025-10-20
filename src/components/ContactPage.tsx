'use client';

import React, { useState } from 'react';
import { useContactContent } from '@/hooks/useTinaContent';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
  const { content, loading, error } = useContactContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: data.message || 'Thank you for your message! We will get back to you soon.',
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || 'Something went wrong. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-gray-400">
              Sorry, we couldn't load the contact information. Please try again later.
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
            {content?.hero?.title || "Contact Us"}
          </h1>
          {content?.hero?.subtitle && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Contact Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="md:col-span-1"
          >
            <div className="p-6 rounded-2xl h-full border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="pointer-events-none absolute -inset-px rounded-2xl blur-[10px]" />
              <div className="relative">
                <h2 className="text-xl font-semibold mb-6">Get In Touch</h2>

                <div className="space-y-6">
                  {content?.contactInfo?.email && (
                    <div className="flex items-start">
                      <div className="bg-sky-600/30 ring-1 ring-sky-500/30 p-3 rounded-full mr-4">
                        <FaEnvelope className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white/80">Email</h3>
                        <p className="text-sky-300">{content.contactInfo.email}</p>
                      </div>
                    </div>
                  )}

                  {content?.contactInfo?.phone && (
                    <div className="flex items-start">
                      <div className="bg-sky-600/30 ring-1 ring-sky-500/30 p-3 rounded-full mr-4">
                        <FaPhone className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white/80">Phone</h3>
                        <p className="text-sky-300">{content.contactInfo.phone}</p>
                      </div>
                    </div>
                  )}

                  {content?.contactInfo?.address && (
                    <div className="flex items-start">
                      <div className="bg-sky-600/30 ring-1 ring-sky-500/30 p-3 rounded-full mr-4">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white/80">Address</h3>
                        <p className="text-sky-300 whitespace-pre-line">{content.contactInfo.address}</p>
                      </div>
                    </div>
                  )}

                  {content?.contactInfo?.businessHours && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                      <h3 className="font-medium text-white/80 mb-2">Business Hours</h3>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {content.contactInfo.businessHours}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
              <div className="pointer-events-none absolute -inset-px rounded-2xl blur-[10px]" />
              <div className="relative">
                <h2 className="text-xl font-semibold mb-2">
                  {content?.form?.title || "Send Us a Message"}
                </h2>
                {content?.form?.description && (
                  <p className="text-gray-400 mb-6">{content.form.description}</p>
                )}

                {submitStatus && (
                  <div
                    className={`p-4 mb-6 rounded-lg ${submitStatus.success ? 'bg-emerald-900/30 text-emerald-200' : 'bg-rose-900/30 text-rose-200'}`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-white/80"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-white"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-white/80"
                      >
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-white"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="subject"
                      className="block mb-2 text-sm font-medium text-white/80"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-white"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Bug Report">Bug Report</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-medium text-white/80"
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-white"
                      placeholder="Type your message here..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>{content?.form?.submitText || "Send Message"}</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
