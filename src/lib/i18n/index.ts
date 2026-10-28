import { en, type DictionaryKey } from "./en";
import { mr } from "./mr";

export type Locale = "en" | "mr";

export const locales: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "mr", label: "मराठी", short: "मर" },
];

const dictionaries: Record<Locale, Record<DictionaryKey, string>> = {
  en,
  mr,
};

export type TranslateKey = DictionaryKey;

export function translate(
  locale: Locale,
  key: DictionaryKey,
  vars?: Record<string, string | number>,
) {
  let value: string = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return value;
}

export const monthNames: Record<Locale, string[]> = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  mr: [
    "जानेवारी",
    "फेब्रुवारी",
    "मार्च",
    "एप्रिल",
    "मे",
    "जून",
    "जुलै",
    "ऑगस्ट",
    "सप्टेंबर",
    "ऑक्टोबर",
    "नोव्हेंबर",
    "डिसेंबर",
  ],
};

export function seasonLabel(
  locale: Locale,
  season: { from: number; to: number } | null,
) {
  if (!season) return null;
  const months = monthNames[locale];
  const from = months[season.from - 1] ?? "";
  const to = months[season.to - 1] ?? "";
  return { from, to };
}

const districtNamesMr: Record<string, string> = {
  Ahilyanagar: "अहिल्यानगर",
  Akola: "अकोला",
  Amravati: "अमरावती",
  Beed: "बीड",
  Bhandara: "भंडारा",
  Buldhana: "बुलढाणा",
  Chandrapur: "चंद्रपूर",
  "Chhatrapati Sambhajinagar": "छत्रपती संभाजीनगर",
  Dharashiv: "धाराशिव",
  Dhule: "धुळे",
  Gadchiroli: "गडचिरोली",
  Gondia: "गोंदिया",
  Hingoli: "हिंगोली",
  Jalgaon: "जळगाव",
  Jalna: "जालना",
  Kolhapur: "कोल्हापूर",
  Latur: "लातूर",
  "Mumbai City": "मुंबई शहर",
  "Mumbai Suburban": "मुंबई उपनगर",
  Nagpur: "नागपूर",
  Nanded: "नांदेड",
  Nandurbar: "नंदुरबार",
  Nashik: "नाशिक",
  Palghar: "पालघर",
  Parbhani: "परभणी",
  Pune: "पुणे",
  Raigad: "रायगड",
  Ratnagiri: "रत्नागिरी",
  Sangli: "सांगली",
  Satara: "सातारा",
  Sindhudurg: "सिंधुदुर्ग",
  Solapur: "सोलापूर",
  Thane: "ठाणे",
  Wardha: "वर्धा",
  Washim: "वाशिम",
  Yavatmal: "यवतमाळ",
};

export function districtLabel(locale: Locale, name: string | null) {
  if (!name) return "";
  if (locale === "mr") return districtNamesMr[name] ?? name;
  return name;
}
