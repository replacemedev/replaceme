"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Talent Carousel data
const talentList = [
  {
    name: "Juan Dela Cruz",
    role: "Senior React Developer",
    desc: "Expert in building scalable React applications and design systems. 7+ years of remote work experience with US startups.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9dEJMmbkyigLnZOOhCjBiUAKd9myiNtavRiIRXXgwDIjU_Iv2aWS6wfqL8yu3m8drFweFnSoKNyyqRipuDA9uiRFEkiAyKdrNoX1t-J5Al4-Nuc7NKCe2qfHZV-HoAxoTUZSft3JQlcO-t892DwQ7eHi0WVPQDJIwWEuLXCzJnGOMdBD_ZLxBmxbSZOgcwog-Mky7Y_g3Z8uuZiPwNa1Y9bZ9lurFDhKmZhkbBNuRjmlF2rx5mIuPQLw9UqulFHXi7Fr-8Ujbkww",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Ana Reyes",
    role: "Content Strategist",
    desc: "Creative content strategist with a knack for SEO-driven storytelling and engaging B2B campaigns.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpuEKCf_iU4qoZqdbEvRE-Y4U6C2z8Z5CvVq2rEmNUBcbaU4NT_rYLhLKRxysEENZepMf5ZUId7ZUbVGuaMsGBoKlwSuY1TbTf1CgRLvwrJu6aFDZV1AWsk6vg3O1cvoK6I6U1GnqQi2uk6cRx6KpkKnqqXthV0UxbgFrwbTP6fUhshKjFpaBTb8Q_5_ZyJNfNeczyQc7nlU3Zl1w1eSwNWalh6MTlB8Cpf5JSaOHb5FHlUAlHa1rMjlWeMHBFItBXyoXY2G0dwS0",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Mark Villar",
    role: "Project Manager",
    desc: "Certified Agile PM adept at keeping distributed teams aligned and delivering complex SaaS projects on time.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt_dpEk0QG9a3VhXSbLOalAHZOX8-PvKSM5fereuX3tzveP2XLQI1aLwWpWmCqElU7g8IurqX8VU55It9Nt0U5i4KTqJ6rI9mtPHD3vhdsRmy3fS9t9pyWncHkOTe-ONd13Mnosj9klZG5QHUxIokpPLoqc9Non4YpPoRqfJAODPPD8dDSPOLLyoJRi2Gx_Z-3qFG3Vdn_009kJRQsCwD9eVQ6fG-F2FAQeAK_07niaV-yYzikqftf96-ZkPCPjPQ_zH4v5dfQ8EU",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Maria Santos",
    role: "SEO Specialist",
    desc: "Data-driven SEO expert focused on organic growth, technical audits, and high-converting keyword strategies.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7wPFda53LrOZHKSSv-M5_FSR-Je4c2YThz5kYWbxMRAzumlT6jEZxsU-_xzBOrEtd7AThAayvxfgdbHSlq0M2JeLSSu_ZU5mBS1IBxjKTFY9A4lXa2onxm_L1N0mSBUVuoFeNSK2pibx5mORroXUT4FSqYlxLEGyPrI7ihUohTmjWcuinP1sFE9EsEflSrLQEPRHjbZ8_D09Obpq1rXBNRmn01Udy0iNYMObs6xUnQ6oqZjIPhDgg_I66Oh3cTzvZjirdnOKBTPg",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Paolo Garcia",
    role: "Mobile App Developer",
    desc: "Proficient in React Native and Swift. Builds seamless, high-performance mobile experiences for iOS and Android.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyo-jgxdauhpDoA0XB_x0FUdU-CQCAxh34ZIlY9aoHKrB4wHjBQmzcdv7d36RnzOG7urkPLEul3hqsYYfzdaDx6rwxDXZyZwgIrNrs6DD3DDpSDAWxVO-dnZZaHnmG59gMi2RhjRJnElesJ2Ov1VeWBkfcg_wiMlg6Q6Dz8v6gD2PTcIsQa-ZrJYV9_9h8jlNyxpbacj0_ab_AbDRfl-SHQesRbQFNHe1D58uXBIVr1_-cu02gS7fGa_iR7KNydU91wOEq8YKqi8A",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Camille Mendoza",
    role: "Data Analyst",
    desc: "Translates complex datasets into actionable insights using SQL, Python, and Tableau for e-commerce brands.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTqJUXPVAOWusaqooYSwuyeNaQfY98Tvdb_ovCR2Lkz8SvXtveG1uRapUgFxDqhcpFzfrbM67VJz_NXMwxWhVtNs5POYh6H-BZt7XEDJIoMTFTc_CUhOOG1dF5zPrZl-DFG4Fa2qFQHeRXmUrHFTeCl4jDTvURiVDV441I7Judh_9tclYCXTCALOMB4D2aHIDQPRiKMr_YD66kQlsmBm3Jx2QsHt1vC3VDxBSyiQq4GF82xHEvm8VR3AAZL_9GOyIQFH3PA-Blhes",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Jose Bautista",
    role: "Graphic Designer",
    desc: "Versatile designer skilled in branding, marketing collateral, and UI design. Expert in Adobe Creative Suite.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSYvZ5rL6zXF9z-d11mC0o7V-19__FE7_c29mZo4EFDNxNJefTz9gmBhbW4hARZEJ0AgS3QRGe4GY1jm0BTtRvI990M68CeLlLfFKhK_PwMlfdKp93XCFbpymkoPrLpDlvOn3LHvS_ukA0q5cyNkBJeHBunRW9T50VSfxII0Y2GfD56oz48H2uFCRfB2f5RC0KUvN-qjiOl6Dd2KU0SDMWY_QDJTp2JwV9NHzAeS8ktkRS0yI6sj6NNs1YSoz3xYqdNEPDd3yoHo4",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Isabella Reyes",
    role: "Customer Success Lead",
    desc: "Dedicated to reducing churn and driving customer satisfaction. Experienced in Zendesk and Intercom management.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpuEKCf_iU4qoZqdbEvRE-Y4U6C2z8Z5CvVq2rEmNUBcbaU4NT_rYLhLKRxysEENZepMf5ZUId7ZUbVGuaMsGBoKlwSuY1TbTf1CgRLvwrJu6aFDZV1AWsk6vg3O1cvoK6I6U1GnqQi2uk6cRx6KpkKnqqXthV0UxbgFrwbTP6fUhshKjFpaBTb8Q_5_ZyJNfNeczyQc7nlU3Zl1w1eSwNWalh6MTlB8Cpf5JSaOHb5FHlUAlHa1rMjlWeMHBFItBXyoXY2G0dwS0",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Miguel Ocampo",
    role: "DevOps Engineer",
    desc: "Streamlines CI/CD pipelines and manages cloud infrastructure on AWS and Azure. Kubernetes certified.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAt_dpEk0QG9a3VhXSbLOalAHZOX8-PvKSM5fereuX3tzveP2XLQI1aLwWpWmCqElU7g8IurqX8VU55It9Nt0U5i4KTqJ6rI9mtPHD3vhdsRmy3fS9t9pyWncHkOTe-ONd13Mnosj9klZG5QHUxIokpPLoqc9Non4YpPoRqfJAODPPD8dDSPOLLyoJRi2Gx_Z-3qFG3Vdn_009kJRQsCwD9eVQ6fG-F2FAQeAK_07niaV-yYzikqftf96-ZkPCPjPQ_zH4v5dfQ8EU",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Sofia Villanueva",
    role: "Digital Marketer",
    desc: "Growth marketer specializing in paid social and search campaigns. Manages $50k+ monthly ad spends efficiently.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTqJUXPVAOWusaqooYSwuyeNaQfY98Tvdb_ovCR2Lkz8SvXtveG1uRapUgFxDqhcpFzfrbM67VJz_NXMwxWhVtNs5POYh6H-BZt7XEDJIoMTFTc_CUhOOG1dF5zPrZl-DFG4Fa2qFQHeRXmUrHFTeCl4jDTvURiVDV441I7Judh_9tclYCXTCALOMB4D2aHIDQPRiKMr_YD66kQlsmBm3Jx2QsHt1vC3VDxBSyiQq4GF82xHEvm8VR3AAZL_9GOyIQFH3PA-Blhes",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  }
];

// FAQs data
const faqs = [
  {
    question: "What is Replace Me?",
    answer: "Replace Me is a direct hiring platform that connects businesses with Filipino virtual assistants and remote workers. Employers can hire and manage talent directly, with no agency fees, salary markups, or ongoing commissions."
  },
  {
    question: "Can I unsubscribe after hiring?",
    answer: "Yes, you can unsubscribe at anytime! There are no contracts, so once you’ve hired someone, you can cancel your subscription and restart it later if you need to find another worker."
  },
  {
    question: "Do I pay monthly fees for my worker?",
    answer: "Nope! Since we’re not an agency, you hire and pay your remote worker directly (with no on-going fees!). Even if you unsubscribe, you still have complete control and management over your hire."
  },
  {
    question: "What is the refund policy?",
    answer: "We have a 30-day money back guarantee! So if for any reason you are not 100% satisfied or don’t find the perfect match within 30 days, we will give you a full refund."
  },
  {
    question: "What can I do with a FREE account?",
    answer: "You can post job listings and review applications to get an idea of potential candidates. However, you won’t be able to message and hire them until you subscribe to a paid account."
  }
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States for Carousel
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

  // State for FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // State to track carousel item width dynamically (prevents accessing refs during render)
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (trackRef.current && trackRef.current.children.length > 0) {
        setItemWidth(trackRef.current.children[0].getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Intersection Observer for scroll reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    const revealItems = document.querySelectorAll(".reveal-item");
    revealItems.forEach((item) => observer.observe(item));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Carousel responsive calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerSlide(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carousel actions
  const maxCarouselIndex = talentList.length - itemsPerSlide;

  const nextSlide = () => {
    if (carouselIndex < maxCarouselIndex) {
      setCarouselIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (carouselIndex > 0) {
      setCarouselIndex((prev) => prev - 1);
    }
  };

  // Carousel translate calculation using safe state value
  const getCarouselTranslate = () => {
    const gap = 32; // 2rem = 32px
    return carouselIndex * (itemWidth + gap);
  };

  return (
    <>
      {/* Header: TopNavBar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-100 ${isScrolled ? "py-2.5 shadow-sm" : "py-4"
          }`}
      >
        <div className="flex justify-between items-center px-margin-desktop w-full">
          {/* Brand */}
          <a
            className="flex items-center gap-3 transition-transform duration-200 hover:opacity-90 scale-102"
            href="#"
          >
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgbZNrJ_I1U7tfeSy8YkH35JJfvtqezZW9pQe2LjKUZfDo7UsctaBNHF_FFCs0pq77ubGBzwNaT7qCYhDJkDaD0qvzDbhIjdTKppteix5d80HcmtrJADVh0fquMQFXaQZpHonlYPP-F6yUCc4iuzRD_pywAJm9F_6FNa8h8zjyn7w8_yjZLBd3uctn5xNxDx4C3ICLHvCvjk9J4RIxkmvaLBCg7nRT-Wq0yhWnG-A6RytUFEnXqYlgmYNoh17B-78M7U5pQQVCNgs"
                alt="Replace Me Logo"
                fill
                className="object-cover rounded-full"
                sizes="36px"
              />
            </div>
            <span className="font-display-md text-2xl font-bold text-[#0a4a29]">
              Replace Me
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-[#475569] font-body-base font-semibold hover:text-[#22c55e] transition-colors duration-200"
              href="#top-talent"
            >
              Find Talent
            </a>
            <a
              className="text-[#475569] font-body-base font-semibold hover:text-[#22c55e] transition-colors duration-200"
              href="#find-work"
            >
              Find Work
            </a>
            <a
              className="text-[#475569] font-body-base font-semibold hover:text-[#22c55e] transition-colors duration-200"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              className="text-[#475569] font-body-base font-semibold hover:text-[#22c55e] transition-colors duration-200"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="text-[#475569] font-body-base font-semibold hover:text-[#22c55e] transition-colors duration-200"
              href="#faq"
            >
              FAQ
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <a
              className="text-[#475569] font-body-bold hover:text-[#22c55e] transition-colors"
              href="#login"
            >
              Sign In
            </a>
            <a
              className="bg-[#22c55e] text-white px-6 py-2.5 rounded-xl font-body-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
              href="#"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center p-2 text-on-surface hover:text-[#22c55e] focus:outline-none"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 flex flex-col p-6 gap-4 shadow-xl animate-fadeIn">
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-medium py-2 hover:text-[#22c55e]"
              href="#top-talent"
            >
              Find Talent
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-medium py-2 hover:text-[#22c55e]"
              href="#find-work"
            >
              Find Work
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-medium py-2 hover:text-[#22c55e]"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-medium py-2 hover:text-[#22c55e]"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-medium py-2 hover:text-[#22c55e]"
              href="#faq"
            >
              FAQ
            </a>
            <hr className="border-slate-100 my-2" />
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-700 font-body-bold py-2 text-center hover:text-[#22c55e]"
              href="#login"
            >
              Sign In
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#22c55e] text-white text-center py-3 rounded-xl font-body-bold"
              href="#"
            >
              Get Started
            </a>
          </div>
        )}
      </header>

      <main className="pt-[72px]">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9]">
          {/* Decorative Glowing Blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/40 blur-3xl animate-float-slow-1 pointer-events-none z-0" />
          <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100/30 blur-3xl animate-float-slow-2 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-teal-100/25 blur-3xl animate-float-slow-3 pointer-events-none z-0" />

          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

          <div className="px-margin-desktop max-w-container-max mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-10 pr-0 lg:pr-8 reveal-item">
                <h1 className="text-display-xl-mobile md:text-display-xl text-slate-900 leading-[1.15] font-extrabold tracking-tight">
                  Your Direct Bridge to <span className="text-[#22c55e]">Filipino</span>
                  <br />
                  <span className="text-[#22c55e]">Remote Talent</span>
                </h1>
                <p className="font-body-base text-slate-500 max-w-2xl text-xl leading-relaxed">
                  Connect directly with top-tier Filipino talent or find your dream remote role. Skip the agency fees and middlemen. Scale your business faster or launch your global career with world-class opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <button className="bg-[#22c55e] text-white px-8 py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-lg">
                    <span>Hire Talent Now</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                  <button className="bg-white text-[#22c55e] border border-slate-200 px-8 py-4 rounded-xl font-extrabold hover:bg-emerald-50/30 hover:border-[#22c55e] hover:-translate-y-0.5 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-lg">
                    <span>Find a Job</span>
                    <span className="material-symbols-outlined text-xl">search</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative hidden lg:block reveal-item" style={{ transitionDelay: "200ms" }}>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  {/* Main Image */}
                  <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-xl border-[8px] border-white bg-slate-50">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1tpYyLAr_beHtfseqt1zCJ4lzwUVez3L2vZ4RorW_a5Lc8NzeW8IvXd2ruJKduvkYoYbbGchSLq8umAqUB-6i-fRrzyhicoJ9G98UkFHslaem-EWRMrAQ1lFP30cLDdDZT9nx3tQ3nqn_PO7f9_BJh7Y2Plp_xyCsZSBRCtV7qoH9zrKIrE3evE2md5OOVorc_tXcA8hyxePxvQ6OnoeWXWikuLqn0GUEUJMO3SaWV_yH0dd0s3UjfHi-CRE5T0RpFviAfJTSGsw"
                      alt="Professional Filipino Remote Worker"
                      fill
                      className="object-cover"
                      priority
                      sizes="500px"
                    />
                  </div>
                  {/* Floating Card 1 */}
                  <div className="absolute -left-12 top-20 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#22c55e] shrink-0">
                      <span className="material-symbols-outlined text-2xl">verified</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Verified Talent</p>
                      <p className="text-xs text-slate-400">Top 5% of applicants</p>
                    </div>
                  </div>
                  {/* Floating Card 2 */}
                  <div className="absolute -right-8 bottom-24 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50">
                    <div className="w-12 h-12 bg-emerald-50 text-[#22c55e] rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      $
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Direct Hiring</p>
                      <p className="text-xs text-slate-400">Zero platform markups</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Employers Choose Replace Me */}
        <section className="py-24 px-margin-desktop bg-white relative overflow-hidden">
          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-50 pointer-events-none z-0" />
          <div className="absolute top-1/2 left-[-20%] w-[400px] h-[400px] rounded-full bg-emerald-50/40 blur-3xl pointer-events-none z-0" />

          <div className="max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-16 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Why Employers Choose Replace Me</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-body-base text-lg">Scale your team without the traditional agency overhead.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in relative z-10">
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "100ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <span className="material-symbols-outlined text-3xl text-[#22c55e]">money_off</span>
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">No Middleman Fees</h3>
                <p className="text-[#475569] text-base leading-relaxed">We don&apos;t take a cut of your worker&apos;s salary. You pay them directly, ensuring they get 100% of what they earn.</p>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "250ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <span className="material-symbols-outlined text-3xl text-[#22c55e]">handshake</span>
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">Direct Hiring</h3>
                <p className="text-[#475569] text-base leading-relaxed">Communicate, manage, and pay your team members directly. Build a true remote team culture.</p>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "400ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <span className="material-symbols-outlined text-3xl text-[#22c55e]">trending_down</span>
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">80% Cost Savings</h3>
                <p className="text-[#475569] text-base leading-relaxed">Hire top-tier talent for a fraction of the cost of local hires, without sacrificing quality or reliability.</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Job Seekers */}
        <section className="py-24 px-margin-desktop bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] relative overflow-hidden" id="find-work">
          {/* Subtle Grid and Blob Decorators */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none z-0" />

          <div className="max-w-container-max mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 space-y-6 reveal-item">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-label-mono text-[10px] uppercase tracking-widest">For Talent</div>
                <h2 className="text-display-lg text-slate-900 leading-tight font-bold">Elevate Your Career with <span className="text-[#22c55e]">Global Opportunities</span></h2>
                <p className="text-slate-500 font-body-base text-lg leading-relaxed">Find stable, long-term remote work with international clients who value your expertise and dedication.</p>
                <div className="pt-2">
                  <button className="bg-[#22c55e] text-white px-8 py-4 rounded-xl font-body-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center gap-2 text-base">
                    <span>Create Your Free Profile</span>
                    <span className="material-symbols-outlined text-lg">person_add</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "100ms" }}>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 shrink-0 text-[#22c55e]">
                      <span className="material-symbols-outlined text-2xl">payments</span>
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">Direct Payment</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Get paid directly by your employer. No waiting for platforms to process your hard-earned money.</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "200ms" }}>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 shrink-0 text-[#22c55e]">
                      <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">No Salary Markups</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">You keep 100% of your agreed-upon salary. We never take a percentage of your earnings.</p>
                  </div>
                </div>

                <div className="md:pt-12">
                  <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-emerald-500/20 group reveal-item hover:shadow-lg transition-all duration-300" style={{ transitionDelay: "300ms" }}>
                    <div className="w-12 h-12 bg-[#22c55e] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">work</span>
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">Stable Remote Work</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">Connect with serious employers looking for long-term team members, not just gig workers. Build a career, not just a side-hustle.</p>
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase font-label-mono">
                      <span className="material-symbols-outlined text-base">verified</span>
                      Verified Employers Only
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-margin-desktop bg-white relative overflow-hidden" id="how-it-works">
          {/* Grid dot pattern overlay */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)] opacity-50 pointer-events-none z-0" />
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-50/40 blur-3xl pointer-events-none z-0" />

          <div className="max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-20 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Outsourcing Made Simple</h2>
              <p className="text-slate-500 text-lg leading-relaxed">A streamlined process for both sides of the marketplace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              {/* Employer Flow */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-[28px] p-8 md:p-10 reveal-item" style={{ transitionDelay: "100ms" }}>
                <h3 className="text-xl md:text-2xl text-[#0a4a29] font-bold mb-10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#22c55e]">business</span> For Employers
                </h3>
                <div className="space-y-12 relative">
                  {/* Vertical Connection Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">1</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Post a Job</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Create a detailed job listing outlining your requirements and budget.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">2</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Message Applicants</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Review profiles, portfolios, and communicate directly with candidates.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">3</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Hire &amp; Pay Directly</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Make your hire and set up payment terms directly with your new team member.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Flow */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-[28px] p-8 md:p-10 reveal-item" style={{ transitionDelay: "300ms" }}>
                <h3 className="text-xl md:text-2xl text-emerald-800 font-bold mb-10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#22c55e]">person</span> For Job Seekers
                </h3>
                <div className="space-y-12 relative">
                  {/* Vertical Connection Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">1</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Sign Up (Free)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Create a comprehensive profile highlighting your skills and experience.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">2</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Apply for Jobs</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Browse listings and apply directly to roles that match your expertise.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">3</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Get Hired &amp; Paid</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Work directly with international clients and keep 100% of your earnings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Talent Preview Carousel */}
        <section className="bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc] py-24 relative overflow-hidden" id="top-talent">
          {/* Decorative Background details */}
          <div className="absolute inset-0 bg-grid-dots opacity-50 pointer-events-none z-0" />
          <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-100/25 blur-3xl pointer-events-none z-0" />

          <div className="px-margin-desktop max-w-container-max mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 reveal-item">
              <div className="max-w-2xl text-left">
                <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Immediate Value, <span className="text-[#22c55e]">Top Talent</span></h2>
                <p className="text-slate-500 font-body-base text-lg leading-relaxed">Browse a curated selection of pre-vetted professionals ready to join your team today. We handle the vetting, you handle the growth.</p>
              </div>
              <a className="group inline-flex items-center gap-2 text-[#22c55e] font-body-bold text-base hover:text-emerald-700 transition-all shrink-0" href="#">
                View All Talent <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </a>
            </div>

            <div className="carousel-container relative overflow-visible">
              {/* Carousel Buttons */}
              <button
                onClick={prevSlide}
                disabled={carouselIndex === 0}
                className="carousel-button prev material-symbols-outlined z-30"
                aria-label="Previous Slide"
              >
                chevron_left
              </button>
              <button
                onClick={nextSlide}
                disabled={carouselIndex >= maxCarouselIndex}
                className="carousel-button next material-symbols-outlined z-30"
                aria-label="Next Slide"
              >
                chevron_right
              </button>

              {/* Carousel Track Container */}
              <div className="overflow-hidden py-4 -mx-4 px-4">
                <div
                  ref={trackRef}
                  className="carousel-track"
                  style={{
                    transform: `translateX(-${getCarouselTranslate()}px)`
                  }}
                >
                  {talentList.map((talent, index) => (
                    <div key={index} className="carousel-item">
                      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                          <div className="relative w-20 h-20 shrink-0">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                              <Image
                                src={talent.image}
                                alt={talent.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          </div>
                          <span className={`bg-white px-4 py-2 rounded-full text-xs font-label-mono font-bold shadow-xs flex items-center gap-1 border ${talent.badgeClass}`}>
                            <span className="material-symbols-outlined text-sm">{talent.badgeIcon}</span>
                            {talent.badge}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{talent.name}</h3>
                        <p className="text-[#22c55e] font-body-bold tracking-wider uppercase text-xs mb-4">{talent.role}</p>
                        <p className="text-[#475569] text-sm leading-relaxed mb-8 flex-grow">{talent.desc}</p>
                        <a className="inline-flex items-center gap-2 font-body-bold text-slate-800 group/link mt-auto text-sm" href="#">
                          View Profile <span className="h-px w-6 bg-slate-300 group-hover/link:w-10 group-hover/link:bg-[#22c55e] transition-all"></span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots navigation */}
              <div className="carousel-dots">
                {Array.from({ length: maxCarouselIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`carousel-dot ${carouselIndex === i ? "active" : ""}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Voices of Success */}
        <section className="py-24 px-margin-desktop bg-white relative overflow-hidden">
          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)] opacity-40 pointer-events-none z-0" />
          <div className="absolute top-1/2 left-[10%] w-[400px] h-[400px] rounded-full bg-emerald-50/50 blur-3xl pointer-events-none z-0" />

          <div className="max-w-container-max mx-auto relative z-10">
            <div className="text-center mb-20 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Voices of <span className="text-[#22c55e]">Success</span></h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-body-base text-lg leading-relaxed">Discover how forward-thinking companies are transforming their operations with elite Filipino talent.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Large Featured Testimonial */}
              <div className="lg:col-span-7 reveal-item">
                <div className="bg-white border border-slate-100 rounded-3xl p-10 md:p-14 shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <span className="material-symbols-outlined absolute -top-4 -right-4 text-[160px] text-emerald-100/30 rotate-12 select-none pointer-events-none">format_quote</span>
                  <div className="relative z-10">
                    <p className="text-slate-700 font-display-md text-2xl md:text-3xl italic leading-snug mb-12">
                      &quot;Finding reliable React developers used to take us months. With Replace Me, we hired two incredible senior engineers in a week. The quality of talent is unmatched.&quot;
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="relative w-16 h-16 shrink-0">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                          <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTqJUXPVAOWusaqooYSwuyeNaQfY98Tvdb_ovCR2Lkz8SvXtveG1uRapUgFxDqhcpFzfrbM67VJz_NXMwxWhVtNs5POYh6H-BZt7XEDJIoMTFTc_CUhOOG1dF5zPrZl-DFG4Fa2qFQHeRXmUrHFTeCl4jDTvURiVDV441I7Judh_9tclYCXTCALOMB4D2aHIDQPRiKMr_YD66kQlsmBm3Jx2QsHt1vC3VDxBSyiQq4GF82xHEvm8VR3AAZL_9GOyIQFH3PA-Blhes"
                            alt="Sarah Jenkins"
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Sarah Jenkins</h4>
                        <p className="text-[#22c55e] font-body-bold uppercase tracking-widest text-xs mt-1">CTO, TechFlow Inc.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Column Testimonials */}
              <div className="lg:col-span-5 space-y-8">
                {/* Card 2 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group reveal-item" style={{ transitionDelay: "150ms" }}>
                  <p className="text-slate-500 font-body-base text-base italic mb-8 leading-relaxed">
                    &quot;Our customer support and operational tasks are now handled by an amazing team in the Philippines. The value and dedication they bring is incredible.&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyo-jgxdauhpDoA0XB_x0FUdU-CQCAxh34ZIlY9aoHKrB4wHjBQmzcdv7d36RnzOG7urkPLEul3hqsYYfzdaDx6rwxDXZyZwgIrNrs6DD3DDpSDAWxVO-dnZZaHnmG59gMi2RhjRJnElesJ2Ov1VeWBkfcg_wiMlg6Q6Dz8v6gD2PTcIsQa-ZrJYV9_9h8jlNyxpbacj0_ab_AbDRfl-SHQesRbQFNHe1D58uXBIVr1_-cu02gS7fGa_iR7KNydU91wOEq8YKqi8A"
                        alt="Michael Chen"
                        fill
                        className="rounded-xl object-cover border border-slate-100 shadow-xs"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="font-body-bold text-slate-800 font-bold text-sm">Michael Chen</h4>
                      <p className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Founder, Elevate Commerce</p>
                    </div>
                  </div>
                </div>
                {/* Card 3 */}
                <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group reveal-item" style={{ transitionDelay: "300ms" }}>
                  <p className="text-slate-500 font-body-base text-base italic mb-8 leading-relaxed">
                    &quot;We completely streamlined our design operations by hiring a full-time UI/UX designer. High-fidelity output at a fraction of local agency costs.&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSYvZ5rL6zXF9z-d11mC0o7V-19__FE7_c29mZo4EFDNxNJefTz9gmBhbW4hARZEJ0AgS3QRGe4GY1jm0BTtRvI990M68CeLlLfFKhK_PwMlfdKp93XCFbpymkoPrLpDlvOn3LHvS_ukA0q5cyNkBJeHBunRW9T50VSfxII0Y2GfD56oz48H2uFCRfB2f5RC0KUvN-qjiOl6Dd2KU0SDMWY_QDJTp2JwV9NHzAeS8ktkRS0yI6sj6NNs1YSoz3xYqdNEPDd3yoHo4"
                        alt="David Miller"
                        fill
                        className="rounded-xl object-cover border border-slate-100 shadow-xs"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="font-body-bold text-slate-800 font-bold text-sm">David Miller</h4>
                      <p className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Creative Director, ScaleUp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-margin-desktop bg-[#0a0f1d] text-white relative overflow-hidden" id="pricing">
          {/* Starry Dot Grid and Glowing Orbs */}
          <div className="absolute inset-0 bg-grid-white-dots opacity-15 pointer-events-none z-0" />
          <div className="absolute -top-40 -right-40 bg-emerald-500/15 w-[600px] h-[600px] rounded-full blur-[130px] animate-float-slow-2 pointer-events-none z-0" />
          <div className="absolute -bottom-40 -left-40 bg-indigo-500/15 w-[600px] h-[600px] rounded-full blur-[130px] animate-float-slow-1 pointer-events-none z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/5 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none z-0" />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="reveal-item">
              <h2 className="text-display-lg text-white mb-4 font-bold">Simple, Transparent Pricing</h2>
              <p className="text-slate-300 mb-6 font-body-base text-lg">Everything you need to hire the best remote talent.</p>
              <div className="inline-block bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 mb-12">
                <p className="text-[#22c55e] font-body-bold flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-lg">card_giftcard</span> Always 100% FREE for Job Seekers
                </p>
              </div>
            </div>

            <div className="bg-white text-slate-800 rounded-3xl p-10 md:p-14 shadow-2xl max-w-lg mx-auto relative border-4 border-emerald-500/20 text-center reveal-item hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] transition-all duration-300" style={{ transitionDelay: "150ms" }}>
              {/* Featured Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white text-xs font-bold tracking-wider px-6 py-2 rounded-full uppercase shadow-lg border-2 border-white">
                Most Popular
              </div>
              <h3 className="text-2xl text-slate-800 mb-4 mt-2 font-bold">Standard Plan</h3>
              <div className="flex items-baseline gap-2 mb-8 justify-center">
                <span className="text-6xl font-display-xl font-extrabold text-slate-900">$30</span>
                <span className="text-slate-400 font-body-base text-lg">/mo</span>
              </div>
              <p className="text-slate-500 mb-10 text-base border-b border-slate-100 pb-8">Access to our entire database of vetted professionals to scale your team.</p>
              <ul className="space-y-6 mb-10 flex flex-col items-center">
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#22c55e] text-2xl font-bold">check_circle</span>
                  <span className="text-slate-700 font-body-base text-base font-semibold">Post Unlimited Jobs</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#22c55e] text-2xl font-bold">check_circle</span>
                  <span className="text-slate-700 font-body-base text-base font-semibold">Message Applicants</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#22c55e] text-2xl font-bold">check_circle</span>
                  <span className="text-slate-700 font-body-base text-base font-semibold">Cancel Anytime</span>
                </li>
              </ul>
              <button className="bg-[#22c55e] text-white w-full py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-300 shadow-[0_12px_24px_-6px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-lg">
                <span>Hire Talent Now</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-margin-desktop bg-white relative overflow-hidden" id="faq">
          {/* Subtle dot pattern and glow */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)] opacity-40 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-50/40 blur-3xl pointer-events-none z-0" />

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-16 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Frequently Asked Questions</h2>
              <p className="text-slate-500 font-body-base text-lg">Everything you need to know about how Replace Me works.</p>
            </div>

            <div className="space-y-4 reveal-item">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`group bg-[#f8fafc] rounded-2xl border p-6 transition-all duration-300 ${isOpen
                        ? "border-emerald-500/30 shadow-md"
                        : "border-slate-100 hover:border-emerald-500/25"
                      }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-1.5 text-slate-800 text-left focus:outline-none"
                    >
                      <h3 className="text-lg font-bold">
                        {faq.question}
                      </h3>
                      <span className="relative w-6 h-6 shrink-0 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-100">
                        <span className={`material-symbols-outlined text-[#22c55e] transition duration-300 text-base font-bold ${isOpen ? "rotate-45" : ""
                          }`}>
                          add
                        </span>
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <p className="leading-relaxed text-slate-500 font-body-base text-base pr-8">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white w-full py-20 border-t border-slate-100 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30 pointer-events-none z-0" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 px-margin-desktop w-full relative z-10">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <a className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity" href="#">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgbZNrJ_I1U7tfeSy8YkH35JJfvtqezZW9pQe2LjKUZfDo7UsctaBNHF_FFCs0pq77ubGBzwNaT7qCYhDJkDaD0qvzDbhIjdTKppteix5d80HcmtrJADVh0fquMQFXaQZpHonlYPP-F6yUCc4iuzRD_pywAJm9F_6FNa8h8zjyn7w8_yjZLBd3uctn5xNxDx4C3ICLHvCvjk9J4RIxkmvaLBCg7nRT-Wq0yhWnG-A6RytUFEnXqYlgmYNoh17B-78M7U5pQQVCNgs"
                  alt="Replace Me Logo"
                  fill
                  className="object-cover rounded-full"
                  sizes="36px"
                />
              </div>
              <span className="font-display-md text-2xl font-extrabold text-slate-800">Replace Me</span>
            </a>
            <p className="text-slate-400 font-body-base text-sm mt-2 max-w-sm">
              Empowering global teams with elite Filipino remote talent. Building direct connections for long-term success.
            </p>
          </div>

          {/* Employer Links Column */}
          <div className="col-span-1 flex flex-col gap-4 text-sm">
            <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Employers</h4>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Post a Job</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Pricing</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Employer FAQs</a>
          </div>

          {/* Jobseeker Links Column */}
          <div className="col-span-1 flex flex-col gap-4 text-sm">
            <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Jobseekers</h4>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Browse Jobs</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Create Profile</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Worker FAQs</a>
          </div>

          {/* Legal & Support Column */}
          <div className="col-span-1 flex flex-col gap-4 text-sm">
            <h4 className="text-slate-800 font-body-bold font-bold text-base mb-1">Legal &amp; Support</h4>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Privacy Policy</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Terms of Service</a>
            <a className="text-slate-400 font-body-base hover:text-[#22c55e] transition-colors" href="#">Contact Us</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-slate-100 px-margin-desktop w-full flex items-center justify-between relative z-10">
          <p className="text-slate-400 font-body-base text-sm">
            © 2026 Replace Me. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
