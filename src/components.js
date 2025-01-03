const View = ({ title, children, backLabel, onBackClick, icon, onIconClick, className }) => {
    return html`
        <div class="view${className ? ` ${className}`: ''}">
            <header class="view-header">
                ${backLabel ? html`<button class="view-back" onClick=${onBackClick}>${backLabel === 'Close' ? '' : html`<i class="fa-solid fa-chevron-left"></i> `}${backLabel}</button>` : html`<div />`}
                <h2 class="view-title">${title}</h2>
                ${icon ? html`<button class="view-icon" onClick=${onIconClick}><i class="fa-solid fa-${icon}"></i></button>` : html`<div />`}
            </header>
            <div class="view-content">
                ${children}
            </div>
        </div>
    `;
};

const List = ({ title, children, className }) => {
    return html`
        <div class="list${className ? ` ${className}`: ''}">
            ${title && html`<h3 class="list-title">${title}</h3>`}
            <div class="list-items">
                ${children}
            </div>
        </div>
    `
}

const ListItem = ({ icon, text, detail, secondaryText, isButton, isEmpty, onClick, percent, className  }) => {
    let container = onClick ? 'button' : 'div';
    let percentStatus = 'high';
    if (percent < 66) percentStatus = 'medium';
    if (percent < 33) percentStatus = 'low'; 
    return html`
        <${container} class="listItem ${isButton ? 'listItem--button' : ''} ${isEmpty ? 'listItem--empty' : ''}${className ? ` ${className}`: ''}" onClick=${onClick}>
            <div class="listItem-left">
                ${icon ? html`<${Icon} className="listItem-icon" name=${icon} />` : ''}
                ${(text || detail) && html`<div class="listItem-textContainer">
                    ${text ? html`<div class="listItem-text">${text}</div>` : ''}
                    ${detail ? html`<div class="listItem-detail">${detail}</div>` : ''}
                </div>`}
            </div>
            ${(secondaryText !== undefined || (onClick && !isButton)) && html`
                <div class="listItem-right">
                    <div class="listItem-secondaryText">${secondaryText}</div>
                    ${onClick && !isButton && html`<div class="listItem-disclosure"><i class="fa-solid fa-chevron-right"></i></div>`}
                </div>
            `}
            ${percent !== undefined && html`<progress value=${percent} max="100" class="listItem-percent listItem-percent--${percentStatus}" />`}
        </${container}>
    `
}

const Toggle = ({ value, onChange, className }) => {
    return html`
        <div class="toggle-container${className ? ` ${className}`: ''}">
            <input type="checkbox" class="toggle" checked=${value} onChange=${onChange} />
            <button class="toggle-slider"></button>
        </div>
    `
}

const Icon = ({ name, color, className }) => {
    return html`<div class="icon icon--${name} ${color ? `color-bg-${color}` : ''} ${className ? ` ${className}`: ''}"><i class="fa-solid fa-${name}"></i></div>`;
}

const Stack = ({ children, className, column, gap }) => {
    const styles = {}
    if (gap) {
        styles.gap = `${gap}px`;
    }
    return html`<div style=${styles} class="stack${className ? ` ${className}`: ''}${column ? ' stack--column': ''}">${children}</div>`;
}