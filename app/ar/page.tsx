'use client'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { AFrame } from 'aframe'
import { projects } from '@/data/projects'


export default function Home() {
  const [video, setVideo] = useState<string>('');
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // AR.js の A-Frame ビルド版を動的に読み込む
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.3.2/aframe/build/aframe-ar.js';
    script.async = true;
    document.head.appendChild(script);

    // クリーンアップ関数を追加
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex flex-col items-center justify-center">
        <p>ARを開始するには</p>
        <p>画面をタップしてください</p>
      </div>
    </div>
  )
}
