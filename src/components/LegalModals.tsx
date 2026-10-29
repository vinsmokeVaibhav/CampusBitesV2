import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Cookie, Check, AlertCircle } from 'lucide-react';
import { CanteenStore } from '../db/store';
import { CookiePreferences } from '../types/database';

interface LegalModalsProps {
  activePolicy: 'terms' | 'privacy' | 'refunds' | 'cookies' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activePolicy, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Cookie customization preferences
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activePolicy) {
      closeBtnRef.current?.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePolicy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePolicy, onClose]);

  if (!activePolicy) return null;

  const handleSaveCookiePreferences = () => {
    CanteenStore.recordConsent('student_browser_session', prefs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white border-4 border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-100 border-b-2 border-[#1e1b18] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white border border-[#1e1b18] text-[#d94e1f]">
              {activePolicy === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {activePolicy === 'terms' && <FileText className="w-5 h-5" />}
              {activePolicy === 'refunds' && <RotateCcw className="w-5 h-5" />}
              {activePolicy === 'cookies' && <Cookie className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="policy-modal-title" className="text-lg font-black text-[#1e1b18]">
                {activePolicy === 'privacy' && 'Privacy Policy & DPDP Act 2023 Compliance'}
                {activePolicy === 'terms' && 'Terms & Conditions of Service'}
                {activePolicy === 'refunds' && 'Refund & Cancellation Policy'}
                {activePolicy === 'cookies' && 'Cookie Preferences & Consent Controls'}
              </h2>
              <span className="text-[11px] font-semibold text-stone-600 block">
                Campus Hospitality Services Pvt. Ltd. &bull; Last updated October 2026
              </span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="w-9 h-9 rounded-lg border-2 border-[#1e1b18] hover:bg-stone-200 flex items-center justify-center text-[#1e1b18] cursor-pointer"
            aria-label="Close dialog modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policy Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
          {activePolicy === 'privacy' && (
            <div className="space-y-3">
              <p>
                This Privacy Policy outlines how <strong>Campus Hospitality Services Pvt. Ltd.</strong> ("CampusBite", "we", "our") collects, processes, and protects your personal data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act 2023 (India)</strong> and international data minimization standards.
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">1. Essential Data Collected (Zero Excess)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Student Name &amp; College Roll Number:</strong> For verifying kitchen tray pickup at Counter #1, 2, or 3.</li>
                <li><strong>Mobile Number / Campus Email:</strong> Solely for sending ready-for-pickup notifications and token confirmations.</li>
                <li><strong>Order &amp; Payment Reference:</strong> Necessary for GST invoice auditing under FSSAI license requirements.</li>
              </ul>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">2. Data Retention &amp; Zero Selling</h3>
              <p>
                Student operational order data is strictly retained for <strong>1 academic year</strong> for accounting and audit compliance, after which personal identifiers are permanently anonymized. <strong>We strictly never sell, rent, or trade student personal information</strong> to third-party advertisers.
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">3. Grievance Redressal Officer</h3>
              <p>
                For data erasure requests or privacy inquiries, contact our Data Protection &amp; Grievance Officer:
                <br />
                <strong>Email:</strong> <span className="font-mono font-bold">canteen-support@college.edu</span>
                <br />
                <strong>Phone:</strong> <span className="font-mono font-bold">+91-581-2409812</span>
                <br />
                <strong>Location:</strong> Ground Floor, Block B, College Central Campus.
              </p>
            </div>
          )}

          {activePolicy === 'refunds' && (
            <div className="space-y-3">
              <p>
                We believe in total transparency. Our Refund and Cancellation Policy is governed by clear, automated kitchen operational milestones:
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">1. 100% Instant Refund for 'TAKEN' Orders</h3>
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950">
                If you cancel your order while the status is still marked as <strong>'TAKEN'</strong> (before the kitchen chef has commenced active preparation), you will receive a <strong>100% full refund</strong> automatically credited to your original payment method.
              </div>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">2. In-Progress 'COOKING' or 'COOKED' Meals</h3>
              <p>
                Once an order transitions to <strong>'COOKING'</strong> or <strong>'COOKED'</strong>, ingredients have been prepared and fresh perishable food cooked. In accordance with FSSAI regulations and food waste reduction protocols, cancellations are not permitted at this stage.
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">3. Kitchen Stockout &amp; Failed Transactions</h3>
              <p>
                If an item becomes unexpectedly sold out after order placement, or if a payment fails during settlement, a 100% refund is initiated automatically within <strong>3 to 5 business days</strong> with zero cancellation penalties.
              </p>
            </div>
          )}

          {activePolicy === 'terms' && (
            <div className="space-y-3">
              <p>
                Welcome to <strong>CampusBite</strong>. By using this digital platform, you agree to these operational terms:
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">1. Counter Pickup &amp; Identity Verification</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Students must present their digital 4-digit Pickup Token (or show their college RFID Smart Card) at the designated counter.</li>
                <li>Meals must be collected within <strong>20 minutes</strong> of the "COOKED (Ready for Pickup)" status announcement to ensure optimal food temperature and hygienic safety.</li>
              </ul>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">2. Pricing &amp; Transparent Taxes</h3>
              <p>
                All prices are displayed in Indian Rupees (INR) with a statutory <strong>5% GST rate</strong> applicable to canteen catering. There are zero platform convenience charges or hidden packaging fees.
              </p>

              <h3 className="font-extrabold text-sm text-[#1e1b18] pt-2">3. Code of Conduct</h3>
              <p>
                Any misuse of staff credentials, false cancellation claims, or unauthorized automated requests will result in suspension of digital canteen ordering privileges.
              </p>
            </div>
          )}

          {activePolicy === 'cookies' && (
            <div className="space-y-4">
              <p>
                We use privacy-friendly local storage to remember your active orders and session cart. Configure your consent preferences below:
              </p>

              <div className="space-y-3 border-2 border-stone-200 rounded-xl p-4 bg-stone-50">
                {/* Strictly Necessary */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-stone-900">1. Strictly Necessary Storage</h4>
                    <p className="text-[11px] text-stone-600">
                      Required for active shopping cart, live order token sync, and payment verification. Cannot be disabled.
                    </p>
                  </div>
                  <span className="bg-stone-300 text-stone-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    Always Active
                  </span>
                </div>

                {/* Anonymous Analytics */}
                <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-3">
                  <div>
                    <h4 className="font-bold text-stone-900">2. Kitchen Performance Analytics</h4>
                    <p className="text-[11px] text-stone-600">
                      Anonymized dish popularity counters (e.g. "Ordered 42 times today") to help reduce food waste.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                    className="w-4 h-4 text-[#d94e1f] rounded border-stone-400 cursor-pointer"
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-3 border-t border-stone-200 pt-3">
                  <div>
                    <h4 className="font-bold text-stone-900">3. Promotional Offers</h4>
                    <p className="text-[11px] text-stone-600">
                      Campus canteen festival notifications. Disabled by default. Zero third-party tracking.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                    className="w-4 h-4 text-[#d94e1f] rounded border-stone-400 cursor-pointer"
                  />
                </div>
              </div>

              {savedSuccess && (
                <div role="status" className="p-2.5 bg-emerald-100 text-emerald-900 rounded font-bold text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Preferences saved successfully to local consent logs!</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveCookiePreferences}
                  className="px-4 py-2 bg-[#d94e1f] hover:bg-[#c24218] text-white font-bold rounded-lg border-2 border-[#1e1b18] text-xs cursor-pointer shadow-xs"
                >
                  Save My Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-100 border-t-2 border-[#1e1b18] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1e1b18] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export const CookieBanner: React.FC<{ onOpenPreferences: () => void }> = ({ onOpenPreferences }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('campusbite_consent_accepted');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('campusbite_consent_accepted', 'all');
    CanteenStore.recordConsent('student_session', { necessary: true, analytics: true, marketing: false });
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('campusbite_consent_accepted', 'necessary_only');
    CanteenStore.recordConsent('student_session', { necessary: true, analytics: false, marketing: false });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#1e1b18] text-[#fafafa] border-t-4 border-[#d94e1f] p-4 sm:p-5 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-orange-400" />
            <h2 className="font-extrabold text-sm text-white">
              Respectful Campus Privacy &amp; Data Transparency
            </h2>
          </div>
          <p className="text-xs text-stone-300 max-w-3xl leading-relaxed">
            CampusBite strictly uses minimal local session tokens to keep track of your active canteen food tray and pickup queue tickets. We do not use intrusive cross-site tracking or sell student information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAcceptNecessary}
            className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-stone-600 cursor-pointer"
          >
            Accept Necessary Only
          </button>

          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onOpenPreferences();
            }}
            className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-orange-300 font-bold text-xs border border-orange-400 cursor-pointer"
          >
            Customize Preferences
          </button>

          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-lg bg-[#d94e1f] hover:bg-[#c24218] text-white font-extrabold text-xs border border-orange-500 cursor-pointer shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
};
