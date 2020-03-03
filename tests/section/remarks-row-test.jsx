/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import RemarksRow from '../../src/components/common/section/remarks-row';


describe('RemarksRow component', () => {
  let element;

  const mocks = {
    firstLine: 'first test line',
    secondLine: 'second test line',
    thirdLine: 'third test line'
  };

  beforeEach(() => {
    element = (
      <RemarksRow
        value={[
          mocks.firstLine,
          mocks.secondLine,
          mocks.thirdLine
        ].join('\n')}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders remarks in proper place and split it into new lines', () => {
    const { container } = render(element);

    const remarksSpans = container.getElementsByTagName('span');
    const remarksNewLines = container.getElementsByTagName('br');

    expect(remarksSpans).to.have.lengthOf(3);
    expect(remarksNewLines).to.have.lengthOf(3);
    expect(remarksSpans[0]).to.property('textContent', mocks.firstLine);
    expect(remarksSpans[1]).to.property('textContent', mocks.secondLine);
    expect(remarksSpans[2]).to.property('textContent', mocks.thirdLine);
  });
});
