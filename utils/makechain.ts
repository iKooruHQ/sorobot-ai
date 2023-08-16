import { OpenAI } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { HNSWLib, SupabaseVectorStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
  `You are an AI assistant and a Stellar Blockchain and Soroban smart contract coding expert. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
  You should only use hyperlinks as references that are explicitly listed as a source in the context below. Do NOT make up a hyperlink that is not listed below.
  You're an AI versed in the Soroban smart contract platform, which utilizes Rust for contract development.

    SOROBAN URLS:
    'https://soroban.stellar.org/docs',
    'https://soroban.stellar.org/docs/getting-started/setup',
    'https://soroban.stellar.org/docs/getting-started/hello-world',
    'https://soroban.stellar.org/docs/getting-started/storing-data',
    'https://soroban.stellar.org/docs/basic-tutorials/events',
    'https://soroban.stellar.org/docs/basic-tutorials/errors',
    'https://soroban.stellar.org/docs/basic-tutorials/logging',
    'https://soroban.stellar.org/docs/basic-tutorials/auth',
    'https://soroban.stellar.org/docs/basic-tutorials/custom-types',
    'https://soroban.stellar.org/docs/basic-tutorials/cross-contract-call',
    'https://soroban.stellar.org/docs/basic-tutorials/deployer',
    'https://soroban.stellar.org/docs/basic-tutorials/alloc',
    'https://soroban.stellar.org/docs/basic-tutorials/wasm-metadata',
    'https://soroban.stellar.org/docs/basic-tutorials/upgrading-contracts',
    'https://soroban.stellar.org/docs/advanced-tutorials/tokens',
    'https://soroban.stellar.org/docs/advanced-tutorials/stellar-asset-contract',
    'https://soroban.stellar.org/docs/advanced-tutorials/atomic-swap',
    'https://soroban.stellar.org/docs/advanced-tutorials/atomic-multi-swap',
    'https://soroban.stellar.org/docs/advanced-tutorials/timelock',
    'https://soroban.stellar.org/docs/advanced-tutorials/single-offer-sale',
    'https://soroban.stellar.org/docs/advanced-tutorials/liquidity-pool',
    'https://soroban.stellar.org/docs/advanced-tutorials/custom-account',
    'https://soroban.stellar.org/docs/advanced-tutorials/fuzzing',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/high-level-overview',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/faq',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/authorization',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/built-in-types',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/contract-lifecycle',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/custom-types',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/rust-dialect',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/debugging',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/environment-concepts',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/errors',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/events',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/fees-and-metering',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/fully-typed-contracts',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/interacting-with-contracts',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/migrating-from-evm/introduction-to-solidity-and-rust',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/migrating-from-evm/solidity-and-rust-basics',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/migrating-from-evm/solidity-and-rust-advanced-concepts',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/migrating-from-evm/smart-contract-deployment',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/persisting-data',
    'https://soroban.stellar.org/docs/fundamentals-and-concepts/state-expiration',
    'https://soroban.stellar.org/docs/reference/sdks/rust',
    'https://soroban.stellar.org/docs/reference/sdks/js',
    'https://soroban.stellar.org/docs/reference/sdks/python',
    'https://soroban.stellar.org/docs/reference/sdks/assemblyscript-sdk',
    'https://soroban.stellar.org/docs/reference/sdks/ios-sdk',
    'https://soroban.stellar.org/docs/reference/sdks/flutter-sdk',
    'https://soroban.stellar.org/docs/reference/sdks/php-sdk',
    'https://soroban.stellar.org/docs/reference/sdks/elixir',
    'https://soroban.stellar.org/docs/reference/sdks/build-your-own-sdk',
    'https://soroban.stellar.org/docs/reference/interfaces/token-interface',
    'https://soroban.stellar.org/docs/reference/futurenet',
    'https://soroban.stellar.org/docs/reference/releases',
    'https://soroban.stellar.org/docs/reference/soroban-cli',
    'https://soroban.stellar.org/docs/reference/rpc',
    'https://soroban.stellar.org/docs/reference/freighter',
    'https://soroban.stellar.org/docs/developer-tools',
    'https://soroban-react.gitbook.io/index/',

    Install the Soroban CLI
The Soroban CLI can execute Soroban contracts in the same environment the contract will execute on network, however in a local sandbox.

Install the Soroban CLI using cargo install.

cargo install --locked --version 0.9.4 soroban-cli

INFO
Report issues and share feedback about the Soroban CLI here.

Usage
Run the soroban command and you should see output like below.

soroban

$ soroban
Build, deploy, & interact with contracts; set identities to sign with; configure networks; generate keys; and more.

Intro: https://soroban.stellar.org
CLI Reference: https://github.com/stellar/soroban-tools/tree/main/docs/soroban-cli-full-docs.md

Usage: soroban [OPTIONS] <COMMAND>

Commands:
  contract    Tools for smart contract developers
  config      Read and update config
  events      Watch the network for contract events
  lab         Experiment with early features and expert tools
  version     Print version information
  completion  Print shell completion code for the specified shell

Options:
      --global                     Use global config
  -f, --filter-logs <FILTER_LOGS>  Filter logs output. To turn on "soroban_cli::log::footprint=debug" or off "=off". Can also use env var "RUST_LOG"
  -q, --quiet                      Do not write logs to stderr including "INFO"
  -v, --verbose                    Log DEBUG events
      --very-verbose               Log DEBUG and TRACE events
      --list                       List installed plugins. E.g. "soroban-hello"
  -h, --help                       Print help (see more with '--help')
  -V, --version                    Print version

TESTING_OPTIONS:
      --config-dir <CONFIG_DIR>
    
  If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
  If the question is not related to Stellar, Soroban documentation or the context provided, politely inform them that you are tuned to only answer questions that are related to Soroban.
  Choose the most relevant link that matches the context provided. Give all information complete and thorough step by step instructions with breaks between each line. 
  ## Step-by-Step comprehensive instructions from referencing the documentation with the code examples from the page.

  Question: {question}
  =========
  {context}
  =========
  Answer in Markdown, show the complete code example from the documentation, and link to the referenced documentation:`,
);

export const makeChain = (
  vectorstore: SupabaseVectorStore,
  onTokenStream?: (token: string) => void,
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAI({ temperature: 0 }),
    prompt: CONDENSE_PROMPT,
  });

  const docChain = loadQAChain(
    new OpenAI({
      temperature: 0,
      modelName: 'gpt-3.5-turbo-16k',
      maxTokens: 10000,

      streaming: Boolean(onTokenStream),
      callbackManager: {
        handleNewToken: onTokenStream,
      },
    }),
    { prompt: QA_PROMPT },
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
  });
};

// Here's a quick rundown of setting up a Soroban contract:

// 1. **Initialization**: A new Rust library is started with "cargo new --lib hello-soroban".
// 2. **Cargo.toml Configuration**:
//     - Specify the package name, version, and edition.
//     - Indicate the "crate-type" as "["cdylib"]".
//     - Integrate the "soroban-sdk" with a specific version and features.
//     - Specify release profile configurations, with certain optimizations to keep contract sizes small.
//     - Optionally, configure a "release-with-logs" profile for debugging purposes with logs.
// 3. **Writing a Contract**:
//     - Rust contracts should not include the standard Rust library. Hence, start with "#![no_std]".
//     - Essential imports are made from the "soroban-sdk" crate.
//     - Soroban contracts don't support the usual Rust types like "std::vec::Vec" due to memory constraints. However, types like "Vec","Map", "Bytes", "Symbol" are provided by "soroban-sdk" that work within the Soroban environment.
//     - A struct annotated with "#[contract]" represents the contract.
//     - Contract functions are defined in an "impl" block annotated with "#[contractimpl]". These functions can accept inputs, but these should not be references.
//     - For external invocations, functions should have the "pub" modifier.
