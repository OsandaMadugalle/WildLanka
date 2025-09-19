import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { contactMessageApi } from "../services/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const ContactUsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const loginTriggerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with user data when authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [isAuthenticated, user]);

  // Initialize interactive map with safari/hiking/adventure locations
  React.useEffect(() => {
    const ensureLeaflet = () =>
      new Promise((resolve, reject) => {
        if (window.L) return resolve(window.L);
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.body.appendChild(script);
      });

    const initMap = async () => {
      try {
        const L = await ensureLeaflet();
        if (mapInstanceRef.current || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Inject CSS for pulsing office marker
        const styleTag = document.createElement("style");
        styleTag.innerHTML = `
          .pulse-marker { position: relative; width: 18px; height: 18px; }
          .pulse-marker .dot { width: 12px; height: 12px; background: #ef4444; border: 2px solid #fca5a5; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
          .pulse-marker .ring { position: absolute; top: 50%; left: 50%; width: 12px; height: 12px; border: 2px solid rgba(239, 68, 68, 0.6); border-radius: 50%; transform: translate(-50%, -50%); animation: pulse-ring 1.8s ease-out infinite; }
          @keyframes pulse-ring { 0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; } 80% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; } 100% { opacity: 0; } }
        `;
        document.head.appendChild(styleTag);

        // Points of interest across Sri Lanka with categories
        const points = [
          // Safari Locations
          {
            coords: [6.3619, 81.5206],
            title: t('destinations.yala'),
            category: "safari",
            desc: t('destinations.yalaDesc') || "Big cats and diverse wildlife",
          },
          {
            coords: [8.4871, 80.1069],
            title: t('destinations.wilpattu'),
            category: "safari",
            desc: t('destinations.wilpattuDesc') || "Largest national park",
          },
          {
            coords: [8.0393, 80.8203],
            title: t('destinations.minneriya'),
            category: "safari",
            desc: t('destinations.minneriyaDesc') || "Elephant gathering",
          },
          {
            coords: [6.5833, 81.6833],
            title: t('destinations.kumana'),
            category: "safari",
            desc: t('destinations.kumanaDesc') || "Bird sanctuary and wildlife",
          },

          // Water Adventure Locations
          {
            coords: [6.9833, 80.4167],
            title: t('destinations.kithulgalaRafting'),
            category: "water-adventure",
            desc: t('destinations.kithulgalaRaftingDesc') || "White water rafting on Kelani River",
          },
          {
            coords: [6.85, 80.55],
            title: t('destinations.lakshapanaBungee'),
            category: "adventure",
            desc: t('destinations.lakshapanaBungeeDesc') || "Thrilling bungee jumping experience",
          },
          {
            coords: [6.3667, 80.0167],
            title: t('destinations.maduGangaBoat'),
            category: "water-adventure",
            desc: t('destinations.maduGangaBoatDesc') || "Mangrove ecosystem and boat tours",
          },

          // Hiking Locations
          {
            coords: [7.4653, 80.7782],
            title: t('destinations.knuckles'),
            category: "hiking",
            desc: t('destinations.knucklesDesc') || "Scenic trails",
          },
          {
            coords: [6.8667, 81.0465],
            title: t('destinations.ella'),
            category: "hiking",
            desc: t('destinations.ellaDesc') || "Little Adam's Peak & Nine Arches",
          },
          {
            coords: [6.8097, 80.499],
            title: t('destinations.adamsPeak'),
            category: "hiking",
            desc: t('destinations.adamsPeakDesc') || "Sunrise pilgrimage hike",
          },
          {
            coords: [6.802, 80.7998],
            title: t('destinations.hortonPlains'),
            category: "hiking",
            desc: t('destinations.hortonPlainsDesc') || "World's End",
          },

          // Other Adventure Locations
          {
            coords: [6.4108, 80.458],
            title: t('destinations.sinharaja'),
            category: "adventure",
            desc: t('destinations.sinharajaDesc') || "Rainforest biodiversity hotspot",
          },
        ];

        const categoryColors = {
          safari: "#10B981",
          "water-adventure": "#3B82F6",
          hiking: "#8B5CF6",
          adventure: "#F59E0B",
        };

        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        const bounds = L.latLngBounds([]);

        // Office marker in red with pulse animation
        const officeLatLng = [6.9147, 79.8523];
        const officeIcon = L.divIcon({
          className: "",
          html: '<div class="pulse-marker"><span class="ring"></span><span class="dot"></span></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const officeMarker = L.marker(officeLatLng, { icon: officeIcon }).addTo(
          map
        );
        officeMarker.bindPopup(
          "<strong>Office - Colombo 03</strong><br/>123 Wildlife Road, Colombo 03"
        );
        bounds.extend(officeLatLng);

        // Category markers with tooltip showing name and category
        points.forEach((p) => {
          const color = categoryColors[p.category] || "#22D3EE";
          const marker = L.circleMarker(p.coords, {
            radius: 7,
            color,
            weight: 2,
            fillColor: color,
            fillOpacity: 0.9,
          }).addTo(map);
          marker.bindTooltip(`${p.title} • ${capitalize(p.category)}`, {
            direction: "top",
            offset: [0, -8],
          });
          marker.bindPopup(
            `<strong>${p.title}</strong><br/><em>Category: ${capitalize(
              p.category
            )}</em><br/>${p.desc}`
          );
          bounds.extend(p.coords);
        });

        map.fitBounds(bounds, { padding: [30, 30] });
      } catch (e) {
        console.error("Map initialization failed:", e);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Trigger the login modal from header
      if (loginTriggerRef.current) {
        loginTriggerRef.current();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await contactMessageApi.createContactMessage(formData);

      // Reset form - preserve user data if authenticated
      if (isAuthenticated && user) {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          subject: "",
          message: "",
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }

      alert(t("contact.form.success"));
    } catch (error) {
      console.error("Error sending message:", error);
      alert(t("contact.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: t("contact.faq.bestTime.question"),
      answer: t("contact.faq.bestTime.answer"),
    },
    {
      question: t("contact.faq.transportation.question"),
      answer: t("contact.faq.transportation.answer"),
    },
    {
      question: t("contact.faq.whatToBring.question"),
      answer: t("contact.faq.whatToBring.answer"),
    },
    {
      question: t("contact.faq.children.question"),
      answer: t("contact.faq.children.answer"),
    },
    {
      question: t("contact.faq.cancellation.question"),
      answer: t("contact.faq.cancellation.answer"),
    },
    {
      question: t("contact.faq.custom.question"),
      answer: t("contact.faq.custom.answer"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header triggerLogin={loginTriggerRef} />

  <div className="pt-24 md:pt-32">
        <div className="container mx-auto px-2 sm:px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
              {t("contact.title")}
            </h1>
            <p className="text-green-200 font-abeze text-base sm:text-lg max-w-2xl md:max-w-3xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mb-10 md:mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20">
              <h3 className="text-2xl font-abeze font-bold text-white mb-6">
                {t("contact.form.title")}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isAuthenticated && (
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-green-400 font-abeze text-sm">
                        {t("contact.form.prefilled")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-white font-abeze font-medium mb-2">
                      {t("contact.form.firstName")}{" "}
                      {isAuthenticated && (
                        <span className="text-green-400 text-sm">
                          ({t("contact.form.prefilledNote")})
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      readOnly={isAuthenticated}
                      className={`w-full border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                        isAuthenticated
                          ? "bg-gray-700/50 border-gray-600 cursor-not-allowed"
                          : "bg-white/10 border-white/20 focus:border-green-400"
                      }`}
                      placeholder={t("contact.form.placeholders.firstName")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-abeze font-medium mb-2">
                      {t("contact.form.lastName")}{" "}
                      {isAuthenticated && (
                        <span className="text-green-400 text-sm">
                          ({t("contact.form.prefilledNote")})
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      readOnly={isAuthenticated}
                      className={`w-full border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                        isAuthenticated
                          ? "bg-gray-700/50 border-gray-600 cursor-not-allowed"
                          : "bg-white/10 border-white/20 focus:border-green-400"
                      }`}
                      placeholder={t("contact.form.placeholders.lastName")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    {t("contact.form.email")}{" "}
                    {isAuthenticated && (
                      <span className="text-green-400 text-sm">
                        ({t("contact.form.prefilledNote")})
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={isAuthenticated}
                    className={`w-full border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                      isAuthenticated
                        ? "bg-gray-700/50 border-gray-600 cursor-not-allowed"
                        : "bg-white/10 border-white/20 focus:border-green-400"
                    }`}
                    placeholder={t("contact.form.placeholders.email")}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    {t("contact.form.phone")}{" "}
                    {isAuthenticated && (
                      <span className="text-green-400 text-sm">
                        ({t("contact.form.prefilledNote")})
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={isAuthenticated}
                    className={`w-full border rounded-lg px-4 py-3 text-white font-abeze focus:outline-none transition-colors ${
                      isAuthenticated
                        ? "bg-gray-700/50 border-gray-600 cursor-not-allowed"
                        : "bg-white/10 border-white/20 focus:border-green-400"
                    }`}
                    placeholder={t("contact.form.placeholders.phone")}
                  />
                </div>

                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    {t("contact.form.subject")}
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">{t("contact.form.selectSubject")}</option>
                    <option value="safari-booking">
                      {t("contact.form.subjects.safari")}
                    </option>
                    <option value="custom-package">
                      {t("contact.form.subjects.custom")}
                    </option>
                    <option value="general-inquiry">
                      {t("contact.form.subjects.general")}
                    </option>
                    <option value="group-booking">
                      {t("contact.form.subjects.group")}
                    </option>
                    <option value="support">
                      {t("contact.form.subjects.support")}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-abeze font-medium mb-2">
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white font-abeze focus:border-green-400 focus:outline-none transition-colors resize-none"
                    placeholder={t("contact.form.placeholders.message")}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-abeze font-bold transition-colors duration-300"
                >
                  {isSubmitting
                    ? t("contact.form.sending")
                    : t("contact.form.sendMessage")}
                </button>
              </form>
            </div>

            <div className="space-y-4 sm:space-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-abeze font-bold text-white mb-2">
                      {t("contact.info.office.title")}
                    </h4>
                    <p className="text-gray-300 font-abeze text-sm leading-relaxed">
                      {t("contact.info.office.address")}
                      <br />
                      {t("contact.info.office.city")}
                      <br />
                      {t("contact.info.office.near")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-abeze font-bold text-white mb-2">
                      {t("contact.info.phone.title")}
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.phone.phone")}
                        </span>{" "}
                        {t("contact.info.phone.phoneNumber")}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.phone.whatsapp")}
                        </span>{" "}
                        {t("contact.info.phone.whatsappNumber")}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.phone.email")}
                        </span>{" "}
                        {t("contact.info.phone.emailAddress")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-abeze font-bold text-white mb-2">
                      {t("contact.info.hours.title")}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.hours.weekdays")}
                        </span>{" "}
                        {t("contact.info.hours.weekdaysTime")}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.hours.safari")}
                        </span>{" "}
                        {t("contact.info.hours.safariTime")}
                      </p>
                      <p className="text-gray-300 font-abeze text-sm">
                        <span className="text-green-400">
                          {t("contact.info.hours.emergency")}
                        </span>{" "}
                        {t("contact.info.hours.emergencyTime")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                <h4 className="text-xl font-abeze font-bold text-white mb-4">
                  {t("contact.followUs")}
                </h4>
                <div className="flex space-x-4">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-110"
                    title="Follow us on Instagram"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 p-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                    title="Follow us on Facebook"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black p-3 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-110"
                    title="Follow us on Twitter"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 p-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110"
                    title="Subscribe to our YouTube channel"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
                <p className="text-gray-400 font-abeze text-sm mt-3">
                  {t("contact.followUsDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Location Categories Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-abeze font-bold text-white text-center mb-12">
              {t('destinations.byCategory')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Safari Parks */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-abeze font-bold text-white">
                    {t('destinations.safariParks')}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.yala')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.wilpattu')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.minneriya')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.kumana')}</li>
                </ul>
              </div>

              {/* Water Adventure */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-abeze font-bold text-white">
                    {t('destinations.waterAdventure')}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.kithulgalaRafting')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.maduGangaBoat')}</li>
                </ul>
              </div>

              {/* Hiking Trails */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-abeze font-bold text-white">
                    {t('destinations.hikingTrails')}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.knuckles')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.ella')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.adamsPeak')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.hortonPlains')}</li>
                </ul>
              </div>

              {/* Adventure Sports */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-abeze font-bold text-white">
                    {t('destinations.adventureSports')}
                  </h4>
                </div>
                <ul className="space-y-2">
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.lakshapanaBungee')}</li>
                  <li className="text-gray-300 font-abeze text-sm">• {t('destinations.sinharaja')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-10 md:mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20">
              <h3 className="text-lg sm:text-2xl font-abeze font-bold text-white mb-4 sm:mb-6 text-center">
                {t("contact.map.title")}
              </h3>

              {/* Map Legend */}
              <div className="mb-4 sm:mb-6 p-2 sm:p-4 bg-gray-800/50 rounded-lg border border-white/10">
                <h4 className="text-base sm:text-lg font-abeze font-bold text-white mb-2 sm:mb-4 text-center">
                  {t('destinations.byCategory')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-white font-abeze text-sm">
                      {t('destinations.safariParks')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-white font-abeze text-sm">
                      {t('destinations.waterAdventure')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-white font-abeze text-sm">
                      {t('destinations.hikingTrails')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-white font-abeze text-sm">
                      {t('destinations.adventureSports')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-56 sm:h-80 md:h-96" />
                <div className="p-2 sm:p-3 text-center">
                  <a
                    href="https://www.openstreetmap.org/#map=7/7.500/80.700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 font-abeze text-sm"
                  >
                    {t("contact.map.viewOnMap")}
                  </a>
                  <p className="text-gray-400 font-abeze text-xs mt-1">
                    {t("contact.map.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 md:mb-16">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white text-center mb-6 md:mb-12">
              {(() => {
                const title = t("contact.title");
                if (title.endsWith('Us')) {
                  const [before, after] = title.split('Us');
                  return <>{before}<span className="text-green-400">Us</span>{after}</>;
                } else if (title.endsWith('වන්න')) {
                  const [before, after] = title.split('වන්න');
                  return <>{before}<span className="text-green-400">වන්න</span>{after}</>;
                } else {
                  return title;
                }
              })()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <h4 className="text-lg font-abeze font-bold text-white mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-gray-300 font-abeze text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUsPage;
