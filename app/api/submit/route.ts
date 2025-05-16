  import type { NextApiRequest, NextApiResponse } from "next";
  import { google } from "googleapis";

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      if(req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
      }

    const { name, romaji, keyword, dir } = req.body;

    const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: key.client_email,
        private_key: key.private_key
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, romaji, keyword, dir]],
      }
    })

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}