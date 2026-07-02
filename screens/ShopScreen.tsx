import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, Star, Sparkles, PawPrint } from 'lucide-react';
import { ShopItem, ShopCategory } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ShopScreenProps {
  items: ShopItem[];
}

const ShopScreen: React.FC<ShopScreenProps> = ({ items }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | ShopCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'ALL' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { key: 'ALL', label: t('categoryAll') },
    { key: ShopCategory.FOOD, label: t('categoryFood') },
    { key: ShopCategory.STUFFS, label: t('categoryStuffs') },
  ];

  return (
    <div className={`space-y-6 md:space-y-8 pb-28 md:pb-0 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden spotlight-card">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-[0.07] rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-300 opacity-[0.1] rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-[10%] opacity-[0.04] pointer-events-none">
          <PawPrint className="w-40 h-40 text-white rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl neon-glow animate-bounce-subtle">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('shop')}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span className="text-emerald-100/80 text-xs font-bold uppercase tracking-wider">Premium Collection</span>
              </div>
            </div>
          </div>
          <p className="text-emerald-100/90 max-w-2xl text-lg font-medium leading-relaxed">
            {t('shopDesc')}
          </p>
        </div>
      </div>

      {/* Filter Bar — pill-style with sliding indicator */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto relative">
          {filters.map(f => (
            <button 
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative z-10 ${
                filter === f.key 
                  ? 'bg-white text-emerald-600 shadow-md shadow-emerald-100/30' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={t('searchPlaceholder') || "Search items..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none font-medium transition-all input-glow"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, i) => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group flex flex-col card-lift spotlight-card animate-slide-in-bottom"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Category badge */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-gray-700 uppercase tracking-wider shadow-sm">
                {item.category === ShopCategory.FOOD ? t('categoryFood') : t('categoryStuffs')}
              </div>

              {/* New badge with shimmer */}
              {i < 2 && (
                <div className="absolute top-3 right-12 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider shadow-sm animate-badge-pop shine-button">
                  New
                </div>
              )}
              
              {/* Wishlist heart */}
              <button 
                onClick={(e) => toggleWishlist(item.id, e)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
              >
                <Heart 
                  className={`w-4 h-4 transition-all duration-300 ${
                    wishlisted.has(item.id) 
                      ? 'text-rose-500 fill-rose-500 scale-110' 
                      : 'text-gray-400 hover:text-rose-400'
                  }`}
                />
              </button>
            </div>
            
            {/* Product Info */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-[10px] text-gray-400 font-medium ml-1">(4.8)</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                <span className="text-xl font-extrabold text-emerald-600">₹{item.price}</span>
                <button 
                  onClick={() => navigate(`/checkout/${item.id}`)}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-sm hover:shadow-lg hover:shadow-emerald-200/30 shine-button"
                >
                  {t('buyNow')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-200 transition-all group">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-50 transition-colors">
            <ShoppingBag className="w-10 h-10 text-gray-300 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-600">No items found</h3>
          <p className="text-gray-400 mt-2 text-sm">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
