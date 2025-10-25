'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/data-insights-from-prompt.ts';
import '@/ai/flows/generate-report-from-prompt.ts';
import '@/ai/flows/data-qa.ts';
