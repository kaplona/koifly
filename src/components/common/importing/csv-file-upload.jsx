'use strict';

const React = require('react');
const { arrayOf, bool, element, func, number, oneOfType, shape, string } = React.PropTypes;
const koiflyErrorPropType = require('../../../errors/error-prop-type');

const Button = require('../buttons/button');
const Description = require('../section/description');
const DesktopBottomGrid = require('../grids/desktop-bottom-grid');
const ImportError = require('./import-error');
const Notice = require('../notice/notice');
const SectionRow = require('../section/section-row');

function CsvFileUpload(props) {
    const ImportButton = (
        <Button
            caption={ props.isImporting ? 'Importing...' : 'Import' }
            buttonStyle='primary'
            onClick={ props.onImport }
            isEnabled={ props.canImport && !props.isImporting }
            />
    );

    const CancelButton = (
        <Button
            caption='Cancel'
            buttonStyle='secondary'
            onClick={ props.onCancel }
            />
    );

    return (
        <div>
            <SectionRow>
                <input
                    type='file'
                    accept='.csv'
                    onChange={ props.onChange }
                    />

                {props.successMessage && (<Notice type='success' text={props.successMessage} />)}
                {props.importError && (<ImportError error={props.importError} />)}
            </SectionRow>

            <SectionRow isLast={ true }>
                <Description>
                    File should be .csv format. Table column names (header) should contain next fields: ... Then some info how to get one of this file and other content requirements.
                </Description>
            </SectionRow>

            <DesktopBottomGrid leftElements={ [ImportButton, CancelButton] } />
        </div>
    );
}

CsvFileUpload.defaultProps = {
    canImport: true,
    isImporting: false
};

CsvFileUpload.propTypes = {
    canImport: bool,
    isImporting: bool,
    importError: oneOfType([
        shape(koiflyErrorPropType),
        arrayOf(shape({
            row: number,
            error: shape(koiflyErrorPropType)
        }))
    ]),
    successMessage: oneOfType([ string, element ]),
    onCancel: func.isRequired,
    onChange: func.isRequired,
    onImport: func.isRequired
};


module.exports = CsvFileUpload;
