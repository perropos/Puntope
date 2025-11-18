import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NewsGrid from './components/NewsGrid';
import NewsDetail from './components/NewsDetail';
import Sidebar from './components/Sidebar';
import { NewsCategory, NewsResponse, LoadingState, NewsArticle } from './types';
import { fetchNewsUpdate } from './services/geminiService';

const App: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<NewsCategory>(NewsCategory.PORTADA);
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTags, setTrendingTags] = useState<string[]>([
    "#PoliticaPeru", "#Congreso", "#Actualidad", "#UltimoMinuto", "#Peru"
  ]);
  const [refreshingCategories, setRefreshingCategories] = useState<string[]>([]);
  
  // Navigation state
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const loadNews = useCallback(async (category: NewsCategory, query?: string, isAutoRefresh = false) => {
    if (!isAutoRefresh) {
        setLoadingState({ 
        isLoading: true, 
        message: query ? `Investigando: "${query}"...` : `Sincronizando noticias en tiempo real...` 
        });
        if (!isAutoRefresh) setNewsData(null); 
        setSelectedArticle(null);
    }
    
    setError(null);

    try {
      // Pass isAutoRefresh as forceRefresh parameter
      const data = await fetchNewsUpdate(category, query, isAutoRefresh);
      
      // If auto-refreshing, only update if we got valid data
      if (isAutoRefresh && (!data || data.articles.length === 0)) {
          return; 
      }

      setNewsData(data);
      
      if (data.hashtags && data.hashtags.length > 0) {
        setTrendingTags(data.hashtags);
      }
    } catch (err: any) {
      console.error(err);
      if (!isAutoRefresh) setError("No pudimos conectar con el servicio de noticias.");
    } finally {
      setLoadingState({ isLoading: false, message: '' });
    }
  }, []);

  const handleRefreshCategory = async (category: NewsCategory) => {
    if (refreshingCategories.includes(category)) return;

    setRefreshingCategories(prev => [...prev, category]);
    console.log(`Refreshing category: ${category}`);
    
    try {
        const updatedData = await fetchNewsUpdate(category, undefined, true);
        
        setNewsData(prevData => {
            if (!prevData) return updatedData;
            
            // We overwrite the category for the new articles to ensure they are grouped correctly
            // and filter out old articles that belonged to this category.
            const newArticles = updatedData.articles.map(a => ({ ...a, category: category }));
            
            // Filter out old items of this category from the main list
            // We use a loose check (includes) because sometimes API returns slightly different strings
            // but for "Portada" view, we want to replace the block.
            const otherArticles = prevData.articles.filter(a => 
              a.category !== category && !a.category.includes(category)
            );
            
            return {
                ...prevData,
                articles: [...newArticles, ...otherArticles]
            };
        });

    } catch (e) {
        console.error("Failed to refresh category", e);
    } finally {
        setRefreshingCategories(prev => prev.filter(c => c !== category));
    }
  };

  // Initial Load
  useEffect(() => {
    if (!isSearchMode) {
        loadNews(currentCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  // Auto-Refresh Interval (Every 60 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
        // Only auto-refresh if we are in grid view (not reading an article) and not searching
        if (!selectedArticle && !isSearchMode) {
            console.log("Auto-refreshing news...");
            loadNews(currentCategory, undefined, true);
        }
    }, 60000); // 1 minute

    return () => clearInterval(intervalId);
  }, [currentCategory, selectedArticle, isSearchMode, loadNews]);

  const handleCategoryChange = (category: NewsCategory) => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSelectedArticle(null);
    setCurrentCategory(category);
  };

  const handleSearch = (query: string) => {
    setIsSearchMode(true);
    setSearchQuery(query);
    setSelectedArticle(null);
    loadNews(NewsCategory.PORTADA, query); // Use general search context
  };

  const handleTagClick = (tag: string) => {
     const cleanTag = tag.replace('#', '');
     handleSearch(`Noticias recientes sobre ${cleanTag}`);
  };

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrid = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-theme-bg text-theme-dark">
      <Header 
        currentCategory={currentCategory} 
        onCategoryChange={handleCategoryChange} 
      />

      {/* Simple Header Title */}
      {!selectedArticle && (
        <section className="pt-32 pb-10 px-6 text-center">
           <div className="relative z-10 max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-heading font-black text-theme-dark uppercase tracking-tight mb-2">
                {isSearchMode ? `Búsqueda: ${searchQuery}` : (currentCategory === NewsCategory.PORTADA ? 'Noticias Destacadas' : currentCategory)}
              </h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
                Actualización en vivo • {new Date().toLocaleDateString()}
              </p>
           </div>
        </section>
      )}

      {/* Spacer if article selected */}
      {selectedArticle && <div className="h-24"></div>}

      <main className="flex-grow container mx-auto px-4 md:px-8 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {selectedArticle ? (
              <NewsDetail 
                article={selectedArticle} 
                onBack={handleBackToGrid} 
              />
            ) : (
              <>
                <NewsGrid 
                  data={newsData} 
                  isLoading={loadingState.isLoading} 
                  error={error} 
                  currentCategory={currentCategory}
                  onArticleClick={handleArticleClick}
                  refreshingCategories={refreshingCategories}
                  onCategoryRefresh={handleRefreshCategory}
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8 hidden lg:block">
             <Sidebar 
                onSearch={handleSearch} 
                trendingTags={trendingTags}
                onTagClick={handleTagClick}
             />
             
             {/* Extra Widget for Elections */}
             <div className="bg-theme-dark p-8 rounded-4xl shadow-card text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-peru-red rounded-full opacity-20"></div>
                <h3 className="font-heading font-bold text-xl mb-2 relative z-10">Elecciones 2026</h3>
                <p className="text-sm text-gray-300 mb-4 relative z-10">Sigue el minuto a minuto de los candidatos y encuestas.</p>
                <button onClick={() => handleCategoryChange(NewsCategory.ELECCIONES)} className="w-full py-3 bg-white text-theme-dark rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors relative z-10">
                    Ver Cobertura
                </button>
             </div>
          </div>
        </div>
      </main>

      <footer className="bg-theme-dark text-white py-16 mt-12">
        <div className="container mx-auto px-8 text-center">
          <div className="w-12 h-12 bg-white text-theme-dark rounded-full flex items-center justify-center mx-auto mb-6 font-heading font-black text-xl">
              PP
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Noticias curadas por Inteligencia Artificial. Actualización cada 60 segundos.
          </p>
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} Punto Pe.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;