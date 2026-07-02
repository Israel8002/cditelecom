import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import '@/App.css';
import Splash from '@/pages/Splash';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NewEvaluation from '@/pages/NewEvaluation';
import History from '@/pages/History';
import EvaluationDetail from '@/pages/EvaluationDetail';
import Backups from '@/pages/Backups';
import Settings from '@/pages/Settings';
import Inventory from '@/pages/Inventory';
import NewEquipment from '@/pages/NewEquipment';

function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluacion" element={<NewEvaluation />} />
        <Route path="/historial" element={<History />} />
        <Route path="/detalle/:id" element={<EvaluationDetail />} />
        <Route path="/respaldos" element={<Backups />} />
        <Route path="/configuracion" element={<Settings />} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="/inventario/nuevo" element={<NewEquipment />} />
        <Route path="/inventario/editar/:id" element={<NewEquipment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
