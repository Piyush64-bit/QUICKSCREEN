import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import DocsPage from './pages/DocsPage';
import NotFoundPage from './pages/NotFoundPage';
import RoomPage from './pages/RoomPage';

const App = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith('/room');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hide Navbar/Footer on Room Page for immersive experience */}
      {!isRoomPage && <Navbar />}
      
      <main className={`flex-1 ${!isRoomPage ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isRoomPage && <Footer />}
    </div>
  );
};

export default App;
