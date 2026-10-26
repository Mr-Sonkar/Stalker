import React from "react";
import { ShieldCheck, ExternalLink, Calendar, MapPin, Search } from "lucide-react";

export const metadata = {
  title: "Data Broker Opt-Out Guide - Privacy Scan",
  description: "Step-by-step instructions for removing your personal information from major data brokers.",
};

const BROKERS = [
  {
    name: "Whitepages",
    description: "One of the oldest and largest directories for contact info, background checks, and public records.",
    findListing: "Search your name and city/state on whitepages.com. Copy the URL of your profile.",
    procedure: "Paste your profile URL into the opt-out page, verify your identity via phone call or text message, and confirm.",
    url: "https://www.whitepages.com/suppression-requests",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "Spokeo",
    description: "Aggregates social media profiles, public records, and demographic data.",
    findListing: "Search your name on spokeo.com. Right-click the 'See Results' or profile link and copy the URL.",
    procedure: "Enter the profile URL and your email address on the opt-out page. Click the verification link sent to your email.",
    url: "https://www.spokeo.com/optout",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "BeenVerified",
    description: "Provides background checks, contact information, and criminal records.",
    findListing: "Use their dedicated opt-out search page to find your record.",
    procedure: "Search for yourself on their opt-out page. Select your record, enter your email, and click the confirmation link sent to your inbox.",
    url: "https://www.beenverified.com/app/optout/search",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "Intelius",
    description: "Background checks and reverse phone lookups.",
    findListing: "Use the privacy center to search for your public records.",
    procedure: "Intelius shares an opt-out system with PeopleConnect. You will need to verify an email address and then suppress your matching records.",
    url: "https://suppression.peopleconnect.us/login",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "PeopleFinders",
    description: "Public records search including phone numbers, addresses, and relatives.",
    findListing: "Search for your name and city on peoplefinders.com. Copy the URL of your specific profile.",
    procedure: "Paste the URL on their opt-out page, enter a verification email, complete the CAPTCHA, and click the link in your email.",
    url: "https://www.peoplefinders.com/opt-out",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "FastPeopleSearch",
    description: "Free public records directory offering extremely detailed contact information.",
    findListing: "Search your name on their site. Ensure it is the exact record matching your current or past addresses.",
    procedure: "Enter your email, agree to the terms, perform the search again within the opt-out flow, and click 'Remove My Record'. Finally, click the link in your email.",
    url: "https://www.fastpeoplesearch.com/removal",
    lastVerified: "Oct 15, 2023"
  },
  {
    name: "TruePeopleSearch",
    description: "Free directory with phone numbers, addresses, and family members.",
    findListing: "Look up your name on the site to verify your record exists.",
    procedure: "Enter your email, check the agreement box, complete the CAPTCHA. Then search for your record and click 'Remove This Record'. Click the link sent to your email.",
    url: "https://www.truepeoplesearch.com/removal",
    lastVerified: "Oct 15, 2023"
  }
];

export default function OptOutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center p-6 pt-24 sm:p-12 sm:pt-32">
      <div className="w-full max-w-4xl space-y-4 text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Data Broker <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Opt-Out Guide</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Take back control of your privacy. Follow these official, step-by-step instructions to remove your personal information from major data brokers.
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        <div className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-6 sm:p-8 backdrop-blur-xl mb-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-indigo-400 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white">Before you begin</h2>
              <p className="mt-2 text-sm text-slate-300">
                Data brokers use automated systems to aggregate public records. 
                When opting out, <strong className="text-white">never pay a fee</strong>—removal is legally required to be free in many jurisdictions. 
                We highly recommend using a burner or secondary email address for all opt-out confirmation links to prevent giving brokers a new verified email.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {BROKERS.map((broker) => (
            <div key={broker.name} className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl backdrop-blur-xl transition-all hover:border-slate-700">
              <div className="border-b border-slate-800/80 bg-slate-950/50 p-6 sm:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{broker.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{broker.description}</p>
                  </div>
                  <a
                    href={broker.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shrink-0"
                  >
                    <span>Official Opt-Out</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">How to find your listing</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{broker.findListing}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Opt-out procedure</h4>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{broker.procedure}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-500">Last verified: {broker.lastVerified}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
