import React from 'react';
import { ShoppingBag, Utensils, Clock, ShieldCheck, Flame } from 'lucide-react';
import { formatINR } from '../utils/pricing';

interface NavbarProps {
  currentView: 'menu' | 'payment' | 'tracker' | 'admin';
  onNavigate: (view: 'menu' | 'payment' | 'tracker' | 'admin') => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  activeQueueCount: number;
  activeOrderId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  cartTotal,
  onOpenCart,
  activeQueueCount,
  activeOrderId,
}) => {
  return (
    <>
      {/* Accessible skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#d94e1f] focus:text-white focus:px-4 focus:py-2 focus:font-bold focus:shadow-lg focus:rounded"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 bg-[#fafafa] border-b-2 border-[#1e1b18] shadow-xs">
        {/* Top Operational Status Banner */}
        <div className="bg-[#1e1b18] text-[#fafafa] px-4 py-1.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="font-semibold text-emerald-400">Live Kitchen Open:</span>
            <span>Counter 1, 2 & 3 Serving Fresh Meals</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-300 hidden sm:inline">
              FSSAI Lic: <strong className="text-white font-mono">10026011004921</strong>
            </span>
            <span className="bg-amber-900/80 text-amber-200 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] font-bold">
              {activeQueueCount} {activeQueueCount === 1 ? 'Order' : 'Orders'} in Prep Queue
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('menu')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-2"
              aria-label="CampusBite Home – Browse Menu"
            >
              <div className="w-10 h-10 rounded-lg bg-[#d94e1f] text-white flex items-center justify-center font-black text-xl shadow-sm border border-[#1e1b18] group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#1e1b18] block leading-tight">
                  Campus<span className="text-[#d94e1f]">Bite</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-600 block uppercase tracking-wider">
                  College Central Canteen
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('menu')}
              className={`px-3.5 py-2 rounded-md font-bold text-sm cursor-pointer transition-colors ${
                currentView === 'menu'
                  ? 'bg-[#1e1b18] text-white shadow-xs'
                  : 'text-[#1e1b18] hover:bg-stone-200'
              }`}
              aria-current={currentView === 'menu' ? 'page' : undefined}
            >
              Live Menu
            </button>

            <button
              onClick={() => onNavigate('tracker')}
              className={`px-3.5 py-2 rounded-md font-bold text-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                currentView === 'tracker'
                  ? 'bg-[#1e1b18] text-white shadow-xs'
                  : 'text-[#1e1b18] hover:bg-stone-200'
              }`}
              aria-current={currentView === 'tracker' ? 'page' : undefined}
            >
              <Clock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Order Tracker
              {activeOrderId && (
                <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`px-3.5 py-2 rounded-md font-bold text-sm cursor-pointer transition-colors flex items-center gap-1.5 border border-stone-300 ${
                currentView === 'admin'
                  ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                  : 'text-stone-800 hover:bg-stone-200'
              }`}
              aria-current={currentView === 'admin' ? 'page' : undefined}
            >
              <Flame className="w-4 h-4 text-[#d94e1f]" aria-hidden="true" />
              Kitchen Admin (KDS)
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                Staff
              </span>
            </button>
          </nav>

          {/* Right Action: Cart Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 bg-[#d94e1f] hover:bg-[#c24218] text-white font-bold px-4 py-2.5 rounded-lg shadow-sm border border-[#1e1b18] transition-transform active:scale-95 cursor-pointer"
              aria-label={`View your shopping cart: ${cartCount} items, total ${formatINR(cartTotal)}`}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">My Tray</span>
              <span className="bg-white text-[#d94e1f] font-black text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
              {cartCount > 0 && (
                <span className="hidden sm:inline font-mono text-xs border-l border-orange-400 pl-2">
                  {formatINR(cartTotal)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-stone-200 bg-[#f7f6f2] px-3 py-2 flex items-center justify-around gap-1 text-xs">
          <button
            onClick={() => onNavigate('menu')}
            className={`flex-1 py-1.5 text-center font-bold rounded ${
              currentView === 'menu' ? 'bg-[#1e1b18] text-white' : 'text-stone-800'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => onNavigate('tracker')}
            className={`flex-1 py-1.5 text-center font-bold rounded flex items-center justify-center gap-1 ${
              currentView === 'tracker' ? 'bg-[#1e1b18] text-white' : 'text-stone-800'
            }`}
          >
            Tracker {activeOrderId && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`flex-1 py-1.5 text-center font-bold rounded flex items-center justify-center gap-1 ${
              currentView === 'admin' ? 'bg-[#1e1b18] text-white' : 'text-stone-800'
            }`}
          >
            Admin KDS
          </button>
        </div>
      </header>
    </>
  );
};
