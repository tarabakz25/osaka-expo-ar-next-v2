import { projects } from "@/data/projects";
import { Project } from "@/types/project";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectProject() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    projects.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index]);
      }, index * 200); // 200ms間隔でフェードイン
    });
  }, []);

  const handleCardClick = (projectDir: string) => {
    router.push(`/ar?project=${projectDir}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold m-10 text-center backdrop-blur-md bg-white/10 p-4 rounded-lg">プロジェクトを<br></br>選択してください</h2>
      {/* カード一覧 */}
      <div className="grid grid-cols-2 gap-8 items-center justify-items-center m-20">
        {projects.map((project: Project, index: number) => (
          <div
            key={project.dir}
            onClick={() => handleCardClick(project.dir)}
            className={`relative w-30 aspect-[128/212] overflow-hidden shadow-lg group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:scale-105 bg-gradient-to-b from-[#e6e6e6] to-[#b3b3b3] ${
              visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* 背景イメージ */}
            <Image
              src="/businessCard.svg"
              alt={`${project.name}の名刺`}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              style={{ zIndex: 1 }}
            />

            {/* テキストエリア（中央配置） */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black z-20 text-center px-2 transition-transform duration-300 group-hover:scale-105">
              <h1 className="text-base font-bold tracking-wide mb-1">
                {project.name}
              </h1>
              <h2 className="text-xs opacity-90 mb-1">{project.romaji}</h2>
              <p className="text-xs opacity-80">{project.keyword}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}