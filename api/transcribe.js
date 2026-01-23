import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

// Force redeploy: 2026-01-23 19:17

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // CORS Headers
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
            console.error('SERVER ERROR: Missing OPENAI_API_KEY');
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const openai = new OpenAI({ apiKey });
        const form = formidable({});

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Formidable parsing error:', err);
                    reject(err);
                }
                resolve([fields, files]);
            });
        });

        const audioFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!audioFile) {
            console.error('No file found in request');
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('Transcribing file:', audioFile.filepath || audioFile.path);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioFile.filepath || audioFile.path),
            model: "whisper-1",
        });

        // Clean up temp file
        try {
            fs.unlinkSync(audioFile.filepath || audioFile.path);
        } catch (e) {
            console.warn('Failed to delete temp file:', e);
        }

        return res.status(200).json({ text: transcription.text });
    } catch (error) {
        console.error('Transcription API Error Detail:', error);
        return res.status(500).json({
            error: 'Transcription API Internal Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
