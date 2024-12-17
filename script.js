const { h, render } = preact;

const App = () => {
    return h('h1', null, 'Helloo world, Preact Local Reference!');
};

render(h(App), document.body);