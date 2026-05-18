import Link from 'next/link';

// 1. กำหนดหน้าตาข้อมูลเกม (TypeScript Interface) ให้ตรงกับที่ Django ส่งมา
interface Game {
  id: number;
  title: string;
  description: string;
  price: string;
  platform: string;
  cover_image_url: string;
}

// 2. ฟังก์ชันดึงข้อมูลจาก Backend
async function getGames() {
  try {
    // ใช้ตัวแปร NEXT_PUBLIC_API_URL ที่เราตั้งไว้ใน .env.local
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/games/`, { 
      cache: 'no-store' // บอกให้ดึงข้อมูลใหม่ทุกครั้ง ไม่ต้องจำของเก่า
    });
    
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 3. หน้าจอหลัก (Home Page)
export default async function Home() {
  // สั่งดึงข้อมูลเกมมารอไว้เลย
  const games: Game[] = await getGames();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* ส่วนหัว */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Latest Trending Games
        </h1>
        <p className="text-gray-400 text-lg">
          เลือกซื้อคีย์เกมแท้ ส่งตรงถึงมือคุณทันทีตลอด 24 ชั่วโมง
        </p>
      </div>

      {/* โซนแสดงการ์ดเกม (Grid) */}
      {games.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          ยังไม่มีเกมในระบบตอนนี้ ลองเข้าไปเพิ่มเกมในหลังบ้าน Django ดูสิ!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* ลูปสร้างการ์ดเกมทีละอัน */}
          {games.map((game) => (
            <div key={game.id} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-blue-500 hover:-translate-y-1 transition duration-300 flex flex-col">
              
              {/* รูปปกเกม */}
              <div className="aspect-[3/4] w-full bg-slate-900 relative">
                {game.cover_image_url ? (
                  <img 
                    src={game.cover_image_url} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-slate-600">
                    No Image
                  </div>
                )}
                {/* ป้ายบอกแพลตฟอร์ม */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                  {game.platform}
                </div>
              </div>

              {/* รายละเอียดด้านล่าง */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{game.title}</h3>
                <p className="text-xl font-extrabold text-emerald-400 mt-auto mb-4">
                  ฿{parseFloat(game.price).toLocaleString()}
                </p>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition">
                  Add to Cart
                </button>
              </div>
              
            </div>
          ))}
          
        </div>
      )}

    </main>
  );
}