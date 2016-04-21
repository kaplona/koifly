'use strict';

var React = require('react');
var SignupButton = require('./signup-button.jsx');
var Separator = require('./separator.jsx');
var FeatureColumn = require('./feature-column.jsx');
var ScreenShort = require('./screen-shot.jsx');
var HomeBlock = require('./home-block.jsx');

if (process.env.BROWSER) {
    require('./home.less');
}


var Home = React.createClass({

    propTypes: {
        isLoggedIn: React.PropTypes.bool.isRequired
    },

    render: function() {

        return (
            <div className='home'>
                <div className='home-pic' >
                    <div className='header float-group'>
                        <div className='logo left-float'>
                            Koifly
                        </div>
                        <a
                            href={ this.props.isLoggedIn ? '/flights' : '/login' }
                            className='app-enter right-float'
                            >
                            { this.props.isLoggedIn ? 'Go to App' : 'Log in' }
                        </a>
                        <a href='/signup' className='app-enter right-float'>Sign up</a>
                    </div>
                    <div className='home-pic-text'>
                        <div>Flight logging app for freeflight pilots</div>
                        <div>Easy to use. Mobile friendly. Free</div>
                    </div>
                </div>

                <div className='home-pic-bottom'>
                    <SignupButton />
                </div>

                <h1>What is Koifly?</h1>
                <div className='about-koifly'>
                    <p>Koifly - is an online flight logging book for freeflight pilots. If you are a hang glider or paraglider pilot this app is for you!</p>
                    <p>No more paper or spread sheets which are inefficient and limit your ability to analyze your flights. Keep your flight log with us means you can access it when and where you need it either from your computer or smartphone.</p>
                    <p>We dedicated ourselves to making easy to use and on the go application and will constantly add more features to it. Sign up now, it’s free and always will be!</p>
                </div>
                <SignupButton />

                <Separator />

                <HomeBlock>
                    <h1>Features</h1>
                    <FeatureColumn>
                        <h2>Log your flights (Duh :)</h2>
                        <ul>
                            <li>Your flights are securely stored online, access them whenever and where ever you want</li>
                            <li>Be aware of your progress: how often do you fly, do you have enough flights and airtime for the next pilot rating?</li>
                            <li>Creating a new record cannot be easier: new flight form is prefilled with your preferences, previous flight and site information</li>
                        </ul>
                    </FeatureColumn>

                    <FeatureColumn>
                        <ScreenShort type='flights' />
                    </FeatureColumn>
                </HomeBlock>

                <Separator />

                <HomeBlock>
                    <FeatureColumn float='right'>
                        <h2>Map your flying spots</h2>
                        <ul>
                            <li>Store and organize your sites information in one place, switch to map view for more convenience</li>
                            <li>Track how familiar you're with the spot - how often you fly there</li>
                            <li>Save places where you want to go</li>
                        </ul>
                    </FeatureColumn>

                    <FeatureColumn float='right'>
                        <ScreenShort type='sites' />
                    </FeatureColumn>
                </HomeBlock>

                <Separator />

                <HomeBlock>
                    <FeatureColumn>
                        <h2>Save your gliders' info</h2>
                        <ul>
                            <li>Make your glider inventory with Koifly</li>
                            <li>Be aware of your bird condition, how many flights you did, does it need its wires changed?</li>
                            <li>Manage your gear smart: write a comment with glider serial number, dealer contact information, link to an article how to perform a minor repair, ...</li>
                        </ul>
                    </FeatureColumn>

                    <FeatureColumn>
                        <ScreenShort type='gliders' />
                    </FeatureColumn>
                </HomeBlock>

                <Separator />

                <HomeBlock>
                    <FeatureColumn float='right'>
                        <h2>Mobile friendly</h2>
                        <ul>
                            <li>Koifly is on every screen!</li>
                            <li>Get fully functional application on your smartphone with intuitive navigation controls</li>
                        </ul>
                    </FeatureColumn>

                    <FeatureColumn float='right'>
                        <div className='mobile-friendly-pic' />
                    </FeatureColumn>
                </HomeBlock>

                <SignupButton />

                <Separator />

                <HomeBlock>
                    <h1>Coming soon</h1>
                    <FeatureColumn>
                        <ul>
                            <li>Data export/import (we want you to be able to upload your previous experience. We also understand that your data shouldn't be locked in the app)</li>
                            <li>GPS uploading (who doesn't want to store GPS tracks along with the other flight information?)</li>
                            <li>Statistics (your highest/longest flight for the season, what site you fly more often, which weather condition induce to longer flights? - just to name a few)</li>
                            <li>More fields for each data type (wind strength and direction, landing zone coordinates and more)</li>
                            <li>Off-line app (what if you don't have Internet connection for a long time? We will solve this problem too)</li>
                        </ul>
                    </FeatureColumn>

                    <FeatureColumn>
                        <div className='blue-box'>
                            <h3>Your feedback is welcome!</h3>
                            <p>Koifly will constantly be improved and stuffed with more features. New functionality will be added in order of more value to users.</p>
                            <p>What for do you use a log book? If you have any suggestions or ideas I would like to hear from you.</p>
                            <p>Feel free to contact me: nkaplina@gmail.com</p>
                        </div>
                    </FeatureColumn>
                </HomeBlock>

                <div className='back-to-the-top' />

                <div className='about-me'>
                    <FeatureColumn>
                        <div className='about-me-text'>
                            <h2>About me</h2>
                            <p>I and my husband are hang gliding pilots in British Columbia, Canada.</p>
                            <p>Hang gliding and paragliding is a spirit freeing sport, for most of us it’s a life style. But it comes with its own perils. For me, safety is a key factor for enjoyable flights. I use a flight log to refresh my knowledge in the beginning of the season, make some notes, plan flying trips, gather information about new sites , ...</p>
                            <p>As a web developer and a pilot, I decided to mix both my favourite things in life and create an on-line application to make our flying experience even more pleasurable. I hope you will enjoy using Koifly as we do!</p>
                        </div>
                    </FeatureColumn>

                    <FeatureColumn>
                        <div className='my-pic' />
                    </FeatureColumn>
                </div>

                <div className='footer'>
                    { '\u00A9' }
                    { new Date().getFullYear() } Anastasia Kaplina
                    <div className='icons-credits'>
                        icons by <a href='http://www.flaticon.com/authors/hand-drawn-goods' title='Hand Drawn Goods'> Hand Drawn Goods </a><br />
                        from <a href='http://www.flaticon.com' title='Flaticon'>www.flaticon.com</a> is licensed by <a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0'> CC BY 3.0 </a>
                    </div>
                </div>
            </div>
        );
    }
});


module.exports = Home;
