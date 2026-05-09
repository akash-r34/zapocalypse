import { z } from "zod";

const OriginalitySignalSchema = z.object({
  signal: z.enum([
    "proprietary_data",
    "first_person_specificity",
    "verifiable_claims",
    "non_obvious_conclusions",
    "depth_score",
  ]),
  score: z.number().min(0).max(10),
  evidence: z.string(),        // direct quote or reference from source content
  recommendation: z.string(),  // how the creator could strengthen this signal
});

export const InformationGainScoreSchema = z.object({
  overall_score: z.number().min(0).max(10),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  signals: z.array(OriginalitySignalSchema).length(5),
  content_classification: z.enum([
    "original_research",
    "expert_commentary",
    "curated_synthesis",
    "derivative_rehash",
    "generic_advice",
  ]),
  strongest_asset: z.string(),
  biggest_gap: z.string(),
  enrichment_suggestions: z.array(z.string()).min(1).max(5),
});

export type InformationGainScore = z.infer<typeof InformationGainScoreSchema>;
export type OriginalitySignal = z.infer<typeof OriginalitySignalSchema>;

export const NEUTRAL_ANALYSIS_SCORE: InformationGainScore = {
  overall_score: 5,
  grade: "C",
  signals: [
    { signal: "proprietary_data", score: 5, evidence: "Analysis unavailable", recommendation: "Add proprietary data or original research" },
    { signal: "first_person_specificity", score: 5, evidence: "Analysis unavailable", recommendation: "Include personal experiences and specific examples" },
    { signal: "verifiable_claims", score: 5, evidence: "Analysis unavailable", recommendation: "Cite sources and include verifiable statistics" },
    { signal: "non_obvious_conclusions", score: 5, evidence: "Analysis unavailable", recommendation: "Push beyond common knowledge with counterintuitive insights" },
    { signal: "depth_score", score: 5, evidence: "Analysis unavailable", recommendation: "Expand on mechanisms and underlying principles" },
  ],
  content_classification: "curated_synthesis",
  strongest_asset: "Analysis unavailable — proceeding with neutral score",
  biggest_gap: "Analysis unavailable — proceeding with neutral score",
  enrichment_suggestions: ["Analysis was unavailable for this run"],
};
