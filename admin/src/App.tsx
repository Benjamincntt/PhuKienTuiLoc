import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RoleRoute } from "@/components/RoleRoute"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { CategoriesPage } from "@/pages/CategoriesPage"
import { CouponsPage } from "@/pages/CouponsPage"
import { NewsPage } from "@/pages/NewsPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<RoleRoute><DashboardPage /></RoleRoute>} />
            <Route path="/products" element={<RoleRoute><ProductsPage /></RoleRoute>} />
            <Route path="/categories" element={<RoleRoute><CategoriesPage /></RoleRoute>} />
            <Route path="/coupons" element={<RoleRoute><CouponsPage /></RoleRoute>} />
            <Route path="/news" element={<RoleRoute><NewsPage /></RoleRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
