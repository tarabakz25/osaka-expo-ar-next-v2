"use client";

/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from "react";
import { projects } from "@/data/projects";

interface ARSceneProps {
  selectedProject: any;
  selectedProjectIndex: number;
}

export default function ARScene({ selectedProject, selectedProjectIndex }: ARSceneProps) {
  const arSceneRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // ウェブカメラ要素のスタイルを調整（遅延して実行）
    const timer = setTimeout(() => {
      const video = document.querySelector('.a-canvas') as HTMLCanvasElement;
      if (video) {
        console.log('AR Canvas found:', video);
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.zIndex = '1';
      } else {
        console.log('AR Canvas element not found');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // DOM 要素取得
    const marker = document.getElementById("patternMarker") as any;
    const projectVideo = document.getElementById("projectVideo") as HTMLVideoElement | null;
    const projectVideoEntity = document.getElementById("projectVideoEntity") as any;
    const projectText = document.getElementById("projectText") as any;
    const markerGuide = document.getElementById("markerGuide") as HTMLElement | null;
    const thankYouContainer = document.getElementById("thankYouContainer") as HTMLElement | null;

    let canPlayVideo = false;
    let userInteracted = false;

    // マーカー検出時
    const markerFoundHandler = () => {
      console.log("マーカーを検出しました！");
      if (markerGuide) markerGuide.style.display = "none";
      if (canPlayVideo && projectVideoEntity && projectVideo) {
        projectVideoEntity.setAttribute("visible", "true");
        projectVideoEntity.setAttribute("animation", {
          property: "opacity",
          from: 0,
          to: 1,
          dur: 1000,
          easing: "easeOutCubic",
        });
        projectVideo.muted = false; // 音声を有効にする
        projectVideo.play().catch((e) => console.error("Video play error after marker found:", e));
      }
    };

    const markerLostHandler = () => {
      console.log("マーカーを見失いました");
      if (projectVideo && !projectVideo.ended) {
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
      if (markerGuide && !projectVideo?.ended) markerGuide.style.display = "flex";
    };

    // マーカーの監視を開始
    marker?.addEventListener("markerFound", markerFoundHandler);
    marker?.addEventListener("markerLost", markerLostHandler);

    // プロジェクト情報をテキスト表示
    if (projectText && selectedProject) {
      projectText.setAttribute("text", {
        value: `${selectedProject.name}\n${selectedProject.keyword}`,
        align: "center",
        width: 5,
        color: "white",
        wrapCount: 20,
      });
      projectText.setAttribute("visible", "true");
    }

    // 動画ソース設定
    if (projectVideo && selectedProject?.dir) {
      const videoPath = `/items/${selectedProject.dir}/movie.mov`;
      projectVideo.src = videoPath;

      // 再生準備用のミュート再生(モバイルブラウザ対策)
      projectVideo.muted = true;
      const playPromise = projectVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            projectVideo.pause();
            projectVideo.currentTime = 0;
            canPlayVideo = true;
          })
          .catch((error) => console.warn("Initial muted play attempt failed", error));
      }

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
      sessionStorage.setItem("selectedProjectDir", selectedProject.dir);
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
      projectVideo?.removeEventListener("ended", () => {});
      watchAgainButton?.removeEventListener("click", () => {});
    };
  }, [selectedProject, selectedProjectIndex]);

  // デフォルトのhiroマーカーを使用するようにA-Frameのマークアップを修正
  const arSceneMarkup = `
    <a-scene
      vr-mode-ui="enabled: false;"
      renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true;"
      embedded
      loading-screen="enabled: false;"
      arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono;">
      
      <a-assets>
        <video id="projectVideo" loop="false" playsinline muted></video>
      </a-assets>

      <a-marker id="patternMarker" preset="hiro">
        <a-entity
          id="projectText"
          scale="2 2 2"
          position="0 2 0"
          text="value: テスト表示; align: center; width: 2; color: white; background-color: rgba(0,0,0,0.8); wrapCount: 20;"
          visible="false">
        </a-entity>
        <a-video
          id="projectVideoEntity"
          width="4"
          height="2.25"
          position="0 0 0"
          rotation="-90 0 0"
          src="#projectVideo"
          visible="false"
          opacity="0"
          playsinline>
        </a-video>
      </a-marker>
      
      <a-entity camera></a-entity>
    </a-scene>
  `;

  return (
    <div 
      id="arjs-scene" 
      ref={arSceneRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0
      }}
      dangerouslySetInnerHTML={{ __html: arSceneMarkup }}
    />
  );
} 