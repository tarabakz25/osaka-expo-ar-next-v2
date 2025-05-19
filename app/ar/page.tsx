// @ts-nocheck

"use client";

/* eslint-disable react/no-unknown-property */
/* eslint-disable @next/next/no-img-element */

// Astro の ar.astro を Next.js(App Router) に移植したページコンポーネント
// DOM 上の ID や構造は元の実装と互換性を保つようにしているため、
// 既存のスクリプトロジック(マーカー検知・動画再生等)をそのまま流用できます。

import { useEffect, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { projects } from "@/data/projects";
import dynamic from "next/dynamic";
import Head from "next/head";

// A-Frameシーンをクライアントサイドのみでレンダリングするためのダイナミックインポート
const ARScene = dynamic(() => import('./ARScene'), {
  ssr: false, // サーバーサイドレンダリングを無効化
  loading: () => <div style={{ textAlign: 'center', marginTop: '2rem' }}>AR読み込み中...</div>
});

export default function ARPage() {
  const [showARScene, setShowARScene] = useState(false);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState({ project: null, index: 0 });
  const [debug, setDebug] = useState({ status: "準備中...", error: null });

  // スタイルの追加
  useEffect(() => {
    // 全体のスタイルを調整
    const style = document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100vw;
        height: 100vh;
      }
      
      #arjsContent {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    // カメラの状態をチェック
    const checkCameraStatus = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          setDebug(prev => ({ ...prev, status: "カメラ権限: OK" }));
          stream.getTracks().forEach(track => track.stop());  // カメラをすぐに停止
        })
        .catch((err) => {
          setDebug(prev => ({ ...prev, status: "カメラエラー", error: err.message }));
          console.error("カメラアクセスエラー:", err);
        });
    };

    checkCameraStatus();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // メインの副作用: 初回マウント時に元 ar.astro のスクリプトを実行
  useEffect(() => {
    // プロジェクト選択情報を取得
    const urlParams = new URLSearchParams(window.location.search);
    const projectDirParam = urlParams.get("project");

    // sessionStorage は watchAgain 時に利用
    const storedDir = sessionStorage.getItem("selectedProjectDir");
    const storedIndex = sessionStorage.getItem("selectedProject");

    let selectedProject;
    let selectedProjectIndex = 0;

    if (projectDirParam) {
      selectedProject = projects.find((p) => p.dir === projectDirParam);
      if (selectedProject) {
        selectedProjectIndex = projects.findIndex((p) => p.dir === projectDirParam);
      }
    }

    // URL に無ければ sessionStorage でフォールバック
    if (!selectedProject && storedDir) {
      selectedProject = projects.find((p) => p.dir === storedDir);
      if (selectedProject) {
        selectedProjectIndex = projects.findIndex((p) => p.dir === storedDir);
      }
    }

    // さらに無ければ index 数値を使う
    if (!selectedProject && storedIndex) {
      const idx = parseInt(storedIndex, 10) || 0;
      selectedProjectIndex = idx;
      selectedProject = projects[idx];
    }

    // デフォルトフォールバック
    if (!selectedProject) {
      selectedProject = projects[0];
      selectedProjectIndex = 0;
    }

    setSelectedProjectInfo({
      project: selectedProject,
      index: selectedProjectIndex
    });

    setShowARScene(true);
  }, []);

  // 開始インストラクションがクリックされたときの処理
  const handleStartClick = () => {
    const startOverlay = document.getElementById("startOverlay");
    const markerGuide = document.getElementById("markerGuide");

    if (startOverlay) startOverlay.style.display = "none";

    // マーカーガイドを遅延表示
    setTimeout(() => {
      if (markerGuide) {
        markerGuide.style.display = "flex";
        setTimeout(() => {
          markerGuide.style.opacity = "1";
        }, 50);
      }
    }, 1500);
  };

  return (
    <div id="arjsContent">
      {/* 外部スクリプト */}
      <Script src="https://aframe.io/releases/1.0.4/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/3.0.0/aframe/build/aframe-ar.js" strategy="beforeInteractive" />
      
      {/* スタイル追加 */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        #arjsContent {
          position: relative;
          width: 100vw;
          height: 100vh;
        }

        .a-canvas {
          width: 100% !important;
          height: 100% !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: -1 !important;
        }
        
        /* AR.js UI要素を非表示 */
        .a-enter-vr, .a-enter-ar {
          display: none !important;
        }
      `}</style>

      {/* デバッグ情報 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        状態: {debug.status}
        {debug.error && <div>エラー: {debug.error}</div>}
      </div>

      {/* 開始インストラクション */}
      <div
        id="startOverlay"
        onClick={handleStartClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
          textAlign: "center",
          flexDirection: "column",
          fontSize: "1.2em",
          cursor: "pointer",
        }}
      >
        <p>ARを開始するには</p>
        <p>画面をタップしてください</p>
        <p style={{ fontSize: '0.8em', marginTop: '1em', color: '#aaa' }}>カメラの使用許可が求められます</p>
      </div>

      {/* マーカー案内画像 */}
      <div 
        id="markerGuide" 
        style={{ 
          display: "none", 
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50,
          opacity: 0,
          transition: "opacity 0.5s ease-in-out",
          textAlign: "center"
        }}
      >
        <div className="marker-image-container">
          <Image src="/marker-announce.svg" alt="マーカー案内" width={400} height={300} />
        </div>
      </div>

      {/* 動画終了後の thank you UI */}
      <div id="thankYouContainer" style={{ 
        display: "none", 
        textAlign: "center",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "90%",
        width: "400px"
      }}>
        <h2>ご視聴ありがとうございました！</h2>
        <p>学生の作品はいかがでしたか？</p>
        <p>良ければ、学生へのメッセージをお願いします。</p>
        <a href="/message" id="messageButton" style={{
          display: "inline-block",
          backgroundColor: "#00a0e9",
          color: "white",
          padding: "10px 20px",
          textDecoration: "none",
          borderRadius: "5px",
          margin: "10px 0 20px",
          fontWeight: "bold"
        }}>
          Send Message!
        </a>
        <div className="project-selection">
          <p>他の作品も見ますか？</p>
          <select id="projectSelector" style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "5px"
          }}>
            {projects.map((project, index) => (
              <option key={project.dir} value={index}>
                {project.name} - {project.keyword}
              </option>
            ))}
          </select>
          <button id="watchAgainButton" style={{
            backgroundColor: "#00a0e9",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>Start!</button>
        </div>
      </div>

      {/* クライアントサイドのみでレンダリングするARシーン */}
      {showARScene && (
        <ARScene selectedProject={selectedProjectInfo.project} selectedProjectIndex={selectedProjectInfo.index} />
      )}

      {/* 位置調整ガイド */}
      <div className="position-guide text-center px-4 py-2" style={{
        position: "fixed",
        bottom: "20px",
        left: "0",
        right: "0",
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "10px",
        zIndex: 40
      }}>
        <h2>マーカーを画面に写してください</h2>
        <p>
          上のマーカーを写すと動画が再生されます。<br />マーカーは紙に印刷するか、別の画面に表示することもできます。
        </p>
      </div>
    </div>
  );
}
