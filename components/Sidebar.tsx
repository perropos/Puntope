import React, { useState } from 'react';

interface SidebarProps {
  onSearch: (query: string) => void;
  trendingTags: string[];
  onTagClick: (tag: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSearch, trendingTags, onTagClick }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  return (
    <aside className="space-y-8">
      {/* Search Widget */}
      <div className="bg-white p-8 rounded-4xl shadow-card text-center">
        <h3 className="font-heading text-xl font-bold text-theme-dark mb-6">
          Búsqueda Específica
        </h3>
        <form onSubmit={handleSubmit} className="relative">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Dina Boluarte, Congreso..."
            className="w-full pl-5 pr-12 py-4 bg-theme-bg rounded-full text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
            <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 w-10 bg-theme-dark text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </button>
        </form>
      </div>

      {/* Trending Widget */}
      <div className="bg-white p-8 rounded-4xl shadow-card">
        <h3 className="font-heading text-xl font-bold text-theme-dark mb-6 text-center">
          Tendencias Ahora
        </h3>
        <ul className="flex flex-col gap-3">
          {trendingTags.map((tag, index) => (
            <li key={index}>
                <button 
                    onClick={() => onTagClick(tag)}
                    className="w-full flex items-center justify-between px-5 py-3 rounded-2xl border border-gray-100 hover:bg-theme-dark hover:text-white hover:border-theme-dark transition-all duration-300 group"
                >
                    <span className="font-bold text-sm tracking-wide">{tag}</span>
                    <span className="text-gray-300 text-lg group-hover:text-white">#</span>
                </button>
            </li>
          ))}
        </ul>
      </div>

      {/* About / Quote Widget */}
      <div className="bg-peru-red p-8 rounded-4xl shadow-card text-center text-white">
        <div className="text-4xl mb-4 opacity-50">”</div>
        <p className="font-serif italic text-lg mb-4">
          La política es el arte de buscar problemas, encontrarlos, hacer un diagnóstico falso y aplicar después los remedios equivocados.
        </p>
        <div className="w-10 h-1 bg-white/30 mx-auto rounded-full mb-2"></div>
        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Groucho Marx</span>
      </div>
    </aside>
  );
};

export default Sidebar;