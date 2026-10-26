"use client";

import React, { useState, useEffect } from "react";

// Dynamically import type for zxcvbn
import type { ZXCVBNResult } from "zxcvbn";

export function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ZXCVBNResult | null>(null);
  const [zxcvbnLib, setZxcvbnLib] = useState<any>(null);

  // Load zxcvbn dynamically on mount
  useEffect(() => {
    import("zxcvbn").then((module) => {
      setZxcvbnLib(() => module.default);
    });
  }, []);

  useEffect(() => {
    if (password && zxcvbnLib) {
      setResult(zxcvbnLib(password));
    } else {
      setResult(null);
    }
  }, [password, zxcvbnLib]);

  const score = result ? result.score : 0;

  const getScoreColor = () => {
    if (!password) return "bg-gray-200";
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const getScoreLabel = () => {
    if (!password) return "";
    switch (score) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg border border-gray-200 shadow-sm mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Password Strength Check</h3>
      <p className="text-xs text-gray-500 mb-4">
        Your password is evaluated entirely in your browser. It is never sent to our servers.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password-check">
          Test a password
        </label>
        <input
          id="password-check"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a password to test..."
        />
      </div>

      {password && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Strength: {getScoreLabel()}</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getScoreColor()}`}
              style={{ width: `${Math.max((score / 4) * 100, 5)}%` }}
            ></div>
          </div>

          {result && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p className="mb-1">
                <span className="font-medium text-gray-900">Estimated crack time:</span>{" "}
                {result.crack_times_display.offline_slow_hashing_1e4_per_second}
              </p>

              {result.feedback.warning && (
                <p className="text-amber-600 mt-2 text-xs font-medium flex items-start">
                  <span className="mr-1">⚠️</span> {result.feedback.warning}
                </p>
              )}

              {result.feedback.suggestions && result.feedback.suggestions.length > 0 && (
                <ul className="mt-2 text-xs list-disc pl-5 space-y-1">
                  {result.feedback.suggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
