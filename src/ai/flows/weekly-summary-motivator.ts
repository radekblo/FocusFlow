'use server';

/**
 * @fileOverview Provides motivational messages based on the user's weekly summary of pomodoros and tasks completed.
 *
 * - weeklySummaryMotivator - A function that generates a personalized motivational message based on the weekly summary.
 * - WeeklySummaryMotivatorInput - The input type for the weeklySummaryMotivator function.
 * - WeeklySummaryMotivatorOutput - The return type for the weeklySummaryMotivator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeeklySummaryMotivatorInputSchema = z.object({
  weeklyPomodorosCompleted: z
    .number()
    .describe('The total number of pomodoros completed during the week.'),
  weeklyTasksCompleted: z
    .number()
    .describe('The total number of tasks completed during the week.'),
  weeklyGoalPomodoros: z
    .number()
    .describe('The user specified goal of pomodoros to complete during the week.'),
  weeklyGoalTasks: z
    .number()
    .describe('The user specified goal of tasks to complete during the week.'),
});
export type WeeklySummaryMotivatorInput = z.infer<typeof WeeklySummaryMotivatorInputSchema>;

const WeeklySummaryMotivatorOutputSchema = z.object({
  motivationMessage: z
    .string()
    .describe('A personalized motivational message based on the weekly summary.'),
});
export type WeeklySummaryMotivatorOutput = z.infer<typeof WeeklySummaryMotivatorOutputSchema>;

export async function weeklySummaryMotivator(input: WeeklySummaryMotivatorInput): Promise<WeeklySummaryMotivatorOutput> {
  return weeklySummaryMotivatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weeklySummaryMotivatorPrompt',
  input: {schema: WeeklySummaryMotivatorInputSchema},
  output: {schema: WeeklySummaryMotivatorOutputSchema},
  prompt: `You are a motivational AI assistant that provides encouraging messages to users based on their weekly productivity summary.

  Generate a motivational message based on the following weekly summary:

  Pomodoros Completed: {{{weeklyPomodorosCompleted}}}
  Tasks Completed: {{{weeklyTasksCompleted}}}
  Pomodoros Goal: {{{weeklyGoalPomodoros}}}
  Tasks Goal: {{{weeklyGoalTasks}}}

  Focus on encouraging the user to maintain or improve their productivity in the coming week. Acknowledge their accomplishments and suggest strategies for improvement if they fell short of their goals. Make the message concise and positive.
  `,
});

const weeklySummaryMotivatorFlow = ai.defineFlow(
  {
    name: 'weeklySummaryMotivatorFlow',
    inputSchema: WeeklySummaryMotivatorInputSchema,
    outputSchema: WeeklySummaryMotivatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
