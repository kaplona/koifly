'use strict';

var React = require('react');
var ReactRouter = require('react-router');
var History = ReactRouter.History;
var Link = ReactRouter.Link;
var $ = require('jquery');
var _ = require('underscore');
var GliderModel = require('../models/glider');
var Validation = require('../utils/validation');
var View = require('./common/view');
var Button = require('./common/button');
var TextInput = require('./common/text-input');
var TimeInput = require('./common/time-input');
var RemarksInput = require('./common/remarks-input');
var Loader = require('./common/loader');


var GliderEditView = React.createClass({

    propTypes: {
        params: React.PropTypes.shape({
            gliderId: React.PropTypes.string // TODO isRequired
        })
    },

    mixins: [ History ],

    getInitialState: function() {
        return {
            glider: null,
            errors: {
                name: '',
                initialFlightNum: '',
                initialAirtime: '',
                hours: '',
                minutes: ''
            }
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var validationRespond = this.validateForm();
        // If no errors
        if (validationRespond === true) {
            var newGlider =  _.clone(this.state.glider);
            newGlider.initialAirtime = parseInt(newGlider.hours) * 60 + parseInt(newGlider.minutes);
            GliderModel.saveGlider(newGlider);
            this.history.pushState(null, '/gliders');
        }
    },

    handleInputChange: function(inputName, inputValue) {
        var newGlider =  _.clone(this.state.glider);
        newGlider[inputName] = inputValue;
        this.setState({ glider: newGlider }, function() {
            this.validateForm(true);
        });
    },

    handleDeleteGlider: function() {
        GliderModel.deleteGlider(this.props.params.gliderId);
    },

    onDataModified: function() {
        var glider;
        if (this.props.params.gliderId) {
            glider = GliderModel.getGliderOutput(this.props.params.gliderId);
        } else {
            glider = GliderModel.getNewGliderOutput();
        }

        if (glider === false) {
            // TODO if no glider with given id => show error
            return;
        }
        if (glider !== null) {
            glider.hours = Math.floor(glider.initialAirtime / 60);
            glider.minutes = glider.initialAirtime % 60;
        }
        this.setState({ glider: glider });
    },

    validateForm: function(softValidation) {
        var newGlider =  _.clone(this.state.glider);
        var validationRespond = Validation.validateForm(
                GliderModel.getValidationConfig(),
                newGlider,
                softValidation
        );
        // update errors state
        var newErrorState =  _.clone(this.state.errors);
        $.each(newErrorState, (fieldName) => {
            newErrorState[fieldName] = validationRespond[fieldName] ? validationRespond[fieldName] : '';
        });
        this.setState({ errors: newErrorState });

        return validationRespond;
    },

    renderLoader: function() {
        var deleteButton = (this.props.params.gliderId) ? <Button active={ false }>Delete</Button> : '';
        return (
            <div>
                <Link to='/gliders'>Back to Gliders</Link>
                <Loader />
                <div className='button__menu'>
                    <Button active={ false }>Save</Button>
                    { deleteButton }
                    <Link to={ this.props.params.gliderId ? ('/glider/' + this.props.params.gliderId) : '/gliders' }>
                        <Button>Cancel</Button>
                    </Link>
                </div>
            </div>
        );
    },

    renderDeleteButton: function() {
        if (this.props.params.gliderId) {
            return (
                <Link to='/gliders'>
                    <Button onClick={ this.handleDeleteGlider }>Delete</Button>
                </Link>
            );
        }
        return '';
    },

    render: function() {
        if (this.state.glider === null) {
            return (
                <View onDataModified={ this.onDataModified }>
                    { this.renderLoader() }
                </View>
            );
        }

        return (
            <View onDataModified={ this.onDataModified }>
                <Link to='/gliders'>Back to Gliders</Link>
                <form onSubmit={ this.handleSubmit }>
                    <TextInput
                        inputValue={ this.state.glider.name }
                        labelText={ <span>Name<sup>*</sup>:</span> }
                        errorMessage={ this.state.errors.name }
                        onChange={ this.handleInputChange.bind(this, 'name') }
                        />

                    <div>Glider usage before Koifly:</div>

                    <TextInput
                        inputValue={ this.state.glider.initialFlightNum }
                        labelText='Number of Flights:'
                        errorMessage={ this.state.errors.initialFlightNum }
                        onChange={ this.handleInputChange.bind(this, 'initialFlightNum') }
                        />

                    <TimeInput
                        hours={ this.state.glider.hours }
                        minutes={ this.state.glider.minutes }
                        labelText='Airtime:'
                        errorMessageHours={ this.state.errors.hours }
                        errorMessageMinutes={ this.state.errors.minutes }
                        onChange={ this.handleInputChange }
                        />

                    <RemarksInput
                        inputValue={ this.state.glider.remarks }
                        labelText='Remarks'
                        onChange={ this.handleInputChange.bind(this, 'remarks') }
                        />

                    <div className='button__menu'>
                        <Button type='submit'>Save</Button>
                        { this.renderDeleteButton() }
                        <Link to='/gliders'><Button>Cancel</Button></Link>
                    </div>
                </form>
            </View>
        );
    }
});


module.exports = GliderEditView;
