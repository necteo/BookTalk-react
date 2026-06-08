import { Fragment, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot = () => {
  // 저체 메세지 목록
  const [message, setMessage] = useState<Message[]>([]);
  // 입력값 읽기
  const [input, setInput] = useState('');

  // AI메세지를 직접 생성 = HTML에 적용
  const streamingRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // AI가 보내준 데이터를 다 읽었는 지 확인
  const isStreaming = useRef(false);

  // 🔥 타이핑 효과용
  const typingQueue = useRef<string[]>([]);
  const typingTimer = useRef<number | null>(null);

  // 타이핑 시작
  const onTypingDoneRef = useRef<(() => void) | null>(null);

  const startTyping = () => {
    if (typingTimer.current !== null) return;

    typingTimer.current = window.setInterval(() => {
      if (!streamingRef.current) return;

      if (typingQueue.current.length === 0) {
        if (!isStreaming.current) {
          clearInterval(typingTimer.current!);
          typingTimer.current = null;
          // 타이핑 완료 시 DOM 초기화 후 state 반영
          if (streamingRef.current) streamingRef.current.textContent = '';
          onTypingDoneRef.current?.();
          onTypingDoneRef.current = null;
        }
        return;
      }

      if (streamingRef.current && typingQueue.current.length > 0) {
        streamingRef.current.textContent =
          (streamingRef.current.textContent ?? '') +
          typingQueue.current.shift()!;
      }
    }, 30); // ⏱ 타이핑 속도
  };

  // => return 안에 있는 데이터는 XML {} => if / for => 제어문 사용 금지
  // { data &&   => HTML만 츨력
  const sendMessage = async () => {
    // 1. 입력값이 없는 경우
    if (!input.trim()) return;

    // 2. 사용자 메세지를 state에 추가
    setMessage((prev) => [
      ...prev, // 이전 데이터를 복사
      { role: 'user', content: input }, // 사용자가 보낸 메세지
      { role: 'assistant', content: '' }, // AI가 보낸 메세지
    ]);

    const userMessage = input;
    setInput('');
    isStreaming.current = true;

    // AI가 보낸 데이터를 출력
    try {
      // 1. 서버연결 => fetch / axios
      // 2. 데이터를 수신 루프
      // 3. DOM직접 업데이트 => HTML을 생성해서 추가
      // 4. 스트리밍 종료후 state 반영

      // 2. 스트리밍 API 호출
      const response = await fetch(
        'http://localhost:8080/chat/stream?message=' +
          encodeURIComponent(userMessage),
        {
          credentials: 'include',
        },
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';

      // 3. 스트리밍 수신 루프
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value).replaceAll('data:', '');

        fullContent += chunk;

        // 🔥 문자 단위 큐 적재
        for (const ch of chunk) {
          typingQueue.current.push(ch);
        }

        // 타이핑 시작
        startTyping();
      }

      // 스트리밍 종료 — 타이핑이 끝나면 콜백으로 state 반영
      isStreaming.current = false;

      onTypingDoneRef.current = () => {
        setMessage((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullContent,
          };
          return updated;
        });
      };

      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Fragment>
      <div
        className="breadcumb-area"
        style={{ backgroundImage: 'url(/img/bg-img/breadcumb.jpg)' }}
      >
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-12">
              <div className="bradcumb-title text-center">
                <h2>챗봇</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="breadcumb-nav">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">챗봇</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    챗봇
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <section className="archive-area section_padding_80">
        <div className="container">
          <div
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              height: '70vh',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              background: '#b2c7d9',
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                background: '#3e6d99',
                color: '#fff',
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: '16px',
                letterSpacing: '0.5px',
              }}
            >
              AI 챗봇
            </div>

            {/* 메시지 영역 */}
            <div
              ref={chatBoxRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {message.map((msg, index) => {
                const isLast = index === message.length - 1;
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                    }}
                  >
                    {isAssistant && (
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#3e6d99',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          marginRight: '8px',
                          flexShrink: 0,
                          alignSelf: 'flex-end',
                        }}
                      >
                        AI
                      </div>
                    )}
                    <div
                      ref={isAssistant && isLast ? streamingRef : null}
                      style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: isAssistant
                          ? '4px 16px 16px 16px'
                          : '16px 4px 16px 16px',
                        background: isAssistant ? '#fff' : '#fee500',
                        color: '#222',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 입력 영역 */}
            <div
              style={{
                display: 'flex',
                padding: '10px 12px',
                background: '#f0f0f0',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="메시지 입력"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: '#fee500',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default ChatBot;
