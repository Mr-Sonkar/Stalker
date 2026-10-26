"use client";

import React, { useState } from "react";
import {
  Monitor,
  Cpu,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Fingerprint as FingerprintIcon,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Layers,
  Type,
  Volume2,
  Palette,
  Sparkles,
  Code,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { runDeepFingerprint, DeepFingerprintResult } from "@/lib/fingerprint";

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
      <div className="flex w-full max-w-4xl flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center backdrop-blur-xl shadow-2xl">
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/30 bg-slate-950 p-4 shadow-xl">
            <FingerprintIcon className="h-10 w-10 text-indigo-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Deep Multi-Vector Fingerprint Audit
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
          Probes hardware graphics rendering, WebGL shader precisions, system font metrics, audio synthesis dynamics, and detects whether your browser injects anti-tracking noise.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" /> GPU Shaders & Extensions
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1">
            <Type className="h-3.5 w-3.5 text-purple-400" /> 55+ System Font Probes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1">
            <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Audio Context & Speech
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Brave / Noise Farbling Detection
          </span>
        </div>

        <button
          onClick={runTest}
          disabled={isLoading}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:opacity-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Probing Deep Hardware Signatures...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Start Deep Fingerprint Audit
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* Hero Summary Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl sm:p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <FingerprintIcon className="h-3.5 w-3.5 text-indigo-400" />
                Composite Hardware ID
              </span>
              <span className="text-xs text-slate-500">
                Audited: {new Date(data.scannedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-cyan-400 break-all">
                {data.hash}
              </span>
              <button
                onClick={() => copyHash(data.hash)}
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                title="Copy Fingerprint Hash"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={runTest}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Re-scan Signals
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Uniqueness Score */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-xs font-medium text-slate-400">Surface Diversity (Heuristic)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {data.entropy.totalBits}
              </span>
              <span className="text-xs text-slate-400">bits</span>
            </div>
            <p className="mt-1 text-xs font-medium text-purple-400">
              {data.entropy.uniquenessRatio} (est. {data.entropy.uniquenessPercentage}% distinct)
            </p>
          </div>

          {/* Defense Status */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-xs font-medium text-slate-400">API Noise (Farbling)</span>
            <div className="mt-1 flex items-center gap-2">
              {data.tamper.defenseStatus === "ACTIVELY_DEFENDED" ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span className="text-base font-bold text-emerald-400">Active Farbling</span>
                </>
              ) : data.tamper.defenseStatus === "PARTIALLY_PROTECTED" ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span className="text-base font-bold text-amber-400">Partial Farbling</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 text-slate-400" />
                  <span className="text-base font-bold text-slate-300">Standard (No Noise)</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {data.tamper.canvasNoiseDetected
                ? "Canvas pixels randomized"
                : "Consistent hardware signature"}
            </p>
          </div>

          {/* Browser / Platform */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <span className="text-xs font-medium text-slate-400">Host Environment</span>
            <div className="mt-1 text-base font-bold text-white truncate">
              {data.navigator.browserName}
            </div>
            <p className="mt-1 text-xs text-slate-400 truncate">
              {data.navigator.platform} • {data.screen.timezone}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy vs Security Context Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Browser Distinguishability vs. System Security</span>
            <p className="text-slate-400 leading-relaxed">
              This audit measures how readily your browser configuration can be differentiated from others for cross-site tracking. A high diversity index does <strong>not</strong> indicate a security vulnerability, virus, or weak passwords—your computer’s antivirus, HTTPS, and operating system security remain fully protective. Similarly, &quot;Standard (No Noise)&quot; means graphics and audio APIs do not inject random farbling; traditional content blockers and network protections operate on separate layers.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 text-xs font-medium text-slate-400 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "overview"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab("gpu")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "gpu"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Cpu className="h-4 w-4" /> GPU & WebGL ({data.webgl.extensions.length} ext)
        </button>
        <button
          onClick={() => setActiveTab("fonts")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "fonts"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Type className="h-4 w-4" /> System Fonts ({data.fonts.detectedFonts.length})
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "media"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Volume2 className="h-4 w-4" /> Audio & Speech ({data.media.voicesCount} voices)
        </button>
        <button
          onClick={() => setActiveTab("display")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "display"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Palette className="h-4 w-4" /> Display & CSS
        </button>
        <button
          onClick={() => setActiveTab("defenses")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "defenses"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Shield className="h-4 w-4" /> API Noise & Farbling
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === "raw"
              ? "border-indigo-400 text-white font-semibold"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          <Code className="h-4 w-4" /> Raw Diagnostic JSON
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Hardware Signals */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <Cpu className="h-4 w-4" /> Hardware & Processing Core
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">GPU Renderer</span>
                    <span className="text-slate-200 font-mono text-right max-w-[240px] truncate" title={data.webgl.renderer || ""}>
                      {data.webgl.renderer || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">CPU Threads (Concurrency)</span>
                    <span className="text-slate-200 font-mono">{data.navigator.hardwareConcurrency || "Unavailable"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Device RAM</span>
                    <span className="text-slate-200 font-mono">
                      {data.navigator.deviceMemory ? `${data.navigator.deviceMemory} GB` : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Max Texture Size</span>
                    <span className="text-slate-200 font-mono">{data.webgl.maxTextureSize}px</span>
                  </div>
                </div>
              </div>

              {/* Display & Optics */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Monitor className="h-4 w-4" /> Screen & Optics Matrix
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Resolution</span>
                    <span className="text-slate-200 font-mono">
                      {data.screen.width} × {data.screen.height} (Avail: {data.screen.availWidth} × {data.screen.availHeight})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Device Pixel Ratio (DPR)</span>
                    <span className="text-slate-200 font-mono">{data.screen.devicePixelRatio}x</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Color Gamut</span>
                    <span className="text-cyan-400 uppercase font-mono">{data.capabilities.colorGamut}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">High Dynamic Range (HDR)</span>
                    <span className="text-slate-200 font-mono">{data.capabilities.hdr ? "Supported" : "Standard SDR"}</span>
                  </div>
                </div>
              </div>

              {/* Audio & Typography */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Type className="h-4 w-4" /> System Typography & Voices
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Installed Fonts Detected</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {data.fonts.detectedFonts.length} of {data.fonts.totalTested} probed
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Speech Synthesis Voices</span>
                    <span className="text-slate-200 font-mono">{data.media.voicesCount} engines</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Media Device Inputs</span>
                    <span className="text-slate-200 font-mono">
                      {data.media.audioInputCount} audio, {data.media.videoInputCount} video
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Audio Frequency Sum</span>
                    <span className="text-slate-200 font-mono truncate max-w-[180px]">{data.audio.value || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Defense & Sandbox */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <ShieldCheck className="h-4 w-4" /> Protection & Sandbox
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Canvas Noise (Farbling)</span>
                    <span className={data.tamper.canvasNoiseDetected ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                      {data.tamper.canvasNoiseDetected ? "Detected (Active)" : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Brave Shields</span>
                    <span className={data.tamper.braveDetected ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                      {data.tamper.braveDetected ? "Active" : "Not Detected"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">WebAssembly Engine</span>
                    <span className="text-slate-200 font-mono">{data.capabilities.webAssembly ? "Enabled" : "Disabled"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Automated Webdriver</span>
                    <span className={data.tamper.isAutomated ? "text-amber-400 font-semibold" : "text-slate-400"}>
                      {data.tamper.isAutomated ? "Detected" : "Clean"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GPU Tab */}
        {activeTab === "gpu" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" /> GPU Hardware Diagnostics
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Unmasked Vendor</span>
                  <span className="font-mono text-slate-200">{data.webgl.vendor || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Unmasked Renderer</span>
                  <span className="font-mono text-cyan-400">{data.webgl.renderer || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">WebGL Version</span>
                  <span className="font-mono text-slate-200">{data.webgl.version || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Shading Language</span>
                  <span className="font-mono text-slate-200">{data.webgl.shadingLanguageVersion || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Max Texture Dimension</span>
                  <span className="font-mono text-slate-200">{data.webgl.maxTextureSize} × {data.webgl.maxTextureSize} px</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Antialiasing Buffer</span>
                  <span className="font-mono text-slate-200">{data.webgl.antialias ? "Hardware Active" : "Disabled"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Vertex Shader Precision</span>
                  <span className="font-mono text-slate-200">{data.webgl.vertexShaderPrecision} bits</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">3D Geometric Raster Hash</span>
                  <span className="font-mono text-emerald-400">{data.webgl.renderHash}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <h4 className="text-sm font-bold text-white mb-3">
                Supported WebGL Extensions ({data.webgl.extensions.length})
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                The specific combination and alphabetical registration order of WebGL extensions is determined by your graphics driver.
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto">
                {data.webgl.extensions.map((ext) => (
                  <span
                    key={ext}
                    className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-300"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === "fonts" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Type className="h-4 w-4 text-purple-400" />
                    System Fonts Signature
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Detected {data.fonts.detectedFonts.length} installed fonts out of {data.fonts.totalTested} probed system typography families.
                  </p>
                </div>
                <span className="font-mono text-xs text-purple-400 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1">
                  Hash: {data.fonts.hash}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.fonts.detectedFonts.map((font) => (
                  <span
                    key={font}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-950/40 px-2.5 py-1 text-xs text-indigo-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    {font}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audio & Media Tab */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-cyan-400" /> OfflineAudio Dynamics
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Audio Sample Rate</span>
                    <span className="text-slate-200">{data.audio.sampleRate} Hz</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Triangle Oscillator Sum</span>
                    <span className="text-cyan-400 truncate max-w-[200px]">{data.audio.value}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-sans">Audio Farbling Status</span>
                    <span className={data.audio.isTampered ? "text-emerald-400" : "text-slate-400"}>
                      {data.audio.isTampered ? "Active Noise Injection" : "Consistent"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-indigo-400" /> Media Devices Topology
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Microphones (Audio Inputs)</span>
                    <span className="text-slate-200">{data.media.audioInputCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Speakers (Audio Outputs)</span>
                    <span className="text-slate-200">{data.media.audioOutputCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-sans">Webcams (Video Inputs)</span>
                    <span className="text-slate-200">{data.media.videoInputCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {data.media.voicesCount > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h4 className="text-sm font-bold text-white mb-2">
                  Speech Synthesis Voice Engines ({data.media.voicesCount})
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Reveals language packs and OS-specific text-to-speech providers.
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.media.voicesSample.map((voice) => (
                    <span
                      key={voice}
                      className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 font-mono"
                    >
                      {voice}
                    </span>
                  ))}
                  {data.media.voicesCount > 5 && (
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                      +{data.media.voicesCount - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Display & CSS Tab */}
        {activeTab === "display" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">CSS Media Query & Screen Profile</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Color Gamut Support</span>
                  <span className="font-mono text-cyan-400 uppercase">{data.capabilities.colorGamut}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">HDR Support</span>
                  <span className="font-mono text-slate-200">{data.capabilities.hdr ? "High Dynamic Range Active" : "Standard Range"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Pointer Precision</span>
                  <span className="font-mono text-slate-200">{data.capabilities.pointerType} (Hover: {data.capabilities.hover ? "Yes" : "No"})</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Touch Points</span>
                  <span className="font-mono text-slate-200">{data.capabilities.maxTouchPoints} max touch contacts</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Preferred Theme</span>
                  <span className="font-mono text-slate-200 uppercase">{data.capabilities.colorScheme}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Reduced Motion Preference</span>
                  <span className="font-mono text-slate-200">{data.capabilities.reducedMotion ? "Active" : "No preference"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Defenses Tab */}
        {activeTab === "defenses" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {data.tamper.defenseStatus === "ACTIVELY_DEFENDED" ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : data.tamper.defenseStatus === "PARTIALLY_PROTECTED" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Shield className="h-4 w-4 text-slate-400" />
                  )}
                  Hardware API Noise & Farbling Analysis
                </h4>
                <span
                  className={`font-bold text-xs px-3 py-1 rounded-full border self-start sm:self-auto ${
                    data.tamper.protectionScore >= 60
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : data.tamper.protectionScore >= 20
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  Farbling Index: {data.tamper.protectionScore} / 100 ({data.tamper.defenseStatus.replace("_", " ")})
                </span>
              </div>

              {/* Explanatory Banner for 0/100 or Low Protection */}
              {data.tamper.protectionScore < 20 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Shield className="h-4 w-4 text-indigo-400" />
                    <span>Understanding &quot;Standard Exposure&quot; (0/100 Farbling)</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    This test evaluates whether your browser intentionally randomizes canvas pixel rendering or audio frequency buffers (farbling). A score of <strong>0 / 100</strong> means that standard graphics and audio APIs execute deterministically, allowing trackers to observe consistent hardware signatures.
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    This does <strong>not</strong> mean your device is unpatched or insecure—network protections, ad blockers, cookie partitioners, and antivirus software operate on separate layers. However, websites with JavaScript enabled can observe your exact hardware characteristics. Privacy-focused configurations (such as Brave Shields or Firefox with <code>privacy.resistFingerprinting</code>) inject subtle mathematical noise to disrupt tracking scripts.
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {data.tamper.notes.map((note, idx) => {
                  const isNegative =
                    note.toLowerCase().includes("no active") ||
                    note.toLowerCase().includes("unprotected") ||
                    note.toLowerCase().includes("automated");

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs text-slate-300 ${
                        isNegative
                          ? "border-red-500/20 bg-red-950/10"
                          : "border-slate-800/80 bg-slate-900/60"
                      }`}
                    >
                      {isNegative ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span>{note}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Raw JSON Tab */}
        {activeTab === "raw" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Complete Diagnostic JSON Object</span>
              <button
                onClick={() => copyHash(JSON.stringify(data, null, 2))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                Copy JSON
              </button>
            </div>
            <pre className="max-h-[460px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-cyan-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
