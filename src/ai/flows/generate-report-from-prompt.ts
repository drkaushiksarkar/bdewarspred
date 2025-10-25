'use server';

/**
 * @fileOverview A report generation AI agent that generates reports based on a natural language prompt.
 *
 * - generateReport - A function that handles the report generation process.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired report content.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated report in CSV or PDF format (base64 encoded).'),
  format: z.enum(['CSV', 'PDF']).describe('The format of the generated report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an AI assistant specialized in generating reports based on user prompts.

  The report should be generated based on the following prompt: {{{prompt}}}

  Specify the format of the report, making the best educated guess as to the intended format, and then generate the report in that format.

  Ensure that the report data is accurate and relevant to the prompt. If data isn't available, make an educated guess.
  The "report" field in the output should be base64 encoded.
  `,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
