import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Mail, Phone, MessageSquare, MessageCircle, MapPin, ArrowUpRight, Instagram, Copy, Check } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { UnifiedContactForm } from '../ui/UnifiedContactForm';
import { ContactInfo, ServiceItem } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { formatWhatsAppUrl } from '../../utils/whatsappHelper';

interface ContactSectionProps {
  contactInfo: ContactInfo;
  services?: ServiceItem[];
  defaultCategory?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactInfo,
  services,
  defaultCategory,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    soundFX.playPop();
    navigator.clipboard.writeText(contactInfo.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F2C17D', '#DCD9B8', '#8FA3A8', '#44455F'],
    });
  };

  return (
    <section
      id="contact"
      className="bg-[#FAF8F3] text-[#44455F] py-24 sm:py-32 px-5 sm:px-8 md:px-10 border-t-2 border-[#111215] relative z-10 select-none selection:bg-[#F2C17D] selection:text-[#44455F]"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Consistent Unified Heading */}
        <FadeIn delay={0} y={30} className="w-full text-center mb-12 sm:mb-16">
          <h2 className="hero-heading font-black uppercase tracking-tight text-center leading-tight text-[clamp(2.5rem,7vw,90px)] max-w-4xl mx-auto">
            Lets connect and Evolve
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
          {/* Left Column: Direct Info, WhatsApp, Socials, Location */}
          <FadeIn delay={0.1} y={30} className="lg:col-span-5 flex flex-col gap-6">
            <div className="funky-card rounded-[32px] bg-white border-2 border-[#111215] p-7 flex flex-col gap-6 shadow-[5px_5px_0px_#F2C17D]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase text-[#181924] tracking-wide">
                  Direct Contact
                </h3>
                <span className="funky-sticker text-[10px] font-mono font-bold bg-[#F2C17D] text-[#44455F] px-2 py-0.5 rounded-md">
                  🟢 ACTIVE
                </span>
              </div>

              {/* 1-Click Copy Email Banner */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="funky-sticker bg-white hover:bg-[#F2C17D] text-[#111215] p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#44455F] text-[#F2C17D] flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase text-[#8FA3A8]">Click to copy email</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#111215]">{contactInfo.email}</span>
                  </div>
                </div>
                {copied ? (
                  <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" /> COPIED!
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-[#111215] opacity-60 group-hover:opacity-100" />
                )}
              </button>

              <div className="flex flex-col gap-3 text-sm">
                <a
                  href={`tel:${(contactInfo.phone || '9035582905').replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 text-[#181924] hover:text-[#FF5500] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE1] border border-[#111215]/20 flex items-center justify-center group-hover:bg-[#111215] group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-medium">{contactInfo.phone || '9035582905'}</span>
                </a>

                <div className="flex items-center gap-3 text-[#181924]">
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE1] border border-[#111215]/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs">{contactInfo.location}</span>
                </div>
              </div>

              {/* WhatsApp Button: Reads directly from displayed phone number as single source of truth */}
              <a
                href={formatWhatsAppUrl(contactInfo.phone || contactInfo.whatsapp || '9035582905')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFX.playPop()}
                className="funky-button w-full py-3.5 px-6 rounded-2xl bg-[#25D366] text-[#111215] font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social Links */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs uppercase tracking-widest text-[#5C6F74] font-mono font-bold">
                Social Radar
              </span>
              <div className="flex flex-wrap gap-2.5 text-xs font-mono">
                {[
                  {
                    name: 'Instagram ↗',
                    url: contactInfo.instagram.startsWith('http')
                      ? contactInfo.instagram
                      : `https://${contactInfo.instagram}`,
                    icon: Instagram,
                    bg: 'bg-[#FAF8F3]',
                  },
                  {
                    name: 'Email Direct ↗',
                    url: `mailto:${contactInfo.email}`,
                    icon: Mail,
                    bg: 'bg-[#FAF8F3]',
                  },
                  {
                    name: 'WhatsApp ↗',
                    url: formatWhatsAppUrl(contactInfo.phone || contactInfo.whatsapp || '9035582905'),
                    icon: MessageCircle,
                    bg: 'bg-[#FAF8F3]',
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundFX.playPop()}
                      className={`funky-sticker px-4 py-2.5 rounded-xl ${s.bg} text-[#111215] hover:bg-[#D2FF3A] transition-all flex items-center gap-2 cursor-pointer font-bold border border-[#111215]/20 hover:border-[#111215]`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#111215]" />
                      <span>{s.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Right Column: Single, Consistent Reusable Contact Form */}
          <FadeIn delay={0.2} y={30} className="lg:col-span-7">
            <div className="funky-card rounded-[32px] bg-[#FAF8F3] border-2 border-[#111215] p-7 sm:p-9 shadow-[6px_6px_0px_#111215]">
              <div className="mb-5">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#111215] tracking-tight">
                  Lets connect and evolve
                </h3>
              </div>
              <UnifiedContactForm
                clientPhone={contactInfo.phone || contactInfo.whatsapp}
                services={services}
                defaultCategory={defaultCategory}
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
