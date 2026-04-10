import { google } from "googleapis";

const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

auth.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

export default async function handler(req, res) {
    const drive = google.drive({ version: "v3", auth });

    try {
        const { name, type, content } = req.body;

        // convert base64 dataURL → Buffer
        const base64Data = content.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        const response = await drive.files.create({
            requestBody: {
                name: name,
                parents: [process.env.FOLDER_ID]
            },
            media: {
                mimeType: type,   // image/png, image/jpeg, etc
                body: buffer
            }
        });

        res.status(200).json({
            message: "Uploaded",
            fileId: response.data.id
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}