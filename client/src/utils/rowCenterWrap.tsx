import React from 'react';

const rowCenterWrap = (): React.CSSProperties => {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexDirection: 'row',
  };
};

export default rowCenterWrap;
