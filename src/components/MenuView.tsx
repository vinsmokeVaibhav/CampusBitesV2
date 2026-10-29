import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory, CartItem } from '../types/database';
import { DietaryBadge } from './DietaryBadge';
import { formatINR } from '../utils/pricing';
import { calculateEstimatedPrepTime } from '../utils/queue';
import { Search, Flame, Clock, Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';

interface MenuViewProps {
  menuItems: MenuItem[];
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  activeQueueCount: number;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  activeQueueCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'jain'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const prepTimeInfo = useMemo(() => {
    return calculateEstimatedPrepTime(activeQueueCount, 7);
  }, [activeQueueCount]);

  // Filtered menu
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Dietary filter
      if (dietaryFilter === 'veg' && !item.is_veg) {
        return false;
      }
      if (dietaryFilter === 'non-veg' && item.is_veg) {
        return false;
      }
      if (dietaryFilter === 'jain' && !item.is_jain) {
        return false;
      }
      // In stock filter
      if (inStockOnly && !item.in_stock) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, inStockOnly, searchQuery]);

  const categories: (MenuCategory | 'All')[] = ['All', 'Breakfast', 'Mains', 'Beverages', 'Quick Grab'];

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Dynamic Queue-Calculated Wait Time Banner */}
      <section
        aria-labelledby="kitchen-status-heading"
        className="bg-white border-2 border-[#1e1b18] rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_#1e1b18] transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-[#d94e1f] rounded-lg border border-orange-200">
              <Clock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="kitchen-status-heading" className="text-lg font-black text-[#1e1b18] tracking-tight">
                Live Kitchen Queue Status
              </h2>
              <p className="text-sm font-semibold text-stone-700 mt-0.5">
                {prepTimeInfo.displayStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping inline-block" />
            <span>Counter 1, 2 & 3 Preparing</span>
          </div>
        </div>
      </section>

      {/* Smart Search & Filter Control Bar */}
      <section aria-labelledby="filters-heading" className="space-y-4">
        <h2 id="filters-heading" className="sr-only">
          Menu Filtering and Search
        </h2>

        {/* Search Input Bar */}
        <div className="relative">
          <label htmlFor="canteen-search" className="sr-only">
            Search live canteen dishes by name or ingredient
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <input
            id="canteen-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search freshly made dosas, thalis, chai, snacks..."
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#1e1b18] rounded-lg text-sm font-medium placeholder-stone-400 focus:outline-hidden shadow-[2px_2px_0px_#1e1b18]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-stone-500 hover:text-black cursor-pointer"
              aria-label="Clear search input"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Tab Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Menu categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap border-2 border-[#1e1b18] cursor-pointer transition-transform ${
                selectedCategory === cat
                  ? 'bg-[#1e1b18] text-white shadow-[2px_2px_0px_#d94e1f]'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              {cat === 'All' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Dietary & Stock Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Dietary preferences">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border ${
                dietaryFilter === 'all'
                  ? 'bg-stone-800 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
              aria-pressed={dietaryFilter === 'all'}
            >
              All Diets
            </button>

            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-white text-emerald-800 border-emerald-400 hover:bg-emerald-50'
              }`}
              aria-pressed={dietaryFilter === 'veg'}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Pure Veg
            </button>

            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-amber-950 text-white border-black'
                  : 'bg-white text-amber-950 border-amber-800 hover:bg-amber-50'
              }`}
              aria-pressed={dietaryFilter === 'non-veg'}
            >
              <span className="w-2 h-2 rounded-full bg-amber-900 inline-block" />
              Non-Veg
            </button>

            <button
              onClick={() => setDietaryFilter('jain')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold border ${
                dietaryFilter === 'jain'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white text-amber-800 border-amber-400 hover:bg-amber-50'
              }`}
              aria-pressed={dietaryFilter === 'jain'}
            >
              Jain Compatible
            </button>
          </div>

          {/* Availability Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800 select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-[#d94e1f] rounded border-2 border-stone-800 focus:ring-0 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </section>

      {/* Menu Grid */}
      <section aria-labelledby="live-menu-list">
        <div className="flex items-center justify-between mb-3">
          <h2 id="live-menu-list" className="text-base font-extrabold text-[#1e1b18]">
            Available Dishes ({filteredItems.length})
          </h2>
          <span className="text-xs text-stone-600 font-medium">Freshly cooked to order</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-stone-800">No dishes match your selection</h3>
            <p className="text-sm text-stone-600 mt-1">Try resetting filters or searching for another dish.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setDietaryFilter('all');
                setInStockOnly(false);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#1e1b18] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const inCartItem = cartItems.find((ci) => ci.menuItem.id === item.id);
              const qtyInCart = inCartItem ? inCartItem.quantity : 0;

              return (
                <article
                  key={item.id}
                  className={`bg-white border-2 border-[#1e1b18] rounded-xl overflow-hidden shadow-[3px_3px_0px_#1e1b18] flex flex-col justify-between transition-transform hover:-translate-y-0.5 ${
                    !item.in_stock ? 'opacity-85 bg-stone-50' : ''
                  }`}
                >
                  <div>
                    {/* Food Photo Container */}
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden border-b-2 border-[#1e1b18]">
                      <img
                        src={item.image_url}
                        alt={item.image_alt}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                          !item.in_stock ? 'grayscale-[60%]' : ''
                        }`}
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="bg-white/95 backdrop-blur-xs border border-stone-400 px-2 py-0.5 rounded shadow-xs">
                          <DietaryBadge isVeg={item.is_veg} isJain={item.is_jain} size="sm" />
                        </span>

                        <span className="bg-[#1e1b18]/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        {item.in_stock ? (
                          <span className="bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            In Stock
                          </span>
                        ) : (
                          <span className="bg-rose-800 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Dynamic Social Proof Metric */}
                      <div className="absolute bottom-2 left-2.5 bg-black/75 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" aria-hidden="true" />
                        <span>Ordered {item.ordered_today_count} times today</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-[#1e1b18] leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-extrabold text-lg text-[#1e1b18] whitespace-nowrap">
                          {formatINR(item.price)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-stone-600 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                          <span>Prep: ~{item.prep_time_mins} mins</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">100% Fresh Counter</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-4 pt-1">
                    {!item.in_stock ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-stone-200 text-stone-500 font-bold text-xs rounded-lg cursor-not-allowed border border-stone-300 text-center"
                        aria-disabled="true"
                      >
                        Currently Sold Out
                      </button>
                    ) : qtyInCart > 0 ? (
                      /* Quantity Control when item already in cart */
                      <div className="flex items-center justify-between bg-stone-100 border-2 border-[#1e1b18] rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded bg-white hover:bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-stone-800 cursor-pointer"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span
                          className="font-extrabold text-sm text-[#1e1b18] px-2"
                          aria-label={`${qtyInCart} of ${item.name} in cart`}
                        >
                          {qtyInCart} in Tray
                        </span>

                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded bg-[#d94e1f] hover:bg-[#c24218] text-white flex items-center justify-center font-bold cursor-pointer"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Explicit Action Button with Dish Name and Price */
                      <button
                        onClick={() => onAddToCart(item)}
                        className="w-full py-2.5 bg-[#d94e1f] hover:bg-[#c24218] text-white font-extrabold text-xs sm:text-sm rounded-lg border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        aria-label={`Add ${item.name} to Cart – ${formatINR(item.price)}`}
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Add to Tray – {formatINR(item.price)}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
