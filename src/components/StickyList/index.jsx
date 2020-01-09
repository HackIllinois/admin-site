// Modified from https://codesandbox.io/s/0mk3qwpl4l

import React from 'react';
import { FixedSizeList as List } from 'react-window';

import './style.scss';

// StickyList works by overriding the list container to always display the sticky rows
// with position: sticky and by overriding the row renderer to leave the first n rows
// blank so that the sticky rows don't cover up any rows
// Note: when scrolling, rows that should be positioned where the sticky rows are still exist, just underneath

const StickyListContext = React.createContext();
StickyListContext.displayName = "StickyListContext";

// This overrides rendering of the contents of List (the entire container)
// We can't directly give this element props because it's inside List, so we use a Context
const innerElementType = React.forwardRef(({ children, ...rest }, ref) => (
  <StickyListContext.Consumer>
    {({ stickyRows, itemSize }) => (
      <div ref={ref} {...rest}>
        {/* We first render all the sticky rows, then the remaining children */}
        {stickyRows.map((stickyRow, index) => 
          <div
            key={index}
            className="sticky-row"
            style={{ top: index * itemSize, height: itemSize }}>
              {stickyRow}
          </div>
        )}
        {children}
      </div>
    )}
  </StickyListContext.Consumer>
));

// This overrides rendering for each individual row of List
const ItemWrapper = ({ data, index, style }) => {
  const { ItemRenderer, stickyRows } = data;
  if (index < stickyRows.length) {
    // This leaves a blank space where the sticky rows will be placed
    return null;
  }

  // And then effectively start the list from index 0 after the sticky rows
  return <ItemRenderer index={index - stickyRows.length} style={style}/>
}

export default function StickyList({ children, stickyRows, itemCount, ...props }) {
  stickyRows = stickyRows || [];
  return (
    <StickyListContext.Provider value={{ stickyRows, itemSize: props.itemSize }}>
      <List
        innerElementType={innerElementType}
        itemData={{ ItemRenderer: children, stickyRows }}
        itemCount={ itemCount + stickyRows.length }
        {...props}>
          {ItemWrapper}
      </List>
    </StickyListContext.Provider>
  )
}
