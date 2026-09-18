import React from 'react';
import Link from 'next/link';
import { Terminal, Share2, Mail, MapPin, Phone, Globe, Video } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#171717] text-[#F7F4ED] pt-16 pb-12 border-t-4 border-[#FF6B35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-lg brutal-border flex items-center justify-center font-black">
                <Terminal className="w-5 h-5" />
              </div>
              <span className="font-display text-2xl font-black tracking-tight">CODE A-THON</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFD84D]">
              GNANAMANI COLLEGE OF TECHNOLOGY
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              NH-7, A.K.Samuthiram, Pachal-PO, Namakkal - 637 018, Tamil Nadu, India.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 bg-white/10 rounded hover:bg-[#3155FF] transition-colors" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded hover:bg-[#FF6B35] transition-colors" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded hover:bg-[#EF4444] transition-colors" aria-label="Media">
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-black text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#B8E63E] rounded-full"></span> Competition
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-medium">
              <li><Link href="/#rounds" className="hover:text-white transition-colors">Three Rounds (C, Python, Java)</Link></li>
              <li><Link href="/#playground" className="hover:text-white transition-colors">Code Playground</Link></li>
              <li><Link href="/#schedule" className="hover:text-white transition-colors">Timeline & Schedule</Link></li>
              <li><Link href="/#leaderboard" className="hover:text-white transition-colors">Live Leaderboard</Link></li>
              <li><Link href="/#rules" className="hover:text-white transition-colors">Rules & Code Integrity</Link></li>
            </ul>
          </div>

          {/* College Info & Portal */}
          <div>
            <h4 className="font-display text-base font-black text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FFD84D] rounded-full"></span> Access Portals
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-medium">
              <li><Link href="/login" className="hover:text-white transition-colors">Participant Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">New Registration</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Judge Evaluation Desk</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Organizers & Admin Panel</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-base font-black text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3155FF] rounded-full"></span> Help & Support
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#FFD84D] shrink-0 mt-0.5" />
                <span>codeathon@gct.ac.in</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#B8E63E] shrink-0 mt-0.5" />
                <span>+91 4286 293888 / 293999</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                <span>Department of Computer Science & Engineering, GCT</span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 mt-2">
                <div className="text-[10px] uppercase font-bold text-gray-400">Campus Helpline</div>
                <div className="text-xs font-bold text-white mt-0.5">Mon–Sat: 8:30 AM – 5:30 PM IST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Gnanamani College of Technology. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>THINK. CODE. CONQUER.</span>
            <span>•</span>
            <span className="text-[#B8E63E]">PLATFORM V2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
