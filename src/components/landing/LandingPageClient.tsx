"use client";

import React, { useState, useEffect } from "react";
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
  CircleDollarSign,
  CreditCard,
  Handshake,
  Plus,
  Quote,
  Search,
  TrendingDown,
  User,
  UserPlus,
  Wallet,
} from "lucide-react";

import type { FAQItem, PricingPlan } from "@/types/employer/billing";
import { LandingSkillsShowcase } from "@/components/landing/LandingSkillsShowcase";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { useRouter } from "next/navigation";
import { CitationBlock } from "@/components/seo";
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
    question: "How does pricing work for employers?",
    answer:
      "We offer 4 simple subscription plans (Discovery, Starter, Growth, and Scale). Employers pay a flat monthly rate to post jobs and message talent with zero placement fees, commissions, or salary markups.",
  },
  {
    question: "Is Replaceme free for job seekers?",
    answer:
      "Yes! Replaceme is 100% free for job seekers. You can build your profile, apply for jobs, and connect with employers without ever paying a fee.",
  },
  {
    question: "Can anyone view worker profiles on Replaceme?",
    answer:
      "No. Worker profiles are private to protect candidate privacy. Only logged-in employers with an active subscription can view full profiles and resumes.",
  },
  {
    question: "How is Replaceme different from a recruitment agency?",
    answer:
      "Replaceme is a direct-hire marketplace. You connect and hire remote talent directly on your own terms with no middlemen and no percentage cut taken from worker pay.",
  },
  {
    question: "Can employers change or cancel plans anytime?",
    answer:
      "Yes. You can upgrade, downgrade, or cancel your subscription plan at any time directly from your employer dashboard.",
  },
];

export function LandingPageClient({
  pricingPlans,
}: LandingPageClientProps) {
  const router = useRouter();
  const faqs = LANDING_FAQ_FALLBACK;

  // State for FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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


  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9]">
        {/* Decorative Glowing Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full bg-emerald-100/40 blur-3xl animate-float-slow-1 pointer-events-none z-0" />
        <div className="absolute top-[40%] right-[-10%] w-[min(600px,85vw)] h-[min(600px,85vw)] rounded-full bg-indigo-100/30 blur-3xl animate-float-slow-2 pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[30%] w-[min(400px,75vw)] h-[min(400px,75vw)] rounded-full bg-teal-100/25 blur-3xl animate-float-slow-3 pointer-events-none z-0" />

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 w-full min-w-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 w-full min-w-0">
            <div className="w-full min-w-0 lg:w-[58%] lg:max-w-[58%] max-w-3xl lg:max-w-4xl space-y-6 sm:space-y-8 pr-0 lg:pr-8 reveal-item">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-8xl text-slate-900 leading-[1.05] font-extrabold tracking-tight">
                Connect Directly <br />
                with <span className="text-[#22c55e]">Filipino</span> <br />
                <span className="text-[#22c55e]">Remote Talent</span>
              </h1>
              <p className="font-body-base text-slate-600 max-w-2xl text-base md:text-lg lg:text-xl leading-relaxed mt-6 lg:mt-8">
                Hire skilled remote professionals in the Philippines or land your next remote role. Pay zero agency fees or salary markups. Employers pay a flat subscription, and job seekers keep 100% of their pay.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-5 pt-2 sm:pt-4 w-full sm:w-auto">
                <Link href="/signup/employer" className="w-full sm:w-auto bg-[#22c55e] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 text-base sm:text-lg">
                  <span>Hire Talent Now</span>
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                </Link>
                <Link href="/signup/worker" className="w-full sm:w-auto bg-white text-[#22c55e] border border-slate-200 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-extrabold hover:bg-emerald-50/30 hover:border-[#22c55e] hover:-translate-y-0.5 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 text-base sm:text-lg">
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
                    className={`object-cover transition-opacity duration-500 ease-in ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    priority
                    sizes="500px"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
                {/* Floating Card 1 */}
                <div className="absolute -left-12 top-20 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-[#22c55e] shrink-0">
                    <BadgeCheck className="h-6 w-6 shrink-0" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Verified Profiles</p>
                    <p className="text-xs text-slate-400">Skilled &amp; ready to work</p>
                  </div>
                </div>
                {/* Floating Card 2 */}
                <div className="absolute -right-8 bottom-24 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50">
                  <div className="w-12 h-12 bg-emerald-50 text-[#22c55e] rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    $
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Direct Hiring</p>
                    <p className="text-xs text-slate-400">0% salary markup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Employers Choose Replaceme */}
      <section className={`${LANDING_SECTION} bg-white`}>
        <div className={LANDING_SECTION_GRID} aria-hidden />
        <div className={`${LANDING_AMBIENT_GLOW} top-1/2 left-[-15%] bg-emerald-50/60`} aria-hidden />

        <div className={`${LANDING_INNER} relative z-10`}>
          {/* AEO: Question-format H2 targets "why use Replaceme" voice & featured-snippet queries */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16 reveal-item">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 sm:mb-4 font-bold tracking-tight text-balance">Why Do Employers Choose Replaceme Over Traditional Agencies?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-body-base text-base sm:text-lg leading-relaxed">Hire directly and save thousands. Pay one low monthly subscription instead of heavy agency markups or placement fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 animate-fade-in relative z-10">
            <div className="bg-[#f8fafc] rounded-3xl p-5 sm:p-8 md:p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "100ms" }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 sm:mb-8 border border-slate-100">
                <CircleDollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-[#22c55e]" aria-hidden />
              </div>
              <h3 className="font-body-bold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-800 font-bold">0% Salary Cut</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">Your subscription covers platform access only. Your hires keep 100% of their salary, so you never pay payroll commissions.</p>
            </div>
            <div className="bg-[#f8fafc] rounded-3xl p-5 sm:p-8 md:p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "250ms" }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 sm:mb-8 border border-slate-100">
                <Handshake className="h-7 w-7 sm:h-8 sm:w-8 text-[#22c55e]" aria-hidden />
              </div>
              <h3 className="font-body-bold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-800 font-bold">Built-In Hiring Flow</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">Manage job posts, applicant pipelines, and direct messages in one clear employer dashboard.</p>
            </div>
            <div className="bg-[#f8fafc] rounded-3xl p-5 sm:p-8 md:p-10 text-center border border-slate-100 card-premium-hover reveal-item" style={{ transitionDelay: "400ms" }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 sm:mb-8 border border-slate-100">
                <TrendingDown className="h-7 w-7 sm:h-8 sm:w-8 text-[#22c55e]" aria-hidden />
              </div>
              <h3 className="font-body-bold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-800 font-bold">70% Cost Savings</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">Hire experienced developers, designers, and admins at a fraction of local costs with fluent English skills.</p>
            </div>
          </div>

          {/* GEO: CitationBlock row — data-dense facts for LLM citation extraction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch mt-10 sm:mt-14 reveal-item" style={{ transitionDelay: "200ms" }}>
            <CitationBlock
              label="Salary Protection"
              headline="Workers receive 100% of their agreed salary"
              body="Replaceme never deducts commissions or markups from worker earnings. Employers pay workers directly on agreed terms."
              stat="0%"
              statLabel="salary commission"
            />
            <CitationBlock
              label="Transparent Pricing"
              headline="Flat monthly subscription with zero placement fees"
              body="Four simple plans (Discovery, Starter, Growth, Scale) give you predictable monthly costs with zero hidden charges."
              stat="4"
              statLabel="flat plan options"
            />
            <CitationBlock
              label="For Job Seekers"
              headline="Joining and applying is always 100% free"
              body="Filipino job seekers can build a profile, browse active listings, and apply to global companies at zero cost."
              stat="Free"
              statLabel="for all job seekers"
            />
          </div>
        </div>
      </section>

      {/* For Job Seekers */}
      <section className={`${LANDING_SECTION} bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" aria-hidden />
        <div className={`${LANDING_AMBIENT_GLOW} bottom-[-10%] right-[-10%] bg-emerald-100/40`} aria-hidden />

        <div className={`${LANDING_INNER} relative z-10`}>
          <Element name="find-work" id="find-work" className="h-0 w-0" aria-hidden />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 reveal-item">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-label-mono text-[10px] uppercase tracking-widest">For Job Seekers</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-tight font-bold tracking-tight">Land Your Dream Remote Job with <span className="text-[#22c55e]">Global Companies</span></h2>
              <p className="text-slate-600 font-body-base text-base sm:text-lg leading-relaxed">Build a long-term remote career with top global employers — with zero worker fees and no bidding on cheap gigs.</p>
              <div className="pt-2">
                <Link href="/signup/worker" className="w-full sm:w-auto bg-[#22c55e] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-body-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] flex items-center gap-2 text-base justify-center">
                  <span>Create Your Free Profile</span>
                  <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "100ms" }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shrink-0 text-[#22c55e]">
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden />
                  </div>
                  <h3 className="font-body-bold text-base sm:text-lg mb-2 text-slate-800 font-bold">Get Paid Directly</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Agree on pay rates directly with your employer. Receive 100% of your salary with zero platform cuts.</p>
                </div>
                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-slate-100 hover:border-emerald-500/30 transition-all duration-300 group reveal-item" style={{ transitionDelay: "200ms" }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shrink-0 text-[#22c55e]">
                    <Wallet className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden />
                  </div>
                  <h3 className="font-body-bold text-base sm:text-lg mb-2 text-slate-800 font-bold">Always 100% Free</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Build your profile, apply for roles, and chat with employers without spending a dime.</p>
                </div>
              </div>

              <div className="md:pt-12">
                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 shadow-md border-2 border-emerald-500/20 group reveal-item hover:shadow-lg transition-all duration-300" style={{ transitionDelay: "300ms" }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#22c55e] text-white rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden />
                  </div>
                  <h3 className="font-body-bold text-base sm:text-lg mb-2 text-slate-800 font-bold">Full-Time &amp; Long-Term Roles</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">Discover full-time jobs and long-term roles in engineering, design, marketing, and admin operations.</p>
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
          {/* AEO: Question-format H2 targets "how does X work" voice-search and featured-snippet queries */}
          <div className="text-center mb-10 sm:mb-14 md:mb-20 reveal-item">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 sm:mb-4 font-bold tracking-tight text-balance">How Does Remote Hiring Work on Replaceme?</h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">Post a job, review applicants in your pipeline, message talent directly, and hire with zero salary markups.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 relative z-10">
            {/* Employer Flow */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 md:p-10 reveal-item" style={{ transitionDelay: "100ms" }}>
              <h3 className="text-lg sm:text-xl md:text-2xl text-[#0a4a29] font-bold mb-6 sm:mb-10 flex items-center gap-3">
                <Building2 className="h-6 w-6 text-[#22c55e] shrink-0" aria-hidden /> For Employers
              </h3>
              <div className="space-y-8 sm:space-y-12 relative">
                {/* Vertical Connection Line */}
                <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">1</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Publish a Remote Job</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Define required skills, pay, and schedule. Free posts are reviewed in 2 days; paid plans post instantly.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">2</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Review Candidates</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">See applicants in your pipeline. Paid plans unlock full candidate profiles, contact info, and resume downloads.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">3</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Message &amp; Interview</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Chat directly with candidates on paid plans to set up interviews, evaluate fit, and discuss role expectations.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">4</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Hire &amp; Pay Directly</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Send job offers and start working together. Pay your talent directly with zero salary markups or recruitment fees.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Flow */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 md:p-10 reveal-item" style={{ transitionDelay: "300ms" }}>
              <h3 className="text-lg sm:text-xl md:text-2xl text-emerald-800 font-bold mb-6 sm:mb-10 flex items-center gap-3">
                <User className="h-6 w-6 text-[#22c55e] shrink-0" aria-hidden /> For Job Seekers
              </h3>
              <div className="space-y-8 sm:space-y-12 relative">
                {/* Vertical Connection Line */}
                <div className="absolute left-[15px] sm:left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 z-0" />

                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">1</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Build Your Profile</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Add your skills, work experience, portfolio links, and expected pay rates.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">2</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Apply to Remote Roles</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Browse active job listings from global companies and submit your application for free.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">3</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Interview &amp; Chat</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">When employers unlock your application, chat directly in the platform to discuss job details.</p>
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 items-start relative z-10">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-sm sm:text-lg font-bold shrink-0 shadow-sm">4</div>
                  <div>
                    <h4 className="font-body-bold text-base sm:text-lg mb-1 text-slate-800 font-bold">Get Hired &amp; Paid</h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Accept job offers and receive 100% of your agreed salary with zero worker fees.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingSkillsShowcase />


      {/* Voices of Success */}
      <section className={`${LANDING_SECTION} bg-white`}>
        <div className={LANDING_SECTION_GRID} aria-hidden />
        <div className={`${LANDING_AMBIENT_GLOW} top-1/2 left-[10%] bg-emerald-50/50`} aria-hidden />

        <div className={`${LANDING_INNER} relative z-10`}>
          <div className="text-center mb-10 sm:mb-14 md:mb-16 reveal-item">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 sm:mb-4 font-bold tracking-tight">Voices of <span className="text-[#22c55e]">Success</span></h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-body-base text-base sm:text-lg leading-relaxed">See how growing companies build great remote teams on Replaceme.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Large Featured Testimonial */}
            <div className="lg:col-span-7 reveal-item">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 md:p-12 lg:p-14 shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <Quote className="absolute -top-4 -right-4 h-40 w-40 text-emerald-100/30 rotate-12 select-none pointer-events-none" aria-hidden />
                <div className="relative z-10">
                  <p className="text-slate-700 font-display-md text-lg sm:text-xl md:text-2xl lg:text-3xl italic leading-snug mb-6 sm:mb-10 lg:mb-12">
                    &quot;Finding reliable React developers used to take us months. With Replaceme, we hired two incredible senior engineers in a week. The quality of talent is unmatched.&quot;
                  </p>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-800">Sarah Jenkins</h4>
                    <p className="text-[#22c55e] font-body-bold uppercase tracking-widest text-xs mt-1">CTO, TechFlow Inc.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Column Testimonials */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              {/* Card 2 */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group reveal-item" style={{ transitionDelay: "150ms" }}>
                <p className="text-slate-600 font-body-base text-sm sm:text-base italic mb-6 sm:mb-8 leading-relaxed">
                  &quot;Our customer support and operational tasks are now handled by an amazing team in the Philippines. The value and dedication they bring is incredible.&quot;
                </p>
                <div>
                  <h4 className="font-body-bold text-slate-800 font-bold text-sm">Michael Chen</h4>
                  <p className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Founder, Elevate Commerce</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 group reveal-item" style={{ transitionDelay: "300ms" }}>
                <p className="text-slate-600 font-body-base text-sm sm:text-base italic mb-6 sm:mb-8 leading-relaxed">
                  &quot;We completely streamlined our design operations by hiring a full-time UI/UX designer. High-fidelity output at a fraction of local agency costs.&quot;
                </p>
                <div>
                  <h4 className="font-body-bold text-slate-800 font-bold text-sm">David Miller</h4>
                  <p className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">Creative Director, ScaleUp</p>
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-3 sm:mb-4 font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-slate-300 mb-6 font-body-base text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Job seekers join 100% free. Employers can start on our free Discovery plan and upgrade anytime to unlock direct messaging and full candidate profiles.
            </p>
          </div>

          <div className="text-left text-slate-900 mt-6 sm:mt-8">
            <PricingCards
              plans={pricingPlans}
              onSelectPlan={() => router.push("/signup/employer")}
            />
          </div>
          <Link
            href="/pricing"
            className="inline-flex mt-6 sm:mt-8 items-center justify-center gap-2 bg-[#22c55e] text-white w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-extrabold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all duration-300 text-base sm:text-lg reveal-item min-h-[48px]"
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
          {/* AEO: Question-format H2 + direct answer para targets zero-click FAQ featured snippets */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16 reveal-item">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3 sm:mb-4 font-bold tracking-tight text-balance">What Do Employers and Job Seekers Ask About Replaceme?</h2>
            <p className="text-slate-600 font-body-base text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">Common questions about subscription plans, hiring flows, candidate privacy, and direct payments.</p>
          </div>

          <div className="space-y-4 reveal-item">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`group bg-[#f8fafc] rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${isOpen
                    ? "border-emerald-500/30 shadow-md"
                    : "border-slate-100 hover:border-emerald-500/25"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-1.5 text-slate-800 text-left focus:outline-none"
                  >
                    <h3 className="text-base sm:text-lg font-bold">
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
                      <p className="leading-relaxed text-slate-600 font-body-base text-sm sm:text-base pr-4 sm:pr-8">
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
