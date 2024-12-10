import "./App.css"
import { Login } from "./Login";
import { useEffect, useState } from "react";

import io from "socket.io-client"

function Mensaje({ msg, user, clientUsername}){
  const ownMessage = user == clientUsername;
  user = ownMessage?"Me":user

  return(
    <li className={ownMessage?"message emited": "message"}>
      <small>{user}</small>
      <p>{msg}</p>
    </li>
  )
}
const getUsername= ()=>{
  const username = localStorage.getItem("username");
  return username ? username : undefined
}

const socket = io("http://localhost:1234", {
  auth:{
    username: getUsername(),
    serverOffSet: 0
  }
});

function App() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState(()=>{
    return socket.auth.username
  });

  socket.on("message", (msg, user, serverOffSet)=>{
    socket.auth.serverOffSet = serverOffSet
    const newMessage = {
      id: serverOffSet,
      msg,
      user
    }
    const newMessages = [
      ...messages,
      newMessage
    ]
    setMessages(newMessages)
    setMessage("")
  })

  const handleSubmit = (e)=>{
    e.preventDefault();
    const form = e.target
    const input = form.input
    const msg = input.value

    if(msg){
      socket.emit("message", msg, username)
    }
  }

  return(
    <>
      {!username && <Login username={username} setUsername={setUsername} />}

      <h2>Bandeja de entrada</h2>
      <ul id="messages">
        {messages.map(({msg, user, id})=>(
          <Mensaje key={id} msg={msg} user={user} clientUsername={username}/>
        ))}
      </ul>
      <form action="" id="form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="input" 
          id="input" 
          placeholder="Hola..." 
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />
        <button id="button" type="submit">Enviar</button>
      </form>
    </>
  )
}

export default App
 