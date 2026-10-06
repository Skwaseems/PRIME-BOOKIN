import {CSSProperties} from 'react';

const numberOfLines = (numberOfLines: number): CSSProperties | null => {
  if (numberOfLines > 0) {
    return {
      display: '-webkit-box',
      WebkitLineClamp: numberOfLines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
  }

  return null;
};

export default numberOfLines;
