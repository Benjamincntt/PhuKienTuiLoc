import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { ProductsPage } from "@/pages/ProductsPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { NewsArticlePage } from "@/pages/NewsArticlePage"
import { AccountPage } from "@/pages/AccountPage"
import { MyOrdersPage } from "@/pages/MyOrdersPage"
import { PaymentResultPage } from "@/pages/PaymentResultPage"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/news/:id" element={<NewsArticlePage />} />
              <Route path="/tai-khoan" element={<AccountPage />} />
              <Route path="/tai-khoan/don-hang" element={<MyOrdersPage />} />
              <Route path="/dat-hang/ket-qua" element={<PaymentResultPage />} />
            </Route>
          </Routes>
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
