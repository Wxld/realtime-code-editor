import { Routes, Route } from 'react-router-dom';
import EditorPage from './Pages/EditorPage';
import Home from './Pages/Home';
import { Toaster } from 'react-hot-toast';

import './App.css';

function App() {
  return (
    <>
      <div>
        <Toaster
          position='top-right'
          toastOptions={{
            success: {
              theme: {
                primary: '#4aed88',
              }
            }
          }} 
        ></Toaster>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/editor/:roomID" 
          element={<EditorPage />} 
        />
      </Routes>
    </>
  );
}

export default App;
