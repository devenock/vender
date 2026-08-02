import {FC} from "react";
import {useDispatch} from "react-redux";
import { AiOutlineDelete } from "react-icons/ai";
import {removeItemFromCart} from "../../features/slices/cartSlice";
import Dropdown from "../../components/common/Dropdown";

interface CartItemProps{
    item:any;
}
const CartItem:FC<CartItemProps> = ({item}) =>{
    const dispatch = useDispatch()
    return(
        <div>
            <li className="flex items-start gap-4 w-full">
                <div className="flex w-1/4">
                    <img
                        src={item.img}
                        alt={item.name}
                        className="rounded object-cover"
                    />
                </div>
                <div className="flex flex-col w-1/2">
                    <h3 className="text-sm text-gray-900 font-bold">{item.name}</h3>
                    <dl className="mt-0.5 space-y-3 text-[10px] text-gray-600">
                        <div>
                            <Dropdown labelName={'Sizes:'} list={item.size} name={'sizes'} />
                        </div>
                        <div>
                            <Dropdown labelName={'Colors'} list={item.color} name={'colors'} />
                        </div>
                    </dl>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2">
                    <p>${item.price}</p>
                    {/*<form>*/}
                    {/*    <label htmlFor="Line3Qty" className="sr-only"> Quantity </label>*/}
                    {/*    <input*/}
                    {/*        type="number"*/}
                    {/*        min="1"*/}
                    {/*        value={item.quantity}*/}
                    {/*        id="Line3Qty"*/}
                    {/*        className="h-8 w-12 rounded border-gray-200 bg-gray-50 p-0 text-center text-xs text-gray-600 [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"*/}
                    {/*    />*/}
                    {/*</form>*/}
                    <button onClick={() => dispatch(removeItemFromCart(item))} className="text-gray-600 bg-gray-100 p-3 rounded-full justify-center items-center transition hover:text-red-600">
                        <span className="sr-only">Remove item</span>
                        <AiOutlineDelete fill="#bc4749"/>
                    </button>
                </div>
            </li>
        </div>
    )
}

export default CartItem;