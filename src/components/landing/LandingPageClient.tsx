"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Element, scroller } from "react-scroll";
import { GUEST_HEADER_NAV } from "@/config/publicNav";
import { PUBLIC_HEADER_SCROLL_OFFSET } from "@/lib/layout/public-shell";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Handshake,
  Plus,
  Quote,
  Search,
  Star,
  TrendingDown,
  User,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const TALENT_BADGE_ICONS: Record<string, LucideIcon> = {
  star: Star,
  verified: BadgeCheck,
  schedule: Clock,
};

// Talent Carousel data
const talentList = [
  {
    name: "Juan Dela Cruz",
    role: "Senior React Developer",
    desc: "Expert in building scalable React applications and design systems. 7+ years of remote work experience with US startups.",
    image: "/images/juan-dela-cruz.png",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Ana Reyes",
    role: "Content Strategist",
    desc: "Creative content strategist with a knack for SEO-driven storytelling and engaging B2B campaigns.",
    image: "/images/ana-reyes.png",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Mark Villar",
    role: "Project Manager",
    desc: "Certified Agile PM adept at keeping distributed teams aligned and delivering complex SaaS projects on time.",
    image: "/images/mark-villar.png",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Maria Santos",
    role: "SEO Specialist",
    desc: "Data-driven SEO expert focused on organic growth, technical audits, and high-converting keyword strategies.",
    image: "/images/maria-santos.png",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Paolo Garcia",
    role: "Mobile App Developer",
    desc: "Proficient in React Native and Swift. Builds seamless, high-performance mobile experiences for iOS and Android.",
    image: "/images/paolo-garcia.png",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Camille Mendoza",
    role: "Data Analyst",
    desc: "Translates complex datasets into actionable insights using SQL, Python, and Tableau for e-commerce brands.",
    image: "/images/camille-mendoza.png",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Jose Bautista",
    role: "Graphic Designer",
    desc: "Versatile designer skilled in branding, marketing collateral, and UI design. Expert in Adobe Creative Suite.",
    image: "/images/jose-bautista.png",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  },
  {
    name: "Isabella Reyes",
    role: "Customer Success Lead",
    desc: "Dedicated to reducing churn and driving customer satisfaction. Experienced in Zendesk and Intercom management.",
    image: "/images/ana-reyes.png",
    badge: "TOP RATED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "star"
  },
  {
    name: "Miguel Ocampo",
    role: "DevOps Engineer",
    desc: "Streamlines CI/CD pipelines and manages cloud infrastructure on AWS and Azure. Kubernetes certified.",
    image: "/images/mark-villar.png",
    badge: "AVAILABLE",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "schedule"
  },
  {
    name: "Sofia Villanueva",
    role: "Digital Marketer",
    desc: "Growth marketer specializing in paid social and search campaigns. Manages $50k+ monthly ad spends efficiently.",
    image: "/images/camille-mendoza.png",
    badge: "VETTED",
    badgeClass: "text-emerald-600 border-slate-200",
    badgeIcon: "verified"
  }
];

import type { FAQItem, PricingPlan } from "@/types/employer/billing";
import { LandingSkillsShowcase } from "@/components/landing/LandingSkillsShowcase";
import { LandingPricingBento } from "@/components/landing/LandingPricingBento";
import {
  LANDING_AMBIENT_GLOW,
  LANDING_INNER,
  LANDING_SECTION,
  LANDING_SECTION_GRID,
} from "@/lib/landing/ui-tokens";

interface LandingPageClientProps {
  pricingPlans: PricingPlan[];
  faqs: FAQItem[];
}

const LANDING_FAQ_FALLBACK: FAQItem[] = [
  {
    question: "How does the pricing work for employers?",
    answer:
      "We offer 4 transparent subscription tiers (Discovery, Starter, Growth, and Scale). You pay a predictable flat rate to access talent and post jobs, with absolutely no placement fees, commissions, or agency markups.",
  },
  {
    question: "Is the platform free for workers?",
    answer:
      "Yes, the platform is 100% free for job seekers. You can build your profile, apply to public job posts, and negotiate directly with employers without ever paying a fee.",
  },
  {
    question: "Can anyone on the internet see worker profiles?",
    answer:
      "No. To protect our talent pool, worker profiles are strictly private. They are exclusively visible to authenticated employers who have an active, verified subscription tier.",
  },
  {
    question: "How is this different from a traditional recruitment agency?",
    answer:
      "We provide a curated direct-hire marketplace, not an agency service. We give you the platform to connect and hire directly, eliminating the middlemen so you can build relationships on your own terms.",
  },
  {
    question: "Can employers change or cancel their subscription?",
    answer:
      "Yes. Employers have full control over their billing and can upgrade, downgrade, or cancel their subscription tier at any time directly from their Admin dashboard.",
  },
];

export function LandingPageClient({
  pricingPlans,
}: LandingPageClientProps) {
  const faqs = LANDING_FAQ_FALLBACK;

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
      observer.disconnect();
    };
  }, []);

  // Deep-link hash scroll (e.g. /#pricing from footer pages) via react-scroll
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!GUEST_HEADER_NAV.some((item) => item.id === hash)) return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const frame = requestAnimationFrame(() => {
      scroller.scrollTo(hash, {
        smooth: true,
        offset: -PUBLIC_HEADER_SCROLL_OFFSET,
        duration: 500,
        isDynamic: true,
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
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
    <main>
        {/* Hero Section */}
        <section className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center py-8 lg:py-12 overflow-hidden bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9]">
          {/* Decorative Glowing Blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full bg-emerald-100/40 blur-3xl animate-float-slow-1 pointer-events-none z-0" />
          <div className="absolute top-[40%] right-[-10%] w-[min(600px,85vw)] h-[min(600px,85vw)] rounded-full bg-indigo-100/30 blur-3xl animate-float-slow-2 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] left-[30%] w-[min(400px,75vw)] h-[min(400px,75vw)] rounded-full bg-teal-100/25 blur-3xl animate-float-slow-3 pointer-events-none z-0" />

          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

          <div className="px-margin-desktop max-w-container-max mx-auto relative z-10 w-full min-w-0">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 w-full min-w-0">
              <div className="w-full min-w-0 lg:w-[58%] lg:max-w-[58%] space-y-10 pr-0 lg:pr-8 reveal-item">
                <h1 className="text-display-xl-mobile md:text-display-xl text-slate-900 leading-[1.15] font-extrabold tracking-tight">
                  Your Direct Bridge to <span className="text-[#22c55e]">Filipino</span>
                  <br />
                  <span className="text-[#22c55e]">Remote Talent</span>
                </h1>
                <p className="font-body-base text-slate-500 max-w-2xl text-xl leading-relaxed">
                  Connect directly with top-tier Filipino talent or find your dream remote role. Skip the agency fees and middlemen. Scale your business faster or launch your global career with world-class opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <Link href="/signup" className="bg-[#22c55e] text-white px-8 py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-lg">
                    <span>Hire Talent Now</span>
                    <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                  </Link>
                  <Link href="/signup" className="bg-white text-[#22c55e] border border-slate-200 px-8 py-4 rounded-xl font-extrabold hover:bg-emerald-50/30 hover:border-[#22c55e] hover:-translate-y-0.5 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-lg">
                    <span>Find a Job</span>
                    <Search className="h-5 w-5 shrink-0" aria-hidden />
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-[42%] relative hidden lg:block reveal-item" style={{ transitionDelay: "200ms" }}>
                <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  {/* Main Image */}
                  <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-xl border-[8px] border-white bg-slate-50">
                    <Image
                      src="/images/hero-worker.png"
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
                      <BadgeCheck className="h-6 w-6 shrink-0" aria-hidden />
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
        <section className={`${LANDING_SECTION} bg-white`}>
          <div className={LANDING_SECTION_GRID} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} top-1/2 left-[-15%] bg-emerald-50/60`} aria-hidden />

          <div className={`${LANDING_INNER} relative z-10`}>
            <div className="text-center mb-16 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Why Employers Choose Replace Me</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-body-base text-lg">Post jobs, review applicants, and hire Filipino talent without agency markups or salary skims.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in relative z-10">
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "100ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <CircleDollarSign className="h-8 w-8 text-[#22c55e]" aria-hidden />
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">No Salary Cut</h3>
                <p className="text-[#475569] text-base leading-relaxed">Your subscription pays for platform access not a percentage of payroll. Workers receive 100% of what you agree on.</p>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "250ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <Handshake className="h-8 w-8 text-[#22c55e]" aria-hidden />
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">Built-In Hiring Flow</h3>
                <p className="text-[#475569] text-base leading-relaxed">Job posts, applicant pipelines, messaging, and offers live in one employer dashboard not spreadsheets and inbox threads.</p>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "400ms" }}>
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                  <TrendingDown className="h-8 w-8 text-[#22c55e]" aria-hidden />
                </div>
                <h3 className="font-body-bold text-xl mb-3 text-slate-800 font-bold">Huge Cost Savings</h3>
                <p className="text-[#475569] text-base leading-relaxed">Hire senior engineers, designers, and operators at a fraction of local costs with strong English and US-hours availability.</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Job Seekers */}
        <section className={`${LANDING_SECTION} bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]`}>
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} bottom-[-10%] right-[-10%] bg-emerald-100/40`} aria-hidden />

          <div className={`${LANDING_INNER} relative z-10`}>
            <Element name="find-work" id="find-work" className="h-0 w-0" aria-hidden />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5 space-y-6 reveal-item">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-label-mono text-[10px] uppercase tracking-widest">For Talent</div>
                <h2 className="text-display-lg text-slate-900 leading-tight font-bold">Elevate Your Career with <span className="text-[#22c55e]">Global Opportunities</span></h2>
                <p className="text-slate-500 font-body-base text-lg leading-relaxed">Build a real remote career with global employers not one-off gigs and endless bidding.</p>
                <div className="pt-2">
                  <Link href="/signup" className="bg-[#22c55e] text-white px-8 py-4 rounded-xl font-body-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center gap-2 text-base justify-center">
                    <span>Create Your Free Profile</span>
                    <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "100ms" }}>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 shrink-0 text-[#22c55e]">
                      <CreditCard className="h-6 w-6 shrink-0" aria-hidden />
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">Get Paid Direct</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Agree on rate and payout with your employer. We don’t hold your salary.</p>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "200ms" }}>
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 shrink-0 text-[#22c55e]">
                      <Wallet className="h-6 w-6 shrink-0" aria-hidden />
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">Zero Worker Fees</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Create a profile, apply, and connect with employers for free always.</p>
                  </div>
                </div>

                <div className="md:pt-12">
                  <div className="bg-white rounded-3xl p-8 shadow-md border-2 border-emerald-500/20 group reveal-item hover:shadow-lg transition-all duration-300" style={{ transitionDelay: "300ms" }}>
                    <div className="w-12 h-12 bg-[#22c55e] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                      <Briefcase className="h-6 w-6 shrink-0" aria-hidden />
                    </div>
                    <h3 className="font-body-bold text-lg mb-2 text-slate-800 font-bold">Long-Term Roles</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">Find full-time and long-term contracts across tech, design, marketing, and ops built for real teams.</p>
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase font-label-mono">
                      <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
                      Vetted Global Employers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className={`${LANDING_SECTION} bg-white`}>
          <div className={LANDING_SECTION_GRID} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} top-[-10%] right-[-10%] bg-emerald-50/50`} aria-hidden />

          <div className={`${LANDING_INNER} relative z-10`}>
            <Element name="how-it-works" id="how-it-works" className="h-0 w-0" aria-hidden />
            <div className="text-center mb-20 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">How Remote Hiring Works on Replace Me</h2>
              <p className="text-slate-500 text-lg leading-relaxed">From job post to signed contract no agency in the middle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              {/* Employer Flow */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-[28px] p-8 md:p-10 reveal-item" style={{ transitionDelay: "100ms" }}>
                <h3 className="text-xl md:text-2xl text-[#0a4a29] font-bold mb-10 flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-[#22c55e] shrink-0" aria-hidden /> For Employers
                </h3>
                <div className="space-y-12 relative">
                  {/* Vertical Connection Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">1</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Publish a Remote Role</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Define skills, compensation, and timezone. Discovery posts go through a 2-day quality review; paid plans go live instantly.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">2</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Review Applicants &amp; Match Signals</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">See who applied in your applicant pipeline. Discovery shows anonymous previews; upgrade for full profiles, resumes, and downloads.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">3</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Hire on Your Terms</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Select your hire, agree on schedule and rate, and work directly. Replace Me never takes a cut of wages.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">4</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Shortlist, Message &amp; Send Offers</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Move candidates through your pipeline, chat on paid plans, and send offers/contracts. You pay talent directly with zero salary markup.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Flow */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-[28px] p-8 md:p-10 reveal-item" style={{ transitionDelay: "300ms" }}>
                <h3 className="text-xl md:text-2xl text-emerald-800 font-bold mb-10 flex items-center gap-3">
                  <User className="h-6 w-6 text-[#22c55e] shrink-0" aria-hidden /> For Job Seekers
                </h3>
                <div className="space-y-12 relative">
                  {/* Vertical Connection Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">1</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Build Your Profile</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Add skills, experience, portfolio links, and availability.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">2</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Apply to Remote Roles</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Browse job posts from global employers and apply directly your application goes straight into their pipeline.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">3</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Interview &amp; Chat</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">When an employer unlocks messaging, you can coordinate interviews and role details in platform chat.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">4</div>
                    <div>
                      <h4 className="font-body-bold text-lg mb-1 text-slate-800 font-bold">Accept Offers &amp; Get Paid Direct</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Review offer details, agree on terms with your employer, and receive 100% of your pay. No platform fee on your salary.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingSkillsShowcase />

        {/* Talent Preview Carousel */}
        <section className={`${LANDING_SECTION} bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#f8fafc]`} id="top-talent">
          <div className={LANDING_SECTION_GRID} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} top-[-10%] left-[-10%] bg-emerald-100/35`} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} bottom-[-10%] right-[-10%] bg-indigo-100/30`} aria-hidden />

          <div className={`${LANDING_INNER} relative z-10`}>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 reveal-item">
              <div className="max-w-2xl text-left">
                <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Immediate Value, <span className="text-[#22c55e]">Top Talent</span></h2>
                <p className="text-slate-500 font-body-base text-lg leading-relaxed">A quick look at the kind of specialists employers hire on Replace Me, remote-ready and focused on long-term work.</p>
              </div>
              <a className="group inline-flex items-center gap-2 text-[#22c55e] font-body-bold text-base hover:text-emerald-700 transition-all shrink-0" href="#">
                View All Talent <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </div>

            <div className="carousel-container relative">
              {/* Carousel Buttons */}
              <button
                onClick={prevSlide}
                disabled={carouselIndex === 0}
                className="carousel-button prev z-30"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                onClick={nextSlide}
                disabled={carouselIndex >= maxCarouselIndex}
                className="carousel-button next z-30"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
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
                            {(() => {
                              const BadgeIcon = TALENT_BADGE_ICONS[talent.badgeIcon] ?? BadgeCheck;
                              return <BadgeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />;
                            })()}
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
        <section className={`${LANDING_SECTION} bg-white`}>
          <div className={LANDING_SECTION_GRID} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} top-1/2 left-[10%] bg-emerald-50/50`} aria-hidden />

          <div className={`${LANDING_INNER} relative z-10`}>
            <div className="text-center mb-20 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Voices of <span className="text-[#22c55e]">Success</span></h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-body-base text-lg leading-relaxed">How real teams scale with dedicated Filipino hires on Replace Me.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Large Featured Testimonial */}
              <div className="lg:col-span-7 reveal-item">
                <div className="bg-white border border-slate-100 rounded-3xl p-10 md:p-14 shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <Quote className="absolute -top-4 -right-4 h-40 w-40 text-emerald-100/30 rotate-12 select-none pointer-events-none" aria-hidden />
                  <div className="relative z-10">
                    <p className="text-slate-700 font-display-md text-2xl md:text-3xl italic leading-snug mb-12">
                      &quot;Finding reliable React developers used to take us months. With Replace Me, we hired two incredible senior engineers in a week. The quality of talent is unmatched.&quot;
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="relative w-16 h-16 shrink-0">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                          <Image
                            src="/images/sarah-jenkins.png"
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
                        src="/images/paolo-garcia.png"
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
                        src="/images/jose-bautista.png"
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
        <section className={`${LANDING_SECTION} bg-[#0a0f1d] text-white`}>
          <div className="absolute inset-0 bg-grid-white-dots opacity-15 pointer-events-none z-0" aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} -top-40 -right-40 bg-emerald-500/20 animate-float-slow-2`} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} -bottom-40 -left-40 bg-indigo-500/20 animate-float-slow-1`} aria-hidden />

          <div className={`${LANDING_INNER} max-w-7xl text-center relative z-10`}>
            <Element name="pricing" id="pricing" className="h-0 w-0" aria-hidden />
            <div className="reveal-item">
              <h2 className="text-display-lg text-white mb-4 font-bold">Simple, Transparent Pricing</h2>
              <p className="text-slate-300 mb-6 font-body-base text-lg">
                Workers join free. Employers start on Discovery, then unlock messaging, full profiles, and instant approval when ready.
              </p>
            </div>

            <LandingPricingBento plans={pricingPlans} />
            <Link
              href="/pricing"
              className="inline-flex mt-8 items-center gap-2 bg-[#22c55e] text-white px-8 py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-300 text-lg reveal-item min-h-[44px]"
              style={{ transitionDelay: "200ms" }}
            >
              Compare all plans
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`${LANDING_SECTION} bg-white`}>
          <div className={LANDING_SECTION_GRID} aria-hidden />
          <div className={`${LANDING_AMBIENT_GLOW} bottom-[-10%] left-[-10%] bg-emerald-50/45`} aria-hidden />

          <div className={`${LANDING_INNER} max-w-3xl relative z-10`}>
            <Element name="faq" id="faq" className="h-0 w-0" aria-hidden />
            <div className="text-center mb-16 reveal-item">
              <h2 className="text-display-lg text-slate-900 mb-4 font-bold">Frequently Asked Questions</h2>
              <p className="text-slate-500 font-body-base text-lg">Plans, hiring flow, and payments — answered for employers and job seekers.</p>
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
                        <Plus
                          className={`h-4 w-4 text-[#22c55e] transition duration-300 ${isOpen ? "rotate-45" : ""}`}
                          aria-hidden
                        />
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
  );
}
