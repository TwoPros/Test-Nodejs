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
        const { id } = req.body;

        await drive.files.delete({
            fileId: id
        });

        res.status(200).json({
            message: "Deleted"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}