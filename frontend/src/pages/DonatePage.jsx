import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DonatePage = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
  ];

  const donationAmounts = [
    { value: '25', label: '25', description: 'Feeds an elephant for a day' },
    { value: '50', label: '50', description: 'Supports anti-poaching patrol' },
    { value: '100', label: '100', description: 'Restores 1 acre of habitat' },
    { value: '250', label: '250', description: 'Educates 10 local families' },
    { value: '500', label: '500', description: 'Funds research project' }
  ];

  const impactAreas = [
    {
      title: "Habitat Protection & Restoration",
      description: "Your donations directly fund the protection and restoration of critical wildlife habitats across Sri Lanka. We work to create wildlife corridors, restore degraded ecosystems, and maintain the natural balance of our national parks.",
      impact: "1,000+ acres of habitat protected annually",
      icon: "🌿",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Anti-Poaching & Wildlife Security",
      description: "Support our ranger programs, surveillance technology, and community-based monitoring systems that protect endangered species from illegal hunting and wildlife trafficking.",
      impact: "24/7 monitoring across 15 protected areas",
      icon: "🛡️",
      color: "from-red-500 to-red-600"
    },
    {
      title: "Community Education & Engagement",
      description: "Fund educational programs that teach local communities about wildlife conservation, sustainable tourism practices, and the economic benefits of protecting natural resources.",
      impact: "500+ families educated annually",
      icon: "📚",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Scientific Research & Monitoring",
      description: "Support vital research projects that help us understand wildlife populations, migration patterns, and the impacts of climate change on Sri Lanka's biodiversity.",
      impact: "50+ research projects funded",
      icon: "🔬",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Emergency Wildlife Rescue",
      description: "Provide immediate care and rehabilitation for injured or orphaned wildlife, including elephants, leopards, and other endangered species found in distress.",
      impact: "100+ animals rescued annually",
      icon: "🚑",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Sustainable Tourism Development",
      description: "Develop eco-friendly tourism infrastructure that benefits both wildlife and local communities while minimizing environmental impact.",
      impact: "20+ sustainable tourism projects",
      icon: "🏞️",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const successStories = [
    {
      title: "Elephant Corridor Success",
      description: "With donor support, we successfully created a 5-mile wildlife corridor connecting two national parks, allowing elephant herds to safely migrate between feeding grounds.",
      impact: "200+ elephants now safely migrate annually",
      year: "2023"
    },
    {
      title: "Community Ranger Program",
      description: "Trained 50 local community members as wildlife rangers, providing employment while protecting endangered species in their natural habitat.",
      impact: "50 new jobs created, 0 poaching incidents",
      year: "2023"
    },
    {
      title: "Habitat Restoration Project",
      description: "Restored 500 acres of degraded forest land, planting native species and creating new habitats for endangered birds and small mammals.",
      impact: "500 acres restored, 15 species returned",
      year: "2022"
    }
  ];

  const handleDonation = (amount) => {
    // Navigate to donation details page with amount and currency
    navigate('/donation-details', {
      state: {
        amount: amount,
        currency: selectedCurrency
      }
    });
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === selectedCurrency)?.symbol || '$';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-abeze font-bold mb-4">
            Support Wildlife <span className="text-yellow-300">Conservation</span>
          </h1>
          <p className="text-xl font-abeze max-w-3xl mx-auto">
            Your donation directly supports our mission to protect Sri Lanka's precious wildlife 
            and preserve our natural heritage for future generations.
          </p>
          <Link 
            to="/" 
            className="inline-block mt-6 bg-white text-green-600 px-6 py-3 rounded-full font-abeze font-bold hover:bg-gray-100 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Impact Areas */}
        <div className="mb-20">
          <h2 className="text-4xl font-abeze font-bold text-white text-center mb-4">
            How Your Donation <span className="text-green-400">Makes a Difference</span>
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Every dollar you donate goes directly to conservation efforts. Here's exactly how your contribution helps protect Sri Lanka's wildlife.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {impactAreas.map((area, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{area.icon}</div>
                <h3 className="text-xl font-abeze font-bold text-white mb-3">
                  {area.title}
                </h3>
                <p className="text-gray-300 font-abeze mb-4 leading-relaxed">
                  {area.description}
                </p>
                <div className={`bg-gradient-to-r ${area.color} text-white px-4 py-2 rounded-lg inline-block`}>
                  <span className="font-abeze font-bold text-sm">{area.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <h2 className="text-4xl font-abeze font-bold text-white text-center mb-4">
            Our <span className="text-green-400">Success Stories</span>
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            See the real impact of donor contributions through our recent conservation achievements.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30"
              >
                <div className="bg-green-600 text-white px-3 py-1 rounded-full inline-block mb-4">
                  <span className="font-abeze font-bold text-sm">{story.year}</span>
                </div>
                <h3 className="text-xl font-abeze font-bold text-white mb-3">
                  {story.title}
                </h3>
                <p className="text-gray-300 font-abeze mb-4 leading-relaxed">
                  {story.description}
                </p>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  <span className="font-abeze font-bold text-sm">{story.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donation Section */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-400/20 backdrop-blur-sm rounded-2xl p-8 border border-green-400/30">
          <h2 className="text-3xl font-abeze font-bold text-white text-center mb-8">
            Make a <span className="text-green-400">Donation</span>
          </h2>
          
                     <div className="grid md:grid-cols-2 gap-12">
             {/* Donation Amounts */}
             <div>
               <h3 className="text-xl font-abeze font-bold text-white mb-6">Choose Your Impact</h3>
               
               {/* Currency Selection */}
               <div className="mb-6">
                 <label className="block text-white font-abeze font-bold mb-3">Select Currency:</label>
                 <select
                   value={selectedCurrency}
                   onChange={(e) => setSelectedCurrency(e.target.value)}
                   className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-green-400 font-abeze"
                 >
                   {currencies.map((currency) => (
                     <option key={currency.code} value={currency.code} className="bg-gray-800">
                       {currency.symbol} - {currency.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="space-y-4">
                 {donationAmounts.map((amount) => (
                   <button
                     key={amount.value}
                     onClick={() => setSelectedAmount(amount.value)}
                     className={`w-full p-4 rounded-xl border-2 transition-all duration-300 font-abeze text-left ${
                       selectedAmount === amount.value
                         ? 'border-green-400 bg-green-600/20 text-white'
                         : 'border-white/20 bg-white/10 text-gray-300 hover:border-green-400/50'
                     }`}
                   >
                     <div className="flex justify-between items-center">
                       <div>
                         <div className="font-bold text-lg">{getCurrencySymbol()}{amount.label}</div>
                         <div className="text-sm opacity-80">{amount.description}</div>
                       </div>
                       <div className="text-2xl">→</div>
                     </div>
                   </button>
                 ))}
                 
                 {/* Custom Amount */}
                 <div className="mt-6">
                   <label className="block text-white font-abeze font-bold mb-2">Or enter custom amount:</label>
                   <div className="flex">
                     <span className="bg-white/10 text-white px-4 py-3 rounded-l-lg border border-white/20">{getCurrencySymbol()}</span>
                     <input
                       type="number"
                       value={customAmount}
                       onChange={(e) => setCustomAmount(e.target.value)}
                       placeholder="Enter amount"
                       className="flex-1 bg-white/10 text-white px-4 py-3 rounded-r-lg border border-white/20 focus:outline-none focus:border-green-400"
                     />
                   </div>
                 </div>
               </div>
             </div>

            {/* Donation Info */}
            <div>
              <h3 className="text-xl font-abeze font-bold text-white mb-6">Your Donation Supports</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="font-abeze">100% of funds go directly to conservation</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="font-abeze">Tax-deductible donations</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="font-abeze">Regular impact reports</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="text-green-400 mr-3">✓</span>
                  <span className="font-abeze">Secure payment processing</span>
                </div>
              </div>

                             <button
                 onClick={() => handleDonation(selectedAmount || customAmount)}
                 disabled={!selectedAmount && !customAmount}
                 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-abeze font-bold text-lg transition-colors duration-300"
               >
                 {selectedAmount || customAmount 
                   ? `Continue to Payment - ${getCurrencySymbol()}${selectedAmount || customAmount}` 
                   : 'Select an amount to donate'
                 }
               </button>

              <p className="text-gray-400 text-sm mt-4 text-center">
                Your donation is secure and will be processed immediately
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-abeze font-bold text-white mb-4">
            Questions About Donations?
          </h3>
          <p className="text-gray-300 font-abeze mb-6">
            Contact our development team for more information about our conservation programs.
          </p>
          <Link 
            to="/contact" 
            className="bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-white px-8 py-3 rounded-full font-abeze font-bold transition-all duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
