import GameCard from '@/components/GameCard';
import { Gamepad2, Sparkles } from 'lucide-react';

interface Game {
  id: number;
  title: string;
  description: string;
  price: string;
  platform: string;
  cover_image_url: string;
}

async function getGames(query: string = '') {
  try {
    const url = query
      ? `${process.env.NEXT_PUBLIC_API_URL}/games/?search=${query}`
      : `${process.env.NEXT_PUBLIC_API_URL}/games/`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home({ searchParams }: any) {
  const params = await Promise.resolve(searchParams);
  const search = params?.search || '';
  const games: Game[] = await getGames(search);

  return (
    <div className="page-shell sm:px-6 lg:px-8 sm:py-12">
      <section className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>คีย์เกมแท้ ส่งทันที 24/7</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight gradient-heading mb-5">
          Latest Trending Games
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          เลือกซื้อคีย์เกมแท้ ส่งตรงถึงมือคุณทันทีตลอด 24 ชั่วโมง
        </p>
      </section>

      {games.length === 0 ? (
        <div className="empty-state sm:p-16">
          <Gamepad2 className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 text-xl font-medium mb-2">
            {search ? 'ไม่พบเกมที่คุณค้นหา' : 'ยังไม่มีเกมในระบบ'}
          </p>
          <p className="text-slate-500">
            {search ? 'ลองเปลี่ยนคำค้นหาหรือค้นหาชื่อเกมอื่นดูสิ' : 'กลับมาใหม่เร็วๆ นี้'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 px-1">
            <p className="text-slate-400 text-sm">
              {search ? (
                <>
                  ผลการค้นหา <span className="text-slate-200 font-medium">&quot;{search}&quot;</span>
                </>
              ) : (
                'เกมยอดนิยม'
              )}
            </p>
            <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
              {games.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
