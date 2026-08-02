import Hero from './Hero'
import './styles/Home.css'
import Brands from './Brands'
import PopularProducts from './PopularProducts'
import Deals from './Deals'
import ProductsOnSale from './ProductsOnSale'
import Showcase from './Showcase'
import Features from "../../components/features/Features";
const Home = (): JSX.Element => {
  return (
        <div className='home'>
            <Hero />
            <Brands />
            <Features />
            <PopularProducts />
            <Deals />
            <ProductsOnSale />
            <Showcase />
        </div>
  )
}

export default Home
