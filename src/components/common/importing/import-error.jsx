'use strict';

const React = require('react');
const { arrayOf, number, shape, string } = React.PropTypes;

const Notice = require('../notice/notice');
const SectionRow = require('../section/section-row');
const SectionTitle = require('../section/section-title');


function ImportError(props) {
    if (!props.errors || props.errors.length === 0) {
        return null;
    }

    // TODO error row is incorrect (I didn't get what it refers to)
    let errorNodes = props.errors.map((error, index) => {
        return <p key={ `error-row-${index}` }>{ `${error.row}: ${error.message}` }</p>;
    });
    let noticeText = <div>{ errorNodes }</div>;

    return (
        <div>
            <SectionTitle isSubtitle={ true }>
                Rows in the file that couldn't be processed and thus won't be imported:
            </SectionTitle>

            <SectionRow>
                <Notice
                    text={ noticeText }
                    type='error'
                    />
            </SectionRow>
        </div>
    );
}

ImportError.propTypes = {
    errors: arrayOf(shape({
        row: number,
        message: string
    })).isRequired
};


module.exports = ImportError;
