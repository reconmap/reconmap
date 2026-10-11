
interface BooleanTextProps {
    value: boolean;
}

const BooleanText = ({ value }: BooleanTextProps) => {
    return value ? 'True' : 'False';
}

export default BooleanText;
