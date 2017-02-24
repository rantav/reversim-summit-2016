//     Grylls.js
//     http://github.com/eventbrite/grylls
//     TL;DR: An Eventbrite specific adapter for analytics.js.

/**
 * @title Grylls.js
 * @overview TL;DR: An Eventbrite specific adapter for analytics.js.
 * @author Alby Barber
*/

define(function(require) {
    'use strict';

    var _ = require('underscore'),
        $ = require('jquery'),
        logger = require('logger'),

        gryllsDoneDfd = new $.Deferred(),

        Grylls,
        instance;

    Grylls = function(){

        // Pixel Loading
        // --------------
        // Load in `tracking data` and `enviromental` options
        // so that we can feed them into the analytics.js library.

        /**
         * Loads Tracking data and enviroment options into grylls
         *
         * Calling this will initialize intergration tracking data
         * and enviromental settings
         *
         * @param  {object} trackingData name of tracking intergration settings
         * @param  {object} options name of enviromental options
         */
        this.load = function(trackingData, options){
            var defaultOptions = {
                'debugging':false,
                'enabled': false,
                'identify': false,
                'identifyData': {}
            };

            // Extend default options with options passed in
            this.options = _.extend(defaultOptions, options);

            // if there is no tracking data passed or the feature is
            // disabled then return
            if (_.isEmpty(trackingData) || !this.options.enabled){
                return;
            }
            // Format our raw tracking data for `analytics.js`
            this.trackingData = this.format(trackingData);

            // Load `analytics.js` library and bind function to `this`
            require(['analyticsjs'], _.bind(function(analyticsjs) {
                this.analyticsjs = analyticsjs;

                // Set up any debugging requested via `options`
                this.debug();
                // Direct call to `analytics.js` initializing our tracking data
                this.analyticsjs.initialize(this.trackingData);

                // Resolve deferrs in the order they were called
                gryllsDoneDfd.resolve();
            }, this));

            if (this.options.identify){
                // If specifed via `options` identify the user
                this.identify(this.options.identifyData);
            }
        }

        // Proxy
        // ------
        // Proxy function that is used as a Façade for `analytics.js` calls
        // Allows you to queue functions using $.Deferred()
        // Caling via this proxy function allows grylls funcions
        // to be executed in the correct order at even when they
        // are called at any point.
        this.proxy = function(func){
            var args = Array.prototype.slice.call(arguments, 1);

            // Set up deferr so that the functions are called
            // after `anaytics.js` is loaded and ready
            gryllsDoneDfd.done(_.bind(function(){
                // Direct call to `analytics.js` function that was proxied
                this.analyticsjs[func].apply(null, args);
                // Log that the event has been called
                this.logInfo('Grylls event: ', func, args);
            }, this));
        }

        // Debug
        // ------
        // Log to JS console if `option` is enabled
        this.debug = function(){
            if (this.options.debugging){
                // Eventbrite logging
                console.group('::TRACKING_PIXEL_DEBUG::');
                    console.log('TrackingData:', this.trackingData);
                    console.log('Options:', this.options);
                console.groupEnd('::TRACKING_PIXEL_DEBUG::');

                // `anaytics.js` logging
                this.analyticsjs.debug();
            }
        }

        // Log info
        // ---------
        // Log to JS console Grylls events if `option` is enabled
        this.logInfo = function(msg, func, args) {
            var message = msg + func;

            if (!this.options.debugging){
                return;
            }

            if (args.length){
                message = message + ' - ' + args;
            }

            logger.appendDetails('trackingPixelArguments', args);
            logger.info(message);
        }

    // Proxied fucntions
    // ------------------
    // Proxied and abstracted analytics.js functions
    // called via grylls API

        /**
         * Identify user
         *
         * The `identify` call is how you tie one of your users
         * and their actions to a recognizable userId and traits.
         *
         * @param  {object} properties used to idenify the user
         */
        this.identify = function(props){
            this.proxy('identify', this.options.uuid, props);
        }

        /**
         * Page track
         *
         * The `page` call lets you record whenever a user sees
         * a page of your website, along with any properties about
         * the page.
         *
         * @param  {string} name of page
         */
        this.page = function(pageName){
            this.proxy('page', pageName);
        }

        /**
         * Track event
         *
         * The `track` call records any actions your users perform,
         * along with any properties that describe the action.
         *
         * @param  {string} name of event you are tracking
         * @param  {object} properties that describe the action
         */
        this.track = function(page, options){
            this.proxy('track', page, options);
        }

    // Helpers
    // --------
    // Helpers used to format tracking data objects

        // Renames an objects key (old to new)
        this.renameKey = function(obj, oldKey, newKey){
            if (oldKey == newKey){
                return obj;
            }
            obj[newKey] = obj[oldKey];
            delete obj[oldKey];

            return obj;
        }

        // Renames a set of attribites in an arry of objects
        // Object passed in can be undefined but if it is it will return safely
        this.renameKeyInObjectArry = function(obj, oldKey, newKey){
            if (_.isUndefined(obj)){
                return;
            }

            _.each(obj, function(obj){
                this.renameKey(obj, oldKey, newKey);
            }, this)

            return obj;
        }

        // Deletes an empty object node if it is empty
        this.cleanEmptyAttr = function(data, attr){
            _.each(data, function(value) {
                if (_.isEmpty(value[attr])){
                    delete value[attr];
                }
            });
            return data;
        }

        // Formats object to ensure that analytics.js can consume it.
        this.format = function(obj){
            this.renameKeyInObjectArry(obj['Google Analytics'], 'pixelId', 'trackingId');
            this.renameKeyInObjectArry(obj['AdWords'], 'pixelId', 'conversionId');
            this.renameKeyInObjectArry(obj['Twitter Ads'], 'pixelId', 'page');

            return this.cleanEmptyAttr(obj, 'events');
        }

    };

    instance = new Grylls();

    // Added for testing but should not be accessed this way
    window.grylls = instance;
    window.grylls._Grylls = Grylls;

    return instance;
});
