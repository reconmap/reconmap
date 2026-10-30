
const parentChildNames =(parentName, name) => {
    if (!name) {
        return '-'
    }

    if (parentName) {
        return `${parentName} • ${name}`
    }

    return name
}

const FindingCategorySpan = ({ name, parentName = null }: any) => {
    return <>{parentChildNames(parentName, name)}</>
}

export default FindingCategorySpan;
