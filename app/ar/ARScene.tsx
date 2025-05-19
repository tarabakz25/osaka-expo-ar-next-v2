"use client";

/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from "react";

// AR用の型拡張
declare global {
  interface Window {
    arCameraInitialized?: boolean;
  }
}
import { projects } from "@/data/projects";

interface ARSceneProps {
  selectedProject: any;
  selectedProjectIndex: number;
}

export default function ARScene({ selectedProject, selectedProjectIndex }: ARSceneProps) {
  const arSceneRef = useRef<HTMLDivElement>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("初期化中...");
  
  // カメラ権限の確認と状態管理
  useEffect(() => {
    console.log("カメラ初期化を試みています...");
    const checkCameraPermission = async () => {
      try {
        // モバイルブラウザ向けの最適化: ユーザージェスチャーが必要
        if (!window.arCameraInitialized) {
          console.log("カメラアクセス開始");
          const constraints = {
            video: {
              facingMode: 'environment', // リアカメラを優先
              width: { ideal: window.innerWidth },
              height: { ideal: window.innerHeight }
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("カメラ権限が許可されました", stream);
          setCameraStatus("カメラ権限OK");
          // 確認用のストリームを停止
          stream.getTracks().forEach(track => track.stop());
          window.arCameraInitialized = true;
        }
      } catch (err) {
        console.error("カメラ権限エラー:", err);
        setCameraStatus(`カメラエラー: ${err instanceof Error ? err.message : String(err)}`);
        // iOS Safariでのカメラエラーメッセージをよりわかりやすくする
        if (String(err).includes('NotAllowedError') || String(err).includes('SecurityError')) {
          setCameraStatus('カメラへのアクセスが拒否されました。設定から許可してください。');
        }
      }
    };
    
    // 少し遅延させてカメラにアクセス (スクリプト読み込み完了後)
    setTimeout(checkCameraPermission, 1000);
  }, []);
  
  // AR.jsのカメラビューを画面全体に表示するためのスタイリング
  useEffect(() => {
    // ウェブカメラ要素のスタイルを調整
    const applyStyles = () => {
      // 全体のスタイルを追加
      const style = document.createElement('style');
      style.textContent = `
        .a-canvas, .a-canvas.fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 1 !important;
          object-fit: cover !important;
          transform: none !important;
        }
        
        canvas.a-canvas {
          width: 100vw !important;
          height: 100vh !important;
          left: 0 !important;
          position: fixed !important;
        }
        
        video {
          object-fit: cover !important;
          width: 100vw !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
        }
        
        .a-enter-vr, .a-enter-ar {
          display: none !important;
        }

        /* AR.js specific styles */
        .a-canvas.a-grab-cursor:hover {
          cursor: grab !important;
        }
        
        .a-canvas.a-grab-cursor:active {
          cursor: grabbing !important;
        }
      `;
      document.head.appendChild(style);

      // カメラ要素も直接スタイリング
      setTimeout(() => {
        const canvas = document.querySelector('.a-canvas') as HTMLElement;
        if (canvas) {
          console.log('AR Canvas found:', canvas);
          canvas.style.width = '100vw';
          canvas.style.height = '100vh';
          canvas.style.position = 'fixed';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.right = '0';
          canvas.style.bottom = '0';
          canvas.style.zIndex = '1';
          canvas.style.objectFit = 'cover';
          canvas.style.transform = 'none';
        } else {
          console.warn('AR Canvas not found');
        }
        
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          console.log('Found video element:', video);
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.objectFit = 'cover';
          video.style.position = 'fixed';
          video.style.top = '0';
          video.style.left = '0';
        });
      }, 1000);

      return style;
    };

    const style = applyStyles();
    
    // リサイズイベントでカメラを調整
    const handleResize = () => {
      const canvas = document.querySelector('.a-canvas') as HTMLElement;
      if (canvas) {
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
      }
      
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.style.width = window.innerWidth + 'px';
        video.style.height = window.innerHeight + 'px';
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.head.removeChild(style);
      window.removeEventListener('resize', handleResize);
    };
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

    // A-Frameとカメラが読み込まれたかチェック
    const checkARJSLoaded = () => {
      const scene = document.querySelector('a-scene');
      const video = document.querySelector('video.a-canvas');
      
      if (scene) {
        console.log('A-Frame scene loaded:', scene);
        setCameraStatus(prev => prev + ", A-Frame OK");
      } else {
        console.warn('A-Frame scene not loaded');
        setCameraStatus(prev => prev + ", A-Frame未検出");
      }
      
      if (video) {
        console.log('AR.js camera video found:', video);
        setCameraStatus(prev => prev + ", カメラ表示OK");
      } else {
        console.warn('AR.js camera video not found');
        setCameraStatus(prev => prev + ", カメラ未検出");
      }
    };
    
    // A-Frameのシーンロード後にチェック
    setTimeout(checkARJSLoaded, 3000);

    // クリーンアップ: コンポーネントアンマウント時にリスナーを削除
    return () => {
      marker?.removeEventListener("markerFound", markerFoundHandler);
      marker?.removeEventListener("markerLost", markerLostHandler);
      projectVideo?.removeEventListener("ended", () => {});
      watchAgainButton?.removeEventListener("click", () => {});
    };
  }, [selectedProject, selectedProjectIndex]);

  // AR.jsの設定を改善し、モバイルブラウザでの互換性を高める
  const arSceneMarkup = `
    <a-scene
      vr-mode-ui="enabled: false;"
      renderer="logarithmicDepthBuffer: true; precision: medium; antialias: true;"
      embedded
      loading-screen="enabled: false;"
      device-orientation-permission-ui="enabled: true"
      arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; maxDetectionRate: 30; canvasWidth: window.innerWidth; canvasHeight: window.innerHeight;">
      
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
      
      <a-entity camera="fov: 80; active: true;"></a-entity>
    </a-scene>
  `;

  return (
    <>
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
      
      {/* カメラ状態表示 */}
      <div style={{
        position: 'fixed',
        top: '35px',
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px',
        fontSize: '12px',
        zIndex: 100,
        width: '100%',
        textAlign: 'center'
      }}>
        カメラ状態: {cameraStatus}
      </div>

      {/* サイズガイド - デバッグ用 */}
      <div style={{
        position: 'fixed',
        bottom: '70px',
        left: 0,
        width: '100%',
        textAlign: 'center',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '5px',
        fontSize: '10px',
        zIndex: 1000
      }}>
        画面サイズ: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '読込中...'}
      </div>
    </>
  );
} 