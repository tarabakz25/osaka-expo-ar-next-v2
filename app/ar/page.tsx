// @ts-nocheck

"use client";

/* eslint-disable react/no-unknown-property */
/* eslint-disable @next/next/no-img-element */

// Astro の ar.astro を Next.js(App Router) に移植したページコンポーネント
// DOM 上の ID や構造は元の実装と互換性を保つようにしているため、
// 既存のスクリプトロジック(マーカー検知・動画再生等)をそのまま流用できます。

import { useEffect } from "react";
import Script from "next/script";
import Image from "next/image";
import { projects } from "@/data/projects";

export default function ARPage() {
  // メインの副作用: 初回マウント時に元 ar.astro のスクリプトを実行
  useEffect(() => {
    // ===== ここから元スクリプトをそのまま移植 =====
    // window や document 等のブラウザ API を使用するため、useEffect 内で実行

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

    // DOM 要素取得
    const marker = document.getElementById("patternMarker") as any;
    const projectVideo = document.getElementById("projectVideo") as HTMLVideoElement | null;
    const projectVideoEntity = document.getElementById("projectVideoEntity") as any;
    const projectText = document.getElementById("projectText") as any;
    const startOverlay = document.getElementById("startOverlay") as HTMLElement | null;
    const markerGuide = document.getElementById("markerGuide") as HTMLElement | null;
    const thankYouContainer = document.getElementById("thankYouContainer") as HTMLElement | null;

    let canPlayVideo = false;
    let userInteracted = false;

    // マーカー検出時
    const markerFoundHandler = () => {
      if (markerGuide) markerGuide.style.display = "none";
      if (canPlayVideo && projectVideoEntity && projectVideo) {
        projectVideoEntity.setAttribute("visible", "true");
        projectVideoEntity.setAttribute("animation", {
          property: "opacity",
          from: 0,
          dur: 1000,
          easing: "easeOutCubic",
        });
        projectVideo.play().catch((e) => console.error("Video play error after marker found:", e));
      }
    };

    const markerLostHandler = () => {
      if (projectVideo) {
        projectVideo.pause();
        projectVideoEntity?.setAttribute("animation", {
          property: "opacity",
          from: 1,
          to: 0,
          dur: 500,
          easing: "easeInCubic",
          onComplete: () => projectVideoEntity?.setAttribute("visible", "false"),
        });
      }
      if (markerGuide) markerGuide.style.display = "flex";
    };

    // startOverlay クリックで初期化
    startOverlay?.addEventListener(
      "click",
      () => {
        userInteracted = true;
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

        marker?.addEventListener("markerFound", markerFoundHandler);
        marker?.addEventListener("markerLost", markerLostHandler);

        // 再生準備用のミュート再生(モバイルブラウザ対策)
        if (selectedProject?.dir && projectVideo) {
          const playPromise = projectVideo.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                projectVideo.pause();
                projectVideo.currentTime = 0;
              })
              .catch((error) => console.warn("Initial muted play attempt failed", error));
          }
        }
      },
      { once: true }
    );

    // プロジェクト情報をテキスト表示
    if (projectText && selectedProject) {
      projectText.setAttribute("text", {
        value: `${selectedProject.name}\n${selectedProject.keyword}`,
        align: "center",
        width: 5,
        color: "black",
      });
    }

    // 動画ソース設定
    if (projectVideo && selectedProject?.dir) {
      const videoPath = `/items/${selectedProject.dir}/movie.mov`;
      projectVideo.src = videoPath;

      projectVideo.oncanplay = () => {
        canPlayVideo = true;
      };
    }

    // 動画終了時: お礼メッセージ表示
    projectVideo?.addEventListener("ended", () => {
      marker?.removeEventListener("markerFound", markerFoundHandler);
      marker?.removeEventListener("markerLost", markerLostHandler);
      markerGuide && (markerGuide.style.display = "none");

      if (thankYouContainer) {
        thankYouContainer.style.opacity = "0";
        thankYouContainer.style.display = "block";
        setTimeout(() => {
          thankYouContainer.style.transition = "opacity 1.5s ease-in-out";
          thankYouContainer.style.opacity = "1";
        }, 100);
      }

      // state 保存
      sessionStorage.setItem("selectedProjectDir", selectedProject!.dir);
      sessionStorage.setItem("selectedProject", String(selectedProjectIndex));
    });

    // "他の作品も見る" UI
    const projectSelector = document.getElementById("projectSelector") as HTMLSelectElement | null;
    const watchAgainButton = document.getElementById("watchAgainButton") as HTMLButtonElement | null;

    if (projectSelector && watchAgainButton) {
      // 初期選択
      projectSelector.value = String(selectedProjectIndex);

      watchAgainButton.addEventListener("click", () => {
        const newProjectIndex = Number(projectSelector.value);
        const newProjectDir = projects[newProjectIndex].dir;
        sessionStorage.setItem("selectedProjectDir", newProjectDir);
        sessionStorage.setItem("selectedProject", String(newProjectIndex));
        // ページ再読み込み
        window.location.href = `/ar?project=${newProjectDir}`;
      });
    }

    // クリーンアップ: コンポーネントアンマウント時にリスナーを削除
    return () => {
      marker?.removeEventListener("markerFound", markerFoundHandler);
      marker?.removeEventListener("markerLost", markerLostHandler);
      watchAgainButton?.removeEventListener("click", () => {});
    };
    // ===== ここまで移植スクリプト =====
  }, []);

  return (
    <div id="arjsContent">
      {/* 外部スクリプト */}
      <Script src="https://aframe.io/releases/1.3.0/aframe.min.js" strategy="beforeInteractive" />
      <Script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js" strategy="beforeInteractive" />

      {/* 開始インストラクション */}
      <div
        id="startOverlay"
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
      </div>

      {/* マーカー案内画像 */}
      <div id="markerGuide" style={{ display: "none", alignItems: "center", justifyContent: "center" }}>
        <div className="marker-image-container">
          <Image src="/marker-announce.svg" alt="マーカー案内" width={300} height={300} />
        </div>
      </div>

      {/* 動画終了後の thank you UI */}
      <div id="thankYouContainer" style={{ display: "none", textAlign: "center" }}>
        <h2>ご視聴ありがとうございました！</h2>
        <p>学生の作品はいかがでしたか？</p>
        <p>良ければ、学生へのメッセージをお願いします。</p>
        <a href="/message" id="messageButton">
          Send Message!
        </a>
        <div className="project-selection">
          <p>他の作品も見ますか？</p>
          <select id="projectSelector">
            {projects.map((project, index) => (
              <option key={project.dir} value={index}>
                {project.name} - {project.keyword}
              </option>
            ))}
          </select>
          <button id="watchAgainButton">Start!</button>
        </div>
      </div>

      {/* A-Frame シーン */}
      <div id="arjs-scene">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a-scene
          vr-mode-ui="enabled: false;"
          renderer="logarithmicDepthBuffer: true; precision: medium;"
          embedded="true"
          arjs="trackingMethod: best; sourceType: webcam;"
        >
          {/* アセット管理 */}
          <a-assets>
            <video id="projectVideo" loop={false} playsInline></video>
          </a-assets>

          <a-marker type="pattern" url="/pattern-test.patt" id="patternMarker">
            <a-entity
              id="projectText"
              scale="2 2 2"
              position="2 2 0"
              text="value: テスト表示; align: center; width: 2; color: white; background-color: rgba(0,0,0,0.8); wrapCount: 20;"
              visible="false"
            ></a-entity>
            <a-video
              id="projectVideoEntity"
              width="6"
              height="2"
              position="0.5 0 0"
              rotation="-45 0 0"
              src="#projectVideo"
              visible="false"
              opacity="0"
              playsInline
            ></a-video>
          </a-marker>
          {/* カメラ */}
          <a-entity camera></a-entity>
        </a-scene>
      </div>

      {/* 位置調整ガイド */}
      <div className="position-guide text-center px-4 py-2">
        <h2>マネキン上のマーカーを写して見てください！</h2>
        <p>
          画面で動画の左右の位置を調節できます。<br />動画が大きすぎる時は、少し離れて見て見てください。
        </p>
      </div>
    </div>
  );
}
