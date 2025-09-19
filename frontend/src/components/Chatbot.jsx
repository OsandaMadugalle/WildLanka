import { useState, useRef, useEffect } from "react";
import GoToTopButton from "./GoToTopButton";
import { useNavigate, Link } from "react-router-dom";

// Get API base URL from environment variable or fallback to local proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
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
      "Kumara Perera - Founder & Wildlife Expert",
      "Dr. Anjali Silva - Hiking Director",
      "Ravi Mendis - Safari Guide & Naturalist",
      "Priya Fernando - Customer Experience Manager",
    ],
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your wildlife safari assistant. I can help you with information about ${websiteInfo.name} and our services. What would you like to know?`,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

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
    if (lowerMsg.includes("my name is")) {
      const name = inputMessage.split("my name is")[1].trim().split(" ")[0];
      setUserName(name);
      intent = "greet";
    }
    if (lowerMsg.includes("package")) intent = "package";
    if (lowerMsg.includes("booking")) intent = "booking";
    if (lowerMsg.includes("donation")) intent = "donation";
    if (lowerMsg.includes("contact")) intent = "contact";
    if (
      lowerMsg.includes("team") ||
      lowerMsg.includes("staff") ||
      lowerMsg.includes("guide")
    )
      intent = "team";
    if (lowerMsg.includes("price") || lowerMsg.includes("cost"))
      intent = "price";
    if (lowerMsg.includes("about") || lowerMsg.includes("company"))
      intent = "about";
    if (lowerMsg.includes("safety") || lowerMsg.includes("secure"))
      intent = "safety";
    if (
      lowerMsg.includes("gallery") ||
      lowerMsg.includes("photo") ||
      lowerMsg.includes("picture")
    )
      intent = "gallery";
    if (
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hi") ||
      lowerMsg.includes("hey") ||
      lowerMsg.includes("good morning") ||
      lowerMsg.includes("good afternoon") ||
      lowerMsg.includes("good evening")
    )
      intent = "greet";

    setLastIntent(intent);

    // Quick reply actions
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

  const generateBotResponse = (message, userName, lastIntent) => {
    // Personalization
    if (message.includes("my name is")) {
      return {
        text: `Nice to meet you, ${userName}! How can I help you with WildLanka today?`,
      };
    }
    if (message.includes("good night")) {
      return {
        text: `Good night${
          userName ? ", " + userName : ""
        }! If you need anything, I'm here 24/7. Sleep well and dream of wild adventures!`,
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
        text: `Hello${
          userName ? ", " + userName : ""
        }! Hope you're having a great day at WildLanka. How can I help you?`,
      };
    }
    if (message.includes("service") || message.includes("tour")) {
      return {
        text: `We offer various wildlife experiences:\n${websiteInfo.services
          .map((service) => `• ${service}`)
          .join(
            "\n"
          )}\n\nWould you like to know more about any specific service?`,
        quickReplies: [
          {
            label: "View Packages",
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
        text: `We operate in several amazing locations:\n${websiteInfo.locations
          .map((location) => `• ${location}`)
          .join("\n")}\n\nWhich location interests you most?`,
        quickReplies: [
          { label: "Contact Us", action: () => handleNavigation("/contact") },
        ],
      };
    }
    if (
      message.includes("contact") ||
      message.includes("phone") ||
      message.includes("email")
    ) {
      return {
        text: `You can reach us at:\n📞 Phone: ${websiteInfo.contact.phone}\n📧 Email: ${websiteInfo.contact.email}\n📍 Address: ${websiteInfo.contact.address}\n[Contact Us]`,
        quickReplies: [
          { label: "Contact Us", action: () => handleNavigation("/contact") },
        ],
      };
    }
    if (
      message.includes("team") ||
      message.includes("staff") ||
      message.includes("guide")
    ) {
      return {
        text: `Our expert team includes:\n${websiteInfo.team
          .map((member) => `• ${member}`)
          .join("\n")}`,
      };
    }
    if (message.includes("price") || message.includes("cost")) {
      return {
        text: "For pricing and booking information, please visit our travel packages page or contact us directly.",
        quickReplies: [
          {
            label: "View Packages",
            action: () => handleNavigation("/packages"),
          },
        ],
      };
    }
    if (message.includes("booking")) {
      return {
        text: "To make a booking, please visit our packages page and select your preferred adventure. Need help?",
        quickReplies: [
          { label: "Book Now", action: () => handleNavigation("/bookings") },
        ],
      };
    }
    if (message.includes("about") || message.includes("company")) {
      return {
        text: `${websiteInfo.name} is a leading wildlife safari management system in Sri Lanka. We specialize in sustainable tourism and authentic wildlife experiences. We've been serving wildlife enthusiasts since 2014 with over 5,000 happy guests from 50+ countries.`,
      };
    }
    if (message.includes("safety") || message.includes("secure")) {
      return {
        text: "We maintain a 100% safety record with zero incidents in all our tours. Our experienced guides and strict safety protocols ensure your wildlife adventure is both thrilling and secure.",
      };
    }
    if (message.includes("donate") || message.includes("donation")) {
      return {
        text: "We support wildlife conservation through our donation program. You can contribute to wildlife protection projects by visiting our donation page.\n[Donate Now]",
        quickReplies: [
          { label: "Donate Now", action: () => handleNavigation("/donations") },
        ],
      };
    }
    if (
      message.includes("gallery") ||
      message.includes("photo") ||
      message.includes("picture")
    ) {
      return {
        text: "We have a beautiful gallery showcasing wildlife photography from our tours. Would you like to see our gallery?\n[View Gallery]",
        quickReplies: [
          { label: "View Gallery", action: () => handleNavigation("/gallery") },
        ],
      };
    }
    // Expanded FAQ
    if (message.includes("faq") || message.includes("question")) {
      return {
        text: "Frequently Asked Questions:\n- How do I book a safari?\n- What is included in the packages?\n- How do I make a donation?\n- Is it safe for children?\n- Can I customize my tour?",
      };
    }
    // Error handling & fallback
    return {
      text: "Let me know what you need! You can ask about safaris, packages, booking, donations, our team, or anything about WildLanka.",
      quickReplies: [
        { label: "View Packages", action: () => handleNavigation("/packages") },
        { label: "Contact Us", action: () => handleNavigation("/contact") },
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
