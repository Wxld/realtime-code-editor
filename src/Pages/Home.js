import React, { useState } from 'react'
import {v4 as uuidv4} from 'uuid';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState('');
  const [username, setUsername] = useState(''); 

  const createNewRoom = (e) => {
    e.preventDefault();
    const newID = uuidv4();
    
    setRoomID(newID);
    toast.success('Created a new room');
  }

  const joinRoom = () => {
    if(!roomID || !username) {
        toast.error("Empty fields are not allowed.");
        return;
    }

    navigate(`/editor/${roomID}`, {
        state: {
            username,
        }
    })
  }

  const handleInputEnter = (e) => {
    if(e.code === "Enter") {
        joinRoom();
    }
  }

  return (
    <div className='homePageWrapper'>
        <div className="formWrapper">

            <img src="./code-sync.png" alt="code-sync-logo" />

            <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>

            <div className="inputGroup">
                <input 
                    onChange={(e) => setRoomID(e.target.value)} 
                    type="text" 
                    placeholder='ROOM ID' 
                    className="inputBox" 
                    value={roomID} 
                    onKeyUp={ handleInputEnter }
                />
                <input
                    onChange={(e) => setUsername(e.target.value)}
                    type="text" 
                    placeholder='USERNAME' 
                    className="inputBox" 
                    value={ username } 
                    onKeyUp={ handleInputEnter }
                />
                <button
                onClick={ joinRoom } 
                className='btn joinBtn'>JOIN</button>

                <span className='createInfo'>
                    If you don't have an invite then create &nbsp;
                    <a onClick={ createNewRoom } href="/" className='createNewBtn'>
                        new room
                    </a>
                </span>
            </div>
        </div>
        <footer>
            <h4>Made with ❤️ by &nbsp; <a href="https://github.com/Wxld">Wxld</a></h4>
        </footer>
    </div>
  )
}

export default Home