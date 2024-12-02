// Kiểm tra phần tử có nằm trong viewport hay không
export const isScrolledIntoView = (element: HTMLLIElement) => {
    const rect = element.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;

    const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
};