import React from 'react';

import {components} from '../components';
import type {ReviewType} from '../types';

type Props = {
  index: number;
  isLast: boolean;
  review: ReviewType;
};

export const HomeReviewItem: React.FC<Props> = ({isLast, review, index}) => {
  return (
    <li
      style={{
        padding: 20,
        maxWidth: 320,
        width: '100%',
        borderRadius: 10,
        marginLeft: index === 0 ? 20 : 0,
        marginRight: isLast ? 20 : 0,
        backgroundColor: 'var(--white-color)',
      }}
    >
      <section
        className='row-center'
        style={{
          paddingBottom: 10,
          marginBottom: 10,
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <img
          src={review.avatar}
          alt={review.name}
          style={{width: 30, height: 30, borderRadius: 15, marginRight: 14}}
        />
        <div style={{width: '100%'}}>
          <div
            className='row-center-space-between'
            style={{marginBottom: 4}}
          >
            <h5>{review.name}</h5>
            <span
              className='t10'
              style={{lineHeight: 1.2}}
            >
              {review.date}
            </span>
          </div>
          <div className='row-center-space-between'>
            <components.Rating rating={review.rating} />
            <button>
              <span
                className='t10'
                style={{lineHeight: 1.2, color: 'var(--main-turquoise)'}}
              >
                Reply
              </span>
            </button>
          </div>
        </div>
      </section>
      <section>
        <p className='t14'>{review.comment}</p>
      </section>
    </li>
  );
};
