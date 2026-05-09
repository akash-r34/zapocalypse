export interface Tweet {
  content: string;
  type: "contrarian" | "insight" | "thread-starter";
  characterCount: number;
}

export interface TwitterOutput {
  tweets: Tweet[];
  generatedAt: Date;
}

export interface LinkedInPost {
  content: string;
  hook: string;
  type: "authority" | "story" | "insight" | "engagement" | "value";
}

export interface LinkedInOutput {
  posts: LinkedInPost[];
  generatedAt: Date;
}

export interface NewsletterOutput {
  markdown: string;
  wordCount: number;
  generatedAt: Date;
}

export interface VeoScript {
  visual_description: string;
  lighting_cue: string;
  audio_script: string;
  duration_seconds: 15;
}

export interface VeoOutput {
  script: VeoScript;
  generatedAt: Date;
}

export interface DarkSocialMessage {
  hook: string;
  body: string;
  emoji_prefix?: string;
  embed_title?: string;
}

export interface DarkSocialOutput {
  slack_message: DarkSocialMessage;
  discord_message: DarkSocialMessage;
  shareable_quote: string;
  context_line: string;
  generatedAt: Date;
}

export type Platform = "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social";

export interface PlatformOutputs {
  twitter?: TwitterOutput;
  linkedin?: LinkedInOutput;
  newsletter?: NewsletterOutput;
  veo?: VeoOutput;
  dark_social?: DarkSocialOutput;
}
