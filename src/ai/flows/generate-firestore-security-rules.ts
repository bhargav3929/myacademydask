'use server';

/**
 * @fileOverview Generates Firestore security rules based on the data structure and user roles.
 *
 * - generateFirestoreSecurityRules - A function that generates Firestore security rules.
 * - GenerateFirestoreSecurityRulesInput - The input type for the generateFirestoreSecurityRules function.
 * - GenerateFirestoreSecurityRulesOutput - The return type for the generateFirestoreSecurityRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFirestoreSecurityRulesInputSchema = z.object({
  dataStructureDescription: z
    .string()
    .describe('A detailed description of the Firestore data structure, including collections, document IDs, and fields.'),
  userRolesDescription: z
    .string()
    .describe('A description of the user roles and their corresponding permissions.'),
});
export type GenerateFirestoreSecurityRulesInput = z.infer<typeof GenerateFirestoreSecurityRulesInputSchema>;

const GenerateFirestoreSecurityRulesOutputSchema = z.object({
  securityRules: z
    .string()
    .describe('The generated Firestore security rules based on the provided data structure and user roles.'),
});
export type GenerateFirestoreSecurityRulesOutput = z.infer<typeof GenerateFirestoreSecurityRulesOutputSchema>;

export async function generateFirestoreSecurityRules(
  input: GenerateFirestoreSecurityRulesInput
): Promise<GenerateFirestoreSecurityRulesOutput> {
  return generateFirestoreSecurityRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFirestoreSecurityRulesPrompt',
  input: {schema: GenerateFirestoreSecurityRulesInputSchema},
  output: {schema: GenerateFirestoreSecurityRulesOutputSchema},
  prompt: `You are an expert in generating Firestore security rules.

  Based on the provided data structure and user roles, generate comprehensive Firestore security rules to ensure data access aligns with user roles and prevent unauthorized data modification.

  Data Structure Description:
  {{dataStructureDescription}}

  User Roles Description:
  {{userRolesDescription}}

  Ensure the generated rules are secure, efficient, and follow Firestore security best practices.

  Output the complete Firestore security rules as a single string.

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      {{securityRules}}
    }
  }
  `,
});

const generateFirestoreSecurityRulesFlow = ai.defineFlow(
  {
    name: 'generateFirestoreSecurityRulesFlow',
    inputSchema: GenerateFirestoreSecurityRulesInputSchema,
    outputSchema: GenerateFirestoreSecurityRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
