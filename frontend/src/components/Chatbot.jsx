import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Website information for the chatbot
  const websiteInfo = {
    name: "Mufasa Wildlife",
    description: "Sri Lankan wildlife safari management system",
    services: [
      "Wildlife Safari Tours",
      "Hiking Adventures", 
      "Photography Tours",
      "Bird Watching",
      "Custom Adventure Packages"
    ],
    locations: [
      "Yala National Park",
      "Udawalawe National Park", 
      "Wilpattu National Park",
      "Minneriya National Park",
      "Sinharaja Forest Reserve"
    ],
    contact: {
      phone: "+94 11 234 5678",
      email: "info@mufasawildlife.lk",
      address: "123 Wildlife Avenue, Colombo 03, Sri Lanka"
    },
    team: [
      "Kumara Perera - Founder & Wildlife Expert",
      "Dr. Anjali Silva - Hiking Director", 
      "Ravi Mendis - Safari Guide & Naturalist",
      "Priya Fernando - Customer Experience Manager"
    ]
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your wildlife safari assistant. I can help you with information about ${websiteInfo.name} and our services. What would you like to know?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase());
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (message) => {
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello! Welcome to ${websiteInfo.name}. How can I assist you today?`;
    }
    
    if (message.includes('service') || message.includes('tour') || message.includes('package')) {
      return `We offer various wildlife experiences:\n${websiteInfo.services.map(service => `• ${service}`).join('\n')}\n\nWould you like to know more about any specific service?`;
    }
    
    if (message.includes('location') || message.includes('park') || message.includes('where')) {
      return `We operate in several amazing locations:\n${websiteInfo.locations.map(location => `• ${location}`).join('\n')}\n\nWhich location interests you most?`;
    }
    
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return `You can reach us at:\n📞 Phone: ${websiteInfo.contact.phone}\n📧 Email: ${websiteInfo.contact.email}\n📍 Address: ${websiteInfo.contact.address}`;
    }
    
    if (message.includes('team') || message.includes('staff') || message.includes('guide')) {
      return `Our expert team includes:\n${websiteInfo.team.map(member => `• ${member}`).join('\n')}`;
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('booking')) {
      return "For pricing and booking information, please visit our travel packages page or contact us directly. I can help you navigate to the packages page if you'd like!";
    }
    
    if (message.includes('about') || message.includes('company')) {
      return `${websiteInfo.name} is a leading wildlife safari management system in Sri Lanka. We specialize in sustainable tourism and authentic wildlife experiences. We've been serving wildlife enthusiasts since 2014 with over 5,000 happy guests from 50+ countries.`;
    }
    
    if (message.includes('safety') || message.includes('secure')) {
      return "We maintain a 100% safety record with zero incidents in all our tours. Our experienced guides and strict safety protocols ensure your wildlife adventure is both thrilling and secure.";
    }
    
    if (message.includes('package') || message.includes('packages')) {
      return "I can help you explore our packages! Would you like me to navigate you to our travel packages page?";
    }
    
    if (message.includes('donate') || message.includes('donation')) {
      return "We support wildlife conservation through our donation program. You can contribute to wildlife protection projects by visiting our donation page.";
    }
    
    if (message.includes('gallery') || message.includes('photo') || message.includes('picture')) {
      return "We have a beautiful gallery showcasing wildlife photography from our tours. Would you like to see our gallery?";
    }
    
    return "I'm here to help! You can ask me about our services, locations, team, pricing, safety, or any other information about our wildlife safari experiences. What would you like to know?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50 chatbot-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
          title="Chat with us"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
                      ) : (
              <span className="text-3xl">🦁</span>
            )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col chatbot-container">
          {/* Chat Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🦁</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-lg">🌿</span>
                  <div>
                    <h3 className="font-bold">Wildlife Assistant</h3>
                    <p className="text-sm text-green-100">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line chatbot-message">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="chatbot-typing">
                    <div className="chatbot-typing-dot"></div>
                    <div className="chatbot-typing-dot"></div>
                    <div className="chatbot-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-100 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleNavigation('/travel-packages')}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
              >
                View Packages
              </button>
              <button
                onClick={() => handleNavigation('/contact')}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </button>
              <button
                onClick={() => handleNavigation('/donate')}
                className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors"
              >
                Donate
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
