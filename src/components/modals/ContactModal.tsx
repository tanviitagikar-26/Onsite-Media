import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, MessageSquare, Copy, Check, Instagram, ArrowUpRight } from 'lucide-react';
import { ContactInfo, ServiceItem } from '../../types';
import { UnifiedContactForm } from '../ui/UnifiedContactForm';
import { formatWhatsAppUrl } from '../../utils/whatsappHelper';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactInfo: ContactInfo;
  services?: ServiceItem[];
  defaultCategory?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contactInfo,
  services,
  defaultCategory,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(contactInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#111215]/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-[32px] bg-[#FAF8F3] border-3 border-[#111215] p-6 sm:p-8 text-[#181924] shadow-[10px_10px_0px_#111215]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-2xl bg-white hover:bg-[#FF5500] hover:text-white border-2 border-[#111215] flex items-center justify-center text-[#111215] transition-all cursor-pointer shadow-[2px_2px_0px_#111215]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5 pr-10">
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-[#111215] tracking-tight">
            Lets connect and evolve
          </h3>
        </div>

        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 text-xs font-mono">
          <button
            type="button"
            onClick={copyEmail}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#111215] transition-colors text-left cursor-pointer hover:bg-[#EFECE1]"
          >
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-[#111215] shrink-0" />
              <span className="truncate">{contactInfo.email}</span>
            </div>
            <span className="text-[10px] text-[#5C6F74] font-bold shrink-0">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <a
            href={formatWhatsAppUrl(contactInfo.phone || contactInfo.whatsapp || '9035582905')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366] text-[#111215] transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-bold">WhatsApp Direct</span>
            </div>
            <span className="text-[10px] underline">Open ↗</span>
          </a>
        </div>

        {/* Single Canonical Unified Contact Form (Classic Form) */}
        <UnifiedContactForm
          onSuccess={onClose}
          clientPhone={contactInfo.phone || contactInfo.whatsapp}
          services={services}
          defaultCategory={defaultCategory}
        />
      </div>
    </div>
  );
};
