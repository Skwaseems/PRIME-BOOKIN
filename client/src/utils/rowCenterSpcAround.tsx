import React from 'react';

const rowCenterSpcAround = (): React.CSSProperties => {
  return {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  };
};

export default rowCenterSpcAround;
