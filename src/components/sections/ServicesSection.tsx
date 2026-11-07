import React from 'react';
import { FadeIn } from '../ui/FadeIn';
import { ServiceItem } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ArrowUpRight } from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService?: (service: ServiceItem) => void;
}

const BADGES = [
  { text: '⚡ RAPID DROP', bg: 'bg-[#44455F]', textCol: 'text-[#F2C17D]' },
  { text: '👾 3D HIGH-RES', bg: 'bg-[#F2C17D]', textCol: 'text-[#44455F]' },
  { text: '👑 MAX AESTHETIC', bg: 'bg-[#FAF8F3]', textCol: 'text-[#44455F]' },
  { text: '✦ BESPOKE DIRECTION', bg: 'bg-[#44455F]', textCol: 'text-[#F2C17D]' },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
}) => {
  return (
    <section
      id="services"
      className="bg-[#FAF2EB] text-[#44455F] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 relative z-0 selection:bg-[#F2C17D] selection:text-[#44455F] select-none shadow-[0_-15px_30px_rgba(24,25,36,0.05)] border-t-2 border-[#111215]"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Heading */}
        <FadeIn delay={0} y={30} className="w-full text-center mb-10 sm:mb-14 md:mb-16">
          <h2 className="text-[#181924] font-black uppercase text-center leading-none tracking-tight text-[clamp(2.8rem,10vw,130px)]">
            SERVICES
          </h2>
        </FadeIn>

        {/* Service items in vertical list */}
        <div className="flex flex-col w-full gap-2">
          {services.map((service, index) => {
            const badge = BADGES[index % BADGES.length];

            return (
              <FadeIn
                key={service.id || service.number}
                delay={index * 0.08}
                y={25}
                className="w-full"
              >
                <div
                  onClick={() => {
                    soundFX.playPop();
                    if (onSelectService) onSelectService(service);
                  }}
                  className={`py-7 sm:py-9 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-10 border-2 border-transparent hover:border-[#111215] border-b-[#DCD9B8] group hover:bg-white px-5 sm:px-7 rounded-3xl transition-all duration-200 cursor-pointer hover:shadow-[6px_6px_0px_#F2C17D]`}
                >
                  {/* Number on the left */}
                  <div className="font-black text-[#181924] leading-none shrink-0 text-[clamp(2.5rem,8vw,110px)] select-none tabular-nums group-hover:text-[#F2C17D] group-hover:translate-x-2 transition-all duration-200">
                    {service.number}
                  </div>

                  {/* Name + description stacked vertically on the right */}
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold uppercase text-[#181924] text-[clamp(1.1rem,2.2vw,2rem)] tracking-tight group-hover:text-[#44455F]">
                          {service.name}
                        </h3>
                        <span
                          className={`funky-sticker text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-lg border border-[#111215] ${badge.bg} ${badge.textCol}`}
                        >
                          {badge.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {service.pricingEstimate && (
                          <span className="text-xs font-mono uppercase tracking-wider text-[#44455F] bg-[#FAF8F3] px-3.5 py-1 rounded-full border border-[#DCD9B8] shrink-0 font-semibold">
                            {service.pricingEstimate}
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-full bg-[#44455F] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="w-4 h-4 text-[#F2C17D]" />
                        </div>
                      </div>
                    </div>

                    <p className="font-light text-[#5C6F74] leading-relaxed max-w-2xl text-[clamp(0.85rem,1.4vw,1.15rem)]">
                      {service.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
