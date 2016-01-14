'use strict';

var React = require('react');
var TopMenu = require('./common/menu/top-menu');
var BottomMenu = require('./common/menu/bottom-menu');
var Loader = require('./common/loader');
var Notice = require('./common/notice/notice');


var Home = React.createClass({

    render: function() {
        return (
            <div>
                <TopMenu headerText='Koifly'/>
                <Notice
                    text='Just notice'
                    onClick={ () => console.log('click') }
                    buttonText='Try Again'
                    onClose={ () => console.log('close') }
                    />
                <div>Hellow World</div>
                <Loader />
                <BottomMenu />
            </div>
        );
    }
});


module.exports = Home;
