import Image from "next/image";

export default function Title() {
  return (
  <div className="flex flex-col items-center justify-center gap-4">
      <Image src="/Kamiyama_Logo.svg" alt="logo" width={100} height={100} className="w-40 h-auto invert"/>
      <h1 className="text-3xl">泉に触れる</h1>
      <h2 className="text-2xl">Touch the "spring"</h2>
    </div>
  )
}