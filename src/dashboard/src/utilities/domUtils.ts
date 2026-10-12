const isInputElement = (el: Element | null): boolean => {
    const elTagName = el?.tagName.toLowerCase() ?? "";
    return ["input", "textarea"].includes(elTagName);
};

export default isInputElement;
