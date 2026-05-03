import fs from 'fs';
import { getAnthropicClient, MODEL } from './client';
import {
  SEMANTICO_SYSTEM,
  buildSemanticoPrompt,
} from './prompts/semantico';
import { GT_SYSTEM, buildGTPrompt } from './prompts/gt';
import {
  MISTRANSLATION_SYSTEM,
  buildMistranslationPrompt,
} from './prompts/mistranslation';

export type AnalysisTag = 'semantico' | 'gt' | 'mistranslation' | 'todo';

interface AnalysisParams {
  filePath: string;
  fileType: string;
  caso: number;
  regimenVerdad: string;
  fuenteTipo: string;
  fechaEvento?: string | null;
  tags?: string[];
  analysisTag: AnalysisTag;
}

export interface AnalysisResult {
  transcription: string | null;
  analysis: string | null;
  codes: string | null;
  mistranslations: string | null;
}

function fileToBase64(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return buffer.toString('base64');
}

async function runAnalysis(
  systemPrompt: string,
  userText: string,
  base64Data: string,
  fileType: string,
): Promise<string> {
  const client = getAnthropicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileBlock: any =
    fileType === 'application/pdf'
      ? {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64Data },
        }
      : {
          type: 'image',
          source: {
            type: 'base64',
            // coerce to supported image media type; JPEG is the fallback for unknown types
            media_type:
              fileType === 'image/jpeg' ? 'image/jpeg' :
              fileType === 'image/gif' ? 'image/gif' :
              fileType === 'image/webp' ? 'image/webp' :
              'image/png',
            data: base64Data,
          },
        };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const systemBlock: any[] = [
    {
      type: 'text',
      text: systemPrompt,
      // cache_control reduces cost for repeated calls with the same system prompt
      cache_control: { type: 'ephemeral' },
    },
  ];

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemBlock,
    messages: [
      {
        role: 'user',
        content: [fileBlock, { type: 'text', text: userText }],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}

function extractJson(raw: string): string {
  const match = raw.match(/```json\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);
  return match ? match[1].trim() : raw.trim();
}

export async function analyzeCapture(params: AnalysisParams): Promise<AnalysisResult> {
  const base64Data = fileToBase64(params.filePath);

  const result: AnalysisResult = {
    transcription: null,
    analysis: null,
    codes: null,
    mistranslations: null,
  };

  const runSem = params.analysisTag === 'semantico' || params.analysisTag === 'todo';
  const runGT = params.analysisTag === 'gt' || params.analysisTag === 'todo';
  const runMT = params.analysisTag === 'mistranslation' || params.analysisTag === 'todo';

  const promptParams = {
    caso: params.caso,
    regimenVerdad: params.regimenVerdad,
    fuenteTipo: params.fuenteTipo,
    fechaEvento: params.fechaEvento,
    tags: params.tags,
  };

  const tasks: Promise<void>[] = [];

  if (runSem) {
    tasks.push(
      runAnalysis(
        SEMANTICO_SYSTEM,
        buildSemanticoPrompt(promptParams),
        base64Data,
        params.fileType,
      ).then((raw) => {
        const json = extractJson(raw);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = JSON.parse(json) as Record<string, any>;
        result.transcription = parsed.transcripcion ?? parsed.transcription ?? null;
        result.analysis = json;
      }),
    );
  }

  if (runGT) {
    tasks.push(
      runAnalysis(GT_SYSTEM, buildGTPrompt(promptParams), base64Data, params.fileType).then(
        (raw) => {
          result.codes = extractJson(raw);
        },
      ),
    );
  }

  if (runMT) {
    tasks.push(
      runAnalysis(
        MISTRANSLATION_SYSTEM,
        buildMistranslationPrompt(promptParams),
        base64Data,
        params.fileType,
      ).then((raw) => {
        result.mistranslations = extractJson(raw);
      }),
    );
  }

  await Promise.all(tasks);
  return result;
}
