import Link from 'next/link';
import { Zap, Shield, Headphones } from 'lucide-react';

const features = [
  { icon: Zap, label: 'ส่งคีย์ทันที', desc: 'หลังชำระเงิน' },
  { icon: Shield, label: 'คีย์แท้ 100%', desc: 'มั่นใจได้' },
  { icon: Headphones, label: 'ซัพพอร์ต 24/7', desc: 'พร้อมช่วยเหลือ' },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40"
            >
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-200">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold gradient-heading mb-3">KeyUnai</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Your ultimate destination for digital game keys. Play more, pay less.
          </p>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} KeyUnai. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
