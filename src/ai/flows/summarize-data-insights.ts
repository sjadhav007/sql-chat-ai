// src/ai/flows/summarize-data-insights.ts
'use server';
/**
 * @fileOverview Summarizes the data insights from a SQL query.
 *
 * - summarizeDataInsights - A function that handles the summarization of data insights.
 * - SummarizeDataInsightsInput - The input type for the summarizeDataInsights function.
 * - SummarizeDataInsightsOutput - The return type for the summarizeDataInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDataInsightsInputSchema = z.object({
  queryResults: z.string().describe('The results from the SQL query.'),
});
export type SummarizeDataInsightsInput = z.infer<typeof SummarizeDataInsightsInputSchema>;

const SummarizeDataInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key insights from the data.'),
});
export type SummarizeDataInsightsOutput = z.infer<typeof SummarizeDataInsightsOutputSchema>;

export async function summarizeDataInsights(input: SummarizeDataInsightsInput): Promise<SummarizeDataInsightsOutput> {
  return summarizeDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDataInsightsPrompt',
  input: {schema: SummarizeDataInsightsInputSchema},
  output: {schema: SummarizeDataInsightsOutputSchema},
  prompt: `You are an expert data analyst. You will analyze the data retrieved by a query and provide a summary of key insights in a clear and concise manner.\n\nData:\n{{queryResults}}`,
});

const summarizeDataInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeDataInsightsFlow',
    inputSchema: SummarizeDataInsightsInputSchema,
    outputSchema: SummarizeDataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
