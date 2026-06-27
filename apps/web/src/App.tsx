import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

/**
 * Root web app component. Routes are intentionally minimal for the scaffold —
 * auth, the valuation wizard, dashboard, and settings routes are added in their
 * respective build phases.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
