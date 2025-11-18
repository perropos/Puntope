import { GoogleGenAI } from "@google/genai";
import { NewsResponse, NewsCategory, NewsArticle } from '../types';

const CACHE_PREFIX = 'puntope_cache_';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache duration

interface CacheItem {
  timestamp: number;
  data: NewsResponse;
}

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Ensure process.env.API_KEY is set.");
    return "";
  }
  return apiKey;
};

// Helper to hash string to index for deterministic random selection
const getIndexFromTitle = (title: string, max: number) => {
  const safeTitle = title || 'default';
  let hash = 0;
  for (let i = 0; i < safeTitle.length; i++) {
    hash = safeTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

// Helper to assign professional images based on keywords since text-AI doesn't scrape images
const getImageForNews = (title: string, category: string): string => {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  
  // Expanded collection of high-quality Unsplash images for Peruvian Politics context
  // These are generic but relevant stock photos (internet sourced)
  const imagePools = {
    congreso: [
        "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80&w=800", // Gov building
        "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=800", // Formal hall
        "https://images.unsplash.com/photo-1541872703-74c5963631df?auto=format&fit=crop&q=80&w=800", // Classical building
    ],
    palacio: [
        "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&q=80&w=800", // Lima architecture
        "https://images.unsplash.com/photo-1569937756447-e2845e6f9d95?auto=format&fit=crop&q=80&w=800", // Peru flag waving
        "https://images.unsplash.com/photo-1590942109862-95d13e6252d5?auto=format&fit=crop&q=80&w=800", // Cityscape
    ],
    justicia: [
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800", // Gavel
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800", // Columns
        "https://images.unsplash.com/photo-1589994965851-a08a09c96962?auto=format&fit=crop&q=80&w=800", // Scales
    ],
    economia: [
        "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=800", // Graph
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800", // Money
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800", // Coins
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800", // Accounting
    ],
    policia: [
        "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&q=80&w=800", // Siren
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800", // Emergency lights
        "https://images.unsplash.com/photo-1606332025129-5b6f3d22c57e?auto=format&fit=crop&q=80&w=800", // Security tape
    ],
    protesta: [
        "https://images.unsplash.com/photo-1642080342386-423f540a97b5?auto=format&fit=crop&q=80&w=800", // Crowd
        "https://images.unsplash.com/photo-1531324916406-07d15d999016?auto=format&fit=crop&q=80&w=800", // People walking
    ],
    peru: [
        "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800", // Flag abstract
        "https://images.unsplash.com/photo-1531968455001-fc0f3f8c4c3c?auto=format&fit=crop&q=80&w=800", // Machu picchu generic
        "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&q=80&w=800", // Jungle/Nature
    ],
    elecciones: [
        "https://images.unsplash.com/photo-1540910419868-474947cebacb?auto=format&fit=crop&q=80&w=800", // Hand voting
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", // People discussion
        "https://images.unsplash.com/photo-1609252553023-244b2108d01c?auto=format&fit=crop&q=80&w=800", // Checkbox
    ],
    sociales: [
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=800", // People
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800", // Group
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800", // Medical/Health
    ],
    general: [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200", // News paper
        "https://images.unsplash.com/photo-1495020686659-d24098c20cc8?auto=format&fit=crop&q=80&w=1200", // Newspaper stack
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200", // Broadcast
    ]
  };

  const select = (pool: string[]) => pool[getIndexFromTitle(t, pool.length)];

  if (c.includes('elecciones') || t.includes('voto') || t.includes('onpe') || t.includes('jne')) return select(imagePools.elecciones);
  if (c.includes('seguridad') || t.includes('policia') || t.includes('crimen') || t.includes('estado de emergencia')) return select(imagePools.policia);
  if (c.includes('sociales') || t.includes('salud') || t.includes('educacion')) return select(imagePools.sociales);

  if (t.includes('congreso') || t.includes('legislativo') || t.includes('parlamento')) return select(imagePools.congreso);
  if (t.includes('dina') || t.includes('boluarte') || t.includes('ejecutivo') || t.includes('gobierno')) return select(imagePools.palacio);
  if (t.includes('fiscal') || t.includes('juez') || t.includes('justicia') || t.includes('policia')) return select(imagePools.justicia);
  if (t.includes('sol') || t.includes('bcr') || t.includes('economia') || t.includes('dolar') || t.includes('mineria')) return select(imagePools.economia);
  if (t.includes('marcha') || t.includes('protesta')) return select(imagePools.protesta);
  
  // Category fallback
  if (c.includes('congreso') || c.includes('política')) return select(imagePools.congreso);
  if (c.includes('economia')) return select(imagePools.economia);
  if (c.includes('justicia')) return select(imagePools.justicia);

  return select(imagePools.general);
};

// --- Caching Helpers ---
const getCacheKey = (category: string, query?: string) => {
  return `${CACHE_PREFIX}${category}_${query || 'default'}`;
};

// Modified to allow retrieving expired cache in case of API failure
const getFromCache = (category: string, query?: string, ignoreExpiry: boolean = false): NewsResponse | null => {
  const key = getCacheKey(category, query);
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item: CacheItem = JSON.parse(itemStr);
    const now = Date.now();
    // Check if expired
    if (!ignoreExpiry && now - item.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (e) {
    console.error("Error parsing cache", e);
    localStorage.removeItem(key);
    return null;
  }
};

const saveToCache = (category: string, data: NewsResponse, query?: string) => {
  const key = getCacheKey(category, query);
  const item: CacheItem = {
    timestamp: Date.now(),
    data,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn("Storage full or error saving to cache", e);
  }
};

// --- Mock Data Fallback for Quota Issues ---
const getMockData = (category: string): NewsResponse => {
    const mockArticles: NewsArticle[] = [];
    
    const categories = [
        NewsCategory.POLITICA, 
        NewsCategory.ECONOMIA, 
        NewsCategory.SEGURIDAD, 
        NewsCategory.SOCIALES,
        NewsCategory.ELECCIONES
    ];

    // Generate generic articles to fill the UI when offline/quota exceeded
    categories.forEach(cat => {
        if (category !== NewsCategory.PORTADA && category !== cat) return;
        
        // Generate varied items based on timestamp to avoid duplicate keys in some lists
        for (let i = 1; i <= 6; i++) {
             const id = `mock-${cat.replace(/\s/g,'')}-${i}-${Date.now()}`;
             mockArticles.push({
                id: id,
                title: `Cobertura en desarrollo: ${cat} en el Perú`,
                summary: `Estamos experimentando una alta demanda en nuestros servidores de IA. Mostrando contenido preliminar sobre ${cat}. La información detallada se actualizará automáticamente en breve.`,
                source: "Punto Pe Alerta",
                url: "#",
                imageUrl: getImageForNews(cat, cat),
                category: cat,
                publishedTime: "En desarrollo"
             });
        }
    });

    return {
        articles: mockArticles,
        hashtags: ["#AltaDemanda", "#Actualizando", "#PuntoPeEnVivo", "#AlertaInformativa"]
    };
}

export const fetchNewsUpdate = async (
  category: NewsCategory, 
  customQuery?: string, 
  forceRefresh: boolean = false
): Promise<NewsResponse> => {
  
  // 1. Check Cache (if not forced)
  if (!forceRefresh) {
    const cachedData = getFromCache(category, customQuery);
    if (cachedData) {
      console.log(`[Cache Hit] Returning cached data for ${category}`);
      return cachedData;
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key missing, using mock data.");
    return getMockData(category);
  }

  console.log(`[API Fetch] Fetching fresh data for ${category}`);
  const ai = new GoogleGenAI({ apiKey });

  const date = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('es-PE');
  
  let prompt = '';

  if (category === NewsCategory.PORTADA && !customQuery) {
      prompt = `
        Hoy es ${date}, hora ${time}.
        Eres el editor en jefe de "Punto Pe".
        Genera un DASHBOARD completo de noticias de ÚLTIMA HORA (últimas 24 horas).
        
        NECESITO EXPLICITAMENTE:
        - 4 noticias de POLITICA
        - 4 noticias de ECONOMIA
        - 4 noticias de SEGURIDAD NACIONAL
        - 4 noticias de SOCIALES
        - 4 noticias de ELECCIONES 2026

        Usa Google Search para encontrar hechos reales y recientes.
        
        Tu respuesta DEBE ser UNICAMENTE un objeto JSON válido (sin texto introductorio):
        {
          "news_items": [
            {
              "headline": "Titular",
              "summary": "Resumen breve",
              "source_name": "Medio",
              "source_url": "URL",
              "relevant_category": "Política"
            }
            ... (total 20 items aprox)
          ],
          "hashtags": ["#Tag1", "#Tag2"]
        }
      `;
  } else {
      const context = customQuery || category;
      prompt = `
        Hoy es ${date}, hora ${time}.
        Eres un editor de noticias de "Punto Pe".
        Investiga las ÚLTIMAS noticias (últimas 24 horas) sobre: "${context}".
        Usa Google Search para encontrar información real y reciente.
        
        Tu respuesta DEBE ser UNICAMENTE un objeto JSON válido (sin texto introductorio).
        Estructura deseada:
        {
          "news_items": [
            {
              "headline": "Titular corto e impactante",
              "summary": "Resumen de 20-30 palabras",
              "source_name": "Nombre del medio",
              "source_url": "URL de la noticia",
              "relevant_category": "${category}"
            }
          ],
          "hashtags": ["#Tag1", "#Tag2", "#Tag3"]
        }
        Genera una lista exhaustiva de al menos 20 noticias relevantes para esta categoría.
      `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No data received");

    // Robust JSON Extraction: Find the first '{' and the last '}'
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // Extract only the JSON part, ignoring conversational text before/after
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
        // Fallback cleanup if braces are missing (unlikely but safe)
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);
    
    if (!parsed.news_items || !Array.isArray(parsed.news_items)) {
        throw new Error("Invalid JSON structure: missing news_items array");
    }

    const articles: NewsArticle[] = parsed.news_items.map((item: any, index: number) => ({
      id: `news-${index}-${Date.now()}`,
      title: item.headline || "Sin titular",
      summary: item.summary || "Sin resumen disponible",
      source: item.source_name || "Fuente desconocida",
      url: item.source_url || "#",
      imageUrl: getImageForNews(item.headline, item.relevant_category),
      category: item.relevant_category || category,
      publishedTime: "Hace instantes"
    }));

    const hashtags = parsed.hashtags || ["#Peru", "#Noticias", "#Actualidad"];
    
    const result = {
      articles,
      hashtags
    };

    // Save to cache
    saveToCache(category, result, customQuery);

    return result;

  } catch (error: any) {
    // Custom handling for 429 (Quota Exceeded) or similar errors
    const errorMsg = error?.message || JSON.stringify(error);
    
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        console.warn("[API Warning] Quota Limit Reached. Switching to Offline/Mock Mode.");
    } else {
        console.error("Error fetching news:", error);
    }
    
    // FALLBACK STRATEGY for 429 or Network Errors
    
    // 1. Try to get STALE CACHE first (even if expired)
    const staleCache = getFromCache(category, customQuery, true);
    if (staleCache) {
        console.log("[Fallback] Returning stale cache due to API error.");
        return staleCache;
    }

    // 2. If no cache exists, return MOCK DATA to prevent empty screen
    console.log("[Fallback] No cache available. Generating mock data.");
    return getMockData(category);
  }
};

export const fetchFullArticle = async (article: NewsArticle): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key no disponible para generar el artículo completo.";
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Actúa como un periodista senior de "Punto Pe".
    Escribe un artículo completo, detallado y profesional basado en este titular y resumen:
    
    TITULAR: ${article.title}
    RESUMEN: ${article.summary}
    FUENTE ORIGINAL REFERENCIAL: ${article.source}
    CATEGORÍA: ${article.category}

    Instrucciones:
    1. Redacta el contenido completo de la noticia (mínimo 300 palabras).
    2. Usa un tono periodístico, neutral y formal.
    3. Estructura: Introducción fuerte, Desarrollo de los hechos, Contexto político, y Conclusión.
    4. Usa formato Markdown (h2 para subtítulos, negritas para énfasis).
    5. NO inventes hechos falsos, apégate al contexto del resumen y usa conocimiento general de la política peruana actual para dar contexto.
    6. NO incluyas enlaces en el cuerpo del texto, solo redacción.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || "No se pudo generar el artículo.";
  } catch (e: any) {
      const errorMsg = e?.message || "";
      console.error("Error generating full article:", e);
      
      // Return a safe fallback if full article generation fails (e.g. quota limit)
      if (errorMsg.includes("429") || errorMsg.includes("quota")) {
          return `
## Alta Demanda de Servicios

Lo sentimos, nuestros servidores de redacción con IA están experimentando una carga inusual en este momento.

**Resumen Original:**
${article.summary}

El sistema reintentará conectar en breve para ofrecerle el análisis completo.
          `;
      }

      return `
## Error de Generación

Lo sentimos, no pudimos redactar el artículo completo en este momento.

**Resumen Original:**
${article.summary}

Inténtelo de nuevo en unos minutos.
      `;
  }
}