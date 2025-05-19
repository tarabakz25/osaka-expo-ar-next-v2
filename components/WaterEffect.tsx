/** @jsxImportSource @emotion/react */
"use client"

import { useEffect, useRef } from "react"
import { css } from "@emotion/react"

export default function WaterEffect() {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// jQueryとjquery.ripplesをクライアントサイドでのみ読み込む
		const loadScripts = async () => {
			// jQueryが既に読み込まれていない場合のみ読み込む
			if (!(window as any).jQuery) {
				const jquery = document.createElement("script")
				jquery.src = "https://code.jquery.com/jquery-3.6.0.min.js"
				document.body.appendChild(jquery)

				// jQueryが読み込まれるのを待つ
				await new Promise<void>((resolve) => {
					jquery.onload = () => resolve()
				})
			}

			// jquery.ripplesを読み込む
			const ripples = document.createElement("script")
			ripples.src =
				"https://cdnjs.cloudflare.com/ajax/libs/jquery.ripples/0.5.3/jquery.ripples.min.js"
			document.body.appendChild(ripples)

			// スクリプトが読み込まれるのを待つ
			await new Promise<void>((resolve) => {
				ripples.onload = () => resolve()
			})

			// エフェクトを適用
			if (containerRef.current && (window as any).jQuery) {
				try {
					;(window as any).jQuery(containerRef.current).ripples({
						resolution: 512,
						dropRadius: 20,
						perturbance: 0.04,
					})
					
					// コンポーネントがロードされた時に中央に波を立たせる
					setTimeout(() => {
						const $container = (window as any).jQuery(containerRef.current)
						const centerX = $container.width() / 2
						const centerY = $container.height() / 2
						$container.ripples('drop', centerX, centerY, 30, 0.5)
					}, 500) // スクリプト読み込み後少し遅延させて実行
				} catch (e) {
					console.error("Ripples effect could not be initialized", e)
				}
			}
		}

		loadScripts()

		// クリーンアップ関数
		return () => {
			if (containerRef.current && (window as any).jQuery) {
				try {
					;(window as any)
						.jQuery(containerRef.current)
						.ripples("destroy")
				} catch (e) {
					// エラー処理
				}
			}
		}
	}, [])

	return (
		<div
			ref={containerRef}
			css={css`
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: url("/images/water-bg.jpg") no-repeat center center;
				background-size: cover;
				z-index: -1;
			`}
		/>
	)
}
