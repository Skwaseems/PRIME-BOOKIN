import React from 'react';

import {svg} from '../assets/svg';

type Props = {
  title: string;
  viewAllVisible?: boolean;
  viewAllOnClick?: () => void;
  containerStyle?: React.CSSProperties;
};

export const BlockHeading: React.FC<Props> = ({
  title,
  viewAllOnClick,
  containerStyle,
  viewAllVisible = false,
}) => {
  return (
    <div
      style={{...containerStyle}}
      className='row-center-space-between'
    >
      <h4
        className='number-of-lines-1'
        style={{textTransform: 'capitalize'}}
      >
        {title}
      </h4>
      {viewAllOnClick && (
        <button onClick={viewAllOnClick}>
          <svg.ViewAllSvg />
        </button>
      )}
    </div>
  );
};
