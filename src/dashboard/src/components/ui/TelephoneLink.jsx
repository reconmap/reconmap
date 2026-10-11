import EmptyField from "components/ui/EmptyField.jsx";

const TelephoneLink = ({ number }) => {
    if (undefined === number || null === number || 0 === number.length) {
        return <EmptyField />;
    }
    return (
        <a href={`tel:${number}`} title={`Call telephone number "${number}"`}>
            {number}
        </a>
    );
};

export default TelephoneLink;
