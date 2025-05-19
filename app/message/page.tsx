"use client";

import { useState, useEffect } from "react";
import { projects } from "@/data/projects";
import type { Project } from "@/types/project";
import ParticlesBg from "@/components/ParticlesBg";

export default function Message() {
  const [name, setName] = useState("");
  const [projectIndex, setProjectIndex] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // セッションストレージから選択されたプロジェクトを取得
    const selectedProjectIndex = sessionStorage.getItem("selectedProject");
    if (selectedProjectIndex !== null) {
      setProjectIndex(selectedProjectIndex);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // プロジェクト名を取得
    let projectName = "";
    const selectedProject = projects[Number(projectIndex)];
    if (selectedProject) {
      projectName = `${selectedProject.name} - ${selectedProject.keyword}`;
    }

    const requestData = { 
      name, 
      project: projectName, 
      message 
    };
    
    console.log("送信データ:", requestData);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("API レスポンスステータス:", res.status);
      
      const json = await res.json();
      console.log("API レスポンス:", json);
      
      if (json.message === "Success") {
        setShowThankYou(true);
      } else {
        setError(json.error || json.message || "送信に失敗しました");
        console.error("エラーレスポンス:", json);
      }
    } catch (error) {
      console.error("送信中にエラーが発生しました:", error);
      setError("エラーが発生しました。ネットワーク接続を確認するか、もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ParticlesBg />

      <h2 className="text-gray-800 text-center text-2xl text-white font-bold mx-10 my-15">
        ご視聴ありがとうございました！良ければ、学生にメッセージをお願いいたします。
      </h2>
      
      <div className="max-w-3xl mx-auto my-12 p-8 bg-white/60 rounded-2xl shadow-lg backdrop-blur-md z-10 relative">
        {!showThankYou ? (
          <form id="messageForm" className="flex flex-col gap-5 text-black" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name">お名前（ニックネーム）</label>
              <input
                type="text"
                id="name"
                name="name"
                className="p-3 border border-gray-300 rounded-md text-base w-full"
                placeholder="お名前を入力"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="projectName">見たプロジェクト</label>
              <select
                id="projectName"
                name="projectName"
                className="p-3 border border-gray-300 rounded-md text-base w-full"
                required
                value={projectIndex}
                onChange={(e) => setProjectIndex(e.target.value)}
              >
                <option value="" disabled>プロジェクトを選択してください</option>
                {projects.map((project, index) => (
                  <option key={index} value={index}>
                    {project.name} - {project.keyword}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="message">メッセージ</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="p-3 border border-gray-300 rounded-md text-base w-full resize-y"
                placeholder="メッセージを入力"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            {error && (
              <div className="text-red-500 p-3 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 mt-3 justify-center">
              <button 
                type="submit" 
                className="px-6 py-3 rounded-md text-base cursor-pointer transition-all duration-300 text-center bg-blue-500 text-white border-none hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "送信中..." : "送信する"}
              </button>
              <a href="/" className="px-6 py-3 rounded-md text-base cursor-pointer transition-all duration-300 text-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200">トップに戻る</a>
            </div>
          </form>
        ) : (
          <div className="text-center p-8">
            <h2 className="mb-4 text-blue-500">メッセージを送信しました！</h2>
            <p className="mb-6 text-lg text-black">ご参加いただきありがとうございます。</p>
            <a href="/" className="px-6 py-3 rounded-md text-base cursor-pointer transition-all duration-300 text-center bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200">トップに戻る</a>
          </div>
        )}
      </div>
    </div>
  );
}