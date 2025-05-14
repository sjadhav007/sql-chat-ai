// This is an auto-generated file from Firebase Studio.

'use server';

/**
 * @fileOverview This file defines a Genkit flow that converts natural language questions into SQL queries.
 *
 * - generateSqlQuery - A function that takes a natural language question and returns an SQL query.
 * - GenerateSqlQueryInput - The input type for the generateSqlQuery function.
 * - GenerateSqlQueryOutput - The return type for the generateSqlQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSqlQueryInputSchema = z.object({
  question: z.string().describe('The natural language question to convert to SQL.'),
  tableSchema: z.string().describe('The schema of the SQL table to query.'),
});
export type GenerateSqlQueryInput = z.infer<typeof GenerateSqlQueryInputSchema>;

const GenerateSqlQueryOutputSchema = z.object({
  sqlQuery: z.string().describe('The generated SQL query.'),
});
export type GenerateSqlQueryOutput = z.infer<typeof GenerateSqlQueryOutputSchema>;

export async function generateSqlQuery(input: GenerateSqlQueryInput): Promise<GenerateSqlQueryOutput> {
  return generateSqlQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSqlQueryPrompt',
  input: {schema: GenerateSqlQueryInputSchema},
  output: {schema: GenerateSqlQueryOutputSchema},
  prompt: `You are an expert SQL query generator.
  Your task is to convert a natural language question into a SQL query that can be executed against a database.
  You will be provided with the question and the schema of the table to query.

  Question: {{{question}}}
  Table Schema: {{{tableSchema}}}

  Generate the SQL query:
  `,
});

const generateSqlQueryFlow = ai.defineFlow(
  {
    name: 'generateSqlQueryFlow',
    inputSchema: GenerateSqlQueryInputSchema,
    outputSchema: GenerateSqlQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
