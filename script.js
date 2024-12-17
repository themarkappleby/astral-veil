const { h, render } = preact;
const { useState, useCallback } = preactHooks;
const html = htm.bind(h);

const App = () => {
    return html`
        <div>
            <h1>Astral Veil</h1>
            <${Button} label="Click me" />
        </div>
    `;
};

const Button = ({ label }) => {
    const [value, setValue] = useState(0);
    const increment = useCallback(() => setValue(value + 1), [value]);
    return html`<button onClick=${increment}>${label}: ${value}</button>`;
};

render(h(App), document.body);