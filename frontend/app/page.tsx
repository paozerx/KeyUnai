import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <h1 className="text-5xl font-bold text-blue-500 mb-4">
        Welcome to KeyUnai 🎮
      </h1>
      <p className="text-xl text-gray-300">
        แพลตฟอร์มซื้อขายคีย์เกมที่เจ๋งที่สุด
      </p>
    </main>
  );
}