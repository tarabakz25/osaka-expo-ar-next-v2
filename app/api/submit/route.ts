import { NextResponse } from "next/server";

// Google Apps ScriptのURL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyiSJ660RQD7LVRLk5fthYR6_46p4c8wd9Dzj2V7i8ykdCsHCON3GQHonz4pCSDL82E/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, project, message } = body;

    // 必須パラメータの確認
    if (!name || !project || !message) {
      return NextResponse.json(
        { message: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // Google Apps Scriptに送信するデータ
    const payload = {
      timestamp: new Date().toISOString(),
      projectName: project,
      name: name,
      message: message
    };

    // Google Apps Scriptに送信
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    // Google Apps Scriptはno-corsモードで応答するため、常に成功とみなす
    console.log("メッセージ送信成功:", payload);
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}