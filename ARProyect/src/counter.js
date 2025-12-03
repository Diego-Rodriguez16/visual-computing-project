export function setupCounter(element) {
  if (!element || !element.addEventListener) {
    console.error('Invalid element provided to setupCounter');
    return;
  }
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.textContent = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
