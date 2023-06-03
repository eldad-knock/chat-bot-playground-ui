import React, {useCallback, useMemo, useState} from 'react';
import './App.css';
import 'react-chat-elements/dist/main.css'
// MessageBox component
import { MessageBox } from 'react-chat-elements'

interface Message  {
  type: 'chatBot' | 'user'
  text: string
}

const DefaultMessages: Message[] = [
  {
    type: 'user',
    text: 'How are you?'
  },
  {
    type: 'chatBot',
    text: `I'm great and you?`
  },
]

const callChatBot = async (message: string, context: string) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    message,
    context
  });


  const res = await fetch('https://knock-api.tunnelto.dev/resources/chat-bot/v1/test',{
    method: 'POST',
    body: raw,
    headers: myHeaders,
    mode: 'cors',
    credentials: 'include'
  }).then(res => res.json())
      .catch(e => e.log)
  return {text : res?.answer || 'FAILED', resources: res?.resources || []}
}


function App() {

  const [messages, setMessages] = useState(DefaultMessages)
  const [inputVal, setInputVal] = useState('')
  const [resources, setResources] = useState<{text: string}[]>([])
  const [context, setContext] = useState('Answer the users question in a fun and engaging way while include emojis in your answers. At the end of each question you are answering think of another topic which is related to the topic he asked, and ask him if he wants to expand on that topic.')
  const [isLoading, setIsLoading] = useState(false)


  const messagesComponents =  useMemo(() => {
      return messages.map(({type, text}) => {
        const isChatBot = type === 'chatBot'

        return <MessageBox
            //@ts-ignore
            type={"text"}
            position={isChatBot? "left" : 'right'}
            title={isChatBot ? 'ChatBot' : 'You'}
            text={text}
        />
      })
  }, [messages])

  const onInputChange = useCallback((e: any) => {
    setInputVal(e.target.value)
  }, [setInputVal])
  const onSend = useCallback(() => {
    if (!inputVal) return
    setMessages([...messages, {
      type: 'user',
      text: inputVal
    }])

    setInputVal('')
    setIsLoading(true)
    callChatBot(inputVal, context).then(({text, resources}) => {
      setMessages([...messages, {
        type: 'user',
        text: inputVal
      }, {
        type: 'chatBot',
        text
      }])
      setIsLoading(false)
      setResources(resources)
    })
  }, [setMessages, inputVal, messages, setInputVal])

  return (
    <div className="App">
      <div className={'chat-wrapper'}>
        <div className={'messages-container'}>
        {messagesComponents}
        </div>
        <div className={'input-container'}>

        <input disabled={isLoading} value={isLoading ? 'Loading...' : inputVal} onChange={onInputChange} onKeyDown={(e) =>  e.key === 'Enter' && onSend()}></input>
          <button onClick={onSend} disabled={!inputVal}>send</button>
        </div>
      </div>
      <div className={'bot-config-container'}>
        <div className={'context-container'}>
          <h3>Context</h3>
          <textarea value={context} onChange={(e) =>  setContext(e.target.value)}></textarea>
        </div>
        <h3>Resources</h3>
        <div className={'resources-container'}>

          <ul>
            {resources.map(r => <li>
              {r.text}
            </li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
