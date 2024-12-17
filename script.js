const { h, render } = preact;
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
    const handleClick = () => {
        alert('Clicked!');
    };
    return html`<button onClick=${handleClick}>${label}</button>`;
};

render(h(App), document.body);