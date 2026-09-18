"use client";

import React, { useState } from "react";
import { Monitor, Cpu, Globe, Key, ShieldAlert, Fingerprint as FingerprintIcon, CheckCircle2, XCircle } from "lucide-react";
import { getCanvasFingerprint, CanvasFingerprint } from "@/lib/fingerprint/canvas";
import { getAudioFingerprint, AudioFingerprint } from "@/lib/fingerprint/audio";
import { getWebGLFingerprint, WebGLFingerprint } from "@/lib/fingerprint/webgl";
import { getNavigatorFingerprint, NavigatorFingerprint } from "@/lib/fingerprint/navigator";
import { getScreenFingerprint, ScreenFingerprint } from "@/lib/fingerprint/screen";
import { generateHash } from "@/lib/fingerprint/hash";

interface FingerprintResult {
  canvas: CanvasFingerprint;
  audio: AudioFingerprint;
  webgl: WebGLFingerprint;
  navigator: NavigatorFingerprint;
  screen: ScreenFingerprint;
  hash: string;
}

export function BrowserFingerprint() {
  const [data, setData] = useState<FingerprintResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      // Collect signals
      const canvas = getCanvasFingerprint();
      const webgl = getWebGLFingerprint();
      const nav = getNavigatorFingerprint();
      const screen = getScreenFingerprint();
      
      // Audio is async
      const audio = await getAudioFingerprint();

      // Normalize for hashing
      const normalizedData = {
        canvas: canvas.supported ? canvas.dataUrl : null,
        audio: audio.supported ? audio.value : null,
        webgl: webgl.supported ? `${webgl.vendor}-${webgl.renderer}` : null,
        navigator: {
          userAgent: nav.userAgent,
          languages: nav.languages.join(","),
          doNotTrack: nav.doNotTrack,
          cookiesEnabled: nav.cookiesEnabled,
          platform: nav.platform,
          hardwareConcurrency: nav.hardwareConcurrency,
          deviceMemory: nav.deviceMemory,
        },
        screen: {
          dimensions: `${screen.width}x${screen.height}`,
          available: `${screen.availWidth}x${screen.availHeight}`,
          dpr: screen.devicePixelRatio,
          colorDepth: screen.colorDepth,
          timezone: screen.timezone,
        },
      };

      const hash = await generateHash(normalizedData);

      setData({
        canvas,
        audio,
        webgl,
        navigator: nav,
        screen,
        hash,
      });
    } catch (error) {
      console.error("Error generating fingerprint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-6">
        <div className="rounded-full bg-slate-800 p-4">
          <FingerprintIcon className="w-12 h-12 text-slate-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-200">Browser Fingerprinting</h2>
          <p className="max-w-md text-sm text-slate-400">
            This tool computes a local, approximate fingerprint of your browser by analyzing canvas rendering, audio properties, WebGL, and other configuration data.
          </p>
        </div>
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Analyzing Browser...
            </>
          ) : (
            "Run fingerprint test"
          )}
        </button>
      </div>
    );
  }

  // Parse browser OS string nicely if possible
  const navPlatform = data.navigator.platform || "Unknown";
  let browserName = "Unknown Browser";
  const ua = data.navigator.userAgent;
  if (ua.includes("Firefox")) browserName = "Firefox";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browserName = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Safari";
  else if (ua.includes("Edg")) browserName = "Edge";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FingerprintIcon className="w-6 h-6 text-indigo-400" />
          Browser Fingerprint
        </h2>
        <button
          onClick={runTest}
          disabled={isLoading}
          className="text-sm px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
        >
          {isLoading ? "Running..." : "Retest"}
        </button>
      </div>

      {/* Hash */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400">Fingerprint</p>
        <p className="font-mono text-2xl font-bold text-cyan-400 tracking-tight">
          {data.hash.substring(0, 4)}...{data.hash.substring(data.hash.length - 4)}
        </p>
      </div>

      {/* Uniqueness Indicators */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-400">Uniqueness indicators</p>
        <div className="grid grid-cols-1 gap-2">
          <IndicatorRow label="Canvas" supported={data.canvas.supported} />
          <IndicatorRow label="WebGL" supported={data.webgl.supported} />
          <IndicatorRow label="Audio" supported={data.audio.supported} />
        </div>
      </div>

      {/* Browser */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400">Browser</p>
        <p className="text-slate-200 font-medium">
          {browserName} <span className="text-slate-500 mx-2">•</span> {navPlatform}
        </p>
      </div>

      {/* Display */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400">Display</p>
        <p className="text-slate-200 font-medium">
          {data.screen.width} × {data.screen.height}
        </p>
        <p className="text-slate-400 text-sm">
          DPR: {data.screen.devicePixelRatio}
        </p>
      </div>

      {/* Hardware */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-400">Hardware</p>
        <p className="text-slate-200 font-medium">
          CPU threads: {data.navigator.hardwareConcurrency || "Unsupported"}
        </p>
        <p className="text-slate-200 font-medium">
          Memory: {data.navigator.deviceMemory ? `${data.navigator.deviceMemory} GB` : "Unsupported"}
        </p>
      </div>

      {/* Privacy Explanation */}
      <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-4 mt-8">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-1">Privacy explanation</span>
              Your browser exposes a combination of characteristics that websites can potentially use for recognition and tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          This fingerprint is an approximation of your browser&apos;s observable characteristics. It can change between sessions and does not uniquely identify you.
        </p>
      </div>

    </div>
  );
}

function IndicatorRow({ label, supported }: { label: string; supported: boolean }) {
  return (
    <div className="flex items-center gap-8 w-48">
      <span className="text-sm text-slate-300 w-16">{label}</span>
      {supported ? (
        <span className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Detected
        </span>
      ) : (
        <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          <XCircle className="w-4 h-4" /> Blocked/Unsupported
        </span>
      )}
    </div>
  );
}
