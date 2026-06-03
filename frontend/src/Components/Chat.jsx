import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import sendbutton from "/public/send.png"
import { createSocketConnection } from '../Utils/socket';
import { useSelector } from "react-redux"
import { BASE_URL } from './constant';
import { useRef } from 'react';

const Chat = () => {
  const { targetUserId } = useParams();
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = useSelector(store => store.user)
  console.log("redux user", user);

  const userId = user?._id;

  const [message, setMessage] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState("");


  const [initialLoad, setInitialLoad] = useState(true);

  const fetchMessages = async (pageNo = 1) => {
    setLoading(true);

    try {
      const response = await fetch(BASE_URL + `/chat/${targetUserId}?page=${pageNo}&limit=20`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      // console.log("Chat API Response:", data);
      if (data.data.length === 0) {
        setHasMore(false);
        return;
      }
      const fetchedMessages = [...data.data];

      setMessage((prev) => [...fetchedMessages, ...prev,]);

    } catch (error) {
      console.log(
        "Error fetching messages",
        error.message
      );
    }
    finally {
      setLoading(false);
    }
  };

  // reset chat when target user changes

  useEffect(() => {
    setMessage([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, [targetUserId]);

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

    // new message
    socketInstance.on("messageReceived", (newMsg) => {
      setMessage(prev => [...prev, newMsg]);
    })

    socketInstance.on("userTyping", ({ firstName }) => {
      setTypingUser(firstName);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    return () => socketInstance.disconnect();
  }, [userId, targetUserId]);

  useEffect(() => {
    if (initialLoad && message.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      setInitialLoad(false);
    }

  }, [message.length])

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


  // infinite scroll handler
  const handleScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    if (top === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      fetchMessages(nextPage);
      setPage(nextPage);
    }
  }
  return (
    <div className=' w-1/2 mx-auto mt-18 border border-gray-600 h-[70vh] flex flex-col' >
      <h1 className=' p-5 border-b border-gray-600'>Chat</h1>
      <div
        onScroll={handleScroll}
        className='flex-1 overflow-y-scroll p-5'>
        {/* display message */}
        {loading && page > 1 && (<div className="text-center text-gray-500">Loading...</div>)}
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
                  <div className="chat-footer text-xs opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>


              </div>
            )
          })

        }
        {
          typingUser && (
            <div className="text-sm text-gray-400">
              {typingUser} is typing...
            </div>
          )
        }
        <div ref={bottomRef}></div>
      </div>
      <div className='p-5 border-t border-gray-600 flex gap-2 items-center justify-center '>
        {/* input  */}
        <input
          className="flex-1 border border-gray-600 p-2 rounded-md"
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);

            socket?.emit("typing", {
              userId,
              targetUserId,
              firstName: user.firstName,
            });
          }}
          placeholder="Write your message..."
        />
        <button onClick={sendMessage}>
          <img src={sendbutton} alt="sendbutton" />
        </button>
      </div>
    </div>

  )
}

export default Chat