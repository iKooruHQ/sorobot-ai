import { OpenAI } from 'langchain/llms';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

export const openai = new OpenAI({
  temperature: 0,
});

export const openaiStream = new OpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  temperature: 0,
  streaming: true,

  maxTokens: 10000,

  callbackManager: {
    handleNewToken(token) {
      console.log(token);
    },
  },
});
