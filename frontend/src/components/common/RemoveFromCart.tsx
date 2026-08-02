const RemoveFromCart = ({clickHandler}: any) => {
    return (
        <button onClick={clickHandler}
                className="flex bg-[#023047] p-3 text-white space-x-3 justify-center items-center w-36">
            <span>Remove</span>
        </button>
    )
}
export default RemoveFromCart;