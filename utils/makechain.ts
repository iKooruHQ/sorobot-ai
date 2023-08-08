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
    'hhttps://soroban.stellar.org/docs/fundamentals-and-concepts/rust-dialect',
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

    SOROBAN REACT URLS:
  'https://soroban-react.gitbook.io/index/Technical-docs',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/connect_button_src.ConnectButtonProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/contracts_src_useContractValue.fetchContractValueProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/contracts_src_useContractValue.useContractValueProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/contracts_src_useSendTransaction.SendTransactionOptions',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/contracts_src_useSendTransaction.SendTransactionResult',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/contracts_src_useSendTransaction.contractTransactionProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/core_src_SorobanContext.SorobanContextType',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/core_src_SorobanReactProvider.SorobanReactProviderProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/events_src_SorobanEventsContext.EventSubscription',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/events_src_SorobanEventsContext.SorobanEventsContextType',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/events_src_SorobanEventsProvider.SorobanEventsProviderProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/types_src.NetworkDetails',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/types_src.WalletChain',
  'https://soroban-react.gitbook.io/index/Technical-docs/interfaces/wallet_data_src.WalletDataProps',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/chains_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/connect_button_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/contracts_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/contracts_src_setTrustline',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/contracts_src_useContractValue',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/contracts_src_useSendTransaction',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/core_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/core_src_SorobanContext',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/core_src_SorobanReactProvider',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/core_src_getDefaultConnectors',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/core_src_useSorobanReact',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/events_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/events_src_SorobanEventsContext',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/events_src_SorobanEventsProvider',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/events_src_useSorobanEvents',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/freighter_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/types_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/utils_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/utils_src_convert',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/wallet_data_src',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/wallet_data_src_provideWalletChains',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/wallet_data_src_useIsMounted',
  'https://soroban-react.gitbook.io/index/Technical-docs/modules/wallet_data_src_useNetwork',
  'https://soroban-react.gitbook.io/index/Tutorial/how-to-start',
  'https://developers.stellar.org/docs/',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-consensus-protocol',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-stack',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/testnet-and-pubnet',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-data-structures/ledgers',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-data-structures/accounts',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-data-structures/assets',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-data-structures/operations-and-transactions',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/lumens',
  'https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-ecosystem-proposals',
  'https://developers.stellar.org/docs/tutorials/create-account',
  'https://developers.stellar.org/docs/tutorials/send-and-receive-payments',
  'https://developers.stellar.org/docs/tutorials/follow-received-payments',
  'https://developers.stellar.org/docs/tutorials/moneygram-access-integration-guide',
  'https://developers.stellar.org/docs/issuing-assets/anatomy-of-an-asset',
  'https://developers.stellar.org/docs/issuing-assets/control-asset-access',
  'https://developers.stellar.org/docs/issuing-assets/how-to-issue-an-asset',
  'https://developers.stellar.org/docs/issuing-assets/publishing-asset-info',
  'https://developers.stellar.org/docs/anchoring-assets/overview',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/architecture',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/getting_started',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep1/configuration',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep10/configuration',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/configuration',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/integration',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/example',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/faq',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep24/setting-up-production-server',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep31/',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep31/configuration',
  'https://developers.stellar.org/docs/anchoring-assets/anchor-platform/sep31/integration',
  'https://developers.stellar.org/docs/building-apps/overview',
  'https://developers.stellar.org/docs/building-apps/application-design-considerations',
  'https://developers.stellar.org/docs/building-apps/wallet/overview',
  'https://developers.stellar.org/docs/building-apps/wallet/intro',
  'https://developers.stellar.org/docs/building-apps/wallet/stellar',
  'https://developers.stellar.org/docs/building-apps/wallet/sep10',
  'https://developers.stellar.org/docs/building-apps/wallet/sep24',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/project-setup',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/basic-wallet',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/setup-custodial-account',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/xlm-payments',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/custom-assets',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/first-deposit',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/connect-to-anchors',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/connect-to-anchors/setup-for-anchored-assets',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/connect-to-anchors/deposit-anchored-assets',
  'https://developers.stellar.org/docs/building-apps/example-application-tutorial/connect-to-anchors/withdraw-anchored-assets',
  'https://developers.stellar.org/docs/run-core-node/prerequisites',
  'https://developers.stellar.org/docs/run-core-node/installation',
  'https://developers.stellar.org/docs/run-core-node/configuring',
  'https://developers.stellar.org/docs/run-core-node/publishing-history-archives',
  'https://developers.stellar.org/docs/run-core-node/running-node',
  'https://developers.stellar.org/docs/run-core-node/monitoring',
  'https://developers.stellar.org/docs/run-core-node/commands',
  'https://developers.stellar.org/docs/run-core-node/network-upgrades',
  'https://developers.stellar.org/docs/run-core-node/tier-1-orgs',
  'https://developers.stellar.org/docs/run-api-server/prerequisites',
  'https://developers.stellar.org/docs/run-api-server/migrating',
  'https://developers.stellar.org/docs/run-api-server/installing',
  'https://developers.stellar.org/docs/run-api-server/configuring',
  'https://developers.stellar.org/docs/run-api-server/running',
  'https://developers.stellar.org/docs/run-api-server/ingestion',
  'https://developers.stellar.org/docs/run-api-server/monitoring',
  'https://developers.stellar.org/docs/run-api-server/scaling',
  'https://developers.stellar.org/docs/run-api-server/ingestion-filtering',
  'https://developers.stellar.org/docs/accessing-data/overview',
  'https://developers.stellar.org/docs/accessing-data/connecting',
  'https://developers.stellar.org/docs/accessing-data/viewing-metadata',
  'https://developers.stellar.org/docs/accessing-data/optimizing-queries',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/overview',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/design-and-architecture',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/getting-started',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/dashboard-home',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/disbursements',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/receivers',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/payments',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/wallets',
  'https://developers.stellar.org/docs/stellar-disbursement-platform/user-interface/analytics',
  'https://developers.stellar.org/docs/encyclopedia/channel-accounts',
  'https://developers.stellar.org/docs/encyclopedia/claimable-balances',
  'https://developers.stellar.org/docs/encyclopedia/clawbacks',
  'https://developers.stellar.org/docs/encyclopedia/error-handling',
  'https://developers.stellar.org/docs/encyclopedia/federation',
  'https://developers.stellar.org/docs/encyclopedia/fee-bump-transactions',
  'https://developers.stellar.org/docs/encyclopedia/fees-surge-pricing-fee-strategies',
  'https://developers.stellar.org/docs/encyclopedia/inflation',
  'https://developers.stellar.org/docs/encyclopedia/ledger-headers',
  'https://developers.stellar.org/docs/encyclopedia/liquidity-on-stellar-sdex-liquidity-pools',
  'https://developers.stellar.org/docs/encyclopedia/lumen-supply-metrics',
  'https://developers.stellar.org/docs/encyclopedia/memos',
  'https://developers.stellar.org/docs/encyclopedia/network-passphrases',
  'https://developers.stellar.org/docs/encyclopedia/path-payments',
  'https://developers.stellar.org/docs/encyclopedia/pooled-accounts-muxed-accounts-memos',
  'https://developers.stellar.org/docs/encyclopedia/securing-web-based-projects',
  'https://developers.stellar.org/docs/encyclopedia/signatures-multisig',
  'https://developers.stellar.org/docs/encyclopedia/sponsored-reserves',
  'https://developers.stellar.org/docs/encyclopedia/xdr',
  'https://developers.stellar.org/docs/glossary',

  If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
  If the question is not related to Stellar, Soroban api or the context provided, politely inform them that you are tuned to only answer questions that are related to Soroban.
  Choose the most relevant link that matches the context provided. Give all information complete and thorough step by step instructions with breaks between each line. 
  ## Step-by-Step Instructions

  Please follow the guidelines below to create your step-by-step list:
  
  1. Start each instruction with a numbered list #1 #2 #3 etc.
  2. Use clear and concise language for each instruction.
  3. If you need to include a sub-step or detail, use a nested list.
  
  **Example:**
  

  
  ---
  
  ### Your Instructions:
  
  1. 
  2. 
  3. 
  
  Question: {question}
  =========
  {context}
  =========
  Answer in Markdown and Show a Sample Code Block:`,
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
