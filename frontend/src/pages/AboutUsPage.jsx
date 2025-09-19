import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import image4 from "../assets/4.jpg";
import image5 from "../assets/5.webp";
import image6 from "../assets/6.webp";
import image7 from "../assets/7.jpg";
import image8 from "../assets/8.webp";
import image9 from "../assets/9.jpg";
import image10 from "../assets/10.jpg";
import image11 from "../assets/11.jpg";

const AboutUsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const teamMembers = [
    {
      name: "Osanda Madugalle",
      role: "Founder & Wildlife Expert",
      description:
        "With over 15 years of experience in wildlife hiking, Kumara leads our mission to explore Sri Lanka's natural heritage.",
      expertise: "Leads the vision, ensures ecological integrity",
      image: <img src="https://i.ibb.co/xqyj3NWX/auOsanda.png" alt="Osanda Madugalle" className="w-70 h-70 rounded-full object-cover mx-auto" style={{backgroundColor: '#53AF53'}}/>,
    },
    {
      name: "Ikshuka Malhengoda",
      role: "Hiking Director",
      description:
        "A PhD in Wildlife Biology, Dr. Silva oversees our research programs and community education initiatives.",
      expertise: "Research & Monitoring, Community Outreach",
      image: <img src="https://i.ibb.co/3ycyzHPb/au-Ikshuka.jpg" alt="Ikshuka Malhengoda" className="w-70 h-70 rounded-full object-cover mx-auto" style={{backgroundColor: '#53AF53'}} />,
    },
    {
      name: "Kalana Jayawardhana",
      role: "Tech & Data Analysts (in digital systems)",
      description:
        "Specializes in leveraging technology to enhance wildlife research and data collection.",
      expertise: "Track animal movements, Analyze ecological data",
      image: <img src="https://i.ibb.co/nqZtC4gt/auKalana.png" alt="Kalana Jayawardhana" className="w-70 h-70 rounded-full object-cover mx-auto" style={{backgroundColor: '#53AF53'}}/>,
    },
    {
      name: "Ravindu Siyambalagoda",
      role: "Safari Guide & Naturalist",
      description:
        "Brings his passion for wildlife and conservation to every safari, ensuring guests have an unforgettable experience.",
      expertise: "Bird watching, Photography tours",
      image: <img src="https://i.ibb.co/JR2jQQnt/au-Ravindu.png" alt="Ravindu Siyambalagoda" className="w-70 h-70 rounded-full object-cover mx-auto" style={{backgroundColor: '#53AF53'}}/>,
    },
    {
      name: "Malinda Sandaruwan",
      role: "Customer Experience Manager",
      description:
        "Ensuring every guest has an unforgettable and responsible wildlife experience in Sri Lanka.",
      expertise: "Sustainable tourism, Guest relations",
      image: <img src="https://i.ibb.co/5gsGHrDR/au-Malinda.png" alt="Malinda Sandaruwan" className="w-70 h-70 rounded-full object-cover mx-auto" style={{backgroundColor: '#53AF53'}}/>,
    },
  ];

  const values = [
    {
      title: t("about.values.hikingFirst.title"),
      description: t("about.values.hikingFirst.description"),
      icon: "🌱",
    },
    {
      title: t("about.values.localExpertise.title"),
      description: t("about.values.localExpertise.description"),
      icon: "🏠",
    },
    {
      title: t("about.values.sustainableTourism.title"),
      description: t("about.values.sustainableTourism.description"),
      icon: "♻️",
    },
    {
      title: t("about.values.authenticExperiences.title"),
      description: t("about.values.authenticExperiences.description"),
      icon: "✨",
    },
  ];

  const achievements = [
    {
      number: "10+",
      label: t("about.achievements.years"),
      description: t("about.achievements.yearsDesc"),
    },
    {
      number: "5,000+",
      label: t("about.achievements.guests"),
      description: t("about.achievements.guestsDesc"),
    },
    {
      number: "100%",
      label: t("about.achievements.safety"),
      description: t("about.achievements.safetyDesc"),
    },
    {
      number: "15+",
      label: t("about.achievements.projects"),
      description: t("about.achievements.projectsDesc"),
    },
  ];

  const galleryImages = [
    { src: image4, alt: "Wildlife Safari Experience" },
    { src: image5, alt: "Elephant in Natural Habitat" },
    { src: image6, alt: "Safari Vehicle in Park" },
    { src: image7, alt: "Wildlife Photography" },
    { src: image8, alt: "Nature Trail" },
    { src: image9, alt: "Wildlife Conservation" },
    { src: image10, alt: "Safari Adventure" },
    { src: image11, alt: "Wildlife Sanctuary" },
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-950 to-gray-900">
      <Header />

      <div className="pt-16 md:pt-20">
        {/* Hero Section with Background Image */}
        <div className="relative h-56 sm:h-72 md:h-96 mb-10 md:mb-16">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${image4})` }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center px-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-abeze font-bold text-white mb-2 md:mb-4 break-words">
                {(() => {
                  const title = t("about.title");
                  // Try to split on 'Wild Lanka' or 'වයිල්ඩ් ලංකා' for both languages
                  if (title.includes('Wild Lanka')) {
                    const [before, after] = title.split('Wild Lanka');
                    return <>{before}<span className="text-green-400">Wild</span> <span className="text-green-400">Lanka</span>{after}</>;
                  } else if (title.includes('වයිල්ඩ් ලංකා')) {
                    const [before, after] = title.split('වයිල්ඩ් ලංකා');
                    return <>{before}<span className="text-green-400">වයිල්ඩ්</span> <span className="text-green-400">ලංකා</span>{after}</>;
                  } else {
                    return title;
                  }
                })()}
              </h1>
              <p className="text-gray-200 text-base sm:text-lg font-abeze max-w-xl md:max-w-3xl mx-auto px-2">
                {t("about.subtitle")}
              </p>
            </div>
          </div>
        </div>

  <div className="container mx-auto px-2 sm:px-4 md:px-6">
          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-20">
            <div>
              <h3 className="text-3xl font-abeze font-bold text-white mb-6">
                {t("about.story.title")}
              </h3>
              <div className="space-y-4 text-gray-300 font-abeze leading-relaxed">
                <p>{t("about.story.founded")}</p>
                <p>{t("about.story.founder")}</p>
                <p>{t("about.story.today")}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-green-400/30">
              <h4 className="text-2xl font-abeze font-bold text-white mb-4">
                {t("about.mission.title")}
              </h4>
              <p className="text-gray-300 font-abeze mb-6">
                {t("about.mission.description")}
              </p>
              <h4 className="text-2xl font-abeze font-bold text-white mb-4">
                {t("about.vision.title")}
              </h4>
              <p className="text-gray-300 font-abeze">
                {t("about.vision.description")}
              </p>
            </div>
          </div>

          {/* Image Gallery Section */}
          <div className="mb-12 md:mb-20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white text-center mb-6 md:mb-12">
              {t("about.gallery.title")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border-2 border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-28 sm:h-36 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12 md:mb-20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white text-center mb-6 md:mb-12">
              {t("about.values.title")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 text-center">{value.icon}</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-abeze font-bold text-white mb-2 sm:mb-3 text-center">
                    {value.title}
                  </h4>
                  <p className="text-gray-300 font-abeze text-xs sm:text-sm text-center leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12 md:mb-20">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white text-center mb-6 md:mb-12">
              {t("about.team.title")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-4 text-center">
                    {member.image}
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-abeze font-bold text-white mb-1 sm:mb-2 text-center">
                    {member.name}
                  </h4>
                  <p className="text-green-400 font-abeze text-xs sm:text-sm text-center mb-2 sm:mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-300 font-abeze text-xs sm:text-sm text-center mb-2 sm:mb-3 leading-relaxed">
                    {member.description}
                  </p>
                  <div className="bg-green-600/20 text-green-400 px-2 sm:px-3 py-1 rounded-lg text-center">
                    <span className="font-abeze font-medium text-xs">
                      {member.expertise}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="mb-8 md:mb-16">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-abeze font-bold text-white text-center mb-6 md:mb-12">
              {t("about.achievements.title")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="text-center bg-gradient-to-br from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-abeze font-bold text-green-400 mb-1 sm:mb-2">
                    {achievement.number}
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-abeze font-bold text-white mb-1 sm:mb-2">
                    {achievement.label}
                  </h4>
                  <p className="text-gray-300 font-abeze text-xs sm:text-sm">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-8 md:mb-16 px-2">
            <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-green-400/30">
              <h3 className="text-lg sm:text-2xl font-abeze font-bold text-white mb-2 sm:mb-4">
                {t("about.cta.title")}
              </h3>
              <p className="text-gray-300 font-abeze mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto text-xs sm:text-base">
                {t("about.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                <button
                  onClick={() => navigate("/travel-packages")}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-abeze font-bold transition-colors duration-300"
                >
                  {t("about.cta.bookSafari")}
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-8 py-3 rounded-full font-abeze font-bold transition-all duration-300"
                >
                  {t("about.cta.contactUs")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
