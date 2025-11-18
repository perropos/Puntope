import React from 'react';
import { NewsResponse, NewsArticle, NewsCategory } from '../types';

interface NewsGridProps {
  data: NewsResponse | null;
  isLoading: boolean;
  error: string | null;
  currentCategory: NewsCategory;
  onArticleClick: (article: NewsArticle) => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({ data, isLoading, error, currentCategory, onArticleClick }) => {
  
  if (isLoading && !data) {
    return (
      <div className="space-y-12">
         {/* Skeleton Banner */}
         <div className="bg-white rounded-4xl h-80 animate-pulse bg-gray-200"></div>
         {/* Skeleton Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-4xl h-64 animate-pulse bg-gray-200"></div>
            ))}
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-12 rounded-4xl shadow-card text-center border-t-8 border-red-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">⚠️</div>
        <h3 className="font-heading font-bold text-2xl mb-3 text-theme-dark">Algo salió mal</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!data || data.articles.length === 0) {
    return (
      <div className="bg-white p-12 md:p-20 rounded-4xl shadow-card text-center">
        <h3 className="text-3xl md:text-4xl font-heading font-black text-theme-dark mb-6 leading-tight">
          Cargando noticias en tiempo real...
        </h3>
      </div>
    );
  }

  // --- Portada Logic (Grouped Sections) ---
  if (currentCategory === NewsCategory.PORTADA) {
    // Find a featured article (preferably Politics or Economy)
    const featured = data.articles.find(a => a.category.includes('Política') || a.category.includes('Elecciones')) || data.articles[0];
    
    // Helper to filter articles by category name loosely
    const getArticlesByCategory = (catName: string) => {
        return data.articles
            .filter(a => a.id !== featured.id) // Don't repeat featured
            .filter(a => a.category.toLowerCase().includes(catName.toLowerCase()) || a.category === catName)
            .slice(0, 4);
    };

    const sections = [
        { title: 'Política', items: getArticlesByCategory('Política') },
        { title: 'Economía', items: getArticlesByCategory('Economía') },
        { title: 'Seguridad Nacional', items: getArticlesByCategory('Seguridad') },
        { title: 'Sociales', items: getArticlesByCategory('Sociales') },
        { title: 'Elecciones 2026', items: getArticlesByCategory('Elecciones') },
    ];

    return (
        <div className="space-y-16">
            {/* --- MAIN BANNER (Reference Style) --- */}
            <div className="group relative bg-white rounded-4xl overflow-hidden shadow-soft transition-all hover:shadow-xl">
                <div className="flex flex-col md:flex-row h-full md:h-[450px]">
                    <div className="h-64 md:h-full md:w-7/12 overflow-hidden relative">
                        <img 
                            src={featured.imageUrl} 
                            alt={featured.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-6 left-6 bg-peru-red text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide z-10 shadow-lg">
                            Noticia Principal
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:hidden"></div>
                    </div>
                    <div className="p-8 md:p-12 md:w-5/12 flex flex-col justify-center bg-white relative">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <span className="text-peru-red">{featured.category}</span>
                            <span>•</span>
                            <span>{featured.source}</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-heading font-black text-theme-dark mb-6 leading-tight">
                            {featured.title}
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed line-clamp-4">
                            {featured.summary}
                        </p>
                        <div>
                            <button 
                                onClick={() => onArticleClick(featured)}
                                className="inline-block px-8 py-3 bg-theme-dark text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Leer Artículo Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTIONS --- */}
            {sections.map((section) => (
                section.items.length > 0 && (
                    <section key={section.title} className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8 border-b-2 border-gray-200 pb-2">
                            <h3 className="text-2xl font-heading font-black text-theme-dark uppercase tracking-tight">
                                {section.title}
                            </h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                                Actualizado hace 1 min
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {section.items.map((article) => (
                                <article 
                                    key={article.id} 
                                    className="bg-white rounded-3xl overflow-hidden shadow-card flex flex-col group hover:-translate-y-2 transition-transform duration-300 cursor-pointer h-full"
                                    onClick={() => onArticleClick(article)}
                                >
                                    <div className="relative h-40 overflow-hidden">
                                        <img 
                                            src={article.imageUrl} 
                                            alt={article.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                                            {article.source}
                                        </span>
                                        <h4 className="text-sm font-heading font-bold text-theme-dark mb-3 leading-snug flex-1 line-clamp-3 group-hover:text-peru-red transition-colors">
                                            {article.title}
                                        </h4>
                                        <div className="pt-3 mt-auto border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400">Leér más</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-theme-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )
            ))}
        </div>
    );
  }

  // --- Category View (Standard Grid) ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 px-2">
         <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
           {data.articles.length} Noticias encontradas
         </span>
         <span className="text-xs font-bold text-peru-red flex items-center gap-1">
           <span className="w-2 h-2 bg-peru-red rounded-full animate-pulse"></span>
           EN VIVO
         </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.articles.map((article) => (
            <article key={article.id} className="bg-white rounded-4xl overflow-hidden shadow-card flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-56 overflow-hidden">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-theme-dark text-xs font-bold px-3 py-1 rounded-full">
                        {article.source}
                    </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-2">
                        <span className="text-peru-red text-xs font-bold uppercase tracking-widest">
                            {article.category}
                        </span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-theme-dark mb-3 leading-snug group-hover:text-gray-600 transition-colors">
                        {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">
                        {article.summary}
                    </p>
                    <div>
                        <button 
                            onClick={() => onArticleClick(article)}
                            className="inline-flex items-center gap-2 text-sm font-bold text-theme-dark uppercase tracking-wide group-hover:gap-3 transition-all"
                        >
                            Leer noticia
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;