const fmtLong = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const fmtShort = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export const longDate = (ms: number) => fmtLong.format(ms);
export const shortDate = (ms: number) => fmtShort.format(ms);
export const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const num = (n: number) => Math.round(n).toLocaleString("en-US");
export const pct1 = (n: number) => n.toFixed(1);
export const money = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`);
