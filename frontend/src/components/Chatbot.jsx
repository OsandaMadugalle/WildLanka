import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import GoToTopButton from "./GoToTopButton";
import { useNavigate, Link } from "react-router-dom";

// Get API base URL from environment variable or fallback to local proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("");
  const [lastIntent, setLastIntent] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Website information for the chatbot
  const websiteInfo = {
    name: "WildLanka",
    description: "Sri Lankan wildlife safari management system",
    services: [
      "Wildlife Safari Tours",
      "Hiking Adventures",
      "Photography Tours",
      "Bird Watching",
      "Custom Adventure Packages",
    ],
    locations: [
      "Yala National Park",
      "Udawalawe National Park",
      "Wilpattu National Park",
      "Minneriya National Park",
      "Sinharaja Forest Reserve",
    ],
    contact: {
      phone: "+94 11 234 5678",
      email: "info@wildlanka.lk",
      address: "123 Wildlife Avenue, Colombo 03, Sri Lanka",
    },
    team: [
      {
        name: "Osanda Madugalle",
        role: "Founder & Wildlife Expert",
        description: "With over 15 years of experience in wildlife hiking, Kumara leads our mission to explore Sri Lanka's natural heritage.",
        expertise: "Elephant Behavior, Hiking Trails",
      },
      {
        name: "Ikshuka Malhengoda",
        role: "Hiking Director",
        description: "A PhD in Wildlife Biology, Dr. Silva oversees our research programs and community education initiatives.",
        expertise: "Research & Monitoring, Community Outreach",
      },
      {
        name: "Kalana Jayawardana",
        role: "Safari Guide & Naturalist",
        description: "Expert in Yala National Park, bird watching, and photography tours.",
        expertise: "Bird watching, Photography tours",
      },
      {
        name: "Ravindu Siyambalagoda",
        role: "Safari Guide & Naturalist",
        description: "Expert in Yala National Park, bird watching, and photography tours.",
        expertise: "Bird watching, Photography tours",
      },
      {
        name: "Malinda Sandaruwan",
        role: "Customer Experience Manager",
        description: "Ensuring every guest has an unforgettable and responsible wildlife experience in Sri Lanka.",
        expertise: "Sustainable tourism, Guest relations",
      },
    ],
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: t('chatbot.welcome', { name: websiteInfo.name }),
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    let intent = "";
    const lowerMsg = inputMessage.toLowerCase();
    // Enhanced intent detection with regex and synonyms
    const patterns = [
      { intent: "greet", regex: /\b(my name is|hello|hi|hey|good (morning|afternoon|evening|night)|greetings|how are you|what's up)\b/ },
      { intent: "package", regex: /\b(packages?|offers?|deals?|what.*package|show.*package)\b/ },
      { intent: "booking-status", regex: /\b(booking status|check( my)? booking|status of my booking|is my booking confirmed|booking reference)\b/ },
      { intent: "booking-create", regex: /\b(book( a)? safari|make( a)? booking|book( a)? tour|reserve( a)? (spot|place|tour|safari))\b/ },
      { intent: "booking", regex: /\b(booking|how do i book|book now|reservation|reserve)\b/ },
      { intent: "donation", regex: /\b(donation|donate|contribute|support wildlife|give to)\b/ },
      { intent: "contact", regex: /\b(contact|phone|email|reach|call|how can i contact|get in touch)\b/ },
      { intent: "feedback", regex: /\b(feedback|issue|problem|report|complain|suggestion|website is slow|bug)\b/ },
      { intent: "team", regex: /\b(team|staff|guide|who.*team|who.*staff|who.*guide|about.*team|about.*staff)\b/ },
      { intent: "price", regex: /\b(price|cost|how much|fee|charge|rate|what.*price)\b/ },
      { intent: "about", regex: /\b(about|company|who are you|what is wildlanka|tell me about)\b/ },
      { intent: "safety", regex: /\b(safety|safe|secure|is it safe|child.*safe|children.*safe)\b/ },
      { intent: "gallery", regex: /\b(gallery|photo|picture|see.*gallery|show.*gallery|images|photos)\b/ },
      { intent: "faq", regex: /\b(faq|question|frequently asked|help|common questions)\b/ },
      { intent: "suggestion", regex: /\b(tour suggestion|suggest tour|recommend|what do you recommend|which tour|which safari|best tour|best safari)\b/ },
    ];
    // Name extraction
    const nameMatch = lowerMsg.match(/my name is ([a-zA-Z]+)/);
    if (nameMatch) {
      setUserName(nameMatch[1]);
      intent = "greet";
    }
    // Pattern matching
    if (!intent) {
      for (const p of patterns) {
        if (p.regex.test(lowerMsg)) {
          intent = p.intent;
          break;
        }
      }
    }

    setLastIntent(intent);

    // Language switch intent
    if (lowerMsg.startsWith("lang ")) {
      const lang = lowerMsg.split(" ")[1];
      if (["en", "si", "ta"].includes(lang)) {
        i18n.changeLanguage(lang);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: t('chatbot.languageChanged', { lng: lang }),
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 500);
        return;
      }
    }
    if (intent === "package") {
      try {
        const res = await fetch(`${API_BASE_URL}/api/packages`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        let packages;
        if (contentType && contentType.includes("application/json")) {
          packages = await res.json();
        } else {
          const text = await res.text();
          throw new Error(
            "Response is not JSON. Received: " + text.slice(0, 100)
          );
        }
        let botResponse = "";
        if (Array.isArray(packages) && packages.length > 0) {
          botResponse =
            "Here are our current packages:\n" +
            packages
              .map(
                (pkg) =>
                  `• ${pkg.title} (${ 
                    pkg.price ? "Rs. " + pkg.price : "Price on request"
                  })`
              )
              .join("\n");
        } else {
          botResponse = "Sorry, there are no packages available at the moment.";
        }
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: botResponse,
              sender: "bot",
              timestamp: new Date(),
              quickReplies: [
                {
                  label: "View Packages",
                  action: () => handleNavigation("/packages"),
                },
                {
                  label: "Book Now",
                  action: () => handleNavigation("/bookings"),
                },
              ],
            },
          ]);
          setIsTyping(false);
        }, 1000);
        return;
      } catch (err) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `Sorry, I could not fetch the packages right now. (${err.message})`,
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }, 1000);
        return;
      }
    }
    // Booking status check (prompt for reference)
    if (intent === "booking-status") {
      setLastIntent("booking-status-await-ref");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Please enter your booking reference number to check the status.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }
    // Awaiting booking reference
    if (lastIntent === "booking-status-await-ref" && /\d{4,}/.test(lowerMsg)) {
      setLastIntent("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: `Booking status for reference ${lowerMsg.match(/\d{4,}/)[0]}: Confirmed. (For real status, integrate with backend.)`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }
    // Booking creation (simple prompt)
    if (intent === "booking-create") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "To book a safari, please provide your name, preferred date, and package (or visit the Book Now page).",
            sender: "bot",
            timestamp: new Date(),
            quickReplies: [
              { label: "Book Now", action: () => handleNavigation("/bookings") },
            ],
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }
    // Feedback/issue reporting (prompt for details)
    if (intent === "feedback") {
      setLastIntent("feedback-await-details");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Thank you for your feedback! Please describe your issue or suggestion, and our team will review it.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }
    // Awaiting feedback details
    if (lastIntent === "feedback-await-details") {
      setLastIntent("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "Thank you for your message! Our team will review your feedback or issue soon.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // Simulate typing delay for other messages
    setTimeout(() => {
      const botResponse = generateBotResponse(lowerMsg, userName, lastIntent);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: botResponse.text,
          sender: "bot",
          timestamp: new Date(),
          quickReplies: botResponse.quickReplies || [],
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  // Multilingual support (using t)
  const generateBotResponse = (message, userName, lastIntent) => {
    // Personalization
    if (message.includes("my name is")) {
      return {
        text: t('chatbot.niceToMeet', { userName }),
      };
    }
    if (message.includes("good night")) {
      return {
        text: t('chatbot.goodNight', { userName }),
      };
    }
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey") ||
      message.includes("good morning") ||
      message.includes("good afternoon") ||
      message.includes("good evening") ||
      message.includes("good day") ||
      message.includes("greetings") ||
      message.includes("how are you") ||
      message.includes("what's up")
    ) {
      return {
        text: t('chatbot.hello', { userName }),
      };
    }
    if (message.includes("service") || message.includes("tour")) {
      return {
        text: t('chatbot.servicesList', { services: websiteInfo.services.map((service) => `• ${service}`).join('\n') }),
        quickReplies: [
          {
            label: t('chatbot.viewPackages'),
            action: () => handleNavigation("/packages"),
          },
        ],
      };
    }
    if (
      message.includes("location") ||
      message.includes("park") ||
      message.includes("where")
    ) {
      return {
        text: t('chatbot.locationsList', { locations: websiteInfo.locations.map((location) => `• ${location}`).join('\n') }),
        quickReplies: [
          { label: t('chatbot.contactUs'), action: () => handleNavigation("/contact") },
        ],
      };
    }
    if (
      message.includes("contact") ||
      message.includes("phone") ||
      message.includes("email")
    ) {
      return {
        text: t('chatbot.contactInfo', { phone: websiteInfo.contact.phone, email: websiteInfo.contact.email, address: websiteInfo.contact.address }),
        quickReplies: [
          { label: t('chatbot.contactUs'), action: () => handleNavigation("/contact") },
        ],
      };
    }
    if (
      message.includes("team") ||
      message.includes("staff") ||
      message.includes("guide")
    ) {
      // Show real team members with roles and expertise
      const teamText = websiteInfo.team.map((member) => `• ${member.name} - ${member.role}\n  ${member.description}\n  Expertise: ${member.expertise}`).join('\n\n');
      return {
        text: `Meet our team:\n${teamText}`,
      };
    }
    if (message.includes("price") || message.includes("cost")) {
      return {
        text: t('chatbot.pricingInfo'),
        quickReplies: [
          {
            label: t('chatbot.viewPackages'),
            action: () => handleNavigation("/packages"),
          },
        ],
      };
    }
    if (message.includes("booking")) {
      return {
        text: t('chatbot.bookingInfo'),
        quickReplies: [
          { label: t('chatbot.bookNow'), action: () => handleNavigation("/bookings") },
        ],
      };
    }
    if (message.includes("about") || message.includes("company")) {
      return {
        text: t('chatbot.about', { name: websiteInfo.name }),
      };
    }
    if (message.includes("safety") || message.includes("secure")) {
      return {
        text: t('chatbot.safetyInfo'),
      };
    }
    if (message.includes("donate") || message.includes("donation")) {
      return {
        text: t('chatbot.donationInfo'),
        quickReplies: [
          { label: t('chatbot.donateNow'), action: () => handleNavigation("/donations") },
        ],
      };
    }
    if (
      message.includes("gallery") ||
      message.includes("photo") ||
      message.includes("picture")
    ) {
      return {
        text: t('chatbot.galleryInfo'),
        quickReplies: [
          { label: t('chatbot.viewGallery'), action: () => handleNavigation("/gallery") },
        ],
      };
    }
    // Expanded FAQ
    if (message.includes("faq") || message.includes("question")) {
      return {
        text: t('chatbot.faq'),
      };
    }
    // Guided tour suggestions (fetch package categories and suggest)
    if (intent === "suggestion") {
      setIsTyping(true);
      fetch(`${API_BASE_URL}/api/packages`)
        .then(res => res.json())
        .then(pkgs => {
          const categories = Array.from(new Set((pkgs || []).map(pkg => pkg.category)));
          let text = "Here are our main tour categories:\n" +
            categories.map(cat => `• ${cat}`).join("\n") +
            "\n\nSelect a category to see packages.";
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text,
              sender: "bot",
              timestamp: new Date(),
              quickReplies: categories.map(cat => ({
                label: cat,
                action: () => handleNavigation(`/packages?category=${encodeURIComponent(cat)}`)
              })).concat([
                { label: t('chatbot.viewPackages'), action: () => handleNavigation("/packages") },
                { label: t('chatbot.contactUs'), action: () => handleNavigation("/contact") }
              ]),
            },
          ]);
          setIsTyping(false);
        })
        .catch(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: "Sorry, I couldn't fetch tour categories right now.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        });
      return;
    }
    // Booking status follow-up (if user provides a reference number)
    if (/ref(erence)? ?#?\d{4,}/.test(message)) {
      // Simulate backend check (replace with real API call)
      return {
        text: t('chatbot.bookingStatus', { ref: message.match(/ref(erence)? ?#?(\d{4,})/i)?.[0] || t('chatbot.yourReference') }),
      };
    }
// ...existing code...
    // Error handling & fallback
    return {
      text: t('chatbot.fallback'),
      quickReplies: [
        { label: t('chatbot.viewPackages'), action: () => handleNavigation("/packages") },
        { label: t('chatbot.contactUs'), action: () => handleNavigation("/contact") },
      ],
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <span className="text-3xl">🤖</span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col chatbot-container">
          {/* Chat Header */}
          {/* Language Switcher */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={() => i18n.changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>EN</button>
            <button onClick={() => i18n.changeLanguage('si')} className={`px-2 py-1 rounded ${i18n.language === 'si' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>සිං</button>
            <button onClick={() => i18n.changeLanguage('ta')} className={`px-2 py-1 rounded ${i18n.language === 'ta' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>தமிழ்</button>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🤖</span>
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
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line chatbot-message">
                    {message.text.split("\n").map((line, idx) => {
                      // Linkify bot responses using React Router Link and brackets
                      if (line.trim() === "[View Packages]") {
                        return (
                          <span key={idx}>
                            <Link
                              to="/packages"
                              className="text-green-600 underline"
                            >
                              View Packages
                            </Link>
                            <br />
                          </span>
                        );
                      }
                      if (line.trim() === "[Book Now]") {
                        return (
                          <span key={idx}>
                            <Link
                              to="/bookings"
                              className="text-green-600 underline"
                            >
                              Book Now
                            </Link>
                            <br />
                          </span>
                        );
                      }
                      if (line.trim() === "[Donate Now]") {
                        return (
                          <span key={idx}>
                            <Link
                              to="/donations"
                              className="text-green-600 underline"
                            >
                              Donate Now
                            </Link>
                            <br />
                          </span>
                        );
                      }
                      if (line.trim() === "[Contact Us]") {
                        return (
                          <span key={idx}>
                            <Link
                              to="/contact"
                              className="text-green-600 underline"
                            >
                              Contact Us
                            </Link>
                            <br />
                          </span>
                        );
                      }
                      if (line.trim() === "[View Gallery]") {
                        return (
                          <span key={idx}>
                            <Link
                              to="/gallery"
                              className="text-green-600 underline"
                            >
                              View Gallery
                            </Link>
                            <br />
                          </span>
                        );
                      }
                      return (
                        <span key={idx}>
                          {line}
                          <br />
                        </span>
                      );
                    })}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Type Bar */}
          <div className="p-3 bg-gray-100 border-t border-gray-200">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-green-400"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Send
              </button>
            </form>
            {/* Persistent Quick Link Buttons */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <Link
                to="/travel-packages"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                Packages
              </Link>
              <Link
                to="/contact"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/gallery"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                Gallery
              </Link>
            </div>
          </div>
        </div>
      )}
      <GoToTopButton />
    </>
  );
};

export default Chatbot;
