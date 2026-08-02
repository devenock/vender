import {useEffect, useState} from "react";
import axios from "axios";
const Features = () =>{
    const[featuresData, setFeaturesData] = useState<any>([]);

    // fetch features
    const getAllFeatures = async () => {
        try{
            const results = await axios.get(`/application.json`);
            const data = await results.data;
            console.log('features info', data);
            setFeaturesData(data.features);
        }catch (error){
            console.error(error);
        }
    }
    useEffect(() =>{
        getAllFeatures();
    },[])

    return(
        <div className="flex justify-between items-center w-full">
            {
                featuresData.map((item:any) =>(
                    <div key={item.id} className="flex space-x-3">
                        <img src={item.icon} alt={item.title} className="h-8 w-8"/>
                        <span>
                            <h5 className="font-semibold">{item.title}</h5>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                        </span>
                    </div>
                ))
            }
        </div>
    )
}

export default Features;