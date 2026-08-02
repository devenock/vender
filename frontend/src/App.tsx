import React, {FC, useEffect, useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Products from './pages/products/Products'
import Navbar from './components/navbar/Navbar'
import Footer from './components/footer/Footer'
import Contact from './components/contact/Contact'
import Category from './components/category/Category'
import Accessories from './components/category/accessories/Accessories'
import Sportsware from './components/category/sportsware/Sportsware'
import Jewelry from './components/category/jewelry/Jewelry'
import Outware from './components/category/outware/Outware'
import Womans from './components/category/womans/Womans'
import Footware from './components/category/footware/Footware'
import Mens from './components/category/mens/Mens'
import Outdoor from './components/category/outdoor/Outdoor'
import Home from './pages/home/Home'
import ProductDetails from "./pages/products/ProductDetails";
import {useDispatch} from "react-redux";
import axios from "axios";
import {fetchAllProducts} from "./features/slices/productSlice";
import CartPage from "./pages/cart/Cart";
import Toast from "./components/common/Toast";
import CheckoutPage from "./pages/order/CheckoutPage";

const App:FC = () => {

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | any >(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const dispatch = useDispatch();
  //   fetch products
  const getAllProducts = async (page: number) => {
    try{
      const results = await axios.get(`/products.json?page=${page}`);
      if(results.statusText !== 'OK'){
        setLoading(false);
      }
      const data = await results.data;
      if (data.products.length === 0) {
        setHasMore(false); // No more products to load
      } else {
        setProducts(prevProducts => [...prevProducts, ...data.products]);
        dispatch(fetchAllProducts([...products, ...data.products]));
      }
      setLoading(false);
    }catch (error){
      setError(error);
      setLoading(false);
    }
  }

  useEffect(() =>{
    getAllProducts(1);
  },[])

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    await getAllProducts(nextPage);
    setPage(nextPage);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Category />
        <Toast />
        <div className="flex flex-col min-h-screen px-60 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<Contact />} />
            <Route path="/products" element={<Products getAllProducts={fetchMoreData} hasMore={hasMore} loading={loading} error={error} products={products} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/contacts" element={<Contact />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/cart/checkout" element={<CheckoutPage />} />
            <Route path="/store/category/accessories" element={<Accessories />} />
            <Route path="/store/category/outdoor" element={<Outdoor />} />
            <Route path="/store/category/mens" element={<Mens />} />
            <Route path="/store/category/footware" element={<Footware />} />
            <Route path="/store/category/womans" element={<Womans />} />
            <Route path="/store/category/outware" element={<Outware />} />
            <Route path="/store/category/jewelry" element={<Jewelry />} />
            <Route path="/store/category/sportsware" element={<Sportsware />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
