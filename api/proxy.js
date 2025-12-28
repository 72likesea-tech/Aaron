import OpenAI from 'openai';

export const config = {
    runtime: 'edge', // Optional: Use Edge runtime for better performance if compatible, or stick to default (Node.js)
};

export default async function handler(request) {
    // Handle CORS preflight request
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.error('Missing OPENAI_API_KEY environment variable');
            return new Response(JSON.stringify({
                error: 'Server configuration error: Missing API Key',
                hint: 'Please set OPENAI_API_KEY in Vercel Settings'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const body = await request.json();
        const { messages, model, max_tokens, temperature } = body;

        const completion = await openai.chat.completions.create({
            messages,
            model: model || 'gpt-4o-mini',
            max_tokens: max_tokens,
            temperature: temperature,
        });

        return new Response(JSON.stringify(completion), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return new Response(JSON.stringify({
            error: 'Error processing request',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
