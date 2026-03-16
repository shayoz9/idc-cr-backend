import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

interface BedrockConfig {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

const config: BedrockConfig = {
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const bedrockClient = new BedrockRuntimeClient(config);

export const BEDROCK_MODELS = {
  CLAUDE_3_OPUS: 'anthropic.claude-3-opus-20240229-v1:0',
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  GPT_OSS_120B: 'openai.gpt-oss-120b-1:0',
} as const;

export default config;