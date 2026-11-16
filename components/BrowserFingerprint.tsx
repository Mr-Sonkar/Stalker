"use client";

import React, { useState } from "react";
import {
  Monitor,
  Cpu,
  ShieldCheck,
  Fingerprint as FingerprintIcon,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  Type,
  Volume2,
  Sparkles,
  Code,
  RotateCcw,
} from "lucide-react";
import { runDeepFingerprint, DeepFingerprintResult } from "@/lib/fingerprint";
import styles from "./BrowserFingerprint.module.css";

type TabKey = "overview" | "gpu" | "fonts" | "media" | "display" | "defenses" | "raw";

export function BrowserFingerprint() {
  const [data, setData] = useState<DeepFingerprintResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copied, setCopied] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await runDeepFingerprint();
      setData(result);
    } catch (error) {
      console.error("Deep fingerprint scan failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.initialCard}>
          <div className={styles.iconHalo}>
            <FingerprintIcon size={36} />
          </div>

          <h2 className={styles.promptTitle}>
            Deep Multi-Vector Hardware Fingerprint Audit
          </h2>
          <p className={styles.promptDesc}>
            Probes GPU shader rendering, WebGL unmasked vendors, system font metrics, audio synthesis dynamics, and detects whether your browser injects anti-tracking farbling noise.
          </p>

          <div className={styles.tagRow}>
            <span className={styles.featureTag}>
              <Cpu size={14} color="var(--brand-cyan)" />
              GPU Shader Hardware
            </span>
            <span className={styles.featureTag}>
              <Type size={14} color="var(--brand-emerald)" />
              55+ Installed Font Probes
            </span>
            <span className={styles.featureTag}>
              <Volume2 size={14} color="var(--brand-chartreuse)" />
              AudioContext Dynamics
            </span>
            <span className={styles.featureTag}>
              <ShieldCheck size={14} color="var(--brand-emerald)" />
              Farbling &amp; Brave Protection Check
            </span>
          </div>

          <button
            type="button"
            onClick={runTest}
            disabled={isLoading}
            className={styles.startAuditBtn}
          >
            {isLoading ? (
              <>
                <RotateCcw size={18} className="animate-spin" />
                <span>Extracting Hardware Signatures...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Execute Deep Fingerprint Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Summary Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTop}>
          <div>
            <div className={styles.statusHeader}>
              <span className={styles.idBadge}>
                <FingerprintIcon size={14} />
                Composite Hardware ID
              </span>
              <span className={styles.timeBadge}>
                Audited: {new Date(data.scannedAt).toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.hashRow}>
              <span className={styles.hashDisplay}>{data.hash}</span>
              <button
                type="button"
                onClick={() => copyHash(data.hash)}
                className={styles.copyBtn}
                title="Copy Fingerprint Hash"
              >
                {copied ? <Check size={14} color="var(--brand-emerald)" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={runTest}
            disabled={isLoading}
            className={styles.rescanBtn}
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Re-scan Signatures</span>
          </button>
        </div>

        {/* Metrics Trio */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricTile}>
            <span className={styles.metricTileTitle}>Surface Diversity</span>
            <span className={styles.metricTileVal}>{data.entropy.totalBits} bits</span>
            <span className={styles.metricTileSub}>
              {data.entropy.uniquenessRatio} (est. {data.entropy.uniquenessPercentage}% distinct)
            </span>
          </div>

          <div className={styles.metricTile}>
            <span className={styles.metricTileTitle}>Rarity Rating</span>
            <span className={styles.metricTileVal}>{data.entropy.rarityLevel}</span>
            <span className={styles.metricTileSub}>
              Defense Status: {data.tamper.defenseStatus}
            </span>
          </div>

          <div className={styles.metricTile}>
            <span className={styles.metricTileTitle}>Anti-Fingerprinting Noise</span>
            <span className={styles.metricTileVal}>
              {data.tamper.canvasNoiseDetected ? "Farbling Active" : "Deterministic"}
            </span>
            <span className={styles.metricTileSub}>
              Score: {data.tamper.protectionScore}/100 • {data.tamper.braveDetected ? "Brave Shielded" : "Standard"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNav}>
        {[
          { key: "overview", label: "Overview", icon: Layers },
          { key: "gpu", label: "WebGL & GPU", icon: Cpu },
          { key: "fonts", label: `Fonts (${data.fonts.detectedFonts.length})`, icon: Type },
          { key: "media", label: "Audio & Canvas", icon: Volume2 },
          { key: "display", label: "Display & Platform", icon: Monitor },
          { key: "defenses", label: "Protections", icon: ShieldCheck },
          { key: "raw", label: "Raw Telemetry", icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab.key as TabKey)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <div className={styles.dataTable}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Canvas 2D Hash</span>
              <span className={`${styles.dataVal} ${styles.dataValCyan}`}>
                {data.canvas.hash}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Audio Oscillator Signature</span>
              <span className={`${styles.dataVal} ${styles.dataValHighlight}`}>
                {data.audio.value || "Not Evaluated"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>WebGL Renderer</span>
              <span className={styles.dataVal}>
                {data.webgl.renderer || "Standard Software Context"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Platform OS</span>
              <span className={styles.dataVal}>
                {data.navigator.platform} ({data.navigator.browserName})
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Logical CPU Cores</span>
              <span className={`${styles.dataVal} ${styles.dataValEmerald}`}>
                {data.navigator.hardwareConcurrency || "Protected"} Threads
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Device Memory Estimation</span>
              <span className={styles.dataVal}>
                {data.navigator.deviceMemory ? `~${data.navigator.deviceMemory} GB` : "Protected API"}
              </span>
            </div>
          </div>
        )}

        {activeTab === "gpu" && (
          <div className={styles.dataTable}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>GPU Vendor</span>
              <span className={`${styles.dataVal} ${styles.dataValCyan}`}>
                {data.webgl.vendor || "Default Graphics Pipeline"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>GPU Renderer</span>
              <span className={`${styles.dataVal} ${styles.dataValHighlight}`}>
                {data.webgl.renderer || "Default Pipeline"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>GLSL Version</span>
              <span className={styles.dataVal}>{data.webgl.shadingLanguageVersion || "1.0"}</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Max Texture Size</span>
              <span className={styles.dataVal}>{data.webgl.maxTextureSize}px</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Supported Extensions</span>
              <span className={styles.dataVal}>{data.webgl.extensions?.length || 0} active</span>
            </div>
          </div>
        )}

        {activeTab === "fonts" && (
          <div className={styles.fontsSection}>
            <div className={styles.fontsHeading}>
              Detected <strong>{data.fonts.detectedFonts.length}</strong> installed fonts out of{" "}
              {data.fonts.totalTested} probed system typefaces:
            </div>
            <div className={styles.fontGrid}>
              {data.fonts.detectedFonts.map((font: string, idx: number) => (
                <div key={idx} className={`${styles.fontCard} ${styles.fontCardActive}`}>
                  <span>{font}</span>
                  <CheckCircle2 size={13} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className={styles.dataTable}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Canvas Geometry Signature</span>
              <span className={`${styles.dataVal} ${styles.dataValCyan}`}>
                {data.canvas.hash}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Audio Sample Rate</span>
              <span className={styles.dataVal}>{data.audio.sampleRate || 44100} Hz</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Audio Oscillator Value</span>
              <span className={`${styles.dataVal} ${styles.dataValHighlight}`}>
                {data.audio.value || "N/A"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Speech Synthesis Voices</span>
              <span className={styles.dataVal}>
                {data.media.voicesCount || 0} voices registered
              </span>
            </div>
          </div>
        )}

        {activeTab === "display" && (
          <div className={styles.dataTable}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Screen Resolution</span>
              <span className={`${styles.dataVal} ${styles.dataValHighlight}`}>
                {data.screen.width} × {data.screen.height}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Available Desktop Area</span>
              <span className={styles.dataVal}>
                {data.screen.availWidth} × {data.screen.availHeight}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Color Depth</span>
              <span className={styles.dataVal}>{data.screen.colorDepth}-bit</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Device Pixel Ratio (DPR)</span>
              <span className={styles.dataVal}>{data.screen.devicePixelRatio}x</span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Timezone &amp; Locale</span>
              <span className={styles.dataVal}>
                {data.screen.timezone} ({data.navigator.languages.join(", ")})
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Touch Screen Points</span>
              <span className={styles.dataVal}>{data.capabilities.maxTouchPoints} Max Touch Points</span>
            </div>
          </div>
        )}

        {activeTab === "defenses" && (
          <div className={styles.dataTable}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Anti-Fingerprinting Noise (Farbling)</span>
              <span
                className={`${styles.dataVal} ${
                  data.tamper.canvasNoiseDetected ? styles.dataValEmerald : styles.dataValHighlight
                }`}
              >
                {data.tamper.canvasNoiseDetected
                  ? "DETECTED (Canvas Noise Injected)"
                  : "NOT DETECTED (Deterministic Canvas)"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Brave Browser Protection</span>
              <span
                className={`${styles.dataVal} ${
                  data.tamper.braveDetected ? styles.dataValEmerald : ""
                }`}
              >
                {data.tamper.braveDetected ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Automated WebDriver Indicator</span>
              <span className={styles.dataVal}>
                {data.tamper.isAutomated ? "DETECTED (Headless / Bot)" : "None (Organic Session)"}
              </span>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Protection Score</span>
              <span className={`${styles.dataVal} ${styles.dataValEmerald}`}>
                {data.tamper.protectionScore} / 100 ({data.tamper.defenseStatus})
              </span>
            </div>
          </div>
        )}

        {activeTab === "raw" && (
          <pre className={styles.rawCode}>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
