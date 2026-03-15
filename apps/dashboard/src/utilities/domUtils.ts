const isInputElement = (el: HTMLElement): boolean => {
    const elTagName = el.tagName.toLowerCase();
    return ["input", "textarea"].includes(elTagName);
};

export default isInputElement;
