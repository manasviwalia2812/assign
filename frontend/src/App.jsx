import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewSpec from './pages/NewSpec';
import ViewSpec from './pages/ViewSpec';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">ClarifyAI</h1>
            <nav className="text-sm font-medium text-gray-600">
              <a href="/" className="hover:text-blue-600 transition">Dashboard</a>
            </nav>
          </div>
        </header>

        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewSpec />} />
            <Route path="/spec/:id" element={<ViewSpec />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
