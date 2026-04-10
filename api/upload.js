import { google } from "googleapis";

const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

auth.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, type, content } = req.body;

        // Validate required fields
        if (!name || !type || !content) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, type, or content' 
            });
        }

        // Validate content is a data URL
        if (!content.includes(',')) {
            return res.status(400).json({ 
                error: 'Invalid content format. Expected data URL' 
            });
        }

        // Convert base64 dataURL → Buffer
        const base64Data = content.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // Validate buffer size (optional: limit to 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            return res.status(400).json({ 
                error: 'File too large. Maximum size is 10MB' 
            });
        }

        // Initialize Google Drive
        const drive = google.drive({ version: "v3", auth });

        // Upload file
        const response = await drive.files.create({
            requestBody: {
                name: name,
                parents: [process.env.FOLDER_ID]
            },
            media: {
                mimeType: type,
                body: buffer
            }
        });

        console.log(`File uploaded successfully: ${name} (${response.data.id})`);

        res.status(200).json({
            message: "Uploaded successfully",
            fileId: response.data.id,
            name: name
        });

    } catch (err) {
        console.error("Upload error:", err);
        
        // Send detailed error response
        res.status(500).json({ 
            error: err.message,
            details: err.response?.data || 'No additional details'
        });
    }
}