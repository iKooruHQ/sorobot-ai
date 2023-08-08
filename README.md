### Sorobot AI makes it easier to build DApps, DAOs, and smart contracts on Stellar/Soroban.

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

# Step 4: Configuration

Inside the config directory, replace the URLs with your website's. Ensure you have more than one URL for the script to function.

# Step 5: Soroban Web Loader Setup

Within utils/soroban_web_loader.ts, modify the values of title, date, and content to the CSS selectors representing the desired text content from your webpage. Dive deep into Cheerio's utility here.

Remember, while you can include custom metadata, the default loader expects at least:

typescript
```

{
  pageContent: string;
  metadata: { source: string; };
}

```

This data will be saved in your Supabase database later.

# Step 6: Database Setup

Paste and execute the schema.sql in your Supabase SQL editor. Ensure the existence of the documents table and the match_documents function.

## 🌍 Update Web Scraping and Embedding

Initiate the scraping and embedding script located in scripts/scrape-embed.ts using:


```
bash

npm run scrape-embed

```

This will process URLs from the config directory, extract specified content, and then utilize OpenAI's Embeddings (gpt-3.5-turbo-16k) to transmute this data into vectors.

## 🚀 Launch the App

Post confirming the successful addition of embeddings and content to your Supabase table, kick start the app with npm run dev. You're all set to pose questions and get them answered!

## 📜 Credits

Inspiration: *[langchain notion bot](https://github.com/mayooear/notion-chat-langchain)*


Documentation: Extensively utilizes documentation from Soroban's React Guide and Soroban's Stellar Docs
