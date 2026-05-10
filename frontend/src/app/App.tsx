import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Sidebar } from './components/sidebar';
import { Dashboard } from './pages/dashboard';
import { Portfolio } from './pages/portfolio';
import { Analytics } from './pages/analytics';
import { AIInsights } from './pages/ai-insights';
import { Settings } from './pages/settings';

export default function App() {
    return (
        <BrowserRouter>
            <div className="size-full flex bg-background dark">
                <Sidebar />
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
