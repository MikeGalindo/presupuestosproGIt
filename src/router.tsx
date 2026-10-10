// Rutas de la SPA — contracts/app-routes.md.

import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { HomePage } from './features/home/HomePage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ClientsPage } from './features/clients/ClientsPage';
import { ServicesPage } from './features/services/ServicesPage';
import { DraftsList } from './features/budgets/DraftsList';
import { BudgetEditor } from './features/budgets/BudgetEditor';
import { HistoryPage } from './features/budgets/HistoryPage';
import { BudgetDetail } from './features/budgets/BudgetDetail';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="borradores" element={<DraftsList />} />
        <Route path="borradores/:id" element={<BudgetEditor />} />
        <Route path="presupuestos" element={<HistoryPage />} />
        <Route path="presupuestos/nuevo" element={<BudgetEditor />} />
        <Route path="presupuestos/:id" element={<BudgetDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
