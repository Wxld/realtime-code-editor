import React, { useState, useRef, useEffect  } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from '../socket'
import ACTIONS from '../Actions'
import { useLocation, useParams, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const EditorPage = () => {
  const location = useLocation();
  const socketRef = useRef(null);
  const { roomID } = useParams();
  const codeRef = useRef(null);

  const [clients, setClients] = useState([]);

  // inorder to not clash with in-home 'Navigate' function deliverd by rrd
  const reactNavigator = useNavigate();

  useEffect(() => {
    // creating a join event 
    const init = async () => {
      socketRef.current = await initSocket();

      // if the current user is unable to join the requested room due to poor connection/other reasons
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      const handleErrors = (e) => {
        // console.log('socket error', e);
        toast.error('Socket connection failed, try again later.');
        
        // send the user back to the home page since the homepage redirected it to editor/roomID page which it couldn't join
        reactNavigator('/');
      }
      
      // raising an event to the server for joining request
      socketRef.current.emit(ACTIONS.JOIN, {
        roomID,
        username: location.state?.username,
      })

      // response from socket.io server once user successfully joins (to notify all the other users of new user joined)
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, connectedSocketID }) => {
          if(username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients)
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            connectedSocketID
          });
        }
      ) 

      // Listening for disconnection event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketID, username}) => {
        toast(`${username} left the room.`, {
          icon: '👋',
        });
        setClients((prev) => {
          return prev.filter(client => client.socketID !== socketID)
        });
      })
    }   


    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  }, []);

  if(!location.state) {
    return <Navigate to='/' />
  }

  const handleCopyRoomID = async (e) => {
    try {
      await navigator.clipboard.writeText(roomID);
      toast('Copied Room ID to your clipboard.', {
        icon: '📋',
      })
    } catch(err) {
      toast.error('Could not copy Room ID');
    }
  }

  const handleLeaveRoom = () => {
    reactNavigator('/');
  }

  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className="asideInner">
          <div className="logo">
            <img 
              src="/code-sync.png" 
              className="logoImage" 
              alt="logo"
            />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients && clients.map(client => (
              <Client key={client.socketID} username={client.username} />
            ))}
          </div>
        </div>
        <button className='btn copyBtn' onClick={handleCopyRoomID}>COPY ROOM ID</button>
        <button className='btn leaveBtn' onClick={handleLeaveRoom} >LEAVE ROOM</button>
      </div>
      <div className='editorWrap'>
        <Editor socketRef={socketRef} roomID={roomID} onCodeChange={(code) => codeRef.current = code} />
      </div>
    </div>
  )
}

export default EditorPage