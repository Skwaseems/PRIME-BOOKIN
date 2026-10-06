import React from 'react';

export const rowCenterSpcBtwWrap = (): React.CSSProperties => {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  };
};
