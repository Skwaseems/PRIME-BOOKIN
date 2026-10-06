import React from 'react';
import {useState} from 'react';

export const Switch: React.FC = () => {
  const [switchValue, setSwitchValue] = useState(false);

  return (
    <button
      style={{
        width: 39,
        backgroundColor: switchValue ? 'var(--main-turquoise)' : '#DCE2E7',
        borderRadius: 12,
        padding: '1.5px 1.5px',
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: switchValue ? 'flex-end' : 'flex-start',
      }}
      onClick={() => {
        setSwitchValue(!switchValue);
      }}
    >
      <div
        style={{
          width: 20.9,
          height: 20.9,
          backgroundColor: switchValue
            ? 'var(--white-color)'
            : 'var(--text-color)',
          borderRadius: 11,
          alignSelf: switchValue ? 'flex-end' : 'flex-start',
        }}
      />
    </button>
  );
};
