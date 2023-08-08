
### Sorobot AI makes it easier to build DApps, DAOs, and smart contracts on Stellar/Soroban.

![sorobot-ai-graphic](https://github.com/iKooruHQ/sorobot-ai/assets/124317926/1ae14817-1752-4cbc-8932-53f2f273e244)

Leverage the power of Sorobot AI combined with LangChain, Supabase, and Next.js. LangChain is a cutting-edge framework designed for building scalable AI/LLM apps, and Supabase provides an open-source Postgres database with capabilities to store embeddings through a pg vector extension. You can customize Sorobot AI to your stellar blockchain project.

## Tutorial Video: Watch Now

Need Help? Connect with me on the Stellar Development Discord Server. @NickThor01

🖼️ Dive into the instructions and get Sorobot AI up in 10 minutes or less!

## 🛠️ Development

# Step 1: Get the Code
bash
```

git clone [github https url]

```

# Step 2: Install Dependencies

bash
```

pnpm install


```

# Step 3: Environment Setup

Duplicate the .env.local.example and rename it to .env

Your .env should look like:

env
```

OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

```

Head over to OpenAI's Documentation to fetch your API keys.

Set up your database at Supabase and get your keys via the user dashboard following their guide.

# Step 4: Database Setup

Paste and execute the schema.sql in your Supabase SQL editor. Ensure the existence of the documents table and the match_documents function.

## 🌍 Update Embedding

Initiate the scraping and embedding script located in scripts/install-stellar.ts, scripts/install-soroban.ts, scripts/install-soroban-react.ts using:

bash
```

pnpm run install-stellar
pnpm run install-soroban
pnpm run install-soroban-react


```

This will process URLs from the config directory, extract specified content, and then utilize OpenAI's Embeddings (gpt-3.5-turbo-16k) to transmute this data into vectors.

## 🚀 Launch the App

Post confirming the successful addition of embeddings and content to your Supabase table, kick start the app with pnpm run dev. You're all set to pose questions and get them answered!

## 📜 Credits

Inspiration: *[langchain notion bot](https://github.com/mayooear/notion-chat-langchain)*


Documentation: Extensively utilizes documentation from Soroban's React Guide, Soroban, and Stellar Docs
