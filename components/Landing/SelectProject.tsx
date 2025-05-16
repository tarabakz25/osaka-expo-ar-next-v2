import { projects } from "@/data/projects";
import { Project } from "@/types/project";
import Image from "next/image";

export default function SelectProject() {
  return (
    <div>
      <h2 className="text-2xl font-bold">プロジェクトを選択してください</h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project: Project) => (
            <div key={project.dir} className="relative">
              <Image 
                src="/businessCard.svg" 
                alt={`${project.name}の名刺`} 
                width={1000} 
                height={1000} 
                className="w-[128px] h-auto"
              />
              <div className="flex flex-col gap-2 absolute top-0 left-0 w-full p-4 text-black">
                <h1 className="text-lg font-bold">{project.name}</h1>
                <h2 className="text-sm">{project.romaji}</h2>
                <p className="text-xs">{project.keyword}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}