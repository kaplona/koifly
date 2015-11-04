'use strict';

var React = require('react');
var _ = require('underscore');


var Table = React.createClass({

    propTypes: {
        rows: React.PropTypes.array,
        columns: React.PropTypes.arrayOf(React.PropTypes.shape({
            key: React.PropTypes.string,
            label: React.PropTypes.string,
            defaultSortingDirection: React.PropTypes.bool
        })).isRequired,
        initialSortingField: React.PropTypes.string.isRequired,
        onRowClick: React.PropTypes.func
    },

    getInitialState: function() {
        var sortingField = this.props.initialSortingField;
        var sortingDirection = this.getDefaultSortingDirection(sortingField);

        return {
            sortingField: sortingField,
            sortingDirection: sortingDirection
        };
    },

    handleSorting: function(newSortingField) {
        if (this.state.sortingField === newSortingField) {
            this.setState((previousState) => {
                return {
                    sortingDirection: !previousState.sortingDirection
                };
            });
            return;
        }

        var newsortingDirection = this.getDefaultSortingDirection(newSortingField);
        this.setState({
            sortingField: newSortingField,
            sortingDirection: newsortingDirection
        });
    },

    handleRowClick: function(flightId) {
        if (this.props.onRowClick) {
            this.props.onRowClick(flightId);
        }
    },

    getDefaultSortingDirection: function(fieldName) {
        var sortingDirection = true;
        for (var i = 0; i < this.props.columns.length; i++) {
            if (this.props.columns[i].key === fieldName) {
                sortingDirection = this.props.columns[i].defaultSortingDirection;
                break;
            }
        }
        return sortingDirection;
    },

    render: function() {
        // Sorting (ascending order)
        var sortedRows = _.sortBy(this.props.rows, (row) => {
            // turn string to upper case so as to avoid ABCabc type of sorting
            if (typeof row[this.state.sortingField] === 'string') {
                return row[this.state.sortingField].toUpperCase();
            }
            return row[this.state.sortingField];
        });
        if (!this.state.sortingDirection) {
            sortedRows.reverse(); // convert to descending order
        }

        var headerNodes = this.props.columns.map((column) => {
            return (
                <th
                    key={ 'column-' + column.key }
                    onClick={ this.handleSorting.bind(this, column.key) }
                    >
                    { column.label }
                </th>
            );
        });

        var rowNodes = sortedRows.map((row) => {
            var rowToDisplay = [];
            for (var i = 0; i < this.props.columns.length; i++) {
                rowToDisplay.push(<td>{ row[this.props.columns[i].key] }</td>);
            }
            return <tr key={ 'row-' + row.id } onClick={ this.handleRowClick.bind(this, row.id) }>{ rowToDisplay }</tr>;
        });

        return (
            <table>
                <thead>
                    <tr>{ headerNodes }</tr>
                </thead>
                <tbody>{ rowNodes }</tbody>
            </table>
        );
    }
});


module.exports = Table;
