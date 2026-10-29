import React, { useState } from 'react';
import { CartItem, PaymentMethod } from '../types/database';
import { formatINR, calculateSubtotal, calculateGST, calculateTotal } from '../utils/pricing';
import { validateUPI } from '../utils/validation';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Building,
  Check
} from 'lucide-react';

interface PaymentViewProps {
  cartItems: CartItem[];
  studentInfo: {
    name: string;
    roll: string;
    contact: string;
    pickupSlot: string;
    notes?: string;
  };
  onBackToMenu: () => void;
  onPaymentSuccess: (paymentDetails: {
    method: PaymentMethod;
    transactionRef: string;
    amount: number;
  }) => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  cartItems,
  studentInfo,
  onBackToMenu,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState<string>('student@upi');
  const [isUpiVerified, setIsUpiVerified] = useState<boolean>(true);
  const [upiVerifyLoading, setUpiVerifyLoading] = useState<boolean>(false);

  // Card Inputs
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('•••');
  const [cardHolder, setCardHolder] = useState<string>(studentInfo.name);

  // Campus Smart Card Wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(450.0);

  // Payment State Machine: 'idle' | 'processing' | 'verifying' | 'success' | 'failed'
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);

  const subtotal = calculateSubtotal(cartItems);
  const taxGST = calculateGST(subtotal);
  const grandTotal = calculateTotal(subtotal, taxGST);

  const handleVerifyUPI = () => {
    if (!validateUPI(upiId)) {
      setErrorMessage('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or roll@upi).');
      setIsUpiVerified(false);
      return;
    }
    setErrorMessage('');
    setUpiVerifyLoading(true);
    setTimeout(() => {
      setUpiVerifyLoading(false);
      setIsUpiVerified(true);
    }, 600);
  };

  const handleProcessPayment = () => {
    setErrorMessage('');
    if (method === 'UPI' && !isUpiVerified && !validateUPI(upiId)) {
      setErrorMessage('Please verify your UPI ID before proceeding.');
      return;
    }
    if (method === 'CAMPUS_WALLET' && walletBalance < grandTotal) {
      setErrorMessage(`Insufficient wallet balance (${formatINR(walletBalance)}). Please top up or choose UPI.`);
      return;
    }

    setPaymentState('processing');

    setTimeout(() => {
      if (simulateFailure) {
        setPaymentState('failed');
        setErrorMessage('Bank gateway timed out or transaction declined. Zero amount was debited.');
        return;
      }

      setPaymentState('verifying');

      setTimeout(() => {
        setPaymentState('success');
        const refNumber = `TXN-${method.substring(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;

        if (method === 'CAMPUS_WALLET') {
          setWalletBalance((prev) => prev - grandTotal);
        }

        setTimeout(() => {
          onPaymentSuccess({
            method,
            transactionRef: refNumber,
            amount: grandTotal,
          });
        }, 800);
      }, 700);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <div>
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-black py-2 px-3 rounded-lg hover:bg-stone-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu &amp; Tray</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Col: Payment Method Selection & Inputs (7 cols) */}
        <section aria-labelledby="payment-methods-title" className="md:col-span-7 space-y-5">
          <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-5 shadow-[4px_4px_0px_#1e1b18]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div>
                <h1 id="payment-methods-title" className="text-xl font-black text-[#1e1b18]">
                  Secure Online Payment
                </h1>
                <p className="text-xs font-semibold text-stone-600">
                  Campus Central Canteen Gateway • 256-Bit Encrypted
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md">
                <Lock className="w-3.5 h-3.5" />
                <span>PCI-DSS Compliant</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-5" role="tablist" aria-label="Payment Options">
              <button
                type="button"
                role="tab"
                aria-selected={method === 'UPI'}
                onClick={() => setMethod('UPI')}
                className={`py-3 px-2 rounded-lg border-2 font-bold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  method === 'UPI'
                    ? 'border-[#d94e1f] bg-orange-50 text-[#d94e1f] shadow-[2px_2px_0px_#d94e1f]'
                    : 'border-[#1e1b18] bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>UPI Instant Pay</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={method === 'CAMPUS_WALLET'}
                onClick={() => setMethod('CAMPUS_WALLET')}
                className={`py-3 px-2 rounded-lg border-2 font-bold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  method === 'CAMPUS_WALLET'
                    ? 'border-[#d94e1f] bg-orange-50 text-[#d94e1f] shadow-[2px_2px_0px_#d94e1f]'
                    : 'border-[#1e1b18] bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>Campus Card</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={method === 'CARD'}
                onClick={() => setMethod('CARD')}
                className={`py-3 px-2 rounded-lg border-2 font-bold text-xs flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  method === 'CARD'
                    ? 'border-[#d94e1f] bg-orange-50 text-[#d94e1f] shadow-[2px_2px_0px_#d94e1f]'
                    : 'border-[#1e1b18] bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Cards / NetBank</span>
              </button>
            </div>

            {/* TAB CONTENT: UPI */}
            {method === 'UPI' && (
              <div className="space-y-4">
                <div className="bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-xl p-4 text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-600 block mb-2">
                    Scan dynamic QR with any UPI App
                  </span>

                  {/* Accessible SVG QR Code Representation */}
                  <div className="inline-block p-3 bg-white border-2 border-[#1e1b18] rounded-lg shadow-xs my-1">
                    <svg
                      className="w-40 h-40 mx-auto"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label={`UPI QR Code to pay ${formatINR(grandTotal)} to Campus Central Canteen`}
                      role="img"
                    >
                      {/* Corner Targets */}
                      <rect x="5" y="5" width="28" height="28" stroke="#1e1b18" strokeWidth="4" fill="white" />
                      <rect x="11" y="11" width="16" height="16" fill="#1e1b18" />
                      <rect x="67" y="5" width="28" height="28" stroke="#1e1b18" strokeWidth="4" fill="white" />
                      <rect x="73" y="11" width="16" height="16" fill="#1e1b18" />
                      <rect x="5" y="67" width="28" height="28" stroke="#1e1b18" strokeWidth="4" fill="white" />
                      <rect x="11" y="73" width="16" height="16" fill="#1e1b18" />
                      {/* QR Data Matrix Mock */}
                      <rect x="42" y="8" width="6" height="6" fill="#1e1b18" />
                      <rect x="52" y="18" width="6" height="6" fill="#1e1b18" />
                      <rect x="42" y="28" width="6" height="6" fill="#1e1b18" />
                      <rect x="14" y="44" width="6" height="6" fill="#1e1b18" />
                      <rect x="24" y="52" width="6" height="6" fill="#1e1b18" />
                      <rect x="36" y="44" width="8" height="8" fill="#d94e1f" />
                      <rect x="48" y="44" width="8" height="8" fill="#1e1b18" />
                      <rect x="60" y="44" width="8" height="8" fill="#d94e1f" />
                      <rect x="44" y="60" width="8" height="8" fill="#1e1b18" />
                      <rect x="56" y="60" width="8" height="8" fill="#1e1b18" />
                      <rect x="42" y="76" width="6" height="6" fill="#1e1b18" />
                      <rect x="54" y="84" width="6" height="6" fill="#1e1b18" />
                      <rect x="74" y="48" width="6" height="6" fill="#1e1b18" />
                      <rect x="84" y="60" width="6" height="6" fill="#1e1b18" />
                      <rect x="74" y="78" width="8" height="8" fill="#1e1b18" />
                      <rect x="86" y="78" width="6" height="6" fill="#1e1b18" />
                    </svg>
                  </div>

                  <p className="text-xs font-mono font-bold text-stone-800 mt-2">
                    UPI ID: canteen@college.bank
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-800">
                    Supports Google Pay, PhonePe, Paytm, BHIM &amp; Cred
                  </p>
                </div>

                {/* Or Enter UPI ID */}
                <div className="space-y-2">
                  <label htmlFor="upi-vpa-input" className="block text-xs font-bold text-[#1e1b18]">
                    Or Enter Your UPI ID / VPA
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="upi-vpa-input"
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setIsUpiVerified(false);
                      }}
                      placeholder="student@upi or roll@okaxis"
                      className="flex-1 px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyUPI}
                      disabled={upiVerifyLoading}
                      className="px-4 py-2 bg-[#1e1b18] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-stone-800 flex items-center gap-1.5"
                    >
                      {upiVerifyLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isUpiVerified ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : null}
                      <span>{isUpiVerified ? 'Verified' : 'Verify'}</span>
                    </button>
                  </div>
                  {isUpiVerified && (
                    <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified for {studentInfo.name} (NPCI Fast-Path)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Campus Smart Card Wallet */}
            {method === 'CAMPUS_WALLET' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-xl p-5 border-2 border-[#1e1b18] shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-orange-400 font-extrabold block">
                        CAMPUS DIGITAL SMART CARD
                      </span>
                      <h4 className="font-extrabold text-base mt-1">{studentInfo.name}</h4>
                      <p className="font-mono text-xs text-stone-300">ROLL: {studentInfo.roll}</p>
                    </div>
                    <Building className="w-7 h-7 text-stone-400" />
                  </div>

                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                        Available Wallet Balance
                      </span>
                      <span className="font-extrabold text-2xl font-mono text-emerald-400">
                        {formatINR(walletBalance)}
                      </span>
                    </div>

                    <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold px-2 py-0.5 rounded">
                      Active Card
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                  <span>Balance after deducting {formatINR(grandTotal)}:</span>
                  <span className="font-mono font-bold text-sm">
                    {formatINR(walletBalance - grandTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Card / NetBanking */}
            {method === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="card-num" className="block text-xs font-bold text-[#1e1b18] mb-1">
                    Card Number
                  </label>
                  <input
                    id="card-num"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="card-exp" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="card-exp"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="card-cvv" className="block text-xs font-bold text-[#1e1b18] mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      id="card-cvv"
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="card-name" className="block text-xs font-bold text-[#1e1b18] mb-1">
                    Name on Card
                  </label>
                  <input
                    id="card-name"
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f7f6f2] border-2 border-[#1e1b18] rounded-lg text-xs font-bold focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Error Announcement */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-4 p-3 bg-rose-50 border-2 border-rose-600 rounded-lg text-xs text-rose-800 font-bold flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Testing Toggle for Error Recovery (Simulate Decline) */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold">Simulate Gateway Downtime / Retry Test:</span>
              <button
                type="button"
                onClick={() => setSimulateFailure(!simulateFailure)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                  simulateFailure
                    ? 'bg-rose-100 text-rose-800 border-rose-400'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {simulateFailure ? 'Failure Mode Active' : 'Normal Success'}
              </button>
            </div>

            {/* Submit Action */}
            <div className="mt-5">
              <button
                type="button"
                disabled={paymentState !== 'idle' && paymentState !== 'failed'}
                onClick={handleProcessPayment}
                className="w-full py-4 bg-[#d94e1f] hover:bg-[#c24218] disabled:bg-stone-400 text-white font-extrabold text-sm sm:text-base rounded-xl border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                aria-label={`Pay ${formatINR(grandTotal)} & Place Order`}
              >
                {paymentState === 'processing' && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                )}
                {paymentState === 'verifying' && (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying with Campus Bank...</span>
                  </>
                )}
                {paymentState === 'success' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Payment Verified! Generating Token...</span>
                  </>
                )}
                {(paymentState === 'idle' || paymentState === 'failed') && (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay {formatINR(grandTotal)} &amp; Place Order</span>
                  </>
                )}
              </button>

              {paymentState !== 'idle' && (
                <div className="sr-only" aria-live="assertive">
                  {paymentState === 'processing' && 'Contacting payment provider.'}
                  {paymentState === 'verifying' && 'Verifying payment approval.'}
                  {paymentState === 'success' && 'Payment successful. Creating order token.'}
                  {paymentState === 'failed' && 'Payment failed. Please retry.'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Col: Order Summary Breakdown (5 cols) */}
        <aside aria-labelledby="order-summary-title" className="md:col-span-5 space-y-4">
          <div className="bg-white border-2 border-[#1e1b18] rounded-xl p-5 shadow-[4px_4px_0px_#1e1b18] space-y-4">
            <h2 id="order-summary-title" className="text-sm font-black uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-2">
              Order Summary
            </h2>

            {/* Student Info Recap */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Student Name:</span>
                <span className="font-bold text-[#1e1b18]">{studentInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Roll Number:</span>
                <span className="font-mono font-bold text-[#1e1b18]">{studentInfo.roll}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Pickup Slot:</span>
                <span className="font-bold text-[#d94e1f]">{studentInfo.pickupSlot}</span>
              </div>
            </div>

            {/* Itemized Lines */}
            <div className="space-y-2">
              {cartItems.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="flex justify-between text-xs py-1 border-b border-stone-100">
                  <span className="font-medium text-stone-800">
                    <strong className="font-extrabold">{quantity}x</strong> {menuItem.name}
                  </span>
                  <span className="font-bold font-mono text-[#1e1b18]">
                    {formatINR(menuItem.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-xs border-t-2 border-[#1e1b18] pt-3">
              <div className="flex justify-between">
                <span className="text-stone-600">Base Subtotal:</span>
                <span className="font-bold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">GST (5% Canteen Food Tax):</span>
                <span className="font-bold">{formatINR(taxGST)}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Convenience / Hidden Charges:</span>
                <span className="font-bold">₹0.00 (Zero)</span>
              </div>

              <div className="flex justify-between text-base font-black text-[#1e1b18] pt-2 border-t border-stone-200">
                <span>Total Payable:</span>
                <span className="text-[#d94e1f] font-mono">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-900 leading-snug">
              <strong>100% Refund Policy:</strong> Automatic full refund if cancelled before kitchen starts cooking.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
