'use strict';

const React = require('react');
const ErrorTypes = require('../../errors/error-types');
const igcService = require('../../services/igc-service');
const KoiflyError = require('../../errors/error');

const ErrorBox = require('../common/notice/error-box');

const FightTrackUpload = React.createClass({

    getInitialState: function() {
        return {
            dataUri: null,
            error: null,
            successSummary: null
        };
    },

    handleFile: function(event) {
        const file = event.target.files[0];

        this.setState({
            dataUri: null,
            error: null,
            successSummary: null
        });

        if (!file) {
            return;
        }

        const validationError = this.validateFile(file);
        if (validationError) {
            this.setState({ error: validationError });
            return;
        }

        const reader = new FileReader();
        reader.onload = upload => {
            console.log('loaded');
            const parsedFile = igcService.parseIgc(upload.target.result);
            console.log(parsedFile);

            if (parsedFile instanceof Error) {
                this.setState({ error: parsedFile });
            }
        };
        reader.onerror = error => {
            this.setState({ error });
        };

        reader.readAsText(file);
    },

    validateFile(file) {
        const lowerCaseName = file.name.toLowerCase();

        let errors = [];
        if (!lowerCaseName.includes('.igc')) {
            errors.push('File must be .igc format.');
        }
        if (file.size > 1048576) {
            errors.push('File must be less than 1MB');
        }

        return errors.length ? new KoiflyError(ErrorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
    },

    render: function() {
        return (
            <div>
                <input type='file' accept='.igc' onChange={ this.handleFile } />

                {this.state.error && <ErrorBox error={ this.state.error } />}
            </div>
        );
    }
});


module.exports = FightTrackUpload;
