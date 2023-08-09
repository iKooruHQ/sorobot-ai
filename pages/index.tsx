import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import 'highlight.js/styles/github-dark-dimmed.css';
import { Clipboard } from 'lucide-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Bot } from 'lucide-react';
export default function Home() {
  const [copySuccess, setCopySuccess] = useState<string>('');
  const codeRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
  }>({
    messages: [
      {
        message: `Hi there, I'm Sorobot AI. You can ask me any questions about the Stellar, Soroban, or Soroban React docs.`,
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, pending, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    try {
      fetchEventSource('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
        signal: ctrl.signal,
        onmessage: (event) => {
          if (event.data === '[DONE]') {
            setMessageState((state) => ({
              history: [...state.history, [question, state.pending ?? '']],
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: state.pending ?? '',
                },
              ],
              pending: undefined,
            }));
            setLoading(false);
            ctrl.abort();
          } else {
            const data = JSON.parse(event.data);
            setMessageState((state) => ({
              ...state,
              pending: (state.pending ?? '') + data.data,
            }));
          }
        },
      });
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending ? [{ type: 'apiMessage', message: pending }] : []),
    ];
  }, [messages, pending]);

  return (
    <>
      <Layout>
        <div className="mx-auto mt-2">
          <div className="mx-auto flex flex-col gap-4">
            <span>
              <h1 className="text-4xl text-white font-bold leading-[1.1] tracking-tighter text-center">
                Sorobot AI
              </h1>
            </span>
            <div className="text-white mx-auto text-xl">
              AI Powered Code Bot for Stellar and Soroban Developers.
            </div>
            <main className={styles.main}>
              <div className={styles.cloud}>
                <div ref={messageListRef} className={styles.messagelist}>
                  {chatMessages.map((message, index) => {
                    let icon;
                    let className;
                    if (message.type === 'apiMessage') {
                      icon = (
                        <Image
                          src="/s-avatar.png"
                          alt="AI"
                          width="30"
                          height="30"
                          className={styles.boticon}
                          priority
                        />
                      );
                      className = styles.apimessage;
                    } else {
                      icon = (
                        <Image
                          src="/usericon.png"
                          alt="Me"
                          width="30"
                          height="30"
                          className={styles.usericon}
                          priority
                        />
                      );
                      // The latest message sent by the user will be animated while waiting for a response
                      className =
                        loading && index === chatMessages.length - 1
                          ? styles.usermessagewaiting
                          : styles.usermessage;
                    }
                    return (
                      <div key={index} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown
                            className="break-words markdown"
                            components={{
                              code: ({ children, inline, className }) => {
                                const language = className?.split('-')[1];
                                if (inline)
                                  return (
                                    <span className="px-2 py-1 text-sm rounded-md text-white dark:bg-neutral-800 bg-[#2f3136]">
                                      {children}
                                    </span>
                                  );
                                return (
                                  <div className="w-full my-5 overflow-hidden rounded-md">
                                    {/* Code Title */}
                                    <div className="dark:bg-[#0d111780] bg-[#292b2f] text-white py-2 px-3 text-xs flex items-center justify-between">
                                      <div>{language ?? 'javascript'}</div>
                                      {/* Copy code to the clipboard */}
                                      <CopyToClipboard
                                        text={
                                          codeRef?.current?.innerText as string
                                        }
                                      >
                                        <button className="flex items-center gap-1">
                                          <Clipboard size="14" />
                                          Copy Code
                                        </button>
                                      </CopyToClipboard>
                                    </div>
                                    {/* Code Block */}
                                    <code
                                      ref={codeRef}
                                      className={
                                        (className ??
                                          'hljs language-javascript') +
                                        ' !whitespace-pre'
                                      }
                                    >
                                      {children}
                                    </code>
                                  </div>
                                );
                              },
                            }}
                            rehypePlugins={[rehypeHighlight]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.message ?? ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.center}>
                <div className={styles.cloudform}>
                  <form onSubmit={handleSubmit}>
                    <textarea
                      disabled={loading}
                      onKeyDown={handleEnter}
                      ref={textAreaRef}
                      autoFocus={false}
                      rows={1}
                      maxLength={5000}
                      id="userInput"
                      name="userInput"
                      placeholder={
                        loading
                          ? 'Waiting for response...'
                          : 'How do I create a React dApp with Soroban?'
                      }
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={styles.textarea}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={styles.generatebutton}
                    >
                      {loading ? (
                        <div className={styles.loadingwheel}>
                          <LoadingDots color="#000" />
                        </div>
                      ) : (
                        // Send icon SVG in input field
                        <svg
                          viewBox="0 0 20 20"
                          className={styles.svgicon}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </main>
          </div>
          <footer className="m-auto">
            <a href="">Github Project.</a>
          </footer>
        </div>
      </Layout>
    </>
  );
}
