import React from 'react';

import './style.scss';

const selectTextInElement = el => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}

const Token = () => (
  <div className="token-page">
    <p className="token-text" onClick={(e) => selectTextInElement(e.target)}>
      {sessionStorage.token}
    </p>
  </div>
);

export default Token;
