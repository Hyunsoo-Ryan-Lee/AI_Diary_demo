
export interface Entry {
  date: string;
  content: string;
  tags: string[];
}

export interface Topic {
  topic: string;
  frequency: number;
}

export interface AnalysisResult {
  summary: string;
  topics: Topic[];
  trend: string;
}
