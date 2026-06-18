import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Search, 
  Menu, 
  X, 
  Sliders, 
  Compass, 
  Award, 
  ShieldCheck, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  ShoppingBag,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('HOME');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeBikeIndex, setActiveBikeIndex] = useState(0);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Customizer States (defaults to match first bike model)
  const [selectedFrameColor, setSelectedFrameColor] = useState('#D1D5DB'); // Chrome Silver
  const [selectedLeatherColor, setSelectedLeatherColor] = useState('#8C4F2B'); // Honey Brown
  const [hasFrontCarrier, setHasFrontCarrier] = useState(true);
  const [fenderColor, setFenderColor] = useState('#9CA3AF'); // Matching fenders

  // Interactive Hotspot details
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Success Notification state
  const [notification, setNotification] = useState('');

  // Booking form states
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    model: 'City Cruiser',
    frameSize: 'Medium (54cm)',
    message: ''
  });

  const bikes = [
    {
      id: '01',
      name: 'City Cruiser',
      tagline: 'Ride in style',
      price: '8,499 DKK',
      rawPrice: 8499,
      description: 'City Cruiser is designed and built based on the idea that a bicycle should be just as comfortable and elegant as a classic sports car.',
      frameColor: '#D1D5DB', // Chrome
      leatherColor: '#8C4F2B', // Honey Brown
      carrier: true,
      specs: {
        weight: '11.8 kg',
        gears: 'Shimano Alfine 8-speed',
        frame: 'Double-butted CrMo Steel',
        tires: 'Panaracer Pasela 32c'
      }
    },
    {
      id: '02',
      name: 'Classic Sport',
      tagline: 'Agility meets heritage',
      price: '9,799 DKK',
      rawPrice: 9799,
      description: 'A lighter, more aggressive profile built for swift urban commuting. Strips away the carrier for an ultra-clean aerodynamic silhouette.',
      frameColor: '#1E293B', // Obsidian
      leatherColor: '#451A03', // Dark Espresso
      carrier: false,
      specs: {
        weight: '10.2 kg',
        gears: 'Single Speed / Flip-Flop Hub',
        frame: 'Columbus Cromor Steel Tubing',
        tires: 'Vittoria Corsa 28c'
      }
    },
    {
      id: '03',
      name: 'Gravel Explorer',
      tagline: 'Beyond the tarmac',
      price: '11,200 DKK',
      rawPrice: 11200,
      description: 'Engineered for off-road reliability. Features broader tire clearance, reinforced frame bosses for bikepacking, and high-performance disc brakes.',
      frameColor: '#2B433B', // British Racing Green
      leatherColor: '#18181B', // Carbon Black
      carrier: true,
      specs: {
        weight: '12.4 kg',
        gears: 'SRAM Apex 1x11 Speed',
        frame: 'Reynolds 531 Heavy Duty Steel',
        tires: 'Schwalbe G-One 40c'
      }
    }
  ];

  // Sync customizer preset when bike slide changes
  useEffect(() => {
    const current = bikes[activeBikeIndex];
    setSelectedFrameColor(current.frameColor);
    setSelectedLeatherColor(current.leatherColor);
    setHasFrontCarrier(current.carrier);
    setBookingForm(prev => ({ ...prev, model: current.name }));
  }, [activeBikeIndex]);

  // Handle slide change
  const nextSlide = () => {
    setActiveBikeIndex((prev) => (prev + 1) % bikes.length);
  };

  const prevSlide = () => {
    setActiveBikeIndex((prev) => (prev - 1 + bikes.length) % bikes.length);
  };

  // Helper to show floating notification
  const triggerNotification = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(''), 4000);
  };

  // Handle customized order
  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    triggerNotification(`Successfully added customized ${bikes[activeBikeIndex].name} to your reservation.`);
  };

  // Handle booking form submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email) {
      triggerNotification('Please fill in required fields.');
      return;
    }
    setBookingOpen(false);
    triggerNotification(`Thank you, ${bookingForm.name}! Your consultation request for the ${bookingForm.model} has been reserved.`);
    setBookingForm({
      name: '',
      email: '',
      model: bikes[activeBikeIndex].name,
      frameSize: 'Medium (54cm)',
      message: ''
    });
  };

  // Pre-configured Design Swatches
  const frameSwatches = [
    { name: 'Chrome Silver', value: '#D1D5DB' },
    { name: 'Obsidian Matte', value: '#1E293B' },
    { name: 'Racing Green', value: '#2B433B' },
    { name: 'Sahara Sand', value: '#C2A17E' },
    { name: 'Classic Burgundy', value: '#581C1C' }
  ];

  const leatherSwatches = [
    { name: 'Classic Honey', value: '#8C4F2B' },
    { name: 'Dark Espresso', value: '#451A03' },
    { name: 'Stealth Black', value: '#18181B' }
  ];

  // Hotspots definitions mapped to bike layout coordinate
  const hotspots = [
    { id: 'bars', x: 530, y: 110, title: 'Cruiser Handlebars', desc: 'Crafted from high-polished alloy with hand-stitched premium leather grips matching your saddle selection.' },
    { id: 'saddle', x: 280, y: 150, title: 'Brooks B17 Leather Saddle', desc: 'Handcrafted in Birmingham, England. Molds to your unique anatomy over miles of riding.' },
    { id: 'rack', x: 610, y: 190, title: 'Integrated Porteur Rack', desc: 'Sleek structural front carrier rated up to 15kg. Built directly into the steering geometry.' },
    { id: 'hub', x: 160, y: 310, title: 'Internal Hub Gearing', desc: 'Protected, maintenance-free shifting. Enables seamless gear changes even when fully stationary at lights.' },
    { id: 'frame', x: 420, y: 220, title: 'Double-Butted Steel Frame', desc: 'Hand-brazed lugs of high-tensile CrMo steel. Provides unparalleled road dampening and aesthetic finesse.' }
  ];

  return (
    <div className="min-h-screen bg-[#1F2226] text-white flex flex-col relative overflow-x-hidden selection:bg-[#4AD2B6] selection:text-[#1F2226] font-sans antialiased">
      
      {/* BACKGROUND STUDIO SHADOW / LIGHT GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial keylight behind the bicycle showcase */}
        <div className="absolute top-[20%] left-[50%] -translate-x-[50%] w-[80vw] h-[55vh] rounded-full bg-gradient-radial from-[#32383F] to-transparent opacity-65 blur-3xl" />
        {/* Ambient mint glow matching UI accent color */}
        <div className="absolute top-[10%] left-[25%] w-[300px] h-[300px] rounded-full bg-[#4AD2B6]/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-black/40 blur-[100px]" />
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#2d3238] border border-[#4AD2B6]/40 text-[#E5E7EB] px-6 py-3 rounded-md shadow-2xl flex items-center space-x-3 transition-all duration-300 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#4AD2B6] animate-pulse" />
          <p className="text-xs tracking-wider uppercase font-medium">{notification}</p>
        </div>
      )}

      {/* OUTER EDITORIAL GRID FRAMING LINES */}
      <div className="absolute inset-y-0 left-[6%] w-[1px] bg-white/[0.04] pointer-events-none z-30" />
      <div className="absolute inset-y-0 right-[6%] w-[1px] bg-white/[0.04] pointer-events-none z-30" />
      <div className="absolute top-[80px] inset-x-0 h-[1px] bg-white/[0.04] pointer-events-none z-30" />

      {/* TOP BRAND NAVIGATION */}
      <header className="relative w-full h-[80px] flex items-center justify-between px-[6%] z-40 border-b border-white/[0.02]">
        {/* Left Side Logo */}
        <div className="flex items-center space-x-10">
          <a href="#" className="flex items-center space-x-3 group">
            <div className="relative w-7 h-7 flex flex-col justify-between p-[5px] border border-white/60 group-hover:border-[#4AD2B6] transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-[#4AD2B6] transition-colors duration-300 self-center" />
              <span className="w-full h-[1.5px] bg-white group-hover:bg-[#4AD2B6] transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold tracking-[0.25em] uppercase text-white leading-none">NORDEN</span>
              <span className="text-[7px] tracking-[0.4em] text-white/45 uppercase mt-1">KØBENHAVN</span>
            </div>
          </a>
        </div>

        {/* Center / Right Links */}
        <nav className="hidden md:flex items-center space-x-12 text-[11px] font-semibold tracking-[0.25em] text-white/50">
          {['HOME', 'BIKES', 'SPECIFICATION', 'HERITAGE'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                const element = document.getElementById(tab.toLowerCase());
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`hover:text-white transition-colors duration-300 uppercase py-2 relative ${
                activeTab === tab ? 'text-white' : ''
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-[#4AD2B6] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Interactive Actions */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className="p-2 text-white/60 hover:text-[#4AD2B6] transition-colors relative"
            aria-label="Search Catalog"
          >
            <Search size={16} />
          </button>

          {/* Search Box Pull-down */}
          {searchOpen && (
            <div className="absolute top-[80px] right-[10%] bg-[#1E2125] border border-white/10 p-3 rounded shadow-xl flex items-center space-x-2 animate-fade-in z-50">
              <input 
                type="text" 
                placeholder="Search bikes, gears..." 
                className="bg-transparent border-none text-xs outline-none text-white w-48 placeholder:text-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    triggerNotification(`Search for "${searchQuery}" is not available in demo.`);
                    setSearchOpen(false);
                  }
                }}
              />
              <button onClick={() => { triggerNotification(`Searching for ${searchQuery}...`); setSearchOpen(false); }}>
                <ArrowRight size={14} className="text-[#4AD2B6]" />
              </button>
            </div>
          )}

          {/* Custom Shopping Basket indicator */}
          <button 
            onClick={() => {
              if (cartCount > 0) {
                triggerNotification("Redirecting you to complete your handcrafted reservation details.");
                setBookingOpen(true);
              } else {
                triggerNotification("Your design board is empty. Choose standard specifications or customize.");
              }
            }}
            className="p-2 text-white/60 hover:text-[#4AD2B6] transition-colors relative"
          >
            <ShoppingBag size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4AD2B6] text-[#1F2226] font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setBookingOpen(true)}
            className="border border-[#4AD2B6]/40 hover:border-[#4AD2B6] px-4 py-1.5 text-[10px] tracking-[0.2em] font-medium text-white hover:text-[#4AD2B6] uppercase rounded transition-all duration-300 bg-[#4AD2B6]/5"
          >
            RESERVE NOW
          </button>
        </div>
      </header>

      {/* SOCIAL VERTICAL FLOATER (RIGHT MARGIN) & LANGUAGE INDICATOR */}
      <div className="hidden lg:flex flex-col justify-between items-center absolute right-[2%] top-[120px] bottom-[100px] w-6 z-40">
        {/* Top Grid Icon */}
        <button 
          onClick={() => {
            setCustomizerOpen(!customizerOpen);
            triggerNotification(customizerOpen ? "Exited configuration deck" : "Opened visual customization studio.");
          }}
          className="text-white/40 hover:text-[#4AD2B6] transition-colors py-2 group"
          title="Open Customization Deck"
        >
          <Sliders size={18} className="group-hover:rotate-95 transition-transform" />
        </button>

        {/* Centered Vertical Links */}
        <div className="flex flex-col space-y-12 my-auto">
          <a href="#instagram" className="text-[9px] tracking-[0.3em] font-medium uppercase text-white/30 hover:text-[#4AD2B6] transition-all transform rotate-90 origin-bottom-left whitespace-nowrap pl-6">
            INSTAGRAM
          </a>
          <a href="#journal" className="text-[9px] tracking-[0.3em] font-medium uppercase text-white/30 hover:text-[#4AD2B6] transition-all transform rotate-90 origin-bottom-left whitespace-nowrap pl-6">
            JOURNAL
          </a>
          <a href="#journal" className="text-[9px] tracking-[0.3em] font-medium uppercase text-white/30 hover:text-[#4AD2B6] transition-all transform rotate-90 origin-bottom-left whitespace-nowrap pl-6">
            TWITTER
          </a>
        </div>

        {/* Language Selector */}
        <div className="text-[10px] tracking-[0.1em] text-white/40 hover:text-white cursor-pointer transition-colors select-none">
          En <span className="text-[8px] text-white/20">▼</span>
        </div>
      </div>

      {/* LEFT MARGIN STYLISH ACCENTS */}
      <div className="hidden lg:flex flex-col justify-between items-center absolute left-[2%] top-[120px] bottom-[100px] w-6 z-40">
        <div className="text-[9px] text-white/30 tracking-[0.2em] uppercase origin-top-left -rotate-90 transform translate-y-20 whitespace-nowrap">
          DANISH DESIGN CO.
        </div>
        <div className="flex flex-col items-center space-y-4">
          <span className="w-[1px] h-20 bg-white/10" />
          <span className="text-[8px] font-bold text-white/25">EST. 2012</span>
        </div>
      </div>

      {/* MAIN MAIN CONTENT LAYOUT */}
      <main className="flex-1 w-full flex flex-col z-10">

        {/* HERO AREA (id="home") */}
        <section id="home" className="min-h-[85vh] lg:min-h-[90vh] w-full flex flex-col justify-between px-[6%] pt-12 pb-8 relative border-b border-white/[0.02]">
          
          {/* Main Flex Grid of Hero contents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
            
            {/* Left Content Column (Hero text elements) */}
            <div className="lg:col-span-4 z-20 flex flex-col justify-center select-none pr-4 lg:pr-8">
              {/* Animated Slide indicator */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-[12px] font-bold text-[#4AD2B6] tracking-wider">
                  0{bikes[activeBikeIndex].id}
                </span>
                <span className="w-12 h-[1px] bg-white/20" />
                <span className="text-[10px] tracking-[0.2em] font-medium uppercase text-white/40">
                  Premium Collection
                </span>
              </div>

              {/* Dynamic Heading and descriptive text */}
              <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-white mb-6 leading-[1.05]">
                {bikes[activeBikeIndex].tagline.split(' ').map((word, i) => (
                  <span key={i} className={i === 0 ? "font-bold block" : "font-extralight block text-white/80"}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <p className="text-[13px] leading-relaxed text-white/50 mb-8 max-w-sm">
                {bikes[activeBikeIndex].description}
              </p>

              {/* View details and Customize CTA triggers */}
              <div className="flex items-center space-x-6">
                <button 
                  onClick={() => {
                    const specSection = document.getElementById('specification');
                    if (specSection) specSection.scrollIntoView({ behavior: 'smooth' });
                    triggerNotification("Scroll down to explore interactive hotspots!");
                  }}
                  className="flex items-center space-x-3 group text-[#4AD2B6] text-[11px] font-semibold tracking-[0.2em] uppercase transition-all"
                >
                  <span className="group-hover:underline decoration-2">EXPLORE HOTSPOTS</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => setCustomizerOpen(true)}
                  className="text-white/45 hover:text-white text-[11px] font-medium tracking-[0.2em] uppercase transition-all underline decoration-[#4AD2B6]/40 hover:decoration-[#4AD2B6]"
                >
                  CONFIGURE SPECS
                </button>
              </div>
            </div>

            {/* Middle Interactive Bike Canvas (Dynamic SVG Visualizer) */}
            <div className="lg:col-span-8 relative flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
              
              {/* Backglow ring inside visualizer area */}
              <div className="absolute w-[80%] h-[80%] border border-white/[0.015] rounded-full pointer-events-none" />

              {/* High-fidelity SVG Classic Diamond Bicycle Frame Illustration */}
              <div className="w-full max-w-[760px] h-auto relative drop-shadow-[0_25px_40px_rgba(0,0,0,0.65)] transform hover:scale-[1.02] transition-transform duration-700">
                <svg viewBox="0 0 800 450" className="w-full h-full select-none">
                  
                  {/* Wheel Spokes Backshadow & Shading */}
                  <circle cx="190" cy="310" r="115" stroke="rgba(0,0,0,0.2)" strokeWidth="6" fill="none" />
                  <circle cx="610" cy="310" r="115" stroke="rgba(0,0,0,0.2)" strokeWidth="6" fill="none" />

                  {/* Tires (Danish Tan-wall classic Tires) */}
                  <circle cx="190" cy="310" r="118" stroke="#AE8B62" strokeWidth="6" fill="none" />
                  <circle cx="610" cy="310" r="118" stroke="#AE8B62" strokeWidth="6" fill="none" />
                  {/* Dark tread */}
                  <circle cx="190" cy="310" r="121" stroke="#2D3035" strokeWidth="3" fill="none" />
                  <circle cx="610" cy="310" r="121" stroke="#2D3035" strokeWidth="3" fill="none" />

                  {/* Chrome Alloy Rims */}
                  <circle cx="190" cy="310" r="112" stroke="#9CA3AF" strokeWidth="4" fill="none" />
                  <circle cx="610" cy="310" r="112" stroke="#9CA3AF" strokeWidth="4" fill="none" />

                  {/* Dense steel spokes */}
                  {[...Array(36)].map((_, index) => {
                    const angle = (index * 10 * Math.PI) / 180;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    return (
                      <g key={index} opacity="0.25">
                        <line x1="190" y1="310" x2={190 + 112 * cos} y2={310 + 112 * sin} stroke="#E5E7EB" strokeWidth="1" />
                        <line x1="610" y1="310" x2={610 + 112 * cos} y2={310 + 112 * sin} stroke="#E5E7EB" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* Mudguards / Fenders (Dynamic color based on customizer) */}
                  {/* Rear Fender */}
                  <path d="M 72 310 A 118 118 0 0 1 270 230" fill="none" stroke={fenderColor} strokeWidth="5" strokeLinecap="round" />
                  {/* Front Fender */}
                  <path d="M 520 220 A 118 118 0 0 1 685 260" fill="none" stroke={fenderColor} strokeWidth="5" strokeLinecap="round" />

                  {/* Structural Frame Tubes (Driven by selectedFrameColor) */}
                  <g stroke={selectedFrameColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    {/* Bottom Bracket (BB) coordinate: 350, 310 */}
                    {/* Rear Hub: 190, 310 */}
                    {/* Seat Cluster: 310, 180 */}
                    {/* Head Tube Top: 520, 130 */}
                    {/* Head Tube Bottom: 532, 175 */}
                    {/* Front Fork Crown: 535, 185 */}
                    {/* Front Hub: 610, 310 */}

                    {/* Chain Stay */}
                    <line x1="190" y1="310" x2="350" y2="310" strokeWidth="7" />
                    {/* Seat Stay */}
                    <line x1="190" y1="310" x2="310" y2="180" strokeWidth="6" />
                    {/* Seat Tube */}
                    <line x1="350" y1="310" x2="310" y2="180" />
                    {/* Down Tube */}
                    <line x1="350" y1="310" x2="532" y2="175" />
                    {/* Top Tube (Classic Diamond horizontal bar) */}
                    <line x1="310" y1="180" x2="520" y2="130" />
                    {/* Head Tube */}
                    <line x1="520" y1="130" x2="532" y2="175" strokeWidth="12" />
                    {/* Fork Leg (curving toward hub) */}
                    <path d="M 532 175 L 555 240 L 610 310" strokeWidth="8" />
                  </g>

                  {/* Chrome Accents & Lugs on Main Frame */}
                  <circle cx="350" cy="310" r="14" fill="none" stroke="#D1D5DB" strokeWidth="3" />
                  <circle cx="190" cy="310" r="10" fill="#9CA3AF" />
                  <circle cx="610" cy="310" r="10" fill="#9CA3AF" />

                  {/* Chainset & Bottom Bracket Pedal assembly */}
                  <circle cx="350" cy="310" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                  {/* Chain (Silver Linked style) */}
                  <path d="M 190 310 L 350 282 A 28 28 0 0 1 350 338 L 190 310" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Pedals & Crank Arms */}
                  {/* Drive side (facing up) */}
                  <line x1="350" y1="310" x2="350" y2="250" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round" />
                  <rect x="330" y="242" width="40" height="8" rx="2" fill="#374151" stroke="#D1D5DB" strokeWidth="2" />
                  {/* Non-drive side (facing down) */}
                  <line x1="350" y1="310" x2="350" y2="370" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
                  <rect x="330" y="368" width="40" height="8" rx="2" fill="#374151" stroke="#9CA3AF" strokeWidth="2" opacity="0.7" />

                  {/* Seatpost and Genuine Leather Brooks Saddle */}
                  <line x1="310" y1="180" x2="310" y2="155" stroke="#9CA3AF" strokeWidth="6" />
                  {/* Leather saddle visual (matches selectedLeatherColor) */}
                  <path d="M 270 148 C 270 142 280 140 315 142 C 322 142 332 148 335 154 L 325 157 C 300 157 285 155 270 148 Z" fill={selectedLeatherColor} stroke="#000" strokeWidth="1" />
                  {/* Chrome seat springs underneath vintage saddle */}
                  <path d="M 285 152 A 4 4 0 0 1 305 152" fill="none" stroke="#9CA3AF" strokeWidth="2" />
                  <path d="M 305 152 A 4 4 0 0 1 325 152" fill="none" stroke="#9CA3AF" strokeWidth="2" />

                  {/* Stem and Classic Swept Cruiser Handlebars */}
                  <line x1="520" y1="130" x2="515" y2="90" stroke="#D1D5DB" strokeWidth="6" />
                  {/* Stem clamp and head bracket */}
                  <path d="M 510 90 L 530 85" stroke="#D1D5DB" strokeWidth="7" fill="none" />
                  {/* Classic curved back handlebars */}
                  <path d="M 530 85 C 555 85 570 110 520 120" fill="none" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" />
                  {/* Leather Handlebar Grip */}
                  <path d="M 545 110 C 540 112 530 114 522 118" stroke={selectedLeatherColor} strokeWidth="7" fill="none" strokeLinecap="round" />

                  {/* Optional Front Carrier (Standard on City Cruiser) */}
                  {hasFrontCarrier && (
                    <g stroke="#9CA3AF" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-in">
                      {/* Carrier supports extending from fork to front axle */}
                      <line x1="610" y1="310" x2="575" y2="180" />
                      {/* Front stay to handlebar area */}
                      <line x1="532" y1="175" x2="575" y2="180" />
                      {/* Horizontal platform rack */}
                      <path d="M 545 180 L 615 180 L 610 160 L 555 160 Z" fill="rgba(0,0,0,0.1)" strokeWidth="4" />
                    </g>
                  )}
                </svg>

                {/* INTERACTIVE HOTSPOTS PULSING DOTS */}
                {hotspots.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setActiveHotspot(h.id === activeHotspot ? null : h.id);
                    }}
                    onMouseEnter={() => setActiveHotspot(h.id)}
                    className="absolute w-8 h-8 flex items-center justify-center group focus:outline-none transition-transform"
                    style={{
                      left: `${(h.x / 800) * 100}%`,
                      top: `${(h.y / 450) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {/* Outer pulse */}
                    <span className="absolute w-full h-full rounded-full bg-[#4AD2B6]/30 animate-ping group-hover:bg-[#4AD2B6]/40" />
                    {/* Border ring */}
                    <span className="absolute w-5 h-5 rounded-full border border-[#4AD2B6] bg-[#1F2226]/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="w-2 h-2 rounded-full bg-[#4AD2B6]" />
                    </span>

                    {/* Tooltip Overlay */}
                    {activeHotspot === h.id && (
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 bg-[#262B30] border border-[#4AD2B6]/30 p-4 rounded-lg shadow-2xl z-50 text-left pointer-events-auto">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs tracking-wider uppercase font-bold text-white">{h.title}</h4>
                          <span className="text-[9px] text-[#4AD2B6] font-mono uppercase tracking-widest">SPEC</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-white/70 font-normal">{h.desc}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* LOWER BAR WITH MODEL TOGGLER & SCROLL DOWN (Inspiration Layout elements) */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between mt-6 z-20 border-t border-white/[0.04] pt-6 select-none">
            
            {/* Cycle Model Showcase Details */}
            <div className="flex items-center space-x-8 mb-4 md:mb-0">
              <div className="text-left">
                <span className="block text-[10px] tracking-[0.25em] text-white/30 uppercase">CURRENT MODEL</span>
                <span className="block text-xl tracking-wide font-semibold text-white">{bikes[activeBikeIndex].name}</span>
                <span className="block text-xs font-semibold text-[#4AD2B6] tracking-wider mt-1">{bikes[activeBikeIndex].price}</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center space-x-3">
                {bikes.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBikeIndex(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition-all duration-300 ${
                      activeBikeIndex === idx 
                        ? 'bg-[#4AD2B6] text-[#1F2226] font-bold shadow-lg shadow-[#4AD2B6]/20' 
                        : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.08]'
                    }`}
                  >
                    0{b.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Scroll down Indicator */}
            <div className="flex flex-col items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => {
                const element = document.getElementById('specification');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {/* Retro Mouse Icon */}
              <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1.5 mb-2">
                <span className="w-1 h-1.5 bg-[#4AD2B6] rounded-full animate-bounce" />
              </div>
              <span className="text-[9px] tracking-[0.3em] font-bold text-white/45">SCROLL DOWN</span>
            </div>

            {/* Slider Navigation arrows */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 border border-white/10 hover:border-[#4AD2B6]/50 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all bg-white/[0.02] hover:bg-[#4AD2B6]/5"
                aria-label="Previous Model"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 border border-white/10 hover:border-[#4AD2B6]/50 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all bg-white/[0.02] hover:bg-[#4AD2B6]/5"
                aria-label="Next Model"
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

        </section>

        {/* INTERACTIVE BUILD STUDIO (CONFIGURATOR SECTION) */}
        <section id="specification" className="w-full bg-[#1C1E22] px-[6%] py-24 border-b border-white/[0.02] relative">
          
          {/* Section Divider Line */}
          <div className="absolute top-0 left-0 w-32 h-[1px] bg-[#4AD2B6]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left spec presentation details column */}
            <div className="lg:col-span-4 select-none">
              <span className="text-[10px] tracking-[0.3em] font-semibold text-[#4AD2B6] uppercase block mb-3">CUSTOM TAILORED</span>
              <h2 className="text-4xl font-light tracking-tight text-white mb-6 leading-snug">
                Configure your <strong className="font-bold block">bespoke setup.</strong>
              </h2>
              <p className="text-white/55 text-xs leading-relaxed mb-8">
                Every Norden frame is built strictly to order, using high-tensile Reynolds or Columbus double-butted steel. Explore our configurations below or adjust frame coatings and leather accents to reflect your signature aesthetic.
              </p>

              {/* Realtime Bike Spec Matrix table */}
              <div className="space-y-4 border-t border-white/[0.05] pt-6">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Total Net Weight</span>
                  <span className="text-xs font-mono font-medium text-white">{bikes[activeBikeIndex].specs.weight}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/[0.02]">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Drivetrain System</span>
                  <span className="text-xs font-semibold text-white">{bikes[activeBikeIndex].specs.gears}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/[0.02]">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Frame Composition</span>
                  <span className="text-xs font-semibold text-white">{bikes[activeBikeIndex].specs.frame}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/[0.02]">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">All-Weather Tires</span>
                  <span className="text-xs font-semibold text-white">{bikes[activeBikeIndex].specs.tires}</span>
                </div>
              </div>

              {/* Reset to standard button */}
              <button 
                onClick={() => {
                  const current = bikes[activeBikeIndex];
                  setSelectedFrameColor(current.frameColor);
                  setSelectedLeatherColor(current.leatherColor);
                  setHasFrontCarrier(current.carrier);
                  triggerNotification("Restored factory original design palette.");
                }}
                className="mt-8 flex items-center space-x-2 text-[10px] text-white/40 hover:text-[#4AD2B6] tracking-widest uppercase transition-colors"
              >
                <RotateCcw size={12} />
                <span>RESTORE FACTORY DEFAULTS</span>
              </button>
            </div>

            {/* Right customizable controls Column */}
            <div className="lg:col-span-8 bg-[#23272C] border border-white/[0.04] p-8 md:p-12 rounded-lg">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Frame Color Swatches */}
                <div>
                  <h3 className="text-xs tracking-[0.2em] font-bold uppercase text-white mb-6 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#4AD2B6] rounded-full" />
                    <span>01. Frame Finish</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {frameSwatches.map((swatch) => (
                      <button
                        key={swatch.name}
                        onClick={() => {
                          setSelectedFrameColor(swatch.value);
                          triggerNotification(`Set frame finish to ${swatch.name}`);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded border transition-all text-left ${
                          selectedFrameColor === swatch.value 
                            ? 'border-[#4AD2B6] bg-[#4AD2B6]/5' 
                            : 'border-white/[0.03] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ backgroundColor: swatch.value }} 
                          />
                          <span className="text-[11px] font-medium tracking-wide text-white">{swatch.name}</span>
                        </div>
                        {selectedFrameColor === swatch.value && (
                          <Check size={12} className="text-[#4AD2B6]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leather Appointments Swatches */}
                <div>
                  <h3 className="text-xs tracking-[0.2em] font-bold uppercase text-white mb-6 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-[#4AD2B6] rounded-full" />
                    <span>02. Saddlery & Handgrips</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {leatherSwatches.map((swatch) => (
                      <button
                        key={swatch.name}
                        onClick={() => {
                          setSelectedLeatherColor(swatch.value);
                          triggerNotification(`Stitched components using ${swatch.name} Leather`);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded border transition-all text-left ${
                          selectedLeatherColor === swatch.value 
                            ? 'border-[#4AD2B6] bg-[#4AD2B6]/5' 
                            : 'border-white/[0.03] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span 
                            className="w-4 h-4 rounded-full border border-white/20" 
                            style={{ backgroundColor: swatch.value }} 
                          />
                          <span className="text-[11px] font-medium tracking-wide text-white">{swatch.name}</span>
                        </div>
                        {selectedLeatherColor === swatch.value && (
                          <Check size={12} className="text-[#4AD2B6]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Addons options (carrier toggle, matching fenders) */}
                  <div className="mt-8 pt-8 border-t border-white/[0.05]">
                    <h3 className="text-xs tracking-[0.2em] font-bold uppercase text-white mb-4">
                      Accessories Deck
                    </h3>
                    <div className="space-y-4">
                      {/* Porteur Carrier Toggle */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] tracking-wide text-white/60 group-hover:text-white transition-colors">
                          Add Front Porteur Carrier Rack
                        </span>
                        <input
                          type="checkbox"
                          checked={hasFrontCarrier}
                          onChange={(e) => {
                            setHasFrontCarrier(e.target.checked);
                            triggerNotification(e.target.checked ? "Added integrated front carrier platform." : "Removed front carrier platform.");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1C1E22] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4AD2B6] relative" />
                      </label>

                      {/* Fender matching color toggle */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] tracking-wide text-white/60 group-hover:text-white transition-colors">
                          Coat Fenders to match Frame color
                        </span>
                        <input
                          type="checkbox"
                          checked={fenderColor === selectedFrameColor}
                          onChange={(e) => {
                            setFenderColor(e.target.checked ? selectedFrameColor : '#9CA3AF');
                            triggerNotification(e.target.checked ? "Matched mudguard paint coordinates." : "Returned to classic alloy fenders.");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1C1E22] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4AD2B6] relative" />
                      </label>
                    </div>
                  </div>

                </div>

              </div>

              {/* Dynamic Bottom Row Summary */}
              <div className="mt-10 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 text-left">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 block">Estimated Handcrafting Cycle</span>
                  <span className="text-sm font-semibold text-white tracking-wide block">3 - 4 Weeks (Danish Workshop)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleAddToCart}
                    className="bg-[#4AD2B6] hover:bg-[#39C3A7] text-[#1F2226] font-bold text-xs tracking-widest uppercase px-8 py-3.5 rounded shadow-lg shadow-[#4AD2B6]/15 transition-all"
                  >
                    ADD TO DESIGN DECK
                  </button>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* NORDEN EDITORIAL HERITAGE (id="heritage") */}
        <section id="heritage" className="w-full bg-[#1F2226] px-[6%] py-24 border-b border-white/[0.02]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Narrative Frame */}
            <div className="lg:col-span-5 select-none relative">
              <span className="text-[10px] tracking-[0.3em] font-semibold text-[#4AD2B6] uppercase block mb-3">
                HANDCRAFTED IN COPENHAGEN
              </span>
              <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-8 leading-tight">
                Steel retains its <strong className="font-bold">soul.</strong>
              </h2>
              <div className="space-y-6 text-white/50 text-xs leading-relaxed max-w-lg">
                <p>
                  At Norden, we believe that high-performance doesn’t require modern composites. Steel has an innate, organic elasticity—a dampening quality that actively breathes with the street, delivering an incredibly smooth, fluid momentum that carbon fibers cannot replicate.
                </p>
                <p>
                  Every frame joint is carefully hand-welded using low-temperature brass brazing. This heritage assembly protects the tube integrity from molecular stress, assuring your Norden is structurally prepared for lifelong utility.
                </p>
              </div>

              {/* Editorial Stat block row */}
              <div className="grid grid-cols-3 gap-8 mt-12 border-t border-white/5 pt-8">
                <div>
                  <span className="block text-3xl font-extrabold text-white">4130</span>
                  <span className="block text-[9px] tracking-wider text-white/40 uppercase mt-1">Grade CrMo Alloy</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-[#4AD2B6]">100%</span>
                  <span className="block text-[9px] tracking-wider text-white/40 uppercase mt-1">Brazed by Hand</span>
                </div>
                <div>
                  <span className="block text-3xl font-extrabold text-white">50yr</span>
                  <span className="block text-[9px] tracking-wider text-white/40 uppercase mt-1">Frame Guarantee</span>
                </div>
              </div>
            </div>

            {/* Right Abstract Artistic Grid (Minimalist representations matching the design language) */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* Premium Card 1 */}
              <div className="bg-[#1C1E22] border border-white/[0.04] p-8 rounded-lg relative overflow-hidden group hover:border-[#4AD2B6]/30 transition-all duration-300">
                <Compass className="text-[#4AD2B6] mb-6" size={28} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Perfect Geometry</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Tailored traditional angles constructed for active, upright visual spatial orientation. Ride safely, in total peripheral sync with municipal movement.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4AD2B6]/5 rounded-full blur-2xl group-hover:bg-[#4AD2B6]/10 transition-colors" />
              </div>

              {/* Premium Card 2 */}
              <div className="bg-[#1C1E22] border border-white/[0.04] p-8 rounded-lg relative overflow-hidden group hover:border-[#4AD2B6]/30 transition-all duration-300">
                <Award className="text-[#4AD2B6] mb-6" size={28} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Danish Craftsmanship</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Each machine undergoes rigorous alignment tolerances within our Copenhagen workshop. Hand-polished, meticulously serial-stamped, and signed by its master builder.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4AD2B6]/5 rounded-full blur-2xl group-hover:bg-[#4AD2B6]/10 transition-colors" />
              </div>

              {/* Premium Card 3 */}
              <div className="bg-[#1C1E22] border border-white/[0.04] p-8 rounded-lg relative overflow-hidden group hover:border-[#4AD2B6]/30 transition-all duration-300">
                <ShieldCheck className="text-[#4AD2B6] mb-6" size={28} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">Lifetime Assembly Support</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Every handcrafted frame contains nested internal cables and sealed industrial bearing components to ward off seasonal ocean mist, rain, and road dust.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4AD2B6]/5 rounded-full blur-2xl group-hover:bg-[#4AD2B6]/10 transition-colors" />
              </div>

              {/* Premium Card 4 */}
              <div className="bg-[#1C1E22] border border-white/[0.04] p-8 rounded-lg relative overflow-hidden group hover:border-[#4AD2B6]/30 transition-all duration-300">
                <BookOpen className="text-[#4AD2B6] mb-6" size={28} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3">The Norden Journal</h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  Join our exclusive cycling network. Read monthly chronicles on classic architecture, city commutes, global steel restoration, and design philosophy.
                </p>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#4AD2B6]/5 rounded-full blur-2xl group-hover:bg-[#4AD2B6]/10 transition-colors" />
              </div>

            </div>

          </div>

        </section>

        {/* CUSTOM BRANDS/PRESS ROW (MINIMALIST LOGOS) */}
        <section className="w-full bg-[#1A1C1F] py-12 px-[6%] border-b border-white/[0.02]">
          <div className="flex flex-wrap items-center justify-between gap-8 opacity-40 hover:opacity-60 transition-opacity">
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white">MONOCLE</span>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white">DEZEEN</span>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white">WALLPAPER*</span>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white">CYCLIST ENG</span>
            <span className="text-[11px] font-bold tracking-[0.4em] uppercase text-white">GEAR PATROL</span>
          </div>
        </section>

        {/* FAQ & SPEC HIGHLIGHT ACCENT */}
        <section className="w-full bg-[#1F2226] px-[6%] py-24 border-b border-white/[0.02]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-[#4AD2B6] uppercase block mb-3">COMMON CURIOSITIES</span>
            <h2 className="text-4xl font-light tracking-tight text-white mb-4">Frequently Considered Details</h2>
            <div className="w-12 h-[1px] bg-[#4AD2B6] mx-auto mt-6" />
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1C1E22] border border-white/[0.03] p-6 rounded-lg">
              <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-3">Do you ship assembled bicycles globally?</h4>
              <p className="text-[11px] leading-relaxed text-white/50">
                Yes. Each Norden is shipped inside a custom heavy-grade wooden crate. It arrives 95% assembled. Simply align and tighten the handlebars and attach the front wheel using our included brass multi-tool.
              </p>
            </div>
            <div className="bg-[#1C1E22] border border-white/[0.03] p-6 rounded-lg">
              <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-3">Can I swap specific elements for standard specs?</h4>
              <p className="text-[11px] leading-relaxed text-white/50">
                Absolutely. If you want straight flat bars instead of our swept cruiser handlebars or a specific Brooks model, simply request a visual consult and our builder team will modify the CAD drawing.
              </p>
            </div>
            <div className="bg-[#1C1E22] border border-white/[0.03] p-6 rounded-lg">
              <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-3">What are the frame size recommendations?</h4>
              <p className="text-[11px] leading-relaxed text-white/50">
                We offer three sizes: Small (50-53cm) for riders 160-172cm, Medium (54-57cm) for riders 173-185cm, and Large (58-61cm) for riders 186cm+. Custom custom fit options can be designed dynamically.
              </p>
            </div>
            <div className="bg-[#1C1E22] border border-white/[0.03] p-6 rounded-lg">
              <h4 className="text-xs font-bold tracking-wider uppercase text-white mb-3">Is there an active warranty on handcrafted paint?</h4>
              <p className="text-[11px] leading-relaxed text-white/50">
                We apply a premium double-coat high-gloss powder coat, followed by clear anti-scratch armor. We provide full paint and rust protection for 5 years across all climates.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full bg-[#181A1D] px-[6%] py-16 text-white/40 border-t border-white/[0.01] z-10 text-xs">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo Brand Frame */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="relative w-6 h-6 flex flex-col justify-between p-[4px] border border-white/60">
                <span className="w-1 h-1 rounded-full bg-[#4AD2B6] self-center" />
                <span className="w-full h-[1px] bg-white" />
              </div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase">NORDEN CO.</span>
            </div>
            <p className="text-[10px] leading-relaxed pr-4 text-white/30">
              Classic Danish cycle architecture. Handcrafted steel machinery constructed for modern, clean cities. Engineered in Copenhagen.
            </p>
          </div>

          {/* Quick Collection Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">THE RANGE</h4>
            <ul className="space-y-3 text-[11px]">
              <li><a href="#" className="hover:text-white transition-colors" onClick={() => setActiveBikeIndex(0)}>01. City Cruiser</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={() => setActiveBikeIndex(1)}>02. Classic Sport</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={() => setActiveBikeIndex(2)}>03. Gravel Explorer</a></li>
              <li><a href="#specification" className="hover:text-white text-[#4AD2B6] transition-colors font-medium">Bespoke Configurator</a></li>
            </ul>
          </div>

          {/* Copenhagen Studio address */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">COPENHAGEN WORKSHOP</h4>
            <p className="text-[10px] leading-relaxed text-white/30">
              Norden Atelier Ltd.<br />
              Nørrebrogade 142, Floor 2<br />
              2200 København N, Denmark<br />
              <span className="block mt-3 font-semibold text-white/50">Atelier Hours: Mon - Fri, 09:00 - 17:00 CET</span>
            </p>
          </div>

          {/* Subscription Letterbox */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">THE NORDEN LETTERS</h4>
            <p className="text-[10px] leading-relaxed text-white/30 mb-4">
              Enter your email to receive private atelier releases and invitations to regional test rides.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); triggerNotification("Email subscribed to the Norden Atelier journal."); }} className="flex">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none rounded-l w-full focus:border-[#4AD2B6]/40" 
              />
              <button 
                type="submit" 
                className="bg-[#4AD2B6] hover:bg-[#39C3A7] text-[#1F2226] font-bold text-xs px-4 rounded-r transition-all"
              >
                JOIN
              </button>
            </form>
          </div>

        </div>

        {/* Footer legal & credentials */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/[0.04] pt-8 text-[9px] tracking-wider text-white/20">
          <p>© 2026 NORDEN DANISH DESIGN CO. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">PRIVACY TERMS</a>
            <a href="#" className="hover:text-white transition-colors">SHIPPING REGISTRY</a>
            <a href="#" className="hover:text-white transition-colors">WARRANTY DECK</a>
          </div>
        </div>

      </footer>

      {/* CUSTOM BOOKING MODAL PANEL */}
      {bookingOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-md">
          <div className="bg-[#1F2226] border border-[#4AD2B6]/40 p-8 max-w-lg w-full rounded-lg shadow-2xl relative select-none">
            
            <button 
              onClick={() => setBookingOpen(false)}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-[9px] tracking-[0.3em] text-[#4AD2B6] font-bold uppercase block mb-1">RESERVE DESIGN PORTFOLIO</span>
              <h3 className="text-2xl font-light text-white tracking-tight">Atelier Consultation Form</h3>
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                Provide your custom parameters below. A dedicated cycle technician will review materials, sizing geometry, and contact you directly.
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g., Christian Hansen"
                  className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4AD2B6] focus:bg-[#4AD2B6]/5 outline-none transition-all"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Email Coordinates *</label>
                <input 
                  type="email" 
                  required
                  placeholder="E.g., christian@copenhagen.dk"
                  className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4AD2B6] focus:bg-[#4AD2B6]/5 outline-none transition-all"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Base Model</label>
                  <select 
                    className="w-full bg-[#2A2E35] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4AD2B6] outline-none"
                    value={bookingForm.model}
                    onChange={(e) => setBookingForm({...bookingForm, model: e.target.value})}
                  >
                    <option value="City Cruiser">01. City Cruiser</option>
                    <option value="Classic Sport">02. Classic Sport</option>
                    <option value="Gravel Explorer">03. Gravel Explorer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Frame Size</label>
                  <select 
                    className="w-full bg-[#2A2E35] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4AD2B6] outline-none"
                    value={bookingForm.frameSize}
                    onChange={(e) => setBookingForm({...bookingForm, frameSize: e.target.value})}
                  >
                    <option value="Small (51cm)">Small (51cm) - (160-172cm)</option>
                    <option value="Medium (54cm)">Medium (54cm) - (173-185cm)</option>
                    <option value="Large (58cm)">Large (58cm) - (186cm+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 mb-1.5 font-semibold">Bespoke Alterations (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Specify unique rack configs, mudguards, alternative saddles, custom powder paint finishes, or delivery dates..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4AD2B6] focus:bg-[#4AD2B6]/5 outline-none transition-all resize-none placeholder:text-white/20"
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-[10px] text-white/30 tracking-wide">
                  * Safe TLS Secure Reservation Encryption.
                </span>
                <button 
                  type="submit"
                  className="bg-[#4AD2B6] hover:bg-[#39C3A7] text-[#1F2226] font-bold text-xs tracking-widest uppercase px-6 py-3 rounded shadow-lg transition-all"
                >
                  TRANSMIT PORTFOLIO
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
3