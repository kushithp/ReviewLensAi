import axios from 'axios';
import { ScrapedData } from '../types';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  timeout: 30000,
});

export const analyze = async (content: string, sourceType: 'url' | 'text'): Promise<ScrapedData> => {
  const response = await api.post('/analyze', { content, source_type: sourceType });
  return response.data;
};

// Backward compatibility
export const analyzeText = (text: string) => analyze(text, 'text');
export const analyzeLink = (url: string) => analyze(url, 'url');
