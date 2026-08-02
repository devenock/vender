import {FaBalanceScale} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const CompareIcon = ({items}:any) => {
    const navigate = useNavigate();
    return (
        <span className="flex relative bg-gray-200 p-3 rounded-full justify-center items-center" onClick={() => {
            navigate('/comparison')
        }}>
                <i><FaBalanceScale fill="#023047"/></i>
                <p className="absolute left-6 -top-3 bg-cyan-950 text-xs rounded-full flex justify-center items-center p-3 h-2 w-2 text-white">{items.length}</p>

            </span>
    )
}

export default CompareIcon;