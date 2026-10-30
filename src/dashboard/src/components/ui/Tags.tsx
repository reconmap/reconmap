import Tag from "components/ui/Tag";
import { Link } from "react-router";

const Tags = ({ values }: any) => {
    if (!values) return null;

    // Safely parse the JSON string and handle cases where parsing might fail
    try {
        const parsedValues = JSON.parse(values);

        return parsedValues
            .filter((value) => value.length > 0)
            .map((value, index) => (
                <Link key={`tag_index_${index}`} to={`/search/${value}?entities=commands,findings`}>
                    <Tag>{value}</Tag>
                </Link>
            ));
    } catch (error) {
        console.error("Failed to parse `values` prop as JSON:", error);
        return null;
    }
};

export default Tags;
