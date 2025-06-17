import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { HostRoomPage } from './pages/HostRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { QuickPlayPage } from './pages/QuickPlayPage';
import { GamePage } from './pages/GamePage';
import { ResultsPage } from './pages/ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host" element={<HostRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/quick-play" element={<QuickPlayPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
        <Route path="/results/:roomId" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;