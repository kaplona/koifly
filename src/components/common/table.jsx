'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var _ = require('underscore');


var Table = React.createClass({
	
	propTypes: {
		rows: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
		columns: React.PropTypes.arrayOf(React.PropTypes.shape({
			key: React.PropTypes.string,
			label: React.PropTypes.string,
			defaultSortingDirection: React.PropTypes.bool
		})).isRequired,
		initialSortingField: React.PropTypes.string.isRequired,
		onRowClick: React.PropTypes.func,
		urlPath: React.PropTypes.string
	},
	
	getInitialState: function() {
		var sortingField = this.props.initialSortingField;
		var sortingDirection = this.getDefaultSortingDirection(sortingField);
		
		return {
			sortingField: sortingField,
			sortingDirection: sortingDirection
		};
	},
	
	getDefaultSortingDirection: function(fieldName) {
		var sortingDirection = true;
		for (var i = 0; i < this.props.columns.length; i++) {
			if (this.props.columns[i].key === fieldName) {
				sortingDirection = this.props.columns[i].defaultSortingDirection;
				break;
			};
		};
		return sortingDirection;
	},
	
	handleSorting: function(newSortingField) {
		if (this.state.sortingField === newSortingField) {
			this.setState(function(previousState, currentProps) {
				return {
					sortingDirection: !previousState.sortingDirection
				};
			});
			return;
		};
		
		var newsortingDirection = this.getDefaultSortingDirection(newSortingField);
		this.setState({
			sortingField: newSortingField,
			sortingDirection: newsortingDirection
		});
	},
	
	handleRowClick: function(flightId) {
		if (this.props.onRowClick) {
			this.props.onRowClick(flightId);
		};
	},

	render: function() {
		// Sorting
		var sortedRows = _.sortBy(this.props.rows, function(row) {
			// turn string to upper case so as to avoid ABCabc type of sorting
			if (typeof row[this.state.sortingField] === 'string') {
				return row[this.state.sortingField].toUpperCase();
			}
			return row[this.state.sortingField];
		}.bind(this)); // sort in ascending order
		if (!this.state.sortingDirection) {
			sortedRows.reverse(); // convert to descending order
		};
		
		var headerNodes = this.props.columns.map(function(column) {
			return (
				<th
					key={ 'column-' + column.key }
					onClick={ this.handleSorting.bind(this, column.key) }
				>
					{ column.label }
				</th>
			);
		}.bind(this));
		
		var rowNodes = sortedRows.map(function(row) {
			var rowToDisplay = [];
			for (var i = 0; i < this.props.columns.length; i++) {
				rowToDisplay.push(<td>{ row[this.props.columns[i].key] }</td>);
			};
			// TODO pass onClick fun from parent component, then handle it by transfering to needed url
			return (
				<Link key={ 'row-' + row.id } to={ this.props.urlPath + row.id }>
					<tr>{ rowToDisplay }</tr>
				</Link>
			);
		}.bind(this));
		
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



