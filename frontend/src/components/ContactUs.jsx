import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ContactUs = ({ loginTrigger }) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    safariInterest: '',
    groupSize: '',
    travelDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Trigger the login modal from header
      if (loginTrigger && loginTrigger.current) {
        loginTrigger.current();
      }
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        safariInterest: '',
        groupSize: '',
        travelDate: ''
      });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      title: "Head Office",
      details: [
        "123 Wildlife Avenue",
        "Colombo 03, Sri Lanka",
        "Near Viharamahadevi Park"
      ],
      icon: "🏢"
    },
    {
      title: "Yala Branch",
      details: [
        "Safari Lodge Complex",
        "Yala National Park Road",
        "Tissamaharama, Sri Lanka"
      ],
      icon: "🦁"
    },
    {
      title: "Phone Numbers",
      details: [
        "+94 11 234 5678 (Office)",
        "+94 77 123 4567 (Mobile)",
        "+94 47 234 5678 (Yala)"
      ],
      icon: "📞"
    },
    {
      title: "Email & Social",
      details: [
        "info@wildlanka.lk",
        "bookings@wildlanka.lk",
        "@wildlanka"
      ],
      icon: "📧"
    }
  ];

  const safariInterests = [
    "Yala National Park Safari",
    "Minneriya Elephant Gathering",
    "Sinharaja Rainforest Trek",
    "Wilpattu Leopard Safari",
    "Bird Watching Tour",
    "Photography Safari",
    "Custom Wildlife Tour",
    "Hiking Adventures"
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-abeze font-bold text-white mb-4">
            Get in <span className="text-green-400">Touch</span>
          </h2>
          <p className="text-gray-300 text-lg font-abeze max-w-3xl mx-auto">
            Ready to start your Sri Lankan wildlife adventure? Contact us for personalized safari experiences, 
            hiking inquiries, or any questions about our tours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-abeze font-bold text-white mb-6">
              Send us a Message
            </h3>

            {submitSuccess && (
              <div className="bg-green-600/20 border border-green-400 text-green-400 p-4 rounded-lg mb-6">
                <p className="font-abeze font-medium">
                  Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Preferred Contact
                  </label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Safari Interest
                  </label>
                  <select
                    name="safariInterest"
                    value={formData.safariInterest}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="">Select a safari type</option>
                    {safariInterests.map((interest, index) => (
                      <option key={index} value={interest}>{interest}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    Group Size
                  </label>
                  <select
                    name="groupSize"
                    value={formData.groupSize}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
                  >
                    <option value="">Select group size</option>
                    <option value="1-2">1-2 people</option>
                    <option value="3-5">3-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="10+">10+ people</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Preferred Travel Date
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="safari-booking">Safari Booking</option>
                  <option value="custom-package">Custom Package</option>
                  <option value="general-inquiry">General Inquiry</option>
                  <option value="group-booking">Group Booking</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-abeze font-medium mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze placeholder-gray-400 focus:border-green-400 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your wildlife adventure plans, special requirements, or any questions you have..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 rounded-lg font-abeze font-bold transition-colors duration-300"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300"
                >
                  <div className="text-3xl mb-4">
                    {info.icon}
                  </div>
                  <h4 className="text-xl font-abeze font-bold text-white mb-3">
                    {info.title}
                  </h4>
                  <div className="space-y-2">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-300 font-abeze text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
              <h4 className="text-xl font-abeze font-bold text-white mb-4">
                Business Hours
              </h4>
              <div className="space-y-2 text-gray-300 font-abeze">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm-rounded-2xl p-6 border border-green-400/30">
              <h4 className="text-xl font-abeze font-bold text-white mb-4">
                Quick Response Guarantee
              </h4>
              <div className="space-y-3 text-gray-300 font-abeze text-sm">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Response within 24 hours</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Free consultation for custom tours</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>WhatsApp support for urgent inquiries</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Multi-language support available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;