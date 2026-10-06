import React from 'react';

const columnCenterSpcBtween = (): React.CSSProperties => {
  return {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
};

export default columnCenterSpcBtween;
