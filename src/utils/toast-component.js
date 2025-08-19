import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notification } from "antd";

const ToastComponent = () => <ToastContainer />;

export const showToast = (type, message, description) => {
  notification[type]({
    message,
    description,
    placement: "topRight",
    duration: 3,
  });
};

export default ToastComponent;
