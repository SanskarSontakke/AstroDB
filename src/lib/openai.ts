import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Generate embedding vector using OpenAI text-embedding-3-small
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error('Failed to generate embedding:', err);
    return null;
  }
}
