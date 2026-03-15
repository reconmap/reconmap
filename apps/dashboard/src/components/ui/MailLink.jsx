const MailLink = ({ email }) => {
    if (null === email) {
        return <>-</>;
    }
    return (
        <a href={`mailto:${email}`} title={`Send email to "${email}"`}>
            {email}
        </a>
    );
};

export default MailLink;
