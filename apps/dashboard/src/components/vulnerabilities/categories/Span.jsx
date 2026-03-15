
export const parentChildNames = (parentName, name) => {
    if (!name) {
        return '-'
    }

    if (parentName) {
        return `${parentName} • ${name}`
    }

    return name
}

const VulnerabilityCategorySpan = ({ name, parentName = null }) => {
    return <>{parentChildNames(parentName, name)}</>
}

export default VulnerabilityCategorySpan;
