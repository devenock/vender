import Checkout from "./Checkout";
import SubTotal from "./SubTotal";
import {useSelector} from "react-redux";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";

const CartPage = () =>{
    const {items} = useSelector((store:any) => store.cart);
    return(
    <section>
        {
            items.length !== 0 ? <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <header className="text-center">
                        <h1 className="text-xl font-bold text-gray-900 sm:text-3xl">Your Cart</h1>
                    </header>

                    <div className="mt-8">
                        <ul className="space-y-4">
                            {
                                items.map((item: any) => (
                                    <CartItem key={item.id} item={item}/>
                                ))
                            }
                        </ul>
                        <div className="mt-8 flex justify-end border-t border-gray-100 pt-8">
                            <div className="w-screen max-w-lg space-y-4">
                                <SubTotal/>
                                <Checkout/>
                            </div>
                        </div>
                    </div>
                </div>
            </div> : <EmptyCart />
        }
    </section>

    )
}

export default CartPage;