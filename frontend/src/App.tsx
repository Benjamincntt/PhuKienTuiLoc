import { BrowserRouter, Route, Routes } from "react-router-dom"
import { CartProvider } from "@/contexts/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { ProductsPage } from "@/pages/ProductsPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { NewsArticlePage } from "@/pages/NewsArticlePage"

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/news/:id" element={<NewsArticlePage />} />
          </Route>
        </Routes>
        <CartDrawer />
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
