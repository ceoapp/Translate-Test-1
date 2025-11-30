export interface TranslationRecord {
  id: string;
  original: string;
  translated: string;
  timestamp: number;
}

export interface IconProps {
  className?: string;
  size?: number;
}