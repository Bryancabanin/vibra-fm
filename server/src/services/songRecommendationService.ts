import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RecommendationResult {
  artist: string;
  song: string;
}

export const recommendSongs = async (
  artist: string,
  song: string,
): Promise<RecommendationResult[]> => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: ` 
          You are a music similarity recommendation system. 
          
          Given a user-provided ${artist} and ${song}, your job is to recommend songs that are musically similar.
          
          You should analyze the input song in terms of:
          - Genre
          - Mood / emotional tone
          - Energy level (calm, medium, high)
          - Instrumentation and production style
          - Vocal style
          - Era / release period (if relevant)
          
          Then recommend songs that closely match these qualities.
          
          Rules:
          - Begin by identifying the input song's genre, mood, energy level, instrumentation, and vocal style. Then use this analysis to guide recommendations.
          - Prioritize sonic similarity over popularity
          - Do NOT repeat the input song or same exact remix
          - Keep recommendations tightly matched (avoid loosely related songs)

          Format:
          - ONLY return exact JSON array of object with artist and song fields
          - Make 50-60 recommendations
          - DO NOT return markdown ONLY RETURN JSON
          `,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'song_recommendations',
          schema: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    artist: { type: 'string' },
                    song: { type: 'string' },
                  },
                  required: ['artist', 'song'],
                },
              },
            },
            required: ['recommendations'],
          },
        },
      },
    });

    const raw = response.choices[0].message.content ?? '';

    // Safety net in case AI returns markdown anyway
    const cleaned = raw.replace(/```json|```/g, '').trim();

    const parsed: { recommendations: RecommendationResult[] } =
      JSON.parse(cleaned);

    return parsed.recommendations;
  } catch (error) {
    console.error('OpenAI recommendation failed', error);
    throw error;
  }
};
