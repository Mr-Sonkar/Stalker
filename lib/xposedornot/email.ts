import { XposedOrNot } from "xposedornot";
import type { PasteFinding } from "@/lib/scanner/types";

export interface BreachResult {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  affectedAccounts: number;
  verified: boolean;
  sensitive: boolean;
  dataClasses: string[];
  sources?: ("HIBP" | "XposedOrNot")[];
}

interface XonBreachDetail {
  breach?: string;
  domain?: string;
  xposed_date?: string;
  added?: string;
  xposed_records?: number;
  verified?: string;
  xposed_data?: string;
  details?: string;
}

interface XonPasteDetail {
  paste_id?: string;
  source?: string;
  title?: string;
  date?: string;
  emails_count?: number;
  [key: string]: unknown;
}

export async function checkXposedOrNotAnalytics(email: string): Promise<{
  breaches: BreachResult[];
  pastes: PasteFinding[];
}> {
  const xon = new XposedOrNot();

  try {
    const result = await xon.getBreachAnalytics(email);

    if (!result || !result.found || !result.analytics) {
      return { breaches: [], pastes: [] };
    }

    const detailsArray = (result.analytics.ExposedBreaches?.breaches_details || []) as XonBreachDetail[];

    const breaches: BreachResult[] = detailsArray.map((b) => ({
      name: b.breach || "Unknown Breach",
      title: b.breach || "Unknown Breach",
      domain: b.domain || "",
      breachDate: b.xposed_date ? `${b.xposed_date}-01-01` : "2000-01-01",
      addedDate: b.added || new Date().toISOString(),
      affectedAccounts: b.xposed_records || 0,
      verified: b.verified === "Yes",
      sensitive: false,
      dataClasses: b.xposed_data ? b.xposed_data.split(";").map((d) => d.trim()).filter(Boolean) : [],
      sources: ["XposedOrNot"],
    }));

    // Extract paste findings from XposedOrNot analytics
    const pastes: PasteFinding[] = [];
    const rawPastes = (result.analytics.ExposedPastes || []) as XonPasteDetail[];

    for (const p of rawPastes) {
      pastes.push({
        id: String(p.paste_id || p.id || `xon_paste_${pastes.length + 1}`),
        source: String(p.source || "XposedOrNot Pastes"),
        title: String(p.title || "Exposed Paste Dump"),
        date: String(p.date || new Date().toISOString().split("T")[0]),
        emailCount: Number(p.emails_count || 1),
      });
    }

    // If summary has paste count but no individual array, add summary finding
    if (pastes.length === 0 && result.analytics.PastesSummary?.cnt && result.analytics.PastesSummary.cnt > 0) {
      pastes.push({
        id: "xon_paste_summary",
        source: "XposedOrNot Paste Monitor",
        title: `Exposed across ${result.analytics.PastesSummary.cnt} public paste dumps`,
        date: String(result.analytics.PastesSummary.tmpstmp || new Date().toISOString().split("T")[0]),
        emailCount: result.analytics.PastesSummary.cnt,
      });
    }

    return { breaches, pastes };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response && err.response.status === 404) {
      return { breaches: [], pastes: [] };
    }
    console.warn("[xposedornot] Analytics request failed:", error);
    return { breaches: [], pastes: [] };
  }
}

export async function checkEmailBreaches(email: string): Promise<BreachResult[]> {
  const analytics = await checkXposedOrNotAnalytics(email);
  return analytics.breaches;
}

