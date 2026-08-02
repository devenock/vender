interface DropdownProps {
    list: any[];
    labelName: string | number;
    name:string;
}

const Dropdown = ({list, labelName, name}: DropdownProps) =>{
    return(
        <div className="flex flex-col">
            <label htmlFor="name">{labelName}</label>
            <select name={name} id={name} className="w-full p-3 border outline-0 border-[#023047]">
                {
                    list.map((item:any) => (
                        <option key={item.id} value={item.id}>{item}</option>
                    ))
                }
            </select>
        </div>
    )
}

export default Dropdown;