import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchReversimTweets } from 'actions/tweets';

import classNames from 'classnames/bind';
import styles from 'css/main';
import reversimLogoFooter from 'images/reversim_logo_footer.png';

const cx = classNames.bind(styles);

class Footer extends Component {

    static need = [  // eslint-disable-line
        fetchReversimTweets
    ];

    constructor(props) {
        super(props);
    }

    componentWillMount() {
      const { dispatch } = this.props;
      dispatch(fetchReversimTweets());
    }

    render() {
      const { reversimTweets } = this.props

      const tweetElements = reversimTweets && reversimTweets.map((tweet, i) => {
        let tweetText = tweet.text;

        // mentions
        tweet.mentions.forEach(mention => {
          tweetText = tweetText.replace(`@${mention}`, `<a href="http://twitter.com/${mention}">@${mention}</a>`)
        });

        // hashtags
        tweet.hashtags.forEach(hashtag => {
          tweetText = tweetText.replace(`#${hashtag}`, `<a href="https://twitter.com/search?q=%22${hashtag}%22">#${hashtag}</a>`)
        });

        // urls
        tweet.urls.forEach(url => {
          tweetText = tweetText.replace(url.url, `<a href="${url.url}">${url.display}</a>`)
        });

        return (
          <li className={cx("tweet")} key={i}>
            <p className={cx('text-alt', 'tweet-text')} dangerouslySetInnerHTML={ { __html: tweetText } }></p>
            <small className={cx("tweet-date")}>{new Date(tweet.created_at).toLocaleDateString('en-US', { day: "numeric", month: "short", year: "numeric"})}</small>
          </li>
        );
      });

      return (
        <section className={cx("footer")}>
          <div className={cx("container")}>

            <div className={cx("col-md-4")}>
              <div className={cx('widget', 'about-widget')}>
                <h6 className={cx("widget-head")}>About <span className={cx("highlight")}>Reversim</span></h6>
              <p className={cx("text-alt")}><small><a href="http://reversim.com/">Reversim</a> (רברס עם פלטפורמה) is a Hebrew podcast by <a href="https://twitter.com/orilahav">Ori Lahav</a> and <a href="http://tavory.com/">Ran Tavory</a> which brings together software developers and product, with over 300 recorded episodes and a few thousands listners.</small></p>
                <p className={cx("text-alt")}><small>The summit is our intention to create a conference for developers by developers. Like in the podcast, we bring you the content we are interested in, and we hope you will be too.</small></p>
              <img src={reversimLogoFooter} alt="autograph" />
              </div>
            </div>

            <div className={cx('col-md-4', 'col-lg-3', 'col-lg-offset-1')}>
              <div className={cx('widget', 'twitter-widget')}>
                <h6 className={cx("widget-head")}><span className={cx('fa', 'fa-twitter')}></span> Twitter Feed</h6>

                <ul className={cx("tweets-list")}>
                  {tweetElements}
                </ul>
              </div>
            </div>
          </div>

          <div className={cx("footer-base")}>
            <div className={cx("container")}>

              <div className={cx("col-md-6")}>
                <ul className={cx("footer-nav")}>
                  <li className={cx("footer-nav-item")}><a href="mailto:adam@matan.name">Contact</a></li>
                  <li className={cx("footer-nav-item")}><a href="http://confcodeofconduct.com/">Code of Conduct</a></li>
                </ul>
              </div>

              <div className={cx('col-md-6', 'align-right')}>
                <ul className={cx('socials-nav', 'align-right')}>
                  <li className={cx("socials-nav-item")}><a href="https://twitter.com/reversim"><span className={cx('fa', 'fa-twitter')}></span></a></li>
                <li className={cx("socials-nav-item")}><a href="https://www.facebook.com/groups/806177629478248/"><span className={cx('fa', 'fa-facebook')}></span></a></li>
                </ul>

                <p className={cx("text-alt")}><small>All Rights Reserved © 2016</small></p>
              </div>

            </div>
          </div>
        </section>
      );
  }
}

Footer.propTypes = {
  dispatch: PropTypes.func
};

function mapStateToProps(state) {
    return {
      reversimTweets: state.tweets.reversim
    };
}

// Read more about where to place `connect` here:
// https://github.com/rackt/react-redux/issues/75#issuecomment-135436563
export default connect(mapStateToProps)(Footer);
