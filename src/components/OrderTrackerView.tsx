import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/database';
import { CanteenStore } from '../db/store';
import { formatINR } from '../utils/pricing';
import { getQueuePosition } from '../utils/queue';
import {
  Clock,
  CheckCircle2,
  Flame,
  BellRing,
  AlertCircle,
  RotateCcw,
  Receipt,
  Store,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface OrderTrackerViewProps {
  initialOrderId?: string;
  onBrowseMenu: () => void;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({
  initialOrderId,
  onBrowseMenu,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId || 'CB-8492');
  const [cancelFeedback, setCancelFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Sync with store
  useEffect(() => {
    const refresh = () => {
      const all = CanteenStore.getOrders();
      setOrders(all);
      // If selectedOrderId is not set, set to first active order or first order
      if (!selectedOrderId && all.length > 0) {
        const active = all.find((o) => o.status !== 'PICKED_UP' && o.status !== 'CANCELLED');
        setSelectedOrderId(active ? active.order_id : all[0].order_id);
      }
    };
    refresh();
    return CanteenStore.subscribe(refresh);
  }, [selectedOrderId]);

  // Keep selected order updated
  const currentOrder = orders.find((o) => o.order_id === selectedOrderId);
  const queuePos = currentOrder ? getQueuePosition(currentOrder.order_id, orders) : 0;

  const handleCancelOrder = () => {
    if (!currentOrder) return;
    const result = CanteenStore.cancelOrder(currentOrder.order_id);
    setCancelFeedback(result);
  };

  const statusStepMap: Record<OrderStatus, number> = {
    TAKEN: 1,
    COOKING: 2,
    COOKED: 3,
    PICKED_UP: 4,
    CANCELLED: 0,
  };

  const currentStep = currentOrder ? statusStepMap[currentOrder.status] : 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Active Orders Switcher Pill Bar */}
      <section aria-labelledby="active-orders-selector" className="bg-white border-2 border-[#1e1b18] rounded-xl p-3 shadow-[2px_2px_0px_#1e1b18]">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2">
            <span id="active-orders-selector" className="text-xs font-black uppercase text-stone-600 whitespace-nowrap">
              Your Orders:
            </span>
            {orders.slice(0, 6).map((ord) => (
              <button
                key={ord.order_id}
                onClick={() => {
                  setSelectedOrderId(ord.order_id);
                  setCancelFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border-2 cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedOrderId === ord.order_id
                    ? 'bg-[#1e1b18] text-white border-[#1e1b18] shadow-[2px_2px_0px_#d94e1f]'
                    : 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100'
                }`}
                aria-pressed={selectedOrderId === ord.order_id}
              >
                <span>#{ord.order_id}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-extrabold ${
                    ord.status === 'COOKED'
                      ? 'bg-emerald-200 text-emerald-950'
                      : ord.status === 'COOKING'
                      ? 'bg-amber-200 text-amber-950'
                      : ord.status === 'CANCELLED'
                      ? 'bg-rose-200 text-rose-950'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {ord.status}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={onBrowseMenu}
            className="text-xs font-bold text-[#d94e1f] hover:underline whitespace-nowrap cursor-pointer"
          >
            + Order More
          </button>
        </div>
      </section>

      {/* Main Order Card */}
      {!currentOrder ? (
        <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-8 text-center shadow-[4px_4px_0px_#1e1b18]">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-[#1e1b18]">No order selected or found</h2>
          <p className="text-xs text-stone-600 mt-1">Please select an order from the list above or place a new order.</p>
        </div>
      ) : (
        <article
          className="bg-white border-2 border-[#1e1b18] rounded-xl p-6 shadow-[5px_5px_0px_#1e1b18] space-y-6"
          aria-labelledby="order-tracker-heading"
        >
          {/* Header & Token Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1e1b18] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-stone-900 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded">
                  ORDER #{currentOrder.order_id}
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  Placed at {new Date(currentOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h1 id="order-tracker-heading" className="text-2xl font-black text-[#1e1b18] mt-2">
                Student: {currentOrder.student_name}
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Roll No: <span className="font-mono font-bold text-stone-900">{currentOrder.student_roll}</span> • Pickup Slot:{' '}
                <strong className="text-[#d94e1f]">{currentOrder.pickup_slot}</strong>
              </p>
            </div>

            {/* Token Badge */}
            <div className="bg-[#1e1b18] text-[#fafafa] border-2 border-[#d94e1f] rounded-xl p-3 text-center sm:min-w-44 shadow-md">
              <span className="text-[10px] uppercase tracking-widest text-orange-400 font-extrabold block">
                YOUR PICKUP TOKEN
              </span>
              <span className="font-mono-token text-3xl sm:text-4xl font-black tracking-wider text-white block my-0.5">
                {currentOrder.token_number}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                <Store className="w-3.5 h-3.5" />
                <span>Counter #{currentOrder.counter_no}</span>
              </span>
            </div>
          </div>

          {/* Cancel Feedback Banner */}
          {cancelFeedback && (
            <div
              role="alert"
              className={`p-3.5 rounded-lg border-2 text-xs font-bold flex items-start gap-2.5 ${
                cancelFeedback.success
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                  : 'bg-rose-50 border-rose-600 text-rose-950'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>{cancelFeedback.message}</p>
              </div>
            </div>
          )}

          {/* Live Kitchen Progress Stepper */}
          <section aria-labelledby="live-prep-stepper" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="live-prep-stepper" className="text-sm font-black uppercase tracking-wider text-stone-800">
                Live Kitchen Preparation Stepper
              </h2>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border ${
                  currentOrder.status === 'COOKED'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-500 animate-pulse'
                    : currentOrder.status === 'COOKING'
                    ? 'bg-amber-100 text-amber-950 border-amber-500'
                    : currentOrder.status === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-950 border-rose-400'
                    : 'bg-blue-100 text-blue-950 border-blue-400'
                }`}
                aria-live="polite"
              >
                {currentOrder.status === 'COOKED' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                {currentOrder.status === 'COOKING' && <Flame className="w-4 h-4 text-orange-600 animate-bounce" />}
                {currentOrder.status === 'TAKEN' && <Clock className="w-4 h-4 text-blue-700" />}
                <span>
                  Status: {currentOrder.status === 'TAKEN' ? 'Taken (Order In Queue)' : currentOrder.status === 'COOKING' ? 'Cooking on Stove' : currentOrder.status === 'COOKED' ? 'Cooked (Ready for Pickup!)' : currentOrder.status}
                </span>
              </div>
            </div>

            {/* 3-Step Neo-Brutalist Stepper */}
            {currentOrder.status !== 'CANCELLED' ? (
              <div className="relative pt-3 pb-2">
                {/* Connecting Progress Track */}
                <div className="absolute top-8 left-6 right-6 h-1 bg-stone-200 z-0" />
                <div
                  className="absolute top-8 left-6 h-1 bg-[#d94e1f] z-0 transition-all duration-500"
                  style={{
                    width: currentStep === 1 ? '10%' : currentStep === 2 ? '50%' : '90%',
                  }}
                />

                <div className="relative z-10 grid grid-cols-3 gap-2 text-center">
                  {/* Step 1: Taken */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-xs ${
                        currentStep >= 1
                          ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                          : 'bg-white text-stone-400 border-stone-300'
                      }`}
                    >
                      {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : '1'}
                    </div>
                    <span className="font-extrabold text-xs text-[#1e1b18] mt-2 block">1. Taken</span>
                    <span className="text-[11px] text-stone-600 block">Payment Verified &amp; Queued</span>
                  </div>

                  {/* Step 2: Cooking */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-xs ${
                        currentStep >= 2
                          ? 'bg-[#d94e1f] text-white border-[#1e1b18]'
                          : 'bg-white text-stone-400 border-stone-300'
                      }`}
                    >
                      {currentStep > 2 ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : currentStep === 2 ? (
                        <Flame className="w-5 h-5 animate-pulse" />
                      ) : (
                        '2'
                      )}
                    </div>
                    <span className="font-extrabold text-xs text-[#1e1b18] mt-2 block">2. Cooking</span>
                    <span className="text-[11px] text-stone-600 block">Chef preparing your meal</span>
                  </div>

                  {/* Step 3: Cooked */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-xs ${
                        currentStep >= 3
                          ? 'bg-emerald-700 text-white border-emerald-900 ring-4 ring-emerald-200'
                          : 'bg-white text-stone-400 border-stone-300'
                      }`}
                    >
                      {currentStep >= 3 ? <BellRing className="w-5 h-5" /> : '3'}
                    </div>
                    <span className="font-extrabold text-xs text-[#1e1b18] mt-2 block">3. Cooked</span>
                    <span className="text-[11px] text-emerald-800 font-bold block">Ready at Counter #{currentOrder.counter_no}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-center">
                <ShieldAlert className="w-6 h-6 text-rose-600 mx-auto mb-1" />
                <h3 className="font-extrabold text-sm text-rose-950">This order has been cancelled</h3>
                <p className="text-xs text-rose-800 mt-1">100% refund processed to your original payment method.</p>
              </div>
            )}

            {/* Dynamic Queue Position Callout */}
            {currentOrder.status === 'TAKEN' && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <span className="font-bold text-blue-950 block">
                      Queue Position: #{queuePos > 0 ? queuePos : 1} in line
                    </span>
                    <span className="text-blue-800">
                      Estimated cooking begins in ~3–5 minutes. Relax, your spot is saved!
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-1 rounded">
                  Queued
                </span>
              </div>
            )}

            {currentOrder.status === 'COOKING' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-[#d94e1f] shrink-0 animate-bounce" />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Chef Rajesh has started your meal!
                    </span>
                    <span className="text-amber-900">
                      Plating in progress. Please head towards <strong>Counter #{currentOrder.counter_no}</strong> with Token #{currentOrder.token_number}.
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-900 bg-amber-200 px-2 py-1 rounded">
                  ~3 mins left
                </span>
              </div>
            )}

            {currentOrder.status === 'COOKED' && (
              <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-extrabold text-sm text-emerald-950 block">
                      Meal Ready for Collection!
                    </span>
                    <span className="text-emerald-900 font-semibold">
                      Please collect immediately at <strong>Counter #{currentOrder.counter_no}</strong>. Show this screen or quote Token <strong>#{currentOrder.token_number}</strong>.
                    </span>
                  </div>
                </div>
                <span className="font-bold text-white bg-emerald-800 px-3 py-1.5 rounded-lg text-xs">
                  Ready Now
                </span>
              </div>
            )}
          </section>

          {/* Itemized Order Breakdown */}
          <section aria-labelledby="order-items-heading" className="bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="order-items-heading" className="text-xs font-black uppercase tracking-wider text-stone-700">
                Itemized Order Receipt
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                PAID &bull; ONLINE
              </span>
            </div>

            <div className="space-y-2">
              {currentOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center text-xs py-1 border-b border-stone-300">
                  <span className="font-semibold text-[#1e1b18]">
                    <strong className="font-extrabold">{it.quantity}x</strong> {it.item_name}
                  </span>
                  <span className="font-mono font-bold text-[#1e1b18]">
                    {formatINR(it.unit_price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-1 text-xs text-stone-700 border-t border-stone-300">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold">{formatINR(currentOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Canteen GST (5%):</span>
                <span className="font-bold">{formatINR(currentOrder.tax_gst)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#1e1b18] pt-1">
                <span>Total Paid:</span>
                <span className="text-[#d94e1f] font-mono">{formatINR(currentOrder.total_amount)}</span>
              </div>
            </div>
          </section>

          {/* Bottom Actions: Cancel & 100% Refund, or Help */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200">
            {currentOrder.status === 'TAKEN' ? (
              <button
                type="button"
                onClick={handleCancelOrder}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-600 rounded-lg text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5"
                aria-label={`Cancel order #${currentOrder.order_id} and get 100% refund`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel Order &amp; Request 100% Refund</span>
              </button>
            ) : currentOrder.status === 'COOKING' || currentOrder.status === 'COOKED' ? (
              <div className="text-xs text-stone-500 font-medium">
                Cancellation locked: Meal is already under active chef preparation.
              </div>
            ) : null}

            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
              <Receipt className="w-4 h-4" />
              <span>Counter Help: +91-581-2409812</span>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
