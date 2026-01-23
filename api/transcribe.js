import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

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
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const openai = new OpenAI({ apiKey });
        const form = formidable({});

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve([fields, files]);
            });
        });

        const audioFile = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // OpenAI's SDK needs a file with a proper extension to recognize the format.
        // On Vercel, formidable temp files often don't have extensions.
        // We use OpenAI.toFile to wrap the stream with a proper filename.
        const transcription = await openai.audio.transcriptions.create({
            file: await OpenAI.toFile(
                fs.createReadStream(audioFile.filepath || audioFile.path),
                audioFile.originalFilename || 'audio.webm'
            ),
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
        console.error('Transcription API Error:', error);
        return res.status(500).json({
            error: 'Transcription Failed',
            message: error.message
        });
    }
}
