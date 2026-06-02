import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import sendbutton from "/public/send.png"
import { createSocketConnection } from '../Utils/socket';
import { useSelector } from "react-redux"
import { BASE_URL } from './constant';

const Chat = () => {
  const { targetUserId } = useParams();
  const user = useSelector(store => store.user)
  console.log("redux user", user);

  const userId = user?._id;

  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const fetchMessages = async () => {
  try {
    const response = await fetch( BASE_URL + `/chat/${targetUserId}`,
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    // console.log("Chat API Response:", data);

    setMessage(data.data);
  } catch (error) {
    console.log(
      "Error fetching messages",
      error.message
    );
  }
};

  useEffect(() => {
    if (!userId) return; // wait until user is available
    fetchMessages();
    const socketInstance = createSocketConnection();
    setSocket(socketInstance);

    socketInstance.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    // socketInstance.on("messageReceived", ({ firstName, text }) => {
    //   setMessage(prev => [...prev, { firstName, text }]);
    // });

    socketInstance.on("messageReceived", (newMsg) => {
      setMessage(prev => [...prev, newMsg]);
    })

    return () => socketInstance.disconnect();
  }, [userId, targetUserId]);

  const sendMessage = () => {
    if (!socket) return; // socket might not be ready yet

    socket.emit("sendMessage", {
      firstName: user.firstName,
      userId,
      targetUserId,
      text: newMessage,
    });

    setNewMessage(""); // clear input
  }

  return (
    <div className=' w-1/2 mx-auto mt-18 border border-gray-600 h-[70vh] flex flex-col' >
      <h1 className=' p-5 border-b border-gray-600'>Chat</h1>
      <div className='flex-1 overflow-y-scroll p-5'>
        {/* display message */}
        {
          message.map((msg, index) => {
            return (
              <div key={index} >
                <div
                  className={`chat ${msg.senderId === userId
                      ? "chat-end"
                      : "chat-start"
                    }`}
                >
                  <div className="chat-header">
                    {msg.firstName}
                    {/* <time className="text-xs opacity-50">2 hours ago</time> */}
                  </div>
                  <div className="chat-bubble text-white">{msg.text}</div>
                  {/* <div className="chat-footer opacity-50">Seen</div> */}
                </div>

              </div>
            )
          })

        }

      </div>
      <div className='p-5 border-t border-gray-600 flex gap-2 items-center justify-center '>
        {/* input  */}
        <input className=' flex-1 border-1 border-gray-600  p-2 rounded-md'
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='Write your message...'
        />
        <button onClick={sendMessage}>
          <img src={sendbutton} alt="sendbutton" />
        </button>
      </div>
    </div>

  )
}

export default Chat