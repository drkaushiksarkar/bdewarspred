'use server';

/**
 * @fileOverview An AI agent that answers questions about a dataset.
 *
 * - answerQuestion - A function that answers a user's question based on provided data context.
 * - DataQaInput - The input type for the answerQuestion function.
 * - DataQaOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataQaInputSchema = z.object({
  question: z.string().describe('The user\'s question about the data.'),
  dataDescription: z.string().describe('A description of the available dataset, its columns, and their meanings.'),
  dataSample: z.string().describe('A sample of the data to be analyzed in JSON format.'),
});
export type DataQaInput = z.infer<typeof DataQaInputSchema>;

const DataQaOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user\'s question.'),
});
export type DataQaOutput = z.infer<typeof DataQaOutputSchema>;

export async function answerQuestion(input: DataQaInput): Promise<DataQaOutput> {
  return dataQaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataQaPrompt',
  input: {schema: DataQaInputSchema},
  output: {schema: DataQaOutputSchema},
  prompt: `You are an expert data analyst for the EWARS Bangladesh dashboard. Your task is to answer a user's question based on the provided data context.
  The data context includes a description of the available data sources and a JSON sample.
  Analyze the user's question and use the provided data to form a clear, concise, and accurate answer.

  User Question: {{{question}}}

  Data Description:
  {{{dataDescription}}}

  Data Sample:
  \`\`\`json
  {{{dataSample}}}
  \`\`\`

  Provide only the answer to the question.
  `,
});

const dataQaFlow = ai.defineFlow(
  {
    name: 'dataQaFlow',
    inputSchema: DataQaInputSchema,
    outputSchema: DataQaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
