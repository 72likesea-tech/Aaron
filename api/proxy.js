import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model, max_tokens, temperature } = request.body;

        const completion = await openai.chat.completions.create({
            messages,
            model: model || 'gpt-4o-mini',
            max_tokens: max_tokens,
            temperature: temperature,
        });

        return response.status(200).json(completion);
    } catch (error) {
        console.error('OpenAI API Error:', error);
        return response.status(500).json({ error: 'Error processing request', details: error.message });
    }
}
