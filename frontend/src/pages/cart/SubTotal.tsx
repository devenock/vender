import {useSelector} from "react-redux";

const SubTotal = () => {
    const{subTotal} = useSelector((store: any) => store.cart);
    return (
        <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
                <p>Subtotal</p>
                <p>${subTotal}</p>
            </div>
            <hr/>
            {/*<div className="flex justify-between">*/}
            {/*    <dt>VAT</dt>*/}
            {/*    <dd>£25</dd>*/}
            {/*</div>*/}

            {/*<div className="flex justify-between">*/}
            {/*    <dt>Discount</dt>*/}
            {/*    <dd>-£20</dd>*/}
            {/*</div>*/}

            <div className="flex justify-between !text-base font-medium">
                <p>Total</p>
                <p>${subTotal}</p>
            </div>
        </div>
    )
}
export default SubTotal;