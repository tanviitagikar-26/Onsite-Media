import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Instagram, 
  Send, 
  Check, 
  Copy, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { ContactInfo } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { formatWhatsAppUrl } from '../../utils/whatsappHelper';

interface FixedContactBarProps {
  contactInfo: ContactInfo;
  onOpenContact: () => void;
}

export const FixedContactBar: React.FC<FixedContactBarProps> = ({
  contactInfo,
  onOpenContact,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playPop();
    navigator.clipboard.writeText(contactInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.85 },
      colors: ['#F7C59F', '#75B4B7', '#111215'],
    });
  };

  const handlePhoneClick = () => {
    soundFX.playPop();
  };

  const handleWhatsAppClick = () => {
    soundFX.playPop();
  };

  const cleanPhone = (contactInfo.phone || '9035582905').replace(/[^0-9+]/g, '');
  const whatsAppUrl = formatWhatsAppUrl(contactInfo.whatsapp || '9035582905');

  return (
    <aside
      aria-label="Fixed Contact Dock"
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none select-none flex justify-center px-2 sm:px-4 pb-2 sm:pb-3"
    >
      <div className="pointer-events-auto w-full max-w-5xl">
        {/* Minimized Pill */}
        {isMinimized ? (
          <div className="flex justify-center">
            <button
              onClick={() => {
                soundFX.playPop();
                setIsMinimized(false);
              }}
              className="funky-sticker group bg-[#111215] text-white hover:text-[#75B4B7] border-2 border-[#111215] px-4 py-2 rounded-full text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2.5 shadow-[4px_4px_0px_#111215] hover:shadow-[6px_6px_0px_#75B4B7] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#75B4B7] animate-pulse" />
              <span>📬 CONTACT &amp; DIRECT LINE</span>
              <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          /* Full Fixed Contact Bar */
          <div className="bg-[#FAF8F3]/95 backdrop-blur-md border-3 border-[#111215] rounded-2xl sm:rounded-3xl shadow-[5px_5px_0px_#111215] p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 transition-all">
            {/* Left: Contact Badge & Direct Calling */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111215] text-[#75B4B7] font-mono font-black text-[10px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#75B4B7] animate-pulse" />
                <span>DIRECT LINE</span>
              </span>

              {/* Call Link */}
              <a
                href={`tel:${cleanPhone}`}
                onClick={handlePhoneClick}
                className="funky-sticker bg-white hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                title={`Call ${contactInfo.phone}`}
              >
                <Phone className="w-3.5 h-3.5 text-[#FF5500]" />
                <span className="hidden sm:inline font-mono">{contactInfo.phone}</span>
                <span className="sm:hidden font-mono text-[11px]">Call</span>
              </a>

              {/* WhatsApp Direct Link - Redirects to 9035582905 */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="funky-button bg-[#25D366] hover:bg-[#20bd5a] text-[#111215] border-2 border-[#111215] px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-mono font-black tracking-wide flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#111215] hover:shadow-[3px_3px_0px_#111215]"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#111215] fill-current" />
                <span>WhatsApp</span>
                <ArrowUpRight className="w-3 h-3 hidden sm:inline" />
              </a>

              {/* Copy Email Button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="funky-sticker bg-white hover:bg-[#F7C59F] text-[#111215] border-2 border-[#111215] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                title="Click to copy email address"
              >
                <Mail className="w-3.5 h-3.5 text-[#111215]" />
                <span className="hidden lg:inline text-[11px] truncate max-w-[150px]">{contactInfo.email}</span>
                <span className="lg:hidden text-[11px]">{copied ? 'Copied' : 'Email'}</span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                ) : (
                  <Copy className="w-3 h-3 opacity-60 hidden sm:inline" />
                )}
              </button>
            </div>

            {/* Right: Social Radar & Full Contact Button */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              {/* Social Links: Instagram, Gmail, WhatsApp */}
              <div className="hidden sm:flex items-center gap-1.5">
                <a
                  href={contactInfo.instagram.startsWith('http') ? contactInfo.instagram : `https://${contactInfo.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#F7C59F] border border-[#111215] flex items-center justify-center text-[#111215] transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-[#F7C59F] border border-[#111215] flex items-center justify-center text-[#111215] transition-colors"
                  title="Gmail"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#25D366] border border-[#111215] flex items-center justify-center text-[#111215] transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Open Contact Brief Modal Button */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playShutter();
                  onOpenContact();
                }}
                className="funky-sticker bg-[#F7C59F] hover:bg-[#75B4B7] text-[#111215] border-2 border-[#111215] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] hover:shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#111215]" />
                <span>LET&apos;S TALK</span>
                <Send className="w-3 h-3 ml-0.5" />
              </button>

              {/* Minimize Toggle */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setIsMinimized(true);
                }}
                className="w-7 h-7 rounded-lg bg-white/70 hover:bg-[#111215] hover:text-white border border-[#111215]/30 flex items-center justify-center text-[#5C6F74] transition-colors cursor-pointer"
                title="Minimize contact bar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
