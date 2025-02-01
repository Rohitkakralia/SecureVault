import Image from "next/image";
export default function Home() {
  return (
    <>
      <div className=" min-h-screen flex items-center justify-center px-6 text-white">
      <div className="max-w-6xl flex flex-col md:flex-row items-center gap-10">
        <div className="text-center md:text-left max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Secure Documents with <span className="text-[#F6E6CB]">SecureVault</span>
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Project management software that enables your teams to collaborate, plan, analyze, and manage everyday tasks.
          </p>
          <button className="bg-[#4C8BF5] hover:bg-[#3A73CC] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2">
            Save Your Documents For Free →
          </button>
        </div>
        <div className="relative w-[500px] h-[300px] md:h-[400px]">
          <Image src="/background.jpg" alt="Illustration" layout="fill" objectFit="contain" />
        </div>
      </div>
    </div>
    </>
  );
}
