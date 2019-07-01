'use strict';

require('../../src/test-dom')();
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;
const then = require('../../src/utils/then');
const Chai = require('chai');
const expect = Chai.expect;
const Sinon = require('sinon');
const sinonChai = require('sinon-chai');
Chai.use(sinonChai);

const Table = require('../../src/components/common/table');


describe('Table component', () => {
  let component;
  let renderedDOMElement;

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
        [keys[1]]: 'value 0 1',
        [keys[0]]: 'Value 0 0',
        [keys[2]]: 'Value 0 2'
      },
      {
        id: 1,
        [keys[2]]: 'value 1 2',
        [keys[0]]: 'value 1 0',
        [keys[1]]: 'Value 1 1'
      }
    ],
    columns: [
      columnsObject[keys[0]],
      columnsObject[keys[1]],
      columnsObject[keys[2]]
    ],
    handleRowClick: Sinon.spy()
  };


  before(() => {
    component = TestUtils.renderIntoDocument(
      <Table
        rows={mocks.rows}
        columns={mocks.columns}
        initialSortingField={mocks.columns[1].key}
        onRowClick={mocks.handleRowClick}
      />
    );

    renderedDOMElement = ReactDOM.findDOMNode(component);
  });

  it('sets right initial state', () => {
    const sortingFieldKey = mocks.columns[1].key;

    expect(component).to.have.deep.property('state.sortingField', sortingFieldKey);
    expect(component).to.have.deep.property('state.sortingDirection', columnsObject[sortingFieldKey].defaultSortingDirection);
  });

  it('renders proper table layout', () => {
    const columnHeaders = renderedDOMElement.querySelectorAll('th');
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

    const bodyRows = renderedDOMElement.querySelectorAll('tbody tr');

    // table has proper amount of rows
    expect(bodyRows).to.have.lengthOf(mocks.rows.length);

    const firstRowCells = bodyRows[0].querySelectorAll('td');
    const secondRowCells = bodyRows[1].querySelectorAll('td');

    // each row has proper amount of columns
    expect(firstRowCells).to.have.lengthOf(mocks.columns.length);
    expect(secondRowCells).to.have.lengthOf(mocks.columns.length);
    // cell contain is rendered in proper column
    // second element in mocks.rows will be rendered first
    // since sorting is descendant (sorting direction is 'false')
    expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);
    expect(firstRowCells[1]).to.have.property('textContent', mocks.rows[1][mocks.columns[1].key]);
    expect(firstRowCells[2]).to.have.property('textContent', mocks.rows[1][mocks.columns[2].key]);
    expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);
    expect(secondRowCells[1]).to.have.property('textContent', mocks.rows[0][mocks.columns[1].key]);
    expect(secondRowCells[2]).to.have.property('textContent', mocks.rows[0][mocks.columns[2].key]);
  });

  it('sorts table rows when certain column header clicked', done => {
    // Click on first column header which table is not sorted by
    let columnHeaders = renderedDOMElement.querySelectorAll('th');

    Simulate.click(columnHeaders[0]);

    then(() => {
      const sortingFieldKey = mocks.columns[0].key;

      // now table is sorted by 'clicked' field by its default sorting direction
      expect(component).to.have.deep.property('state.sortingField', sortingFieldKey);
      expect(component).to.have.deep.property('state.sortingDirection', columnsObject[sortingFieldKey].defaultSortingDirection);

      columnHeaders = renderedDOMElement.querySelectorAll('th');
      const firstHeaderTitleArrowClassName = columnHeaders[0].querySelector(`span.${defaults.arrowClass}`).className;
      const secondHeaderTitleArrowClassName = columnHeaders[1].querySelector(`span.${defaults.arrowClass}`).className;
      const thirdHeaderTitleArrowClassName = columnHeaders[2].querySelector(`span.${defaults.arrowClass}`).className;

      // first column header now have sorting-arrow pointing down
      expect(columnHeaders[0])
        .to.have.property('textContent')
        .that.contain(defaults.arrowUp); // sorted by this field, ascendant sorting direction (true)
      // other arrows are hidden
      expect(firstHeaderTitleArrowClassName).to.not.contain(defaults.hiddenClass);
      expect(secondHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);
      expect(thirdHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);

      const bodyRows = renderedDOMElement.querySelectorAll('tbody tr');
      const firstRowCells = bodyRows[0].querySelectorAll('td');
      const secondRowCells = bodyRows[1].querySelectorAll('td');

      // first element in mocks.rows will be rendered first
      // since sorting is ascendant (default sorting direction is 'true')
      expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);
      expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);

      // Now let's click on the same column header again
      Simulate.click(columnHeaders[0]);
    })
      .then(() => {
        const sortingFieldKey = mocks.columns[0].key;

        // table is still sorted by 'clicked' field, but different direction than it was
        expect(component).to.have.deep.property('state.sortingField', sortingFieldKey);
        expect(component).to.have.deep.property('state.sortingDirection', !columnsObject[sortingFieldKey].defaultSortingDirection);

        columnHeaders = renderedDOMElement.querySelectorAll('th');
        const firstHeaderTitleArrowClassName = columnHeaders[0].querySelector(`span.${defaults.arrowClass}`).className;
        const secondHeaderTitleArrowClassName = columnHeaders[1].querySelector(`span.${defaults.arrowClass}`).className;
        const thirdHeaderTitleArrowClassName = columnHeaders[2].querySelector(`span.${defaults.arrowClass}`).className;

        // first column header now have sorting-arrow pointing up
        expect(columnHeaders[0])
          .to.have.property('textContent')
          .that.contain(defaults.arrowDown); // sorted by this field, ascendant sorting direction (true)
        // other arrows are hidden
        expect(firstHeaderTitleArrowClassName).to.not.contain(defaults.hiddenClass);
        expect(secondHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);
        expect(thirdHeaderTitleArrowClassName).to.contain(defaults.hiddenClass);

        const bodyRows = renderedDOMElement.querySelectorAll('tbody tr');
        const firstRowCells = bodyRows[0].querySelectorAll('td');
        const secondRowCells = bodyRows[1].querySelectorAll('td');

        // now second element in mocks.rows will be rendered first
        // since sorting is descendant (sorting direction is 'false')
        expect(firstRowCells[0]).to.have.property('textContent', mocks.rows[1][mocks.columns[0].key]);
        expect(secondRowCells[0]).to.have.property('textContent', mocks.rows[0][mocks.columns[0].key]);

        done();
      });
  });
});
