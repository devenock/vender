import { Link, type NavigateFunction, useNavigate } from 'react-router-dom'
import { FaUserAlt } from 'react-icons/fa'
import { navData } from '../../assets/data/navData'
import {FC} from "react";
import {useSelector} from "react-redux";
import CartIcon from "./CartIcon";
import CompareIcon from "./CompareIcon";
import Logo from "./Logo";

const Navbar: FC = () => {
    const navigate: NavigateFunction = useNavigate()
    const {items} = useSelector((store:any) => store.cart);
  return (
    <div className='navbar'>
      <div className="logo">
         <Logo />
      </div>
        <div className="nav-links">
            <ul>
                {
                    navData.map((item) => (
                        <Link key={item.id} to={item.url} className='navLinkItem'>{item.name}</Link>
                    ))
                }
            </ul>
        </div>
        <div className="nav-action cursor-pointer space-x-5">
            <CartIcon items={items} />
            <CompareIcon items={items} />
            <p className="bg-gray-200 p-3 rounded-full justify-center items-center" onClick={() => {
                navigate('/login')
            }} id='auth-icon'><i><FaUserAlt  fill="#023047"/></i></p>
        </div>
    </div>
  )
}
export default Navbar
