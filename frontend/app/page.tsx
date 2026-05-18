import Link from 'next/link';
import GameCard from '@/components/GameCard';
// 1. กำหนดหน้าตาข้อมูลเกม (TypeScript Interface) ให้ตรงกับที่ Django ส่งมา
interface Game {
  id: number;
  title: string;
  description: string;
  price: string;
  platform: string;
  cover_image_url: string;
}

async function getGames() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home() {
  const games: Game[] = await getGames();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Latest Trending Games
        </h1>
        <p className="text-gray-400 text-lg">
          เลือกซื้อคีย์เกมแท้ ส่งตรงถึงมือคุณทันทีตลอด 24 ชั่วโมง
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">ยังไม่มีเกมในระบบตอนนี้</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* 💡 วนลูปส่งข้อมูลเกมเข้าไปใน GameCard */}
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}