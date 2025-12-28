import OpenAI from 'openai';

// Remove Edge runtime config to use standard Node.js Serverless Function
// This ensures maximum compatibility with the OpenAI SDK

export default async function handler(req, res) {
    // Handle CORS manully
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle Preflight
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
            console.error('Missing OPENAI_API_KEY environment variable');
            return res.status(500).json({
                error: 'Server configuration error: Missing API Key',
                hint: 'Please set OPENAI_API_KEY in Vercel Settings'
            });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const { messages, model, max_tokens, temperature } = req.body;

        const completion = await openai.chat.completions.create({
            messages,
            model: model || 'gpt-4o-mini',
            max_tokens: max_tokens,
            temperature: temperature,
        });

        return res.status(200).json(completion);
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return res.status(500).json({
            error: 'Error processing request',
            details: error.message
        });
    }
}
