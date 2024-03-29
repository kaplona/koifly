import React from 'react';
import { bool } from 'prop-types';
import FeatureColumn from './feature-column.jsx';
import HomeBlock from './home-block.jsx';
import ScreenShort from './screen-shot.jsx';
import Separator from './separator.jsx';
import SignupButton from './signup-button.jsx';


if (process.env.BROWSER) {
  require('./home.less');
}


export default class Home extends React.Component {
  render() {
    return (
      <div className='home'>
        <div className='home-pic'>
          <div className='header float-group'>
            <div className='logo left-float'>
              Koifly
            </div>
            <a
              href={this.props.isLoggedIn ? '/flights' : '/login'}
              className='app-enter right-float'
            >
              {this.props.isLoggedIn ? 'Go to App' : 'Log in'}
            </a>
            {!this.props.isLoggedIn && (
              <a href='/signup' className='app-enter right-float'>Sign up</a>
            )}
          </div>
          <div className='home-pic-text'>
            <div>Flight logging app for freeflight pilots</div>
            <div>Easy to use. Mobile friendly. Free.</div>
          </div>
        </div>

        <div className='home-pic-bottom'>
          <SignupButton/>
        </div>

        <h1 className='main-header'>What is Koifly?</h1>
        <div className='about-koifly'>
          <p>
            Koifly is a free, <a className='home-page-link' href='https://github.com/kaplona/koifly'>open-source</a>, online flight logbook for
            freeflight pilots. If you are a hang glider or paraglider pilot – this app is for you!
          </p>
          <p>
            No more paper or spreadsheets which are inefficient and limit your ability to analyze your flights. Keeping
            your flight log with us means you can access it whenever and wherever you need it either from your computer
            or smartphone.
          </p>
          <p>
            We dedicated ourselves to making easy to use and on the go application. Sign up now, it’s free and always
            will be!
          </p>
        </div>

        <HomeBlock>
          <h1>Features</h1>
          <FeatureColumn>
            <h2>Log your flights (Duh :)</h2>
            <ul>
              <li>Your flights are securely stored online, access them whenever and wherever you want</li>
              <li>
                Upload IGC flight tracks and see it on the map. Who doesn't want to store GPS tracks along with
                the other flight information?
              </li>
              <li>
                Be aware of your progress: check how often and where you fly, and whether you have enough flights and
                airtime for the next pilot rating
              </li>
            </ul>
          </FeatureColumn>

          <FeatureColumn>
            <ScreenShort type='flights'/>
          </FeatureColumn>
        </HomeBlock>

        <HomeBlock>
          <FeatureColumn float='right'>
            <h2>Map your flying spots</h2>
            <ul>
              <li>Store and organize your sites information in one place, switch to map view for more convenience</li>
              <li>
                Track how familiar you are with the spot: check how often you fly at the site and what is the best
                time of the year to fly there
              </li>
              <li>
                Save places where you want to go: record local contacts, safety hazards, local thermalling tips, etc.
              </li>
            </ul>
          </FeatureColumn>

          <FeatureColumn float='right'>
            <ScreenShort type='sites'/>
          </FeatureColumn>
        </HomeBlock>

        <HomeBlock>
          <FeatureColumn>
            <h2>Analyze your flights</h2>
            <ul>
              <li>
                See individual flight statistics: how high you were during a flight, your climb rate, how far from
                the launch, what glide ratio to the landing zone.
              </li>
              <li>
                Get more insights from your data: your highest/longest flight for the season, what site you fly
                more often, which weather condition induce to longer flights, just to name a few.
              </li>
            </ul>
          </FeatureColumn>

          <FeatureColumn>
            <ScreenShort type='stats'/>
          </FeatureColumn>
        </HomeBlock>

        <HomeBlock>
          <FeatureColumn float='right'>
            <h2>Save your gliders info</h2>
            <ul>
              <li>
                Be aware of your bird's condition: check how many flights you have on the glider and whether it needs
                new wires or other maintenance
              </li>
              <li>
                Manage your gear smartly: write a comment with glider serial number, dealer contact information, link
                to an article how to perform a minor repair, etc.
              </li>
            </ul>
          </FeatureColumn>

          <FeatureColumn float='right'>
            <ScreenShort type='gliders'/>
          </FeatureColumn>
        </HomeBlock>

        <HomeBlock>
          <FeatureColumn>
            <h2>Mobile friendly</h2>
            <ul>
              <li>Works on any device, just go to <a className='home-page-link' href='/flights'>koifly.com/flights</a></li>
              <li>Get fully functional application on your smartphone with intuitive navigation controls</li>
            </ul>
          </FeatureColumn>

          <FeatureColumn>
            <div className='mobile-friendly-pic'/>
          </FeatureColumn>
        </HomeBlock>

        <SignupButton/>

        <Separator/>

        <HomeBlock noMargin={true}>
          <h1>Coming soon</h1>
          <FeatureColumn>
            <ul>
              <li>
                <div className='coming-title'>Tagging and advanced search</div>
                Tag your flights: was it winch tow or a foot launch, powered or unpowered flight. Filter through
                your flights, see if you have enough flights of various kinds for that instructor rating.
              </li>
              <li>
                <div className='coming-title'>More fields for each data type</div>
                Wind strength and direction, landing zone coordinates and more.
              </li>
              <li>
                <div className='coming-title'>Glider inspection periods</div>
                Track your glider inspections and get a reminder, when it is time again to get your gear tested again.
              </li>
              <li>
                <div className='coming-title'>Offline app</div>
                Our passion for flying can bring us to some remote places with no Internet connection, we plan to solve
                this problem too.
              </li>
            </ul>
          </FeatureColumn>

          <FeatureColumn>
            <div className='blue-box'>
              <h3>Your feedback is welcome!</h3>
              <p>
                Koifly will constantly be improved and stuffed with more features. New functionality will be added in
                order of more value to users.
              </p>
              <p>If you have any suggestions or ideas I would like to hear from you.</p>
              <p>Feel free to contact me: nkaplina@gmail.com</p>
            </div>
          </FeatureColumn>
        </HomeBlock>

        <div className='back-to-the-top'/>

        <div className='about-me'>
          <FeatureColumn>
            <div className='about-me-text'>
              <h2>About me</h2>
              <p>My husband and I are hang gliding pilots in beautiful British Columbia, Canada.</p>
              <p>
                Hang gliding and paragliding is a spirit freeing sport, for most of us it’s a lifestyle. But it comes
                with its own perils. For me, safety is a key factor for enjoyable flights. I use a flight log to refresh
                my knowledge in the beginning of the season, make some notes, plan flying trips, gather information
                about new sites, etc.
              </p>
              <p>
                As a web developer and a pilot, I decided to combine my two passions and create an online application
                to make our flying experience even more pleasurable. I hope you will enjoy using Koifly as much as we
                do!
              </p>
            </div>
          </FeatureColumn>

          <FeatureColumn>
            <div className='my-pic'/>
          </FeatureColumn>
        </div>

        <div className='footer'>
          <div className='copyright'>
            {'\u00A9'}
            2015-{new Date().getFullYear()} Anastasia Kaplina
          </div>
          <div className='icons-credits'>
            icons by Hand Drawn Goods, <a href='https://www.flaticon.com/authors/monkik' title='monkik'>monkik</a> and <a href='https://www.flaticon.com/authors/freepik' title='freepik'>freepik</a>
            <br/>
            from <a href='http://www.flaticon.com' title='Flaticon'>www.flaticon.com</a> is licensed by <a href='http://creativecommons.org/licenses/by/3.0/' title='Creative Commons BY 3.0'> CC BY 3.0 </a>
            <br/>
            background pattern from <a href='https://www.toptal.com/designers/subtlepatterns/' title='Toptal Subtle Patterns'> Toptal Subtle Patterns </a>
          </div>
        </div>
      </div>
    );
  }
}


Home.propTypes = {
  isLoggedIn: bool.isRequired
};
