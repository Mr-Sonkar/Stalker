"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  Search,
  CheckCircle2,
  Circle,
  Info,
  RotateCcw,
} from "lucide-react";
import styles from "./BrokerOptOutView.module.css";

interface Broker {
  id: string;
  name: string;
  category: "Major Aggregator" | "Background Check" | "Contact Directory";
  riskLevel: "High" | "Critical" | "Moderate";
  description: string;
  findListing: string;
  procedure: string;
  url: string;
  lastVerified: string;
}

const BROKERS: Broker[] = [
  {
    id: "whitepages",
    name: "Whitepages",
    category: "Contact Directory",
    riskLevel: "Critical",
    description: "One of the oldest and largest directories for contact info, background checks, mobile numbers, and relatives.",
    findListing: "Search your name and city/state on whitepages.com. Copy the URL of your profile record.",
    procedure: "Paste your profile URL into their suppression request page, verify your identity via automated phone call or SMS, and confirm.",
    url: "https://www.whitepages.com/suppression-requests",
    lastVerified: "Verified Active",
  },
  {
    id: "spokeo",
    name: "Spokeo",
    category: "Major Aggregator",
    riskLevel: "Critical",
    description: "Aggregates social media profiles, public records, property records, and estimated wealth demographics.",
    findListing: "Search your name on spokeo.com. Right-click your profile link and copy the link address.",
    procedure: "Enter your profile URL and a secondary email on the opt-out page. Click the confirmation link sent to your inbox.",
    url: "https://www.spokeo.com/optout",
    lastVerified: "Verified Active",
  },
  {
    id: "beenverified",
    name: "BeenVerified",
    category: "Background Check",
    riskLevel: "High",
    description: "Specializes in deep background reports, court records, historical addresses, and vehicle registrations.",
    findListing: "Navigate directly to their dedicated suppression portal search tool.",
    procedure: "Search for your record on the opt-out page, select 'Optout', enter your verification email, and click the confirmation link.",
    url: "https://www.beenverified.com/app/optout/search",
    lastVerified: "Verified Active",
  },
  {
    id: "intelius",
    name: "Intelius / PeopleConnect",
    category: "Background Check",
    riskLevel: "Critical",
    description: "Large data aggregator sharing backend record suppression with PeopleConnect, TruthFinder, and InstantCheckmate.",
    findListing: "Use the unified PeopleConnect Privacy Center to lookup your phone or name records.",
    procedure: "Authenticate your email address on the suppression portal, select matching identity records, and toggle suppression to Active.",
    url: "https://suppression.peopleconnect.us/login",
    lastVerified: "Verified Active",
  },
  {
    id: "peoplefinders",
    name: "PeopleFinders",
    category: "Contact Directory",
    riskLevel: "High",
    description: "Public records search listing phone numbers, home addresses, relatives, and criminal court filings.",
    findListing: "Locate your profile listing URL by searching your name and city on peoplefinders.com.",
    procedure: "Paste the URL on their suppression page, enter email verification, complete the CAPTCHA, and click the verification email link.",
    url: "https://www.peoplefinders.com/opt-out",
    lastVerified: "Verified Active",
  },
  {
    id: "fastpeoplesearch",
    name: "FastPeopleSearch",
    category: "Contact Directory",
    riskLevel: "High",
    description: "Free public records directory offering un-gated, instant access to mobile phone numbers and current home addresses.",
    findListing: "Search your full name on fastpeoplesearch.com and locate the specific record matching your past addresses.",
    procedure: "Agree to removal terms, re-run your search within the removal portal, click 'Remove My Record', and confirm via email.",
    url: "https://www.fastpeoplesearch.com/removal",
    lastVerified: "Verified Active",
  },
  {
    id: "truepeoplesearch",
    name: "TruePeopleSearch",
    category: "Contact Directory",
    riskLevel: "High",
    description: "Free directory with comprehensive cell phone records, past physical addresses, and family member relationships.",
    findListing: "Search your name and click through to your full record details page on truepeoplesearch.com.",
    procedure: "Visit their record removal page, enter your email, perform the search, click 'Remove This Record', and verify link in email.",
    url: "https://www.truepeoplesearch.com/removal",
    lastVerified: "Verified Active",
  },
  {
    id: "radaris",
    name: "Radaris",
    category: "Major Aggregator",
    riskLevel: "High",
    description: "Deep public aggregator crawling social networks, professional profiles, property ownership, and reviews.",
    findListing: "Search your profile on radaris.com, click your name, and copy the full page link.",
    procedure: "Click 'Control Info' on the record or visit their removal form. Verify ownership via verification code sent to SMS or email.",
    url: "https://radaris.com/control/privacy",
    lastVerified: "Verified Active",
  },
  {
    id: "nuwber",
    name: "Nuwber",
    category: "Contact Directory",
    riskLevel: "Moderate",
    description: "Online directory that indexes residential phone landlines, current and historical residences, and potential roommates.",
    findListing: "Search your name and location on nuwber.com, then copy your unique profile URL.",
    procedure: "Navigate to nuwber.com/removal/link, paste your listing link, enter your confirmation email, and confirm removal.",
    url: "https://nuwber.com/removal/link",
    lastVerified: "Verified Active",
  },
  {
    id: "lexisnexis",
    name: "LexisNexis Risk Solutions",
    category: "Major Aggregator",
    riskLevel: "Critical",
    description: "Enterprise data broker powering credit, background, insurance, and risk assessment decisions nationwide.",
    findListing: "No public index search. Suppression is filed directly with consumer advocacy compliance.",
    procedure: "Submit an Opt-Out Request under their Consumer Disclosure portal with your identifying details and state residency.",
    url: "https://optout.lexisnexis.com",
    lastVerified: "Verified Active",
  },
];

export function BrokerOptOutView() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stalker_broker_opt_outs");
      if (saved) {
        setCompletedIds(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleCompleted = (id: string) => {
    const next = completedIds.includes(id)
      ? completedIds.filter((item) => item !== id)
      : [...completedIds, id];
    setCompletedIds(next);
    try {
      localStorage.setItem("stalker_broker_opt_outs", JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const resetProgress = () => {
    if (confirm("Reset all tracked data broker removals?")) {
      setCompletedIds([]);
      try {
        localStorage.removeItem("stalker_broker_opt_outs");
      } catch {
        // Ignore storage errors
      }
    }
  };

  const filteredBrokers = useMemo(() => {
    return BROKERS.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const progressPercent = Math.round((completedIds.length / BROKERS.length) * 100);

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.badgeRow}>
          <div className={styles.statusPill}>
            <span className={styles.statusDot} />
            Data Protection Protocol
          </div>
        </div>
        <h1 className={styles.title}>
          Data Broker <span className={styles.titleAccent}>Opt-Out Dossier</span>
        </h1>
        <p className={styles.subtitle}>
          Take back ownership of your private footprint. Follow these verified procedures to purge your personal telephone numbers, residential history, and relatives from major public broker indexes.
        </p>
      </div>

      {/* Removal Progress Card */}
      <div className={styles.progressCard}>
        <div className={styles.progressTop}>
          <div>
            <div className={styles.progressLabel}>Suppression Progress</div>
            <div className={styles.progressHeading}>
              {completedIds.length} of {BROKERS.length} Brokers Suppressed
            </div>
          </div>
          <div className={styles.progressStats}>
            <span className={styles.percentDisplay}>{progressPercent}%</span>
            {completedIds.length > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className={styles.resetBtn}
                title="Reset tracked suppression"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Critical Safeguards */}
      <div className={styles.noticeBox}>
        <Info className={styles.noticeIcon} size={20} />
        <div className={styles.noticeContent}>
          <div className={styles.noticeTitle}>Critical Privacy Safeguards</div>
          <div>
            <span className={styles.highlightYellow}>1. Never pay a fee:</span> Data broker record suppression is legally mandated to be 100% free by state and federal regulations.
          </div>
          <div className={styles.noticeSubItem}>
            <span className={styles.highlightCyan}>2. Use an alias email:</span> Use an ephemeral or secondary inbox for verification links so brokers cannot link your primary active inbox to historical physical records.
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={16} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search data broker or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filterPills}>
          {["All", "Major Aggregator", "Contact Directory", "Background Check"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterBtnActive : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Broker List */}
      <div className={styles.brokerGrid}>
        {filteredBrokers.map((broker) => {
          const isDone = completedIds.includes(broker.id);
          const riskClass =
            broker.riskLevel === "Critical"
              ? styles.riskCritical
              : broker.riskLevel === "High"
              ? styles.riskHigh
              : styles.riskModerate;

          return (
            <div
              key={broker.id}
              className={`${styles.brokerCard} ${isDone ? styles.brokerCardCompleted : ""}`}
            >
              <div className={styles.brokerHeader}>
                <div className={styles.brokerTitleGroup}>
                  <h3 className={styles.brokerName}>{broker.name}</h3>
                  <span className={`${styles.riskBadge} ${riskClass}`}>
                    {broker.riskLevel} Risk
                  </span>
                  <span className={styles.categoryTag}>{broker.category}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCompleted(broker.id)}
                  className={`${styles.checkActionBtn} ${isDone ? styles.checkActionBtnChecked : ""}`}
                >
                  {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  <span>{isDone ? "Suppressed" : "Mark Done"}</span>
                </button>
              </div>

              <p className={styles.brokerDesc}>{broker.description}</p>

              <div className={styles.instructionBox}>
                <div className={styles.instructionItem}>
                  <span className={styles.instructionLabel}>Step 1: Locate Listing</span>
                  <span className={styles.instructionText}>{broker.findListing}</span>
                </div>
                <div className={styles.instructionItem}>
                  <span className={styles.instructionLabel}>Step 2: Suppression Procedure</span>
                  <span className={styles.instructionText}>{broker.procedure}</span>
                </div>
              </div>

              <div className={styles.footerRow}>
                <span className={styles.verifiedLabel}>{broker.lastVerified}</span>
                <a
                  href={broker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.optOutLink}
                >
                  <span>Open Removal Portal</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          );
        })}

        {filteredBrokers.length === 0 && (
          <div className={styles.emptyState}>
            No brokers found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
