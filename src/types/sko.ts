export interface SKO {
  core_thesis: string;
  audience_persona: {
    primary: string;
    pain_points: string[];
    aspirations: string[];
  };
  viral_hooks: Array<{
    hook: string;
    hook_type: "contrarian" | "curiosity" | "data" | "story";
    platform_fit: string[];
  }>;
  semantic_chunks: Array<{
    id: string;
    content: string;
    big_idea: string;
    supporting_data: string[];
  }>;
  brand_tone_fingerprint: {
    voice: string;
    vocabulary_level: string;
    humor_quotient: number;
    sentence_style: string;
  };
}
