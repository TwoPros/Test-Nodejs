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
        const response = await drive.files.list({
            q: `'${process.env.FOLDER_ID}' in parents`,
            fields: "files(id, name)"
        });

        res.status(200).json(response.data.files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}