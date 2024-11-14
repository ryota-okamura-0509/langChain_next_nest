"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [userMessages, setUserMessages] = useState<String[]>([]);
  const [aiMessages, setAiMessages] = useState<String[]>(["please message"]);
  const [maxlength, setMaxLength] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const max = Math.max(userMessages.length, aiMessages.length);
    console.log(max);
    setMaxLength(max);
  }, [userMessages, aiMessages]);

  const submitMessage = async () => {
    setUserMessages([...userMessages, message]);
    setMessage("");
    const res = await fetch(`http://localhost:3005/memo?q=${message}`);
    const data = await res.json();
    console.log(data.content);
    if (!data.content) return;
    setAiMessages([...aiMessages, data.content]);
  };
  return (
    <div className="">
      {Array.from({ length: maxlength }).map((_, index) => (
        <div className="overflow-y-auto h-80">
          {aiMessages[index] ? (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-12 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://icon-pit.com/wp-content/uploads/2020/01/brain_ai_5286.png"
                  />
                </div>
              </div>
              <div className="chat-bubble chat-bubble-primary">
                {aiMessages[index]}
              </div>
            </div>
          ) : (
            <></>
          )}
          {userMessages[index] ? (
            <div className="chat chat-end">
              <div className="chat-bubble">{userMessages[index]}</div>
            </div>
          ) : (
            <></>
          )}
        </div>
      ))}
      <div className="container">
        <div className="fixed bottom-5 w-full flex justify-center items-center space-x-2">
          <textarea
            placeholder="入力してください"
            className=" text-xl textarea textarea-primary textarea-xs w-4/5"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          ></textarea>
          <button
            className="btn btn-active btn-primary"
            onClick={() => {
              submitMessage();
            }}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
