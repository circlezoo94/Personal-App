const STORAGE_KEY = "feedbacklens_hospital_mapping";

export function loadHospitalMapping(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveHospitalMapping(mapping: Record<string, string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
}

export function applyHospitalMapping(
  name: string,
  mapping: Record<string, string>
): string {
  return mapping[name] ?? name;
}
