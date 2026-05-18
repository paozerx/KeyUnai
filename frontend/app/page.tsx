import GameCard from '@/components/GameCard';
import SearchBar from '@/components/SearchBar'; // 💡 1. นำเข้า SearchBar

interface Game {
  id: number;
  title: string;
  description: string;
  price: string;
  platform: string;
  cover_image_url: string;
}

// 💡 2. ปรับฟังก์ชันให้รับคำค้นหา (query) และส่งต่อไปที่ Backend
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

// 💡 3. รับค่า searchParams จาก URL ของ Next.js
export default async function Home({ searchParams }: any) {
  // แก้ปัญหาการอ่านค่าจาก URL ให้รองรับ Next.js ทุกเวอร์ชัน
  const params = await Promise.resolve(searchParams);
  const search = params?.search || '';

  // สั่งดึงข้อมูลพร้อมคำค้นหา
  const games: Game[] = await getGames(search);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Latest Trending Games
        </h1>
        <p className="text-gray-400 text-lg">
          เลือกซื้อคีย์เกมแท้ ส่งตรงถึงมือคุณทันทีตลอด 24 ชั่วโมง
        </p>
      </div>

      {/* 💡 4. วาง SearchBar ไว้ตรงนี้ */}
      <SearchBar />

      {games.length === 0 ? (
        <div className="text-center bg-slate-800/50 rounded-xl p-10 border border-slate-700 mt-10">
          <p className="text-gray-400 text-xl">
            {/* แยกข้อความแจ้งเตือนให้ชัดเจนขึ้น */}
            {search ? `ไม่พบเกมที่ชื่อ "${search}" ในระบบ` : 'ยังไม่มีเกมในระบบตอนนี้'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

    </main>
  );
}