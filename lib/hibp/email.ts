import { XposedOrNot } from "xposedornot";

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
}

export async function checkEmailBreaches(email: string): Promise<BreachResult[]> {
  const xon = new XposedOrNot();
  
  try {
    const result = await xon.getBreachAnalytics(email);

    if (!result || !result.found || !result.analytics || !result.analytics.ExposedBreaches) {
      return [];
    }

    const detailsArray = result.analytics.ExposedBreaches.breaches_details || [];

    return detailsArray.map((b: any) => ({
      name: b.breach,
      title: b.breach,
      domain: b.domain,
      // XON returns "2012", so we pad it to a full date string to match our interface
      breachDate: b.xposed_date ? `${b.xposed_date}-01-01` : "2000-01-01",
      addedDate: b.added || new Date().toISOString(),
      affectedAccounts: b.xposed_records || 0,
      verified: b.verified === "Yes",
      sensitive: false, // XON does not provide a sensitive flag
      dataClasses: b.xposed_data ? b.xposed_data.split(";") : [],
    }));
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    console.error("XposedOrNot error:", error);
    throw new Error("Failed to fetch breaches from XposedOrNot");
  }
}
