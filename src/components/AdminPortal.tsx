import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, MenuItem } from '../types/database';
import { CanteenStore } from '../db/store';
import { formatINR } from '../utils/pricing';
import {
  Flame,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  Package,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Lock,
  LogOut,
  Sliders,
  DollarSign,
  UtensilsCrossed
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated for seamless demo, with toggleable logout/login
  const [emailInput, setEmailInput] = useState<string>('admin@campusbite.edu');
  const [passwordInput, setPasswordInput] = useState<string>('ChefAdmin#2026');
  const [authError, setAuthError] = useState<string>('');
  const [loginAttempts, setLoginAttempts] = useState<number>(0);

  // KDS View Tab: 'kds' | 'menu_manage'
  const [activeTab, setActiveTab] = useState<'kds' | 'menu_manage'>('kds');

  // Orders and Menu Data from Store
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const refreshData = () => {
      setOrders(CanteenStore.getOrders());
      setMenuItems(CanteenStore.getMenuItems());
    };
    refreshData();
    return CanteenStore.subscribe(refreshData);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAttempts >= 5) {
      setAuthError('Too many failed attempts. Rate limited for 60 seconds.');
      return;
    }

    if (
      (emailInput === 'admin@campusbite.edu' && passwordInput === 'ChefAdmin#2026') ||
      (emailInput === 'staff@campusbite.edu' && passwordInput === 'CounterPass#2026')
    ) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setLoginAttempts((prev) => prev + 1);
      setAuthError('Invalid credentials. Use demo: admin@campusbite.edu / ChefAdmin#2026');
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    CanteenStore.updateOrderStatus(orderId, newStatus);
  };

  const handleToggleStock = (itemId: string, currentStock: boolean) => {
    CanteenStore.toggleItemStock(itemId, !currentStock);
  };

  const handleResetData = () => {
    if (confirm('Reset orders and menu inventory back to default demonstration seed data?')) {
      CanteenStore.resetToDefaults();
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = o.order_id.toLowerCase().includes(q);
      const matchName = o.student_name.toLowerCase().includes(q);
      const matchRoll = o.student_roll.toLowerCase().includes(q);
      const matchToken = o.token_number.includes(q);
      if (!matchId && !matchName && !matchRoll && !matchToken) return false;
    }
    return true;
  });

  const stats = CanteenStore.getStats();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border-2 border-[#1e1b18] rounded-xl p-6 sm:p-8 shadow-[5px_5px_0px_#1e1b18]">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 bg-[#1e1b18] text-white rounded-xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6 text-[#d94e1f]" />
          </div>
          <h1 className="text-xl font-black text-[#1e1b18]">Canteen Staff &amp; KDS Login</h1>
          <p className="text-xs text-stone-600">Access restricted to authorized canteen kitchen personnel.</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 mb-5 space-y-1">
          <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800 block">
            Demo Kitchen Staff Credentials
          </span>
          <p>
            Email: <strong className="font-mono">admin@campusbite.edu</strong>
          </p>
          <p>
            Password: <strong className="font-mono">ChefAdmin#2026</strong>
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-[#1e1b18] mb-1">
              Staff Email / ID
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-medium focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-bold text-[#1e1b18] mb-1">
              Secret Password
            </label>
            <input
              id="admin-pass"
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-medium focus:outline-hidden"
            />
          </div>

          {authError && (
            <div role="alert" className="p-2.5 bg-rose-50 border border-rose-300 rounded text-xs text-rose-800 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1e1b18] hover:bg-stone-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg border-2 border-[#1e1b18] cursor-pointer shadow-[2px_2px_0px_#d94e1f]"
          >
            Authenticate &amp; Launch KDS
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top Admin Operational Header */}
      <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-5 shadow-[4px_4px_0px_#1e1b18] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-black text-[#1e1b18]">
              Kitchen Display System (KDS) &bull; Central Canteen
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Logged in as <strong>Chef Rajesh Sharma (Head Kitchen)</strong> &bull; Role: Kitchen Administrator
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <button
            onClick={() => setActiveTab('kds')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border-2 cursor-pointer transition-colors ${
              activeTab === 'kds'
                ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
            }`}
          >
            Live Kitchen Queue
          </button>

          <button
            onClick={() => setActiveTab('menu_manage')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border-2 cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'menu_manage'
                ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stock Inventory ({menuItems.length})</span>
          </button>

          <button
            onClick={handleResetData}
            title="Reset to fresh sample orders and menu items"
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-300 cursor-pointer flex items-center gap-1"
            aria-label="Logout from Kitchen Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <section aria-labelledby="kds-metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <h2 id="kds-metrics" className="sr-only">
          Kitchen Metrics
        </h2>

        <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-3.5 shadow-[2px_2px_0px_#1e1b18]">
          <span className="text-[11px] font-black uppercase text-stone-500 block">Orders In Queue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-[#d94e1f]">
              {stats.activeQueueCount}
            </span>
            <span className="text-xs font-bold text-stone-600">Pending Kitchen</span>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-3.5 shadow-[2px_2px_0px_#1e1b18]">
          <span className="text-[11px] font-black uppercase text-stone-500 block">Ready At Counter</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-700">
              {orders.filter((o) => o.status === 'COOKED').length}
            </span>
            <span className="text-xs font-bold text-stone-600">Pickup Counter #2</span>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-3.5 shadow-[2px_2px_0px_#1e1b18]">
          <span className="text-[11px] font-black uppercase text-stone-500 block">Total Shift Orders</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-stone-900">
              {stats.totalOrdersToday}
            </span>
            <span className="text-xs font-bold text-stone-600">All Counters</span>
          </div>
        </div>

        <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-3.5 shadow-[2px_2px_0px_#1e1b18]">
          <span className="text-[11px] font-black uppercase text-stone-500 block">Shift Revenue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-[#1e1b18]">
              {formatINR(stats.totalRevenueToday)}
            </span>
            <span className="text-xs font-bold text-emerald-700">Settled</span>
          </div>
        </div>
      </section>

      {/* TAB 1: KITCHEN DISPLAY SYSTEM */}
      {activeTab === 'kds' && (
        <div className="space-y-5">
          {/* KDS Search & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Token (e.g. 8492), or Student Roll..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1e1b18] rounded-lg text-xs font-medium focus:outline-hidden"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Status filters">
              {(['ALL', 'TAKEN', 'COOKING', 'COOKED', 'PICKED_UP', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                  aria-pressed={statusFilter === st}
                >
                  {st === 'ALL' ? 'All Orders' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid / Kanban Card Layout */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-8 text-center">
              <Package className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <h3 className="font-bold text-stone-800">No orders in this filter</h3>
              <p className="text-xs text-stone-600 mt-1">Try switching to 'All Orders' or clearing your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrders.map((order) => {
                const elapsedMins = Math.max(
                  1,
                  Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
                );

                return (
                  <article
                    key={order.order_id}
                    className={`bg-white border-2 border-[#1e1b18] rounded-xl p-4 shadow-[3px_3px_0px_#1e1b18] flex flex-col justify-between space-y-4 ${
                      order.status === 'COOKED'
                        ? 'border-emerald-700 ring-2 ring-emerald-500/30'
                        : order.status === 'COOKING'
                        ? 'border-amber-600 ring-2 ring-amber-500/20'
                        : order.status === 'CANCELLED'
                        ? 'opacity-75 bg-stone-50'
                        : ''
                    }`}
                  >
                    <div>
                      {/* Order Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black font-mono text-sm text-[#1e1b18]">
                              #{order.order_id}
                            </span>
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              PAID
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-stone-900 mt-0.5">
                            {order.student_name}{' '}
                            <span className="font-mono text-stone-500">({order.student_roll})</span>
                          </h3>
                        </div>

                        {/* Big Token Badge */}
                        <div className="bg-[#1e1b18] text-white px-2.5 py-1 rounded-lg text-center shrink-0">
                          <span className="text-[9px] uppercase tracking-wider text-orange-400 font-bold block">
                            TOKEN
                          </span>
                          <span className="font-mono-token text-base font-black">
                            {order.token_number}
                          </span>
                        </div>
                      </div>

                      {/* Timing & Pickup Slot Info */}
                      <div className="flex items-center justify-between text-xs py-2 text-stone-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{elapsedMins} mins ago</span>
                        </span>

                        <span className="font-bold text-[#d94e1f] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[11px]">
                          {order.pickup_slot}
                        </span>
                      </div>

                      {/* Itemized Dish List */}
                      <div className="bg-[#f7f6f2] border border-stone-300 rounded-lg p-2.5 space-y-1.5 my-2">
                        <span className="text-[10px] font-black uppercase text-stone-500 block">
                          Items to Prepare:
                        </span>
                        {order.items.map((it) => (
                          <div key={it.id} className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-[#1e1b18]">
                              <span className="bg-[#1e1b18] text-white px-1.5 py-0.2 rounded mr-1.5 font-mono text-[11px]">
                                {it.quantity}x
                              </span>
                              {it.item_name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total and Current Status */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-stone-500">
                          Bill: <strong className="text-black font-mono">{formatINR(order.total_amount)}</strong>
                        </span>

                        <span
                          className={`font-black text-[11px] px-2 py-0.5 rounded border uppercase tracking-wide ${
                            order.status === 'COOKED'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                              : order.status === 'COOKING'
                              ? 'bg-amber-100 text-amber-950 border-amber-400'
                              : order.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-950 border-rose-400'
                              : 'bg-blue-100 text-blue-950 border-blue-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* 3-State Status Controller Buttons */}
                    <div className="border-t border-stone-200 pt-3 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-stone-500 block">
                        Kitchen Status Controller:
                      </span>

                      <div className="grid grid-cols-2 gap-1.5">
                        {/* 1. Mark as Taken */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.order_id, 'TAKEN')}
                          disabled={order.status === 'TAKEN' || order.status === 'CANCELLED'}
                          className={`py-2 px-2 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 cursor-pointer ${
                            order.status === 'TAKEN'
                              ? 'bg-blue-700 text-white border-blue-800'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                          aria-label={`Mark order #${order.order_id} as Taken`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>📥 Taken</span>
                        </button>

                        {/* 2. Mark as Cooking */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.order_id, 'COOKING')}
                          disabled={order.status === 'COOKING' || order.status === 'CANCELLED'}
                          className={`py-2 px-2 text-[11px] font-bold rounded-lg border flex items-center justify-center gap-1 cursor-pointer ${
                            order.status === 'COOKING'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                          aria-label={`Mark order #${order.order_id} as Cooking`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>🔥 Cooking</span>
                        </button>

                        {/* 3. Mark as Cooked */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.order_id, 'COOKED')}
                          disabled={order.status === 'COOKED' || order.status === 'CANCELLED'}
                          className={`col-span-2 py-2 px-2 text-xs font-black rounded-lg border-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                            order.status === 'COOKED'
                              ? 'bg-emerald-700 text-white border-emerald-900'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-600'
                          }`}
                          aria-label={`Mark order #${order.order_id} as Cooked – notify student`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✅ Mark as Cooked (Notify Student)</span>
                        </button>
                      </div>

                      {/* Complete / Picked up option */}
                      {order.status === 'COOKED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.order_id, 'PICKED_UP')}
                          className="w-full mt-1 py-1.5 text-[11px] font-bold text-stone-700 hover:text-black bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer flex items-center justify-center gap-1"
                          aria-label={`Mark order #${order.order_id} as Picked Up`}
                        >
                          <Package className="w-3 h-3" />
                          <span>Student Picked Up / Handover Complete</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'menu_manage' && (
        <section aria-labelledby="inventory-management-title" className="bg-white border-2 border-[#1e1b18] rounded-xl p-5 shadow-[4px_4px_0px_#1e1b18] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h2 id="inventory-management-title" className="text-lg font-black text-[#1e1b18]">
                Canteen Live Menu &amp; Inventory Toggles
              </h2>
              <p className="text-xs text-stone-600">
                Mark items In Stock or Out of Stock in real-time. Changes instantly reflect on student screens.
              </p>
            </div>
            <span className="text-xs font-bold text-stone-500">
              {menuItems.filter((i) => i.in_stock).length} of {menuItems.length} In Stock
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1e1b18] bg-stone-100">
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Dish Name</th>
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Category</th>
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Price</th>
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Avg Prep</th>
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Ordered Today</th>
                  <th className="py-2.5 px-3 font-black text-[#1e1b18]">Live Stock Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50">
                    <td className="py-3 px-3 font-bold text-[#1e1b18] flex items-center gap-2">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-8 h-8 rounded object-cover border border-stone-300"
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-700">{item.category}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#1e1b18]">{formatINR(item.price)}</td>
                    <td className="py-3 px-3 text-stone-600 font-medium">~{item.prep_time_mins} mins</td>
                    <td className="py-3 px-3 font-bold text-amber-800">{item.ordered_today_count} times</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item.id, item.in_stock)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border-2 cursor-pointer flex items-center gap-1.5 transition-all ${
                          item.in_stock
                            ? 'bg-emerald-700 text-white border-emerald-900 shadow-xs'
                            : 'bg-rose-100 text-rose-900 border-rose-500'
                        }`}
                        aria-label={`Toggle stock for ${item.name}: currently ${
                          item.in_stock ? 'In Stock' : 'Sold Out'
                        }`}
                      >
                        {item.in_stock ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
