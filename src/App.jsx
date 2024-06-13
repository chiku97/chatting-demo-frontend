import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


const ws = new WebSocket("ws://localhost:3000/cable");
function App() {
  const [message , setMessage] = useState([]);
  const [guide, setGuide] = useState("");
  const container = document.getElementById("messages");


  ws.onopen = () => {
    console.log("Connected");
    setGuide(Math.random().toString(36).substring(2,15));

    ws.send(
      JSON.stringify({
        command: "subscribe",
        identifier: JSON.stringify({
          channel: "MessagesChannel",
          id: guide,
        }),
      })
    )
  };

  useEffect(()=>{
    fetchMessages();
  },[])

  useEffect(() =>{
    resetScroll();
  },[message])

  const fetchMessages = async () => {
    const response = await fetch("http://localhost:3000/messages");
    const data = await response.json();
    setMessageAndScrollDown(data);
    
  }

  const setMessageAndScrollDown = (data) => {
    setMessage(data);
    // console.log(message);
    resetScroll();
  }

  const resetScroll=()=>{
    if(!container)return;
    container.scrollTop = container.scrollHeight;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value="";
    await fetch("http://localhost:3000/messages",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({body}),
    })
  }

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "ping")return;
    if(data.type === "welcome")return;
    if(data.type === "confirm_subscribtion")return;
    const message = data.body
    setMessageAndScrollDown([...message, message])
  }

  return (
    <>
    <div>
      <h2>Messages</h2>
      <p>{guide}</p>
    </div>
    <div id='messages'>
        {message.map(msg =>(
          <div className='message' key={msg.id}>
          <p>{msg.body}</p>
          </div>
        ))}
    </div>
    <form onSubmit={handleSubmit}>
        <input type='text' name='message' className='messageForm' />
        <button type='submit' className='messageButton'>Send</button>
    </form>
    </>
  )
}

export default App
