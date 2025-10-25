'use server';

/**
 * @fileOverview A data insights AI agent that analyzes data based on user prompts.
 *
 * - getDataInsights - A function that generates data insights from a user prompt.
 * - DataInsightsInput - The input type for the getDataInsights function.
 * - DataInsightsOutput - The return type for the getDataInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataInsightsInputSchema = z.object({
  prompt: z.string().describe('The user prompt requesting data insights.'),
  dataDescription: z.string().describe('Description of the available dataset, its columns, and their meanings.'),
  dataSample: z.string().describe('A sample of the data to be analyzed in JSON format.'),
});
export type DataInsightsInput = z.infer<typeof DataInsightsInputSchema>;

const DataInsightsOutputSchema = z.object({
  insights: z.string().describe('A summary of key insights generated from the data based on the prompt.'),
  visualizationSuggestions: z.string().describe('Suggestions for relevant charts/maps to display the insights.'),
});
export type DataInsightsOutput = z.infer<typeof DataInsightsOutputSchema>;

export async function getDataInsights(input: DataInsightsInput): Promise<DataInsightsOutput> {
  return dataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataInsightsPrompt',
  input: {schema: DataInsightsInputSchema},
  output: {schema: DataInsightsOutputSchema},
  prompt: `You are an expert data analyst. Analyze the provided data based on the user's prompt and generate key insights.
  Also, suggest relevant charts or maps that can effectively display these insights.

  User Prompt: {{{prompt}}}

  Data Description: {{{dataDescription}}}

  Data Sample:
  ```json
  {{{dataSample}}}
  ```

  Provide the insights and visualization suggestions in a clear and concise manner.
  `,
});

const dataInsightsFlow = ai.defineFlow(
  {
    name: 'dataInsightsFlow',
    inputSchema: DataInsightsInputSchema,
    outputSchema: DataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
