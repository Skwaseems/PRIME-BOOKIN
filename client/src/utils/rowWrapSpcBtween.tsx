import React from 'react';

const rowWrapSpcBtween = (): React.CSSProperties => {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  };
};

export default rowWrapSpcBtween;
