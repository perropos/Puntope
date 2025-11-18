import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { NewsArticle } from '../types';
import { fetchFullArticle } from '../services/geminiService';
import CommentsSection from './CommentsSection';

interface NewsDetailProps {
  article: NewsArticle;
  onBack: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ article, onBack }) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      // Scroll to top when loading new content
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const generatedText = await fetchFullArticle(article);
      setContent(generatedText);
      setLoading(false);
    };
    loadContent();
  }, [article]);

  // Scroll Animation Observer
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: "0px 0px -50px 0px"
    });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading, content]);

  return (
    <div className="bg-white rounded-4xl shadow-card overflow-hidden min-h-[80vh] relative animate-fade-in mb-10">
      {/* Navigation Header (Floating) */}
      <div className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center pointer-events-none">
         <button 
           onClick={onBack}
           className="pointer-events-auto bg-white/30 backdrop-blur-md hover:bg-white hover:text-black text-white border border-white/20 px-5 py-2.5 rounded-full flex items-center gap-2 transition-all font-bold text-sm uppercase tracking-wider shadow-lg group"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Inicio
         </button>
      </div>

      {/* Hero Section */}
      <div className="h-[50vh] w-full relative">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
           <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-4 animate-fade-in">
                <span className="bg-peru-red text-white text-xs px-3 py-1.5 rounded-full uppercase font-bold tracking-wider shadow-sm">
                  {article.category}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                  {article.source}
                </span>
                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider ml-auto">
                  {article.publishedTime}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-tight mb-4 drop-shadow-lg reveal-on-scroll">
                {article.title}
              </h1>
              
              <p className="text-lg text-gray-200 md:w-3/4 font-medium leading-relaxed drop-shadow-md reveal-on-scroll">
                {article.summary}
              </p>
           </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="bg-white relative -mt-6 rounded-t-4xl z-10 px-6 md:px-12 pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          
          {loading ? (
             <div className="max-w-3xl mx-auto py-8 animate-pulse">
                {/* Lead Paragraph Simulation */}
                <div className="space-y-3 mb-12">
                    <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-4/5"></div>
                </div>

                {/* Subheading Simulation */}
                <div className="h-8 bg-gray-300 rounded-lg w-2/3 mb-6"></div>

                {/* Body Paragraph Simulation */}
                <div className="space-y-3 mb-12">
                     <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-11/12"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                </div>

                {/* Visual/Quote Block Simulation */}
                <div className="h-56 bg-gray-100 rounded-3xl w-full mb-12 relative overflow-hidden border border-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                         <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    </div>
                </div>

                {/* Conclusion Paragraph Simulation */}
                <div className="space-y-3 mb-12">
                     <div className="h-4 bg-gray-200 rounded-full w-11/12"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                     <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                </div>

                {/* Status Indicator */}
                 <div className="flex justify-center mt-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest border border-gray-100 shadow-sm">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-peru-red opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-peru-red"></span>
                        </div>
                        Redactando Noticia con IA...
                    </div>
                </div>
             </div>
          ) : (
            <>
              {/* AI Content */}
              <div className="markdown-content text-gray-800 text-lg leading-relaxed reveal-on-scroll">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>

              {/* Disclaimer / References */}
              <div className="mt-16 border-t border-gray-100 pt-10 reveal-on-scroll">
                <div className="bg-theme-bg rounded-3xl p-8 relative overflow-hidden">
                   {/* Decorator */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 rounded-full translate-x-16 -translate-y-16 opacity-50"></div>

                   <h4 className="font-heading font-bold text-sm text-gray-400 uppercase tracking-widest mb-6 relative z-10">
                      Transparencia & Fuentes
                   </h4>
                   
                   <div className="flex flex-col md:flex-row gap-6 relative z-10">
                      <div className="flex-shrink-0">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-theme-dark shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                         </div>
                      </div>
                      <div>
                         <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                           Esta nota ha sido elaborada por la Inteligencia Artificial de <strong>Punto Pe</strong>, sintetizando información pública disponible en la web para brindarte un resumen objetivo y rápido.
                         </p>
                         <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Fuente Original:</span>
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-peru-red hover:text-red-700 hover:underline text-sm font-bold break-all transition-colors flex items-center gap-1"
                            >
                              {article.source}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mt-12 reveal-on-scroll">
                <CommentsSection articleId={article.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;