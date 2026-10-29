/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MenuView } from './components/MenuView';
import { CartDrawer } from './components/CartDrawer';
import { PaymentView } from './components/PaymentView';
import { OrderTrackerView } from './components/OrderTrackerView';
import { AdminPortal } from './components/AdminPortal';
import { LegalModals, CookieBanner } from './components/LegalModals';
import { Footer } from './components/Footer';
import { CanteenStore } from './db/store';
import { CartItem, MenuItem, PaymentMethod, Order, Payment } from './types/database';
import { calculateSubtotal, calculateGST, calculateTotal, formatINR } from './utils/pricing';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'menu' | 'payment' | 'tracker' | 'admin'>('menu');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activePolicy, setActivePolicy] = useState<'terms' | 'privacy' | 'refunds' | 'cookies' | null>(null);

  // Student checkout session info
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    roll: string;
    contact: string;
    pickupSlot: string;
    notes?: string;
  }>({
    name: 'Aarav Sharma',
    roll: '2024CS0842',
    contact: '+91-9876543210',
    pickupSlot: 'Immediate (Next in line)',
  });

  const [activeOrderId, setActiveOrderId] = useState<string>('CB-8492');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeQueueCount, setActiveQueueCount] = useState<number>(3);

  // Subscribe to live CanteenStore changes
  useEffect(() => {
    const syncData = () => {
      setMenuItems(CanteenStore.getMenuItems());
      const stats = CanteenStore.getStats();
      setActiveQueueCount(stats.activeQueueCount);
    };

    syncData();
    return CanteenStore.subscribe(syncData);
  }, []);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter((ci): ci is CartItem => ci !== null);
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const cartCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const cartSubtotal = calculateSubtotal(cartItems);
  const cartTax = calculateGST(cartSubtotal);
  const cartGrandTotal = calculateTotal(cartSubtotal, cartTax);

  const handleProceedToPayment = (info: typeof studentInfo) => {
    setStudentInfo(info);
    setIsCartOpen(false);
    setCurrentView('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (paymentDetails: {
    method: PaymentMethod;
    transactionRef: string;
    amount: number;
  }) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `CB-${randomSuffix}`;
    const tokenNumber = `${randomSuffix}`;
    const assignedCounter = Math.floor(Math.random() * 3) + 1; // Counter 1, 2, or 3

    const newOrder: Order = {
      order_id: newOrderId,
      student_name: studentInfo.name,
      student_roll: studentInfo.roll,
      student_phone: studentInfo.contact,
      items: cartItems.map((ci, idx) => ({
        id: `oi-${Date.now()}-${idx}`,
        order_id: newOrderId,
        menu_item_id: ci.menuItem.id,
        item_name: ci.menuItem.name,
        quantity: ci.quantity,
        unit_price: ci.menuItem.price,
      })),
      subtotal: cartSubtotal,
      tax_gst: cartTax,
      total_amount: cartGrandTotal,
      status: 'TAKEN', // In kitchen queue
      pickup_slot: studentInfo.pickupSlot,
      counter_no: assignedCounter,
      token_number: tokenNumber,
      consent_recorded: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newPayment: Payment = {
      payment_id: `pay-${randomSuffix}`,
      order_id: newOrderId,
      amount: cartGrandTotal,
      method: paymentDetails.method,
      transaction_ref: paymentDetails.transactionRef,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    };

    // Commit to persistent relational store
    CanteenStore.createOrder(newOrder, newPayment);

    // Clear cart and switch to Order Tracker
    setCartItems([]);
    setActiveOrderId(newOrderId);
    setCurrentView('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f6f2] text-[#1e1b18]">
      {/* Top Header / Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartCount}
        cartTotal={cartGrandTotal}
        onOpenCart={() => setIsCartOpen(true)}
        activeQueueCount={activeQueueCount}
        activeOrderId={activeOrderId}
      />

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'menu' && (
          <MenuView
            menuItems={menuItems}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            activeQueueCount={activeQueueCount}
          />
        )}

        {currentView === 'payment' && (
          <PaymentView
            cartItems={cartItems}
            studentInfo={studentInfo}
            onBackToMenu={() => setCurrentView('menu')}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {currentView === 'tracker' && (
          <OrderTrackerView
            initialOrderId={activeOrderId}
            onBrowseMenu={() => setCurrentView('menu')}
          />
        )}

        {currentView === 'admin' && <AdminPortal />}
      </main>

      {/* Mobile Persistent Bottom Cart Bar (Sticky when cart has items) */}
      {cartCount > 0 && currentView === 'menu' && (
        <aside
          aria-label="Mobile cart quick bar"
          className="fixed bottom-0 inset-x-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t-2 border-[#1e1b18] md:hidden shadow-lg"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 bg-[#d94e1f] text-white font-black text-sm rounded-xl border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-between px-4 cursor-pointer"
            aria-label={`Open Food Tray: ${cartCount} items, total ${formatINR(cartGrandTotal)}`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Tray
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base">{formatINR(cartGrandTotal)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </aside>
      )}

      {/* Cart Drawer / Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToPayment={handleProceedToPayment}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      {/* Legal & Policy Modals */}
      <LegalModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      {/* Interactive Cookie Consent Banner */}
      <CookieBanner onOpenPreferences={() => setActivePolicy('cookies')} />

      {/* Global Semantic Footer */}
      <Footer onOpenPolicy={(policy) => setActivePolicy(policy)} />
    </div>
  );
}
