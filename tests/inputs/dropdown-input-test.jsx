/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, render } from '@testing-library/react';

import DropdownInput from '../../src/components/common/inputs/dropdown-input';


describe('DropdownInput component', () => {
  let element;

  const defaults = {
    emptyText: '',
    errorClassName: 'x-error'
  };

  const mocks = {
    selectedValue: 'value 2',
    labelText: 'test text',
    options: [
      { value: 'value 1', text: 'text a' },
      { value: 'value 2', text: 'text b' },
      { value: 'value 3', text: 'text c' }
    ],
    emptyValue: 'empty value',
    errorMessage: 'test error message',
    inputName: 'testInput',
    handleSelectChange: () => {},
    handleSelectFocus: () => {},
    handleSelectBlur: () => {}
  };

  afterEach(() => {
    cleanup();
  });


  describe('Defaults and behavior testing', () => {
    beforeEach(() => {
      element = (
        <DropdownInput
          selectedValue={mocks.selectedValue}
          options={mocks.options}
          labelText={mocks.labelText}
          emptyValue={mocks.emptyValue}
          inputName={mocks.inputName}
          onChangeFunc={mocks.handleSelectChange}
          onFocus={mocks.handleSelectFocus}
          onBlur={mocks.handleSelectBlur}
        />
      );
    });

    it('renders label with proper text', () => {
      const { getByText } = render(element);
      const label = getByText(mocks.labelText);

      expect(label).to.be.ok;
    });

    it('renders dropdown with proper options', () => {
      const { container, getByText } = render(element);
      const dropdown = container.querySelector('select');

      expect(dropdown).to.have.property('value', mocks.selectedValue);
      expect(dropdown.className).to.not.contain(defaults.errorClassName);

      const options = container.getElementsByTagName('option');
      const option1 = getByText(mocks.options[0].text);
      const option2 = getByText(mocks.options[1].text);
      const option3 = getByText(mocks.options[2].text);

      expect(options.length).to.equal(mocks.options.length + 1); // one for empty value
      expect(option1).to.be.ok;
      expect(option2).to.be.ok;
      expect(option3).to.be.ok;
    });

    it('doesn\'t show error message if wasn\'t provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.not.be.ok;
    });
  });


  describe('Error message testing', () => {
    beforeEach(() => {
      element = (
        <DropdownInput
          selectedValue={mocks.selectedValue}
          options={mocks.options}
          labelText={mocks.labelText}
          inputName={mocks.inputName}
          errorMessage={mocks.errorMessage}
          onChangeFunc={mocks.handleSelectChange}
        />
      );
    });

    it('renders error message if provided', () => {
      const { queryByText } = render(element);
      const errorMessages = queryByText(mocks.errorMessage);

      expect(errorMessages).to.be.ok;
    });

    it('renders a dropdown with error classes if error message presents', () => {
      const { container } = render(element);
      const dropdown = container.querySelector('select');

      expect(dropdown.className).to.contain(defaults.errorClassName);
    });
  });
});
