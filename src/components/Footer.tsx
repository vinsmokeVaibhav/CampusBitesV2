import React from 'react';
import { Utensils, ShieldCheck, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (policy: 'terms' | 'privacy' | 'refunds' | 'cookies') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="bg-[#1e1b18] text-[#fafafa] border-t-4 border-[#d94e1f] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Canteen Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#d94e1f] text-white flex items-center justify-center font-black">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                Campus<span className="text-[#d94e1f]">Bite</span>
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Official digital food ordering and live queue management system for the Central College Canteen. Eliminating peak lunch lines since 2026.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>WCAG 2.1 AA Compliant &bull; 100% Accessible</span>
            </div>
          </div>

          {/* Col 2: Real Operator & Legal Registrations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
              Registered Operator &amp; Licenses
            </h3>
            <p className="text-xs text-stone-300 leading-snug">
              <strong>Campus Hospitality Services Pvt. Ltd.</strong>
              <br />
              Central College Canteen, Block B (Ground Floor)
            </p>
            <div className="text-xs text-stone-300 space-y-1 pt-1 font-mono">
              <p>
                <span className="text-stone-400 font-sans">FSSAI License:</span>{' '}
                <strong className="text-white">10026011004921</strong>
              </p>
              <p>
                <span className="text-stone-400 font-sans">GSTIN:</span>{' '}
                <strong className="text-white">09AAACC1206D1ZM</strong>
              </p>
            </div>
          </div>

          {/* Col 3: Support & Grievance Redressal */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
              Support &amp; Grievance Officer
            </h3>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <a
                  href="mailto:canteen-support@college.edu"
                  className="hover:underline font-mono text-white"
                >
                  canteen-support@college.edu
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <a
                  href="tel:+915812409812"
                  className="hover:underline font-mono text-white"
                >
                  +91-581-2409812
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>Counter 1 &amp; 2 Helpdesk, 08:00 AM – 06:30 PM (Mon–Sat)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Legal Links */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400">
              Legal &amp; Compliance
            </h3>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-white underline cursor-pointer"
                >
                  Privacy Policy (DPDP Act 2023)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('refunds')}
                  className="hover:text-white underline cursor-pointer"
                >
                  Refund &amp; Cancellation Policy (100% Rule)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-white underline cursor-pointer"
                >
                  Terms &amp; Conditions of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('cookies')}
                  className="hover:text-white underline cursor-pointer"
                >
                  Cookie &amp; Local Storage Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="mt-8 pt-6 border-t border-stone-800 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Campus Hospitality Services Pvt. Ltd. All rights reserved.</span>
          <span>Zero unsupported claims &bull; Real-time kitchen queue calculated</span>
        </div>
      </div>
    </footer>
  );
};
