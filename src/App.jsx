import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EvaluateField from './pages/EvaluateField';
import DiseaseDetection from './pages/DiseaseDetection';
import Weather from './pages/Weather';
import AIAdvisor from './pages/AIAdvisor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="evaluate" element={<EvaluateField />} />
          <Route path="disease" element={<DiseaseDetection />} />
          <Route path="weather" element={<Weather />} />
          <Route path="ask" element={<AIAdvisor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
