import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter } from 'lucide-react';
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

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'ALL' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
      <div className="bg-emerald-600 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('shop')}</h1>
          </div>
          <p className="text-emerald-100 max-w-2xl text-lg font-medium">
            {t('shopDesc')}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setFilter('ALL')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('categoryAll')}
          </button>
          <button 
            onClick={() => setFilter(ShopCategory.FOOD)}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === ShopCategory.FOOD ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('categoryFood')}
          </button>
          <button 
            onClick={() => setFilter(ShopCategory.STUFFS)}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === ShopCategory.STUFFS ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('categoryStuffs')}
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={t('searchPlaceholder') || "Search items..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700 uppercase tracking-wider">
                {item.category === ShopCategory.FOOD ? t('categoryFood') : t('categoryStuffs')}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-extrabold text-emerald-600">₹{item.price}</span>
                <button 
                  onClick={() => navigate(`/checkout/${item.id}`)}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors active:scale-95 shadow-sm"
                >
                  {t('buyNow')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600">No items found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
