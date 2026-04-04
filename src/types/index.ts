export interface ScrapedData {
  reviews: string;
  productName: string;
  platform: 'amazon' | 'flipkart' | 'unknown';
  isFallback: boolean;
}

export interface Aspect {
  name: string;
  pros: string[];
  cons: string[];
}

export interface AnalysisResult {
  product_name: string;
  rating: number;
  total_reviews: number;
  aspects: Aspect[];
  overall_pros: string[];
  overall_cons: string[];
  summary: string;
  most_mentioned_aspect: string;
  platform?: 'amazon' | 'flipkart' | 'unknown';
  is_fallback?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
