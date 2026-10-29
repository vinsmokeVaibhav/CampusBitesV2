import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types/database';
import { formatINR, calculateSubtotal, calculateGST, calculateTotal } from '../utils/pricing';
import { validateStudentRoll, validateContact } from '../utils/validation';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToPayment: (studentInfo: {
    name: string;
    roll: string;
    contact: string;
    pickupSlot: string;
    notes?: string;
  }) => void;
  onOpenPolicy: (policy: 'terms' | 'privacy' | 'refunds') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToPayment,
  onOpenPolicy,
}) => {
  const [fullName, setFullName] = useState<string>('Aarav Sharma');
  const [rollNumber, setRollNumber] = useState<string>('2024CS0842');
  const [contact, setContact] = useState<string>('+91-9876543210');
  const [pickupSlot, setPickupSlot] = useState<string>('Immediate (Next in line)');
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    roll?: string;
    contact?: string;
    consent?: string;
  }>({});

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Set initial focus
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const subtotal = calculateSubtotal(cartItems);
  const taxGST = calculateGST(subtotal);
  const totalAmount = calculateTotal(subtotal, taxGST);
  const totalItemsCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.name = 'Full name is required (minimum 2 letters).';
    }

    const rollValidation = validateStudentRoll(rollNumber);
    if (!rollValidation.isValid) {
      errors.roll = rollValidation.message || 'Valid student Roll / ID required.';
    }

    const contactValidation = validateContact(contact);
    if (!contactValidation.isValid) {
      errors.contact = contactValidation.message || 'Valid phone or email required for pickup alerts.';
    }

    if (!consentChecked) {
      errors.consent = 'You must give consent to process order details for kitchen preparation.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onProceedToPayment({
        name: fullName.trim(),
        roll: rollNumber.trim().toUpperCase(),
        contact: contact.trim(),
        pickupSlot,
        notes: kitchenNotes.trim() || undefined,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div
        ref={drawerRef}
        className="w-full max-w-lg bg-[#fafafa] h-full shadow-2xl flex flex-col border-l-4 border-[#1e1b18] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[#1e1b18] flex items-center justify-between">
          <div>
            <h2 id="cart-drawer-title" className="text-xl font-black text-[#1e1b18]">
              Your Food Tray ({totalItemsCount})
            </h2>
            <p className="text-xs font-semibold text-stone-600 mt-0.5">
              Central Canteen, Block B • Prepared Fresh
            </p>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="w-9 h-9 rounded-lg border-2 border-[#1e1b18] hover:bg-stone-100 flex items-center justify-center text-[#1e1b18] cursor-pointer"
            aria-label="Close food tray modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto border-2 border-stone-300 text-stone-400">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-lg text-[#1e1b18]">Your tray is empty</h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto">
                Explore the live canteen menu and add freshly made delicacies to bypass lunch queue lines.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2.5 bg-[#d94e1f] text-white font-bold text-xs rounded-lg border-2 border-[#1e1b18] cursor-pointer"
              >
                Browse Live Menu
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List with ARIA live region */}
              <section aria-label="Tray items" className="space-y-3">
                <div className="sr-only" aria-live="polite">
                  Cart updated. Total is {formatINR(totalAmount)} for {totalItemsCount} items.
                </div>

                <div className="space-y-2.5">
                  {cartItems.map(({ menuItem, quantity }) => (
                    <div
                      key={menuItem.id}
                      className="bg-white border-2 border-[#1e1b18] rounded-xl p-3 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1e1b18]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={menuItem.image_url}
                          alt={menuItem.image_alt}
                          className="w-14 h-14 rounded-lg object-cover border border-stone-300 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm text-[#1e1b18] truncate">
                            {menuItem.name}
                          </h4>
                          <span className="text-xs font-bold text-stone-600">
                            {formatINR(menuItem.price)} each
                          </span>
                        </div>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-stone-400 rounded-lg bg-stone-50 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(menuItem.id, -1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 text-stone-800 cursor-pointer font-bold"
                            aria-label={`Decrease quantity of ${menuItem.name}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className="w-7 text-center font-extrabold text-xs text-[#1e1b18]"
                            aria-label={`Current quantity ${quantity}`}
                          >
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(menuItem.id, 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 text-stone-800 cursor-pointer font-bold"
                            aria-label={`Increase quantity of ${menuItem.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-extrabold text-sm text-[#1e1b18] min-w-16 text-right">
                          {formatINR(menuItem.price * quantity)}
                        </span>

                        <button
                          onClick={() => onRemoveItem(menuItem.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                          aria-label={`Remove ${menuItem.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Transparent Bill Breakdown */}
              <section aria-labelledby="bill-details" className="bg-white border-2 border-[#1e1b18] rounded-xl p-4 space-y-2 shadow-[2px_2px_0px_#1e1b18]">
                <h3 id="bill-details" className="text-xs font-black uppercase tracking-wider text-stone-600">
                  Itemized Bill Breakdown
                </h3>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-[#1e1b18]">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>
                      Canteen GST (5% FSSAI Catering Rate)
                    </span>
                    <span className="font-bold text-[#1e1b18]">{formatINR(taxGST)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Queue Skipping / Tech Fee</span>
                    <span className="font-bold">₹0.00 (Zero Hidden Charges)</span>
                  </div>

                  <div className="border-t-2 border-[#1e1b18] pt-2 mt-2 flex justify-between text-sm font-black text-[#1e1b18]">
                    <span>Total Amount Payable</span>
                    <span className="text-base text-[#d94e1f]">{formatINR(totalAmount)}</span>
                  </div>
                </div>
              </section>

              {/* Data-Minimized Student Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4" noValidate>
                <div className="border-2 border-[#1e1b18] rounded-xl p-4 bg-white space-y-3.5 shadow-[2px_2px_0px_#1e1b18]">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                      Student Pickup Information
                    </h3>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-bold">
                      Data Minimized
                    </span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="student-full-name" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      Full Student Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="student-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-semibold focus:outline-hidden"
                      aria-invalid={!!formErrors.name}
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="text-[11px] text-rose-700 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Student Roll Number */}
                  <div>
                    <label htmlFor="student-roll-id" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      College Roll No. / Student ID <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="student-roll-id"
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 2024CS0842"
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                      aria-invalid={!!formErrors.roll}
                      aria-describedby={formErrors.roll ? 'roll-error' : undefined}
                    />
                    {formErrors.roll && (
                      <p id="roll-error" className="text-[11px] text-rose-700 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.roll}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number / Campus Email */}
                  <div>
                    <label htmlFor="student-contact" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      Mobile Number / Campus Email (For Ready Alerts) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="student-contact"
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. +91-9876543210 or roll@college.edu"
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-semibold focus:outline-hidden"
                      aria-invalid={!!formErrors.contact}
                      aria-describedby={formErrors.contact ? 'contact-error' : undefined}
                    />
                    {formErrors.contact && (
                      <p id="contact-error" className="text-[11px] text-rose-700 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.contact}
                      </p>
                    )}
                  </div>

                  {/* Pickup Slot Selection */}
                  <div>
                    <label htmlFor="pickup-slot-select" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      Desired Pickup Slot <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="pickup-slot-select"
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-bold focus:outline-hidden cursor-pointer"
                    >
                      <option value="Immediate (Next in line)">Immediate (Next in Kitchen Queue)</option>
                      <option value="11:15 AM Short Break">11:15 AM – Morning Recess Break</option>
                      <option value="01:00 PM Lunch Break">01:00 PM – Lunch Hour Slot</option>
                      <option value="03:45 PM Tea Break">03:45 PM – Evening Tea Break</option>
                    </select>
                  </div>

                  {/* Special Cooking Notes (Optional) */}
                  <div>
                    <label htmlFor="kitchen-notes" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      Kitchen Special Notes <span className="text-stone-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="kitchen-notes"
                      type="text"
                      value={kitchenNotes}
                      onChange={(e) => setKitchenNotes(e.target.value)}
                      placeholder="e.g. Extra spicy red chutney / Less sugar in tea"
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs focus:outline-hidden"
                    />
                  </div>

                  {/* Mandatory Explicit Consent Checkbox */}
                  <div className="pt-2 border-t border-stone-200">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-2 border-[#1e1b18] text-[#d94e1f] focus:ring-0 cursor-pointer"
                        aria-invalid={!!formErrors.consent}
                        aria-describedby={formErrors.consent ? 'consent-error' : undefined}
                      />
                      <span className="text-[11px] leading-relaxed text-stone-800 font-medium select-none">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => onOpenPolicy('terms')}
                          className="font-bold underline text-[#d94e1f] hover:text-[#1e1b18] cursor-pointer"
                        >
                          Terms &amp; Conditions
                        </button>
                        ,{' '}
                        <button
                          type="button"
                          onClick={() => onOpenPolicy('refunds')}
                          className="font-bold underline text-[#d94e1f] hover:text-[#1e1b18] cursor-pointer"
                        >
                          Refund Policy
                        </button>
                        , and consent to processing my order details for kitchen fulfillment.{' '}
                        <span className="text-rose-600 font-bold">*</span>
                      </span>
                    </label>

                    {formErrors.consent && (
                      <p id="consent-error" className="text-[11px] text-rose-700 font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {formErrors.consent}
                      </p>
                    )}
                  </div>
                </div>

                {/* Explicit Action Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#d94e1f] hover:bg-[#c24218] text-white font-extrabold text-sm rounded-xl border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  aria-label={`Proceed to Checkout (${totalItemsCount} Items – ${formatINR(totalAmount)})`}
                >
                  <span>Proceed to Checkout ({totalItemsCount} Items – {formatINR(totalAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
