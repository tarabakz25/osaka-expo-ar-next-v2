import { projects } from "@/data/projects";
import { Project } from "@/types/project";
import Image from "next/image";

export default function SelectProject() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">プロジェクトを選択してください</h2>
      {/* カード一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <div
            key={project.dir}
            className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* 背景イメージ */}
            <Image
              src="/businessCard.svg"
              alt={`${project.name}の名刺`}
              width={1000}
              height={1000}
              priority
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* 画像上に乗せるグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />

            {/* テキストエリア */}
            <div className="absolute bottom-0 left-0 w-full p-4 text-white z-10">
              <h1 className="text-lg font-bold tracking-wide drop-shadow-lg">
                {project.name}
              </h1>
              <h2 className="text-sm opacity-90">{project.romaji}</h2>
              <p className="text-xs opacity-80 mt-1">{project.keyword}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}