import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

// Disable Vercel's default body parsing to handle multipart/form-data
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Missing API Key' });
        }

        const openai = new OpenAI({ apiKey });

        const form = formidable();

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const audioFile = files.file?.[0] || files.file; // formidable v3 returns arrays
        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFile.filepath),
            model: "whisper-1",
        });

        return res.status(200).json(transcription);
    } catch (error) {
        console.error('Transcription API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
