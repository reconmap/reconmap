import { useLocation } from "react-router-dom";

const useQuery = (): URLSearchParams => {
    const location = useLocation();
    return new URLSearchParams(location.search);
};

export default useQuery;
