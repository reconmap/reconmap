import { useLocation } from "react-router";

const useQuery = (): URLSearchParams => {
    const location = useLocation();
    return new URLSearchParams(location.search);
};

export default useQuery;
