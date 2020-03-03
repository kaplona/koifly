/* eslint-disable no-unused-expressions, no-undef */
'use strict';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import Chai from 'chai';
import Sinon from 'sinon';
import sinonChai from 'sinon-chai';
Chai.use(sinonChai);

import Table from '../../src/components/common/table';


describe('Table component', () => {
  let element;
  let handleRowClick;

  const defaults = {
    arrowUp: '\u25b2',
    arrowDown: '\u25bc',
    arrowClass: 'arrow',
    hiddenClass: 'x-hidden'
  };

  const keys = ['firstKey', 'secondKey', 'thirdKey'];
  const columnsObject = {
    [keys[0]]: {
      key: keys[0],
      label: 'firstLabel',
      defaultSortingDirection: true
    },
    [keys[1]]: {
      key: keys[1],
      label: 'secondLabel',
      defaultSortingDirection: false
    },
    [keys[2]]: {
      key: keys[2],
      label: 'thirdLabel',
      defaultSortingDirection: false
    }
  };

  const mocks = {
    rows: [
      {
        id: 0,
        [keys[0]]: 'Value 0 0',
        [keys[1]]: 'value 0 1',
        [keys[2]]: 'Value 0 2'
      },
      {
        id: 1,
        [keys[0]]: 'value 1 0',
        [keys[2]]: 'value 1 2',
        [keys[1]]: 'Value 1 1'
      },
      {
        id: 2,
        [keys[0]]: 'value 2 0',
        [keys[2]]: 'value 2 2',
        [keys[1]]: 'Value 2 1'
      }
    ],
    columns: [
      columnsObject[keys[0]],
      columnsObject[keys[1]],
      columnsObject[keys[2]]
    ]
  };


  beforeEach(() => {
    handleRowClick = Sinon.spy();

    element = (
      <Table
        rows={mocks.rows}
        columns={mocks.columns}
        initialSortingField={mocks.columns[1].key}
        onRowClick={handleRowClick}
      />
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('table has proper amount of columns', () => {
    const { container } = render(element);

    const columnHeaders = container.querySelectorAll('th');
    const firstHeaderTitleArrowClassName = columnHeaders[0].querySelector(`span.${defaults.arrowClass}`).className;
    const secondHeaderTitleArrowClassName = columnHeaders[1].querySelector(`span.${defaults.arrowClass}`).className;
    const thirdHeaderTitleArrowClassName = columnHeaders[2].querySelector(`span.${defaults.arrowClass}`).className;

    // table has proper amount of columns
    // all column headers have proper text
    // column header by which table is sorted has a sorting-arrow
    // other arrows are hidden
    expect(columnHeaders).to.have.lengthOf(mocks.columns.length);
    expect(columnHeaders[0])
      .to.have.property('textContent')
      .that.contain(mocks.columns[0].label);
    expect(firstHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);
    expect(columnHeaders[1])
      .to.have.property('textContent')
      .that.contain(mocks.columns[1].label)
      .and.contain(defaults.arrowDown); // sorted by this field, descendant sorting direction (false)
    expect(secondHeaderTitleArrowClassName).to.not.contain(defaults.hiddenClass);
    expect(columnHeaders[2])
      .to.have.property('textContent')
      .that.contain(mocks.columns[2].label);
    expect(thirdHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);
  });

  it('renders proper amount of rows', () => {
    const { container } = render(element);

    const bodyRows = container.querySelectorAll('tbody tr');

    // table has proper amount of rows
    expect(bodyRows).to.have.lengthOf(mocks.rows.length);

    const firstRowCells = bodyRows[0].querySelectorAll('td');
    const secondRowCells = bodyRows[1].querySelectorAll('td');
    const thirdRowCells = bodyRows[2].querySelectorAll('td');


    // each row has proper amount of columns
    expect(firstRowCells).to.have.lengthOf(mocks.columns.length);
    expect(secondRowCells).to.have.lengthOf(mocks.columns.length);
    expect(thirdRowCells).to.have.lengthOf(mocks.columns.length);
  });

  it('sorts by a column initial sorting direction', () => {
    const { container } = render(element);

    const bodyRows = container.querySelectorAll('tbody tr');
    const firstRowCells = bodyRows[0].querySelectorAll('td');
    const secondRowCells = bodyRows[1].querySelectorAll('td');
    const thirdRowCells = bodyRows[2].querySelectorAll('td');

    // sorting is descendant (sorting direction is 'false' for initial sorting column)
    expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[2][mocks.columns[0].key]);
    expect(firstRowCells[1]).to.have.property('textContent', mocks.rows[2][mocks.columns[1].key]);
    expect(firstRowCells[2]).to.have.property('textContent', mocks.rows[2][mocks.columns[2].key]);
    expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);
    expect(secondRowCells[1]).to.have.property('textContent', mocks.rows[1][mocks.columns[1].key]);
    expect(secondRowCells[2]).to.have.property('textContent', mocks.rows[1][mocks.columns[2].key]);
    expect(thirdRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);
    expect(thirdRowCells[1]).to.have.property('textContent', mocks.rows[0][mocks.columns[1].key]);
    expect(thirdRowCells[2]).to.have.property('textContent', mocks.rows[0][mocks.columns[2].key]);
  });

  it('sorts table rows when certain column header clicked', () => {
    let columnHeaders;
    let bodyRows;
    let firstRowCells;
    let secondRowCells;
    let thirdRowCells;
    const { container, getByText } = render(element);

    // Click on first column header which table is not sorted by
    const firstHeader = getByText(mocks.columns[0].label);
    fireEvent.click(firstHeader);

    columnHeaders = container.querySelectorAll('th');
    const firstHeaderTitleArrowClassName = columnHeaders[0].querySelector(`span.${defaults.arrowClass}`).className;
    const secondHeaderTitleArrowClassName = columnHeaders[1].querySelector(`span.${defaults.arrowClass}`).className;
    const thirdHeaderTitleArrowClassName = columnHeaders[2].querySelector(`span.${defaults.arrowClass}`).className;

    // first column header now have sorting-arrow pointing up
    expect(firstHeaderTitleArrowClassName).to.not.contain(defaults.hiddenClass);
    expect(columnHeaders[0])
      .to.have.property('textContent')
      .that.contain(defaults.arrowUp); // sorted by this field, ascendant sorting direction (true)
    // other arrows are hidden
    expect(secondHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);
    expect(thirdHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);

    bodyRows = container.querySelectorAll('tbody tr');
    firstRowCells = bodyRows[0].querySelectorAll('td');
    secondRowCells = bodyRows[1].querySelectorAll('td');
    thirdRowCells = bodyRows[2].querySelectorAll('td');

    // first element in mocks.rows will be rendered first
    // since sorting is ascendant (default sorting direction is 'true')
    expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);
    expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);
    expect(thirdRowCells[0]).to.have.property('textContent', mocks.rows[2][mocks.columns[0].key]);


    // Now let's click on the same column header again
    fireEvent.click(firstHeader);

    columnHeaders = container.querySelectorAll('th');

    // first column header now have sorting-arrow pointing down
    expect(columnHeaders[0])
      .to.have.property('textContent')
      .that.contain(defaults.arrowDown); // sorted by this field, ascendant sorting direction (true)

    bodyRows = container.querySelectorAll('tbody tr');
    firstRowCells = bodyRows[0].querySelectorAll('td');
    secondRowCells = bodyRows[1].querySelectorAll('td');
    thirdRowCells = bodyRows[2].querySelectorAll('td');

    // first element in mocks.rows will be rendered first
    // since sorting is ascendant (default sorting direction is 'true')
    expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[2][mocks.columns[0].key]);
    expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);
    expect(thirdRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);
  });

  it('calls a callback when row is clicked', () => {
    const { container } = render(element);
    const bodyRows = container.querySelectorAll('tbody tr');

    fireEvent.click(bodyRows[1]);

    expect(handleRowClick).to.have.been.calledWith(mocks.rows[1].id);
  });
});
