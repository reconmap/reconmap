import { toast } from "react-hot-toast";

export function actionCompletedToast(description) {
    toast.success(
        <div>
            <h4>Action completed</h4>
            {description}
        </div>,
        {
            duration: 4000,
            position: "bottom-right",
        },
    );
}

export function errorToast(description) {
    toast.error(
        <div>
            <h4>An error has occurred</h4>
            {description}
        </div>,
        {
            position: "bottom-right",
        },
    );
}
