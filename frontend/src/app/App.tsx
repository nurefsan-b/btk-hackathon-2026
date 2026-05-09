import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './pages/dashboard';
import { Portfolio } from './pages/portfolio';

export default function App() {
    return (
        <BrowserRouter>
            <div className="size-full flex bg-background dark">
                <Sidebar />
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
