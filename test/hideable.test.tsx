import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import Hideable from '../src/app/components/generic/hideable';
import { PreferenceField } from '../src/app/types';

describe('Hideable component', () => {
  const child = <span>content</span>;
  it('renders children when not hidden', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <Hideable field={{} as PreferenceField} allPreferences={{}}>{child}</Hideable>
    );
    expect(html).toContain('content');
  });

  it('hides children when hideFunction returns true', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <Hideable
        field={{ hideFunction: () => true } as PreferenceField}
        allPreferences={{}}
      >
        {child}
      </Hideable>
    );
    expect(html).toBe('');
  });
});
