export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: string;
  publishedTime: string;
  fullContent?: string; // Optional field for the generated content
}

export interface NewsResponse {
  articles: NewsArticle[];
  hashtags: string[];
}

export enum NewsCategory {
  PORTADA = 'Portada',
  POLITICA = 'Política',
  ECONOMIA = 'Economía',
  SEGURIDAD = 'Seguridad Nacional',
  SOCIALES = 'Sociales',
  ELECCIONES = 'Elecciones 2026'
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}