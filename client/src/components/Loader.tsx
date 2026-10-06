import React from 'react';
import PuffLoader from 'react-spinners/PuffLoader';

export const Loader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        top: 52,
        bottom: 0,
        height: '100%',
      }}
      className='center'
    >
      <PuffLoader
        size={40}
        color={'#455A81'}
        aria-label='Loading Spinner'
        data-testid='loader'
        speedMultiplier={1}
      />
    </div>
  );
};
