import {Link, type NavigateFunction, useNavigate} from 'react-router-dom'
import {FC} from "react";

const Hero:FC = () => {
  const navigate: NavigateFunction = useNavigate()
  return (
        <div className='hero'>
            <div className="top-content">
                <Link to="/products" className="new">
                    <h1>Sale</h1>
                    <h3>GET UP TO 25% OFF</h3>
                    <button onClick={() => { navigate('/accessories') }}>shop now</button>
                </Link>
                <div className="collection">
                    <Link to="/store/category/womans" className="collection-item" id='women'>
                        <h5>New arrivals</h5>
                        <h3>women's</h3>
                    </Link>
                    <Link to="/store/category/mens" className="collection-item" id='men'>
                        <h5>New arrivals</h5>
                        <h3>men's</h3>
                    </Link>
                </div>
            </div>
            <div className="bottom-content">
                <Link to="/footwear" className="sale">
                    <h1>Sale</h1>
                    <p>Get upto 50% off</p>
                </Link>
                <Link to="/footwear" className="free">
                    <p>buy 2 items</p>
                    <h1>get one for free</h1>
                </Link>
                <Link to="/store/category/footware" className="footwear">
                    <p>new arrivals</p>
                    <h1>footwear</h1>
                </Link>
            </div>
        </div>
  )
}

export default Hero
