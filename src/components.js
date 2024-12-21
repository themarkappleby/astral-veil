const View = ({ title, children, backLabel, onBackClick }) => {
    return html`
        <div class="view">
            <div class="view-header">
                ${backLabel ? html`<button class="view-back" onClick=${onBackClick}><i class="fa-solid fa-chevron-left"></i> ${backLabel}</button>` : ''}
                <h2 class="view-title">${title}</h2>
            </div>
            <div class="view-content">
                ${children}
            </div>
        </div>
    `;
};

const List = ({ title, children }) => {
    return html`
        <div class="list">
            ${title && html`<h3 class="list-title">${title}</h3>`}
            <div class="list-items">
                ${children}
            </div>
        </div>
    `
}

const ListItem = ({ icon, color, children, right, onClick, percent }) => {
    const container = onClick ? 'button' : 'div';
    let percentColor = 'var(--color-11)';
    if (percent < 66) percentColor = 'var(--color-9)';
    if (percent < 33) percentColor = 'var(--color-8)'; 
    return html`
        <${container} class="list-item" onClick=${onClick}>
            ${percent ? html`<div class="list-item-percent" style="width: ${percent}%; background: ${percentColor}" />` : ''}
            <div class="list-item-left">
                ${icon ? html`<${Icon} name=${icon} color=${color} />` : ''}
                ${children}
            </div>
            ${(right || onClick) ? html`
                <div class="list-item-right">
                    ${right ? html`<div class="list-item-right">${right}</div>` : ''}
                    ${onClick ? html`<div class="list-item-arrow"><i class="fa-solid fa-chevron-right"></i></div>` : ''}
                </div>
            ` : ''}
        </${container}>
    `
}

const Toggle = ({ value, onChange }) => {
    return html`
        <div class="toggle-container">
            <input type="checkbox" class="toggle" checked=${value} onChange=${onChange} />
            <button class="toggle-slider"></button>
        </div>
    `
}

const Icon = ({ name, color }) => {
    return html`<div class="icon ${color && `color-bg-${color}`}"><i class="fa-solid fa-${name}"></i></div>`;
}