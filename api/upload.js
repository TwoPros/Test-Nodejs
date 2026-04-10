import Busboy from "busboy";
import { google } from "googleapis";

export const config = {
  api: {
    bodyParser: false // 🚨 REQUIRED
  }
};

export default async function handler(req, res) {
  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  auth.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const drive = google.drive({ version: "v3", auth });

  const busboy = Busboy({ headers: req.headers });

  let uploadPromise;

  busboy.on("file", (fieldname, file, info) => {
    const { filename, mimeType } = info;

    uploadPromise = drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.FOLDER_ID]
      },
      media: {
        mimeType,
        body: file // ✅ direct stream
      }
    });
  });

  busboy.on("finish", async () => {
    try {
      const response = await uploadPromise;

      res.status(200).json({
        message: "Uploaded",
        fileId: response.data.id
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  req.pipe(busboy);
}