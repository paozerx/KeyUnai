import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, KeyRound, ScrollText, Gamepad2 } from 'lucide-react';
import type { Game } from '@/store/cartStore';
import AddToCartFromDetail from './AddToCartFromDetail';

interface GameDetail extends Game {
  description: string | null;
  detail_info: string;
  key_usage_guide: string;
}

async function getGame(id: string): Promise<GameDetail | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}/games/${id}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  const hasDetail = Boolean(game.detail_info?.trim());
  const hasKeyGuide = Boolean(game.key_usage_guide?.trim());

  return (
    <div className="page-shell sm:px-6 lg:px-8 sm:py-10 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        กลับหน้าร้าน
      </Link>

      <div className="glass-card overflow-hidden shadow-xl shadow-black/10">
        <div className="grid md:grid-cols-[minmax(0,220px)_1fr] gap-0 md:gap-8 p-6 sm:p-8">
          <div className="mx-auto w-full max-w-[200px] md:max-w-none">
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60">
              {game.cover_image_url ? (
                <img
                  src={game.cover_image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                  No Image
                </div>
              )}
            </div>
            <p className="text-center text-xs uppercase tracking-wider text-slate-500 mt-3 font-semibold">
              {game.platform}
            </p>
          </div>

          <div className="min-w-0 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">
              {game.title}
            </h1>

            {game.description ? (
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                {game.description}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4 mt-auto pt-4 border-t border-slate-700/50">
              <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                ฿{parseFloat(game.price).toLocaleString()}
              </p>
              <AddToCartFromDetail game={game} />
            </div>
          </div>
        </div>

        {(hasDetail || hasKeyGuide) && (
          <div className="border-t border-slate-700/50 px-6 sm:px-8 py-8 space-y-10 bg-slate-900/30">
            {hasDetail && (
              <section>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <ScrollText className="w-5 h-5 text-blue-400 shrink-0" />
                  รายละเอียดเกม
                </h2>
                <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {game.detail_info}
                </div>
              </section>
            )}

            {hasKeyGuide && (
              <section>
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
                  วิธีใช้คีย์ / แลกคีย์
                </h2>
                <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-4">
                  {game.key_usage_guide}
                </div>
              </section>
            )}
          </div>
        )}

        {!hasDetail && !hasKeyGuide && (
          <div className="border-t border-slate-700/50 px-6 sm:px-8 py-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <Gamepad2 className="w-10 h-10 text-slate-600" />
            <p>ยังไม่มีรายละเอียดเพิ่มเติม — แอดมินสามารถเพิ่มได้ใน Django Admin</p>
          </div>
        )}
      </div>
    </div>
  );
}
