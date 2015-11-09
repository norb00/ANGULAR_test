/*
 * @author Artem Demo
 * @git https://github.com/artemdemo/angular-popup
 */

/**
 * @namespace Directives
 */

(function(){

    var module = angular.module( 'artemdemo.popup', []);

    /**
     * Popup module for angular applications
     *
     * This module has some cool UX functionality:
     * - it will set focus on OK in simple alert popup
     * - it will focus on input if you have one in the popup (will work in confirmation popup only)
     *
     * @class $popup
     * @param $rootScope
     * @param $compile
     * @param $q
     * @param $timeout
     * @param $sce
     */
    var $popup = function( $rootScope, $compile, $q, $timeout, $sce ){
        /**
         * Popup factory object
         *
         * @private
         * @type {Object}
         */
        var $popup = {};

        /**
         * Scope that will contain scope of the created popup
         *
         * @memberof $popup
         * @private
         * @type {Object}
         */
        var popupScope;

        /**
         * Popup DOM object
         *
         * @memberof $popup
         * @private
         * @type {Object}
         */
        var popupEl;

        /**
         * I don't want to show popups one above another,
         * therefore I need to check if there is one open
         *
         * Can be 'closed' OR 'open'
         *
         * @memberof $popup
         * @private
         * @type {string}
         */
        var popupStatus = 'closed';

        /**
         * If there are timeouts one after another i need to know that next timeout should be cancelled
         *
         * @memberof $popup
         * @private
         * @type {number}
         */
        var animTimeoutID;

        /**
         * This object will contain promise.
         * It should be global because I want to use it also when user click on ESC button and in this case it should be global
         *
         * @memberof $popup
         * @private
         * @type {promise}
         */
        var deferred = null;

        /**
         * Templates for popups
         *
         * @memberof $popup
         * @type {Object}
         * @private
         */
        var templates = {};

        /**
         * Template for backdrop
         *
         * @memberof $popup
         * @type {string}
         */
        templates.backdrop = [
            '<div class="popup-backdrop fadeIn"></div>'
        ].join('');

        /**
         * General template with main popup construction
         *
         * @memberof $popup
         * @type {string}
         * @example
         * &lt;popup&gt;
         * &lt;form&gt;
         * &lt;div class=&quot;popup-container&quot; ng-class=&quot;CUSTOM_CLASS&quot;&gt;
         * &lt;div class=&quot;popup zoomIn&quot;&gt;
         * &lt;div class=&quot;popup-head&quot;&gt;
         * &lt;h3 class=&quot;popup-title ng-binding&quot; ng-bind-html=&quot;TITLE&quot;&gt;&lt;/h3&gt;
         * &lt;/div&gt;
         * &lt;div class=&quot;popup-body&quot;&gt;
         * BODY_TXT
         * &lt;/div&gt;
         * &lt;div class=&quot;popup-buttons&quot;&gt;&lt;/div&gt;
         * &lt;/div&gt;
         * &lt;/div&gt;
         * &lt;/form&gt;
         * &lt;/popup&gt;
         */
        templates.popup = [
            '<popup>',
            '<form>',
            '<div class="popup-container" ng-class="POPUP_TYPE">',
            '<div class="popup zoomIn">',
            '<div class="popup-head">',
            '<h3 class="popup-title ng-binding" ng-bind-html="TITLE"></h3>',
            '</div>',
            '<div class="popup-body">',
            'BODY_TXT',
            '</div>',
            '<div class="popup-buttons"></div>',
            '</div>',
            '</div>',
            '</form>',
            '</popup>'
        ].join('');

        /**
         * Template object for buttons
         *
         * @memberof $popup
         * @type {Object}
         */
        templates.buttons = {};

        /**
         * Buttons for confirmation popup
         *
         * @memberof Services.artPopup
         * @private
         * @example
         * &lt;button
         *      ng-click=&quot;okAction($event)&quot;
         *      class=&quot;button ng-binding app-bg-color no-border&quot;
         *      ng-class=&quot;okType || \\'button-default\\'&quot;&gt;{{ OK_TXT }}&lt;/button&gt;
         * &lt;div
         *      ng-click=&quot;cancelAction($event)&quot;
         *      class=&quot;button ng-binding btn-dark-bg no-border&quot;
         *      ng-class=&quot;cancelType || \\'button-default\\'&quot;&gt;{{ CANCEL_TXT }}&lt;/div&gt;
         * @type {String}
         */
        templates.buttons.confirm = [
            '<button ng-click="cancelAction($event)" class="btn btn-default cancel_button">{{ CANCEL_TXT }}</button>',
            '<button ng-click="okAction($event)" class="btn btn-primary">{{ OK_TXT }}</button>'
        ].join('');

        /**
         * Buttons for simple alert popup
         *
         * @memberof $popup
         * @type {String}
         */
        templates.buttons.show = [
            '<button ng-click="okAction($event)" class="btn btn-ok" ng-class="okType || \'btn-block btn-primary\'">{{ OK_TXT }}</button>'
        ].join('');

        /**
         * Show simple popup
         *
         * @function show
         * @memberof $popup
         * @public
         * @param {Object} params - parameters of new popup
         * @example
         *  {
            title: 'Alert',
            template: 'Alert body text',
            scope: {scope},
            popupClass: 'Additional class for the popup',
            okText: 'OK button text',
            okType: 'OK button additional classes'
         *  }
         *
         *  @return {promise}
         */
        $popup.show = function( params ) {
            var element,
                scope = params.hasOwnProperty('scope') ? params.scope : undefined,
                BODY_TXT = params.hasOwnProperty('template') ? params.template : '',
                deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('show', BODY_TXT, scope);

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';
            popupScope.okType = params.hasOwnProperty('okType') ? params.okType : '';
            popupScope.CUSTOM_CLASS += params.hasOwnProperty('popupClass') ? ' ' + params.popupClass : '';

            document.getElementsByTagName('body')[0].classList.add('popup-open');

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            // Setting focus to button in order to let user to close popup in one click
            popupEl.find('button')[0].focus();

            popupScope.okAction = function() {
                deferred.resolve();
                document.getElementsByTagName('body')[0].classList.remove('popup-open');
                $popup.hide();
            };

            return deferred.promise;
        };


        /**
         * Show dialog popup in the view.
         * Will create new element, new scope and link it to the DOM
         *
         * @function confirm
         * @memberof $popup
         * @public
         * @param {Object} params - parameters of new popup
         * @example
         *  {
            title: 'Alert',
            template: 'Alert body text',
            scope: {scope},
            cancelText: 'Cancel button text',
            cancelType: 'Cancel button additional classes',
            okText: 'OK button text',
            okType: 'OK button additional classes',
            okTap: function()
         *  }
         * @return {promise} - Promise will return result of given onTap function
         */
        $popup.confirm = function( params ) {
            var element,
                inputs,
                BODY_TXT = params.hasOwnProperty('template') ? params.template : '',
                scope = params.hasOwnProperty('scope') ? params.scope : undefined;

            deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('confirm', BODY_TXT, scope);

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.CANCEL_TXT = params.hasOwnProperty('cancelText') ? params.cancelText : 'Cancel';
            popupScope.cancelType = params.hasOwnProperty('cancelType') ? params.cancelType : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';
            popupScope.okType = params.hasOwnProperty('okType') ? params.okType : '';
            popupScope.CUSTOM_CLASS += params.hasOwnProperty('popupClass') ? ' ' + params.popupClass : '';

            document.getElementsByTagName('body')[0].classList.add('popup-open');

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            popupScope.cancelAction = function() {
                deferred.reject();
                document.getElementsByTagName('body')[0].classList.remove('popup-open');
                $popup.hide();
            };

            $timeout(function(){
                inputs = popupEl.find('input');
                if ( inputs.length > 0 ) inputs[0].focus();
                else popupEl.find('button')[0].focus();
            });

            /**
             * Result of 'okTap' function can prevent popup from closing.
             * If result is FALSE - popup wouldn't close
             * (obviously user can close it by clicking on 'cancel' or using ESC button)
             *
             * @param {Object} event - mouse event that will be send to the custom function
             *
             * @return {promise}
             */
            popupScope.okAction = function(event) {
                var result = false;
                if ( params.hasOwnProperty('okTap') && angular.isFunction( params.okTap ) ) {
                    result = params.okTap.call(popupScope, event);
                } else {
                    // If there are no 'okTap' function we can close popup
                    result = true;
                }
                document.getElementsByTagName('body')[0].classList.remove('popup-open');
                deferred.resolve( result );
                if ( !! result ) $popup.hide();
            };

            return deferred.promise;
        };



        /**
         * Hide popup.
         * Will destroy scope of the element and remove tags from the DOM
         *
         * @memberof $popup
         * @function hide
         * @param immediately {boolean}
         * @public
         */
        $popup.hide = function( immediately ) {
            var $popupContainer = angular.element( popupEl[0].getElementsByClassName('popup')[0]),
                $popupBackdrop = angular.element( popupEl[0].getElementsByClassName('popup-backdrop')[0] );

            popupScope.$destroy();
            popupStatus = 'closed';

            if ( !! immediately ) {
                popupEl.remove();
                clearTimeout(animTimeoutID);
            } else {
                $popupContainer.removeClass('zoomIn');
                $popupContainer.addClass('zoomOut');
                $popupBackdrop.removeClass('fadeIn');
                $popupBackdrop.addClass('fadeOut');
                animTimeoutID = setTimeout(function(){
                    popupEl.remove();
                }, 200);
            }

            angular.element(document.getElementsByTagName('body')[0]).unbind('keyup');
            angular.element(document.getElementsByTagName('body')[0]).removeClass('popup-open');
        };

        /**
         * Function is compiling element into the DOM
         *
         * @function compilePopup
         * @memberof $popup
         * @private
         * @param {String} tmpl - template name
         * @param {String} BODY_TXT
         * @param {Object} scope - scope of the popup if not defined I will use rootScope
         * @return {Object} - DOM element of popup
         */
        var compilePopup = function( tmpl, BODY_TXT, scope ) {
            var linkFn,
                element,
                popupTmpl,
                backdrop,
                buttons;

            if ( !! popupEl ) $popup.hide( true );

            popupTmpl = templates.popup.replace('BODY_TXT', BODY_TXT);

            popupEl = angular.element( popupTmpl );
            backdrop = angular.element( templates.backdrop );
            buttons = angular.element( templates.buttons[tmpl] );

            popupEl.append( backdrop );
            for ( var i=0; i<buttons.length; i++ ) {
                popupEl[0].getElementsByClassName('popup-buttons')[0].appendChild(buttons[i]);
            }

            linkFn = $compile(popupEl);
            popupScope = angular.isDefined(scope) ? scope.$new() : $rootScope.$new();
            element = linkFn(popupScope);

            popupScope.CUSTOM_CLASS = 'popup-type-' + tmpl;

            // Bind keypress functionality
            angular.element(document.getElementsByTagName('body')[0])
                .bind('keyup', function(e){

                    // if ESC - close popup
                    if (e.keyCode == 27 ) {
                        deferred.reject();
                        $popup.hide();
                    }
                });

            return element;
        };

        return $popup;
    };

    module.factory('$popup',[ '$rootScope', '$compile', '$q', '$timeout', '$sce', $popup ]);

})();