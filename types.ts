
export interface MedicationInfo {
  koreanName: string;
  englishIngredients: string;
  dosage: string;
  company: string;
  description: string;
  sourceUrl: string;
}

export interface IdentificationResult {
  medications: MedicationInfo[];
  summary: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
