import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { ProductsPage } from "@/pages/ProductsPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
