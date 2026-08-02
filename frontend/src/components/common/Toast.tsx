import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({ position = 'top-right', autoClose = 5000 }:any) =>{
    return(
        <ToastContainer
            position={position}
            autoClose={autoClose}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={'colored'}
        />
    )
}

export const showToast = (message:string, type:string = 'info') => {
    switch (type) {
        case 'success':
            toast.success(message);
            break;
        case 'error':
            toast.error(message);
            break;
        case 'warning':
            toast.warning(message);
            break;
        case 'info':
        default:
            toast.info(message);
            break;
    }
};

export default Toast;