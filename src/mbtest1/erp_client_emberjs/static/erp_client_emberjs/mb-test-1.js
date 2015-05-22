/* jshint ignore:start */

/* jshint ignore:end */

define('mb-test-1/adapters/ajax', ['exports', 'ember', 'mb-test-1/config/environment', 'mb-test-1/adapters/base'], function (exports, Ember, ENV, BaseAdapter) {

    'use strict';

    var forEach = Ember['default'].EnumerableUtils.forEach;

    exports['default'] = BaseAdapter['default'].extend({
        host: (function () {
            return ENV['default'].APP.API_HOST;
        }).property(),

        namespace: (function () {
            return ENV['default'].APP.API_NAMESPACE;
        }).property(),

        _uri: function _uri(type, uri) {
            this._checkParams(type, uri);

            /*var host = this.getHostForType(type);
            if (uri && uri.indexOf(host) !== 0 && uri.indexOf('https') !== 0) {
                uri = host + uri;
            }*/
            return uri;
        },

        find: function find(type, id) {
            var uri;
            if (id && String(id).charAt(0) === "/") {
                uri = this.completeURL(this._uri(type, id.substr(1)));
            } else {
                uri = this.completeURL(this._uri(type, id));
                //uri = this.buildURL(type.typeKey, id, snapshot);
            }
            return this.ajax(uri, "GET");
        },

        findAll: function findAll(type, sinceToken) {
            var query;

            if (sinceToken) {
                query = { since: sinceToken };
            }

            return this.ajax(this.buildURL(type.typeKey), "GET", { data: query });
        },

        createRecord: function createRecord(type, uri, data, settings) {
            settings = settings || {};
            settings.data = data;
            if (uri && String(uri).charAt(0) === "/") {
                uri = uri.substr(1);
            }
            uri = this.completeURL(this._uri(type, uri));
            return this.ajax(uri, "POST", settings);
        },

        updateRecord: function updateRecord(type, uri, data, settings) {
            settings = settings || {};
            settings.data = data;
            if (uri && String(uri).charAt(0) === "/") {
                uri = uri.substr(1);
            }
            Ember['default'].Logger.debug("Adapter.updateRecord:", settings.data);
            uri = this.completeURL(this._uri(type, uri));
            return this.ajax(uri, "PUT", settings);
        },

        deleteRecord: function deleteRecord(type, uri, settings) {
            settings = settings || {};
            if (uri && String(uri).charAt(0) === "/") {
                uri = uri.substr(1);
            }
            uri = this.completeURL(this._uri(type, uri));
            return this.ajax(uri, "DELETE", settings);
        },

        /*get: function(type, uri, success, error) {
            var settings = {};
            settings.error = error;
            return this.ajax(this._uri(type, uri), 'GET', settings).then(function(json) {
                success(json);
            });
        },//*/

        //createRecord: function(store, type, uri, snapshot) {
        /*create: function(type, uri, data, success, error, settings) {
            settings = settings || {};
            settings.data = data;
            settings.error = error;
            this.ajax(this._uri(type, uri), 'POST', settings).then(function(json) {
                success(json);
            });
        },//*/

        //updateRecord: function(store, type, uri, snapshot) {
        /*update: function(type, uri, data, success, error, settings) {
            settings = settings || {};
            settings.data = data;
            settings.error = error;
            this.ajax(this._uri(type, uri), 'PUT', settings).then(function(json) {
                success(json);
            });
        },//*/

        //deleteRecord: function(store, type, uri, snapshot) {
        /*delete: function(type, uri, success, error, settings) {
            settings = settings || {};
            settings.error = error;
            this.ajax(this._uri(type, uri), 'DELETE', settings).then(function(json) {
                success(json);
            });
        },//*/

        /*ajax: function(url, type, settings) {
            settings = settings || {};
            settings.url = url;
            settings.type = type;
            settings.context = this;
             var alreadyHasAuth = settings.headers && settings.headers['Authorization'];
             // HACK this goes away when we have oAuth
            if (!alreadyHasAuth && url && url.indexOf(ENV.BALANCED.AUTH) === -1) {
                if (Auth.get('signedIn')) {
                    var marketplaceId = BalancedApp.currentMarketplace ? BalancedApp.currentMarketplace.get('id') : null;
                     var matches = MARKETPLACE_URI_REGEX.exec(url);
                    if (matches) {
                        marketplaceId = matches[1];
                    }
                     var userMarketplace = Auth.get('user').user_marketplace_for_id(marketplaceId);
                     if (!userMarketplace) {
                        if (marketplaceId) {
                            Ember.Logger.warn("Couldn't find user marketplace for ID %@ (url: %@)".fmt(marketplaceId, url));
                             // If we couldn't find the user marketplace, maybe this is an admin user, so hit the auth server to try to find the API secret
                            return Ajax.ajax({
                                url: ENV.BALANCED.AUTH + '/marketplaces/%@'.fmt(marketplaceId),
                                type: 'GET',
                                error: settings.error
                            }).then(function(response) {
                                Auth.addUserMarketplace(response.id, response.uri, response.name, response.secret);
                                 settings.headers = settings.headers || {};
                                settings.headers['Authorization'] = Utils.encodeAuthorization(response.secret);
                                return Ajax.ajax(settings);
                            });
                        }
                    } else if (!userMarketplace.get('secret')) {
                        userMarketplace.reload();
                    } else {
                        var secret = userMarketplace.get('secret');
                        settings.headers = settings.headers || {};
                        settings.headers['Authorization'] = Utils.encodeAuthorization(secret);
                    }
                }
            }
             return Ajax.ajax(settings);
        },
         load: function(settings) {
            var deferred = Ember.RSVP.defer();
            jQuery.ajax(settings).then(deferred.resolve, deferred.reject);
            return deferred.promise;
        },*/

        ajaxError: function ajaxError(jqXHR, responseText, errorThrown) {
            var isObject = jqXHR !== null && typeof jqXHR === "object";

            if (isObject) {
                jqXHR.then = null;
                if (!jqXHR.errorThrown) {
                    if (typeof errorThrown === "string") {
                        jqXHR.errorThrown = new Error(errorThrown);
                    } else {
                        jqXHR.errorThrown = errorThrown;
                    }
                }
            }

            return jqXHR;
        },

        ajaxSuccess: function ajaxSuccess(jqXHR, jsonPayload) {
            return jsonPayload;
        },

        ajax: function ajax(url, type, options) {
            var adapter = this;

            return new Ember['default'].RSVP.Promise(function (resolve, reject) {
                var hash = adapter.ajaxOptions(url, type, options);

                hash.success = function (json, textStatus, jqXHR) {
                    json = adapter.ajaxSuccess(jqXHR, json);
                    //if (json instanceof InvalidError) {
                    //    Ember.run(null, reject, json);
                    //} else {
                    Ember['default'].run(null, resolve, json);
                    //}
                };

                hash.error = function (jqXHR, textStatus, errorThrown) {
                    Ember['default'].run(null, reject, adapter.ajaxError(jqXHR, jqXHR.responseText, errorThrown));
                };
                Ember['default'].Logger.debug("Adapter.ajax:", hash);
                Ember['default'].$.ajax(hash);
            }, "_: BaseAdapter#ajax " + type + " to " + url);
        },

        ajaxOptions: function ajaxOptions(url, type, options) {
            var hash = options || {};
            hash.url = url;
            hash.type = type;
            hash.dataType = "json";
            hash.context = this;

            if (hash.data && type !== "GET") {
                //hash.contentType = 'application/json; charset=utf-8';
                hash.contentType = "application/vnd.api+json; charset=utf-8";
                hash.data = JSON.stringify(hash.data);
            }

            var headers = Ember['default'].get(this, "headers");
            if (headers !== undefined) {
                hash.beforeSend = function (xhr) {
                    forEach.call(Ember['default'].keys(headers), function (key) {
                        xhr.setRequestHeader(key, headers[key]);
                    });
                };
            }

            return hash;
        }
    });

});
define('mb-test-1/adapters/application', ['exports', 'mb-test-1/adapters/ajax'], function (exports, AjaxAdapter) {

	'use strict';

	exports['default'] = AjaxAdapter['default'];

});
define('mb-test-1/adapters/base', ['exports', 'ember', 'mb-test-1/config/environment'], function (exports, Ember, ENV) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({
    hostsByType: [],
    defaultSerializer: "mb-test-1/serializers/rev1",
    addTrailingSlashes: false,

    pathForType: function pathForType(type) {
      var dasherized = Ember['default'].String.dasherize(type);
      return Ember['default'].String.pluralize(dasherized);
    },

    completeURL: function completeURL(uri) {
      Ember['default'].Logger.debug("BaseAdapter.completeURL: uri=", uri);
      if (uri.indexOf("http") === 0) {
        return uri;
      }

      var namespace = Ember['default'].get(this, "namespace");
      if (namespace && uri.indexOf(namespace) === 0) {
        uri = uri.slice(namespace.length + 1);
        Ember['default'].Logger.debug("BaseAdapter.completeURL: sliced uri=", uri);
      }

      var url = [uri];
      var host = Ember['default'].get(this, "host");
      var prefix = this.urlPrefix();

      if (prefix) {
        url.unshift(prefix);
      }

      url = url.join("/");
      if (!host && url) {
        url = "/" + url;
      }

      return url;
    },

    generateURI: function generateURI(type, id) {
      var url = [];

      if (type) {
        url.push(this.pathForType(type));
      }

      //We might get passed in an array of ids from findMany
      //in which case we don't want to modify the url, as the
      //ids will be passed in through a query param
      if (id && !Ember['default'].isArray(id)) {
        url.push(encodeURIComponent(id));
      }

      return url.join("/");
    },

    buildURL: function buildURL(type, id, snapshot) {
      var uri = this.generateURI(type, id, snapshot);
      var url = this.completeURL(uri);
      if (this.get("addTrailingSlashes")) {
        if (url.charAt(url.length - 1) !== "/") {
          url += "/";
        }
      }
      return url;
    },

    registerHostForType: function registerHostForType(type, host) {
      this.hostsByType.push({
        type: type,
        host: host
      });
    },

    getHostForType: function getHostForType(type) {
      var hostType = this.hostsByType.findBy("type", type);
      if (hostType) {
        return hostType.host;
      } else {
        return ENV['default'].APP.API_HOST;
      }
    },

    /*get: function(type, uri, success, error) {
      return Ember.assert("Your adapter should override get", false);
    },
     create: function(type, uri, data, success, error) {
      return Ember.assert("Your adapter should override create", false);
    },
     update: function(type, uri, data, success, error) {
      return Ember.assert("Your adapter should override update", false);
    },
     "delete": function(type, uri, success, error) {
      return Ember.assert("Your adapter should override delete", false);
    },*/

    _checkParams: function _checkParams(type, uri) {
      if (!uri) {
        throw new Error("Missing URI in adapter call for %@".fmt(type));
      }
      if (!type) {
        throw new Error("Missing type in adapter call for %@".fmt(uri));
      }
    },

    urlPrefix: function urlPrefix(path, parentURL) {
      var host = Ember['default'].get(this, "host");
      var namespace = Ember['default'].get(this, "namespace");
      var url = [];

      if (path) {
        // Protocol relative url
        //jscs:disable disallowEmptyBlocks
        if (/^\/\//.test(path)) {} else if (path.charAt(0) === "/") {
          //jscs:enable disallowEmptyBlocks
          if (host) {
            path = path.slice(1);
            url.push(host);
          }
          // Relative path
        } else if (!/^http(s)?:\/\//.test(path)) {
          url.push(parentURL);
        }
      } else {
        if (host) {
          url.push(host);
        }
        if (namespace) {
          url.push(namespace);
        }
      }

      if (path) {
        url.push(path);
      }

      return url.join("/");
    } });

  // Do nothing, the full host is already included. This branch
  // avoids the absolute path logic and the relative path logic.

  // Absolute path

});
define('mb-test-1/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'mb-test-1/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default'],

    // Basic logging, e.g. "Transitioned into 'post'"
    LOG_TRANSITIONS: false,

    // Extremely detailed logging, highlighting every internal
    // step made while transitioning into a route, including
    // `beforeModel`, `model`, and `afterModel` hooks, and
    // information about redirects and aborted transitions
    LOG_TRANSITIONS_INTERNAL: false,

    LOG_ACTIVE_GENERATION: false
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('mb-test-1/components/link-li', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Component.extend({
        tagName: 'li',
        classNameBindings: ['active'],
        active: (function () {
            return this.get('childViews').anyBy('active');
        }).property('childViews.@each.active')
    });

});
define('mb-test-1/components/modal', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ModalComponent = Ember['default'].Component.extend({
        submitAction: 'submit',
        classNames: ['modal-container'],
        modalElement: '.modal',

        willDestroyElement: function willDestroyElement() {
            this.hide();
        },

        hide: function hide() {
            this.$(this.get('modalElement')).modal('hide');
        },

        reposition: function reposition() {
            // trigger a resize to reposition the dialog
            this.$(document.body).trigger('resize');
        },

        actions: {
            open: function open(model) {
                var self = this;
                var modalElement = this.get('modalElement');

                if (model) {
                    model.on('didCreate', function () {
                        self.hide();
                    });

                    this.set('model', model);
                }

                this.$(modalElement).modal({
                    manager: this.$()
                });
            },

            close: function close() {
                this.hide();
            },

            save: function save(model) {
                model = model || this.get('model');

                if (Ember['default'].get(model, 'isSaving')) {
                    return;
                }

                var self = this;

                model.save().then(function () {
                    if (!self.get('submitAction')) {
                        return;
                    }

                    self.sendAction('submitAction', model);
                });
            }
        }
    });

    exports['default'] = ModalComponent;

});
define('mb-test-1/controllers/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend(Ember['default'].Evented, {
        needs: ["notification_center"] });

});
define('mb-test-1/controllers/basket', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/baskets', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/component', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        propertiesResultsLoader: (function () {
            return this.get('model').getPropertiesLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/components', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/floor', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/floors', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/modal-notification-center', ['exports', 'mb-test-1/controllers/notification-center'], function (exports, NotificationCenterController) {

    'use strict';

    exports['default'] = NotificationCenterController['default'].extend({
        model: []
    });

});
define('mb-test-1/controllers/modals-container', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ModalsContainerController = Ember['default'].Controller.extend({
        needs: ['notification_center', 'modal_notification_center'],
        registerContainer: function registerContainer(modalsContainer) {
            this.set('modalsContainer', modalsContainer);
        },

        close: function close() {
            var modalsContainer = this.get('modalsContainer');
            if (modalsContainer) {
                modalsContainer.forEach(function (modal) {
                    modal.close();
                });
            }
        },

        open: function open(klass, args) {
            this.close();
            var modalView = klass;

            if (_.isString(klass)) {
                klass = this.get('container').lookupFactory('view:' + klass);
            }

            modalView = klass.open.apply(klass, args);
            this.openInstance(modalView);
            return modalView;
        },

        openInstance: function openInstance(modalView) {
            var modalsContainer = this.get('modalsContainer');

            Ember['default'].run(function () {
                modalsContainer.pushObject(modalView);
            });
            modalView.open().on('hidden.bs.modal', function () {
                modalsContainer.removeObject(modalView);
            });
        },

        currentModal: Ember['default'].computed.reads('modalsContainer.firstObject')
    });

    exports['default'] = ModalsContainerController;

});
define('mb-test-1/controllers/navigation', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    model: Ember['default'].A([Ember['default'].Object.create({ title: 'Nodes', location: 'nodes', active: null }), Ember['default'].Object.create({ title: 'Floors', location: 'floors', active: null }), Ember['default'].Object.create({ title: 'Rooms', location: 'rooms', active: null }), Ember['default'].Object.create({ title: 'Rows', location: 'rows', active: null }), Ember['default'].Object.create({ title: 'Racks', location: 'racks', active: null }), Ember['default'].Object.create({ title: 'Baskets', location: 'baskets', active: null }), Ember['default'].Object.create({ title: 'Servers', location: 'servers', active: null }), Ember['default'].Object.create({ title: 'Server Templates', location: 'servertemplates', active: null }), Ember['default'].Object.create({ title: 'Components', location: 'components', active: null })]),
    title: 'MB Test 1: EmberJS'
  });

});
define('mb-test-1/controllers/node', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/nodes', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/notification-center', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var AlertMessage = Ember['default'].Object.extend({
        expire: false
    });

    exports['default'] = Ember['default'].ArrayController.extend({
        model: [],

        clearAlerts: function clearAlerts() {
            this.set("content", []);
        },

        clearNamedAlert: function clearNamedAlert(name) {
            var cleanAlerts = this.rejectBy("name", name);
            this.set("content", cleanAlerts);
        },

        expireAlerts: function expireAlerts() {
            var cleanAlerts = this.rejectBy("expire");
            this.set("content", cleanAlerts);
        },

        alert: function alert(attributes) {
            var message = AlertMessage.create(attributes);
            this.pushObject(message);
            return message;
        },

        alertInfo: function alertInfo(message, options) {
            options = _.extend({
                message: message,
                type: "info"
            }, options);

            return this.alert(options);
        },

        alertWarning: function alertWarning(message, options) {
            options = _.extend({
                message: message,
                type: "warning"
            }, options);

            return this.alert(options);
        },

        alertError: function alertError(message, options) {
            options = _.extend({
                message: message,
                type: "error"
            }, options);

            return this.alert(options);
        },

        alertSuccess: function alertSuccess(message, options) {
            options = _.extend({
                message: message,
                type: "success"
            }, options);
            return this.alert(options);
        }
    });

});
define('mb-test-1/controllers/rack', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/racks', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/room', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/rooms', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/row', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/rows', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/server', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        componentsResultsLoader: (function () {
            return this.get('model').getComponentsLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/servers', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/controllers/servertemplate', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['notification_center'],
        serversResultsLoader: (function () {
            return this.get('model').getServersLoader();
        }).property('model')
    });

});
define('mb-test-1/controllers/servertemplates', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        needs: ['application'],

        resultsLoader: Ember['default'].computed.oneWay('model')
    });

});
define('mb-test-1/initializers/app-version', ['exports', 'mb-test-1/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: 'App Version',
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('mb-test-1/initializers/env-injector-initializer', ['exports', 'mb-test-1/config/environment'], function (exports, ENV) {

    'use strict';

    exports['default'] = {
        name: 'global-env-mbtest1',
        initialize: function initialize(container) {
            container.typeInjection('controller', 'ENV', 'env:main');
            container.typeInjection('route', 'ENV', 'env:main');
            container.register('env:main', ENV['default'], {
                instantiate: false,
                singleton: true
            });
        }
    };

});
define('mb-test-1/initializers/export-application-global', ['exports', 'ember', 'mb-test-1/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('mb-test-1/initializers/mbtest-app-global-initializer', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        name: 'mbtest-app-global',
        initialize: function initialize(container, App) {
            window.MbTestApp = App;
        }
    };

});
define('mb-test-1/initializers/models-adapter-initializer', ['exports', 'mb-test-1/config/environment'], function (exports, ENV) {

  'use strict';

  exports['default'] = {
    name: "modelsAdapter",
    initialize: function initialize(container, App) {
      var adapter;
      if (App.ADAPTER) {
        adapter = App.ADAPTER;
      } else {
        adapter = container.lookup("adapter:ajax");
      }
      var register = function register(factoryName, host) {
        var klass = container.lookupFactory("model:" + factoryName);
        adapter.registerHostForType(klass, host);
      };
      register("node", ENV['default'].APP.API_HOST);
      register("server", ENV['default'].APP.API_HOST);
      container.register("adapter:main", adapter, { instantiate: false });
    }
  };

});
define('mb-test-1/initializers/result-loaders-initializer', ['exports'], function (exports) {

  'use strict';

  var LOADER_NAMES = ["base", "nodes", "servers", "floors", "rooms", "rows", "racks", "baskets", "servertemplates", "components", "properties", "propertyoptions"];

  exports['default'] = {
    name: "resultLoaders",
    initialize: function initialize(container) {
      var i, klass, len, name, results;
      results = [];
      for (i = 0, len = LOADER_NAMES.length; i < len; i++) {
        name = LOADER_NAMES[i];
        klass = require("mb-test-1/models/results-loaders/" + name)["default"];
        results.push(container.register("results-loader:" + name, klass));
      }
    }
  };

});
define('mb-test-1/initializers/type-mappings-initializer', ['exports', 'mb-test-1/models/core/type-mappings'], function (exports, TypeMappings) {

  'use strict';

  exports['default'] = {
    name: "typeMappings",
    initialize: function initialize(container) {
      var registerMapping = function registerMapping(key, factoryName) {
        var klass = container.lookupFactory("model:" + (factoryName || key));
        return TypeMappings['default'].addTypeMapping(key, klass);
      };
      registerMapping("Nodes", "node");
      registerMapping("Servers", "server");
      registerMapping("Baskets", "basket");
      registerMapping("Racks", "rack");
      registerMapping("Rows", "row");
      registerMapping("Rooms", "room");
      registerMapping("Floors", "floor");
      registerMapping("Components", "component");
      registerMapping("ServerTemplates", "servertemplate");
      registerMapping("Server Templates", "servertemplate");
      registerMapping("Properties", "property");
      registerMapping("PropertyOptions", "propertyoption");
      registerMapping("Property Options", "propertyoption");
    }
  };

});
define('mb-test-1/lib/ajax', ['exports', 'ember', 'mb-test-1/config/environment', 'mb-test-1/utils/constants/cookie', 'mb-test-1/lib/connections/api-connection'], function (exports, Ember, ENV, COOKIE, ApiConnection) {

    'use strict';

    exports['default'] = Ember['default'].Namespace.create({
        csrfToken: Ember['default'].$.cookie(COOKIE['default'].CSRF_TOKEN),
        defaultApiKey: null,

        loadCSRFToken: function loadCSRFToken() {
            var self = this;
            var deferred = Ember['default'].RSVP.defer();
            // POSTing to / will return a csrf token
            this.ajax({
                type: "POST",
                url: ENV['default'].APP.API_HOST
            }).then(function (response) {
                self.csrfToken = response.csrf;
                deferred.resolve();
            });
            return deferred.promise;
        },

        loadCSRFTokenIfNotLoaded: function loadCSRFTokenIfNotLoaded() {
            return this.csrfToken ? Ember['default'].RSVP.resolve() : this.loadCSRFToken();
        },

        ajax: function ajax(settings) {
            var connection = ApiConnection['default'].create({});
            /*if (settings.url.indexOf(ENV.APP.API_HOST) >= 0) {
                connection = AuthConnection.create({
                    csrfToken: this.csrfToken
                });
            } else {
                connection = ApiConnection.create({
                    apiKey: this.defaultApiKey
                });
            }*/
            return connection.ajax(settings);
        }
    });

});
define('mb-test-1/lib/connections/api-connection', ['exports', 'ember', 'mb-test-1/lib/connections/base-connection', 'mb-test-1/lib/utils'], function (exports, Ember, BaseConnection, Utils) {

    'use strict';

    var DEFAULT_SETTINGS = {
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        accepts: {
            json: "application/vnd.cegesta+json; version=1.1"
        } };

    var ApiConnection = BaseConnection['default'].extend({
        getEncodedAuthorization: function getEncodedAuthorization() {
            var apiKey = this.get("apiKey");
            return Utils['default'].encodeAuthorization(apiKey);
        },

        isAuthorized: function isAuthorized() {
            return !Ember['default'].isBlank(this.get("apiKey"));
        },

        settings: function settings(additionalSettings) {
            var headers = {};
            /*if (this.isAuthorized()) {
                headers["Authorization"] = this.getEncodedAuthorization();
            }*/
            var settings = _.extend({
                headers: headers
            }, DEFAULT_SETTINGS, additionalSettings);

            if (settings.data && settings.type.toUpperCase() !== "GET") {
                settings.data = JSON.stringify(settings.data);
            }
            return settings;
        } });

    exports['default'] = ApiConnection;

});
define('mb-test-1/lib/connections/auth-connection', ['exports', 'mb-test-1/lib/connections/base-connection'], function (exports, BaseConnection) {

    'use strict';

    //import ENV from "mb-test-1/config/environment";
    exports['default'] = BaseConnection['default'].extend({
        csrfToken: (function () {
            var Ajax = require("mb-test-1/lib/ajax")["default"];
            return Ajax.csrfToken;
        }).property(),

        getCsrfToken: function getCsrfToken() {
            return this.get("csrfToken");
        },

        settings: function settings(additionalSettings) {
            var settings = additionalSettings; /*_.extend({
                                               headers: {
                                               "X-CSRFToken": this.getCsrfToken()
                                               }
                                               }, additionalSettings);*/

            // This does NOT work in Firefox
            // See http://stackoverflow.com/questions/16668386/cors-synchronous-requests-not-working-in-firefox
            /* istanbul ignore if */
            /*if (!window.TESTING) {
                settings.xhrFields = {
                    withCredentials: true
                };
            } else {
                settings.beforeSend = function(xhr) {
                    xhr.withCredentials = true;
                };
            }*/
            return settings;
        }
    });

});
define('mb-test-1/lib/connections/base-connection', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({
        settings: function settings(_settings) {
            // This function can be overriden by descendant classes so they can add default arguments
            return _settings;
        },

        post: function post(url, data) {
            return this.ajax({
                url: url,
                data: data,
                type: "POST"
            });
        },

        "delete": function _delete(url) {
            return this.ajax({
                url: url,
                type: "DELETE"
            });
        },

        ajax: function ajax(settings) {
            var Adapter = MbTestApp.__container__.lookup("adapter:main");
            return Adapter.load(this.settings(settings));
        }
    });

});
define('mb-test-1/lib/ember-data/system/store/common', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports._bind = _bind;
  exports._guard = _guard;
  exports._objectIsAlive = _objectIsAlive;

  var get = Ember['default'].get;
  function _bind(fn) {
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
      return fn.apply(undefined, args);
    };
  }

  function _guard(promise, test) {
    var guarded = promise["finally"](function () {
      if (!test()) {
        guarded._subscribers.length = 0;
      }
    });

    return guarded;
  }

  function _objectIsAlive(object) {
    return !(get(object, "isDestroyed") || get(object, "isDestroying"));
  }

});
define('mb-test-1/lib/ember-data/system/store/serializers', ['exports'], function (exports) {

  'use strict';

  exports.serializerForAdapter = serializerForAdapter;

  function serializerForAdapter(store, adapter, type) {
    var serializer = adapter.serializer;

    if (serializer === undefined) {
      serializer = store.serializerFor(type);
    }

    if (serializer === null || serializer === undefined) {
      serializer = {
        extract: function extract(store, type, payload) {
          return payload;
        }
      };
    }

    return serializer;
  }

});
define('mb-test-1/lib/utils', ['exports', 'ember', 'mb-test-1/utils/constants'], function (exports, Ember, Constants) {

    'use strict';

    var FORMAT_NUMBER_REGEX = /\B(?=(\d{3})+(?!\d))/g,
        PRETTY_LOG_URL_REGEX = /\/marketplaces\/[^\/]*\/(.+)$/,
        STRIP_DOMAIN_REGEX = /^.*\/\/[^\/]+/,
        TO_TITLECASE_REGEX = /\w\S*/g,
        SPACE_REPLACE_REGEX = /\s/g,
        UNDERSCORE_REPLACE_REGEX = /_/g,
        PARAM_HELPER_1_REGEX = /[\[]/,
        PARAM_HELPER_2_REGEX = /[\]]/,
        PARAM_URI_DECODE_REGEX = /\+/g,
        FORMAT_CURRENCY_REGEX = /(\d)(?=(\d{3})+\.)/g,
        FORMAT_ERROR_REGEX = /-\s/,
        REMOVE_COMMA_WHITESPACE_REGEX = /,|\s/g,
        CURRENCY_TEST_REGEX = /^([0-9]*(\.[0-9]{0,2})?)$/,
        HIDE_BA_NUMBER_REGEX = /([0-9])[\s+\-]([0-9])/g,
        HIDE_CC_NUMBER_REGEX = /([0-9]*)([0-9]{4})/g;

    var Utils = Ember['default'].Namespace.create({

        toDataUri: function toDataUri(string) {
            return "data:text/plain;charset=utf-8;base64," + window.btoa(string);
        },

        queryStringToObject: function queryStringToObject(string) {
            if (string === undefined) {
                return undefined;
            }

            var results = {};
            var pairs = string.split("?")[1].split("&");
            pairs.forEach(function (str) {
                var pair = str.split("=").map(function (s) {
                    return window.decodeURIComponent(s);
                });
                results[pair[0]] = pair[1];
            });

            return results;
        },

        objectToQueryString: function objectToQueryString(object) {
            return _.map(object, function (v, k) {
                var value = Ember['default'].isBlank(v) ? "" : v;
                return encodeURIComponent(k) + "=" + encodeURIComponent(value);
            }).join("&");
        },

        stripDomain: function stripDomain(url) {
            return url.replace(STRIP_DOMAIN_REGEX, "");
        },

        prettyLogUrl: function prettyLogUrl(url) {
            return Utils.stripDomain(url).replace(PRETTY_LOG_URL_REGEX, "/.../$1").split("?")[0];
        },

        prettyPrint: function prettyPrint(obj) {
            return JSON.stringify(obj, null, 2);
        },

        geoIP: function geoIP(ip, callback) {
            if (window.TESTING) {
                return callback("(San Francisco, California, United States)");
            }

            if (ip) {
                return Ember['default'].$.ajax("https://freegeoip.net/json/" + ip, {
                    dataType: "jsonp",
                    type: "GET",
                    jsonp: "callback"
                }).then(function (result) {
                    var geoIpString;

                    if (result.city && result.region_name && result.country_name) {
                        geoIpString = "(" + result.city + ", " + result.region_name + ", " + result.country_name + ")";
                    } else if (result.region_name && result.country_name) {
                        geoIpString = "(" + result.region_name + ", " + result.country_name + ")";
                    }

                    if (_.isFunction(callback)) {
                        return callback(geoIpString);
                    } else {
                        return geoIpString;
                    }
                });
            }
        },

        toTitleCase: function toTitleCase(str) {
            if (!str) {
                return str;
            }

            return str.replace(UNDERSCORE_REPLACE_REGEX, " ").replace(TO_TITLECASE_REGEX, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },

        toLowerCase: function toLowerCase(str) {
            if (!str) {
                return str;
            }

            return str.toLowerCase();
        },

        getParamByName: function getParamByName(uri, name) {
            name = name.replace(PARAM_HELPER_1_REGEX, "\\\\[").replace(PARAM_HELPER_2_REGEX, "\\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(uri);
            return results === null ? "" : decodeURIComponent(results[1].replace(PARAM_URI_DECODE_REGEX, " "));
        },

        /*
         * Inserts or updates a single query string parameter
         */
        updateQueryStringParameter: function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf("?") > -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, "$1" + key + "=" + value + "$2");
            } else {
                return uri + separator + key + "=" + value;
            }
        },

        sortDict: function sortDict(dict) {
            var sorted = [];
            for (var key in dict) {
                sorted[sorted.length] = key;
            }
            sorted.sort();

            var tempDict = {};
            for (var i = 0; i < sorted.length; i++) {
                tempDict[sorted[i]] = dict[sorted[i]];
            }

            return tempDict;
        },

        formatCurrency: function formatCurrency(cents) {
            if (!cents) {
                return "$0.00";
            }

            var prepend = "$";
            if (cents < 0) {
                cents = cents * -1;
                prepend = "-$";
            }

            return prepend + Utils.centsToDollars(cents);
        },

        formatNumber: function formatNumber(number) {
            if (!number) {
                return 0;
            }

            return ("" + number).replace(FORMAT_NUMBER_REGEX, ",");
        },

        formatError: function formatError(error) {
            if (error !== null && error !== undefined) {
                if (error.message) {
                    // amount validation
                    return error.message;
                } else if (error.search === undefined) {
                    // ember validation
                    return (error.get("messages") || []).join(", ");
                } else {
                    // server-side validation
                    var split = error.search(FORMAT_ERROR_REGEX);
                    if (split !== -1) {
                        return error.slice(split + 2);
                    }
                }
            }
            return error;
        },

        capitalize: function capitalize(str) {
            if (!str) {
                return str;
            }

            return str.charAt(0).toUpperCase() + str.slice(1).replace(UNDERSCORE_REPLACE_REGEX, " ");
        },

        dollarsToCents: function dollarsToCents(dollars) {
            if (!dollars) {
                throw new Error("%@ is not a valid dollar amount".fmt(dollars));
            }

            // remove commas and whitespace
            dollars = dollars.replace(REMOVE_COMMA_WHITESPACE_REGEX, "");

            // make sure our input looks reasonable now, or else fail
            if (!CURRENCY_TEST_REGEX.test(dollars)) {
                throw new Error("%@ is not a valid dollar amount".fmt(dollars));
            }

            return Math.round(100 * parseFloat(dollars));
        },

        centsToDollars: function centsToDollars(cents) {
            if (!cents) {
                return "0";
            }

            return (cents / 100).toFixed(2).replace(FORMAT_CURRENCY_REGEX, "$1,");
        },

        applyUriFilters: function applyUriFilters(uri, params) {
            if (!uri) {
                return uri;
            }

            var transformedParams = ["limit", "offset", "sortField", "sortOrder", "minDate", "maxDate", "type", "query"];

            var filteringParams = {
                limit: params.limit || 10,
                offset: params.offset || 0
            };

            if (params.sortField && params.sortOrder && params.sortOrder !== "none") {
                filteringParams.sort = params.sortField + "," + params.sortOrder;
            }

            if (params.minDate) {
                filteringParams["created_at[>]"] = params.minDate.toISOString();
            }
            if (params.maxDate) {
                filteringParams["created_at[<]"] = params.maxDate.toISOString();
            }
            if (params.type) {
                switch (params.type) {
                    case "search":
                        filteringParams["type[in]"] = Constants['default'].SEARCH.SEARCH_TYPES.join(",");
                        break;
                    case "transaction":
                        filteringParams["type[in]"] = Constants['default'].SEARCH.TRANSACTION_TYPES.join(",");
                        break;
                    case "funding_instrument":
                        filteringParams["type[in]"] = Constants['default'].SEARCH.FUNDING_INSTRUMENT_TYPES.join(",");
                        break;
                    default:
                        filteringParams.type = params.type;
                }
            }
            filteringParams.q = "";
            if (params.query && params.query !== "%") {
                filteringParams.q = params.query;
            }

            filteringParams = _.extend(filteringParams, _.omit(params, transformedParams));
            filteringParams = Utils.sortDict(filteringParams);
            return this.buildUri(uri, filteringParams);
        },

        buildUri: function buildUri(path, queryStringObject) {
            var queryString = _.isString(queryStringObject) ? queryStringObject : this.objectToQueryString(queryStringObject);
            return Ember['default'].isBlank(queryString) ? path : path + "?" + queryString;
        },

        /*
         * This function checks whether data is loaded, when it is loaded, loadedFunc
         * is called and the result is returned. Otherwise, result of loadingFunc()
         * will be returned and callback(loadedFunc()) will be called once the data is loaded
         *
         * It is very useful for getting a loading message when it is loading,
         * update the information later with the data is loaded.
         */
        maybeDeferredLoading: function maybeDeferredLoading(data, callback, loadingFunc, loadedFunc) {
            // the data is already loaded
            if (data.isLoaded) {
                return loadedFunc();
            }

            // called when data is loaded
            data.on("didLoad", function () {
                callback(loadedFunc());
            });
            return loadingFunc();
        },

        combineUri: function combineUri(baseUri, path) {
            if (!baseUri || !path) {
                throw new Error("Can't combine URIs: %@ %@".fmt(baseUri, path));
            }

            // strip trailing slash
            if (baseUri[baseUri.length - 1] === "/") {
                baseUri = baseUri.substring(0, baseUri.length - 1);
            }

            // strip leading slash
            if (path[0] === "/") {
                path = path.substring(1);
            }

            return baseUri + "/" + path;
        },

        date_formats: {
            date: "MMM D, YYYY",
            time: "h:mm A",
            date_time: "MMM D, YYYY, h:mm A",
            short: "M/D/YYYY, h:mm A",
            long: "MMMM D YYYY, h:mm A" },

        formatDate: function formatDate(date, format) {
            if (_.isDate(date)) {
                return moment(date).format(format);
            } else if (_.isString(date)) {
                // As of Sept 22 2014 there is an issue with log api results returning the time zone as
                // "+00:00Z" which is not being parsed as valid ISO_8601
                // https://github.com/balanced/balanced/issues/644
                return moment(date.replace(/\+00:00Z$/, "Z"), moment.ISO_8601).format(format);
            } else {
                return date;
            }
        },

        humanReadableDateTime: function humanReadableDateTime(isoDate) {
            return Utils.formatDate(isoDate, Utils.date_formats.date_time);
        },

        humanReadableDate: function humanReadableDate(isoDate) {
            return Utils.formatDate(isoDate, Utils.date_formats.date);
        },

        humanReadableTime: function humanReadableTime(isoDate) {
            return Utils.formatDate(isoDate, Utils.date_formats.time);
        },

        humanReadableDateShort: function humanReadableDateShort(isoDate) {
            return Utils.formatDate(isoDate, Utils.date_formats.short);
        },

        humanReadableDateLong: function humanReadableDateLong(isoDate) {
            return Utils.formatDate(isoDate, Utils.date_formats.long);
        },

        // filters any number that is in the form of a string and longer than 4 digits (bank codes, ccard numbers etc)
        filterSensitiveData: function filterSensitiveData(str) {
            if (Ember['default'].isNone(str)) {
                return str;
            }
            var strValue = "" + str;
            return strValue.replace(HIDE_BA_NUMBER_REGEX, "$1$2").replace(HIDE_CC_NUMBER_REGEX, "XX-HIDE-XX-$2");
        },

        // Takes a hash and filters out all the sensitive data. Only preserves
        // top-level properties, since mixpanel doesn't do nested properties
        filterSensitivePropertiesMap: function filterSensitivePropertiesMap(obj) {
            if (!obj) {
                return obj;
            }

            var ret = {};
            for (var name in obj) {
                if (obj.hasOwnProperty(name)) {
                    ret[name] = Utils.filterSensitiveData(obj[name]);
                }
            }
            return ret;
        },

        encodeAuthorization: function encodeAuthorization(apiKey) {
            return "Basic " + window.btoa(apiKey + ":");
        },

        extractValidationErrorHash: function extractValidationErrorHash(errorsRoot) {
            var errorsHash = {};
            _.each(errorsRoot.errors, function (error) {
                for (var key in error.extras) {
                    errorsHash[key] = error.extras[key];
                }
            });
            return errorsHash;
        },

        traverse: function traverse(o, fn, ctx, addlKey) {
            addlKey = addlKey || "";

            _.each(o, function (val, key) {
                fn.call(this, val, addlKey + key);

                if (_.isObject(val)) {
                    Utils.traverse(val, fn, ctx, key + ".");
                }
            }, ctx);
        },

        safeFormat: function safeFormat(template) {
            var args = _.toArray(arguments).slice(1).map(function (str) {
                return Ember['default'].Handlebars.Utils.escapeExpression(str);
            });
            return template.fmt.apply(template, args);
        },

        formatBankName: function formatBankName(bankName) {
            var formattedBankName = Utils.toTitleCase(bankName);

            _.each(Constants['default'].BANK_NAMES, function (unformattedArr, formattedStr) {
                _.each(unformattedArr, function (unformattedStr) {
                    formattedBankName = formattedBankName.replace(unformattedStr, formattedStr);
                });
            });

            return formattedBankName;
        },

        formatStatusCode: function formatStatusCode(statusCode) {
            if (statusCode) {
                return Utils.capitalize(statusCode.replace(/-/g, " "));
            } else {
                return null;
            }
        },

        formatFileSize: function formatFileSize(bytes) {
            if (bytes >= 1000000000) {
                bytes = (bytes / 1000000000).toFixed(2) + " gb";
            } else if (bytes >= 1000000) {
                bytes = (bytes / 1000000).toFixed(2) + " mb";
            } else if (bytes >= 1000) {
                bytes = (bytes / 1000).toFixed(2) + " kb";
            } else if (bytes > 1) {
                bytes = bytes + " bytes";
            } else if (bytes === 1) {
                bytes = bytes + " byte";
            } else {
                bytes = "0 byte";
            }
            return bytes;
        },

        getCurrentYear: function getCurrentYear() {
            return moment().get("year");
        }
    });

    exports['default'] = Utils;

});
define('mb-test-1/models/basket', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            rack: {
                presence: true
            },
            slot_qty: {
                presence: true
            },
            unit_takes: {
                presence: true
            }
        },
        /*name: DS.attr('string'),
        rack: DS.belongsTo('rack'),
        slot_qty: DS.attr('number'),
        unit_takes: DS.attr('number'),
        servers: DS.hasMany('server')*/
        uri: "/baskets",
        route_name: "baskets",
        type_name: "Basket",
        type_plural: "Baskets",

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        json_floor: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.floor;
            }
            this.reload().then(function () {
                return self.get("__json").floor;
            });
        }).property("__json"),

        json_room: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.room;
            }
            this.reload().then(function () {
                return self.get("__json").room;
            });
        }).property("__json"),

        json_row: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.row;
            }
            this.reload().then(function () {
                return self.get("__json").row;
            });
        }).property("__json"),

        json_rack: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.rack;
            }
            this.reload().then(function () {
                return self.get("__json").rack;
            });
        }).property("__json"),

        getResultsLoader: utils__model.generateResultsLoader("baskets", "uri"),
        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/component', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            manufacturer: {
                presence: true
            },
            model_name: {
                presence: true
            },
            serial_number: {
                presence: true
            },
            kind: {
                presence: true
            }
        },
        uri: "/components",
        route_name: "components",
        type_name: "Component",
        type_plural: "Components",

        json_kind: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.kind;
            }
            this.reload().then(function () {
                return self.get("__json").kind;
            });
        }).property("__json"),

        json_server: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.server;
            }
            this.reload().then(function () {
                return self.get("__json").server;
            });
        }).property("__json"),

        getResultsLoader: utils__model.generateResultsLoader("components", "uri"),
        getPropertiesLoader: utils__model.generateResultsLoader("properties", "properties_uri"),

        properties_uri: (function () {
            return this.get("uri") + "/properties";
        }).property("uri") });

});
define('mb-test-1/models/core/mixins/load-promise', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var Evented = Ember['default'].Evented,
        // ember-runtime/mixins/evented
    run = Ember['default'].run,
        // ember-metal/run-loop
    get = Ember['default'].get,
        // ember-metal/accessors
    set = Ember['default'].set;

    var PENDING = void 0;
    var SEALED = 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var LoadPromise = Ember['default'].Mixin.create(Evented, {
        init: function init() {
            this._super.apply(this, arguments);

            _.each(['didLoad', 'didCreate'], function (name) {
                this.one(name, this, function () {
                    run(this, 'resolve', this);
                });
            }, this);

            _.each(['becameError', 'becameInvalid'], function (name) {
                this.one(name, this, function () {
                    run(this, 'reject', this);
                });
            }, this);

            if (get(this, 'isLoaded')) {
                this.trigger('didLoad');
            }
        },

        resolveOn: function resolveOn(successEvent) {
            var model = this;
            var deferred = Ember['default'].RSVP.defer();

            function success(args) {
                resetEventHandlers();
                deferred.resolve(args || model);
            }

            function error(args) {
                resetEventHandlers();
                deferred.reject(args || model);
            }

            function resetEventHandlers() {
                _.each(['becameError', 'becameInvalid'], function (name) {
                    this.off(name, error);
                }, model);

                _.each(['didLoad', 'didCreate'], function (name) {
                    this.off(name, success);
                }, model);
            }

            model._resetPromise();
            model.one(successEvent, success);
            model.one('becameError', error);
            model.one('becameInvalid', error);

            return deferred.promise;
        },

        _resetPromise: function _resetPromise() {
            // once a promise is resolved it doesn't not seem possible to get it
            // to "reset". we emulate that capability here by creating a new
            // promise if it has already been rejected which can happen during
            // model object validation.
            var resolved = this.get('_deferred');

            // RSVP got rid of isRejected and uses _state to maintain a promise's state
            if (resolved && resolved.promise && resolved.promise._state === REJECTED) {
                set(this, '_deferred', Ember['default'].RSVP.defer());
            }
        },

        //
        then: function then(resolve, reject, label) {
            var deferred, promise, entity;

            entity = this;
            deferred = get(this, '_deferred');
            promise = deferred.promise;

            function fulfillmentHandler(fulfillment) {
                if (fulfillment === promise) {
                    return resolve(entity);
                } else {
                    return resolve(fulfillment);
                }
            }

            return promise.then(resolve && fulfillmentHandler, reject, label);
        },

        resolve: function resolve(value) {
            var deferred, promise;

            deferred = Ember['default'].get(this, '_deferred');
            promise = deferred.promise;

            if (value === this) {
                deferred.resolve(promise);
            } else {
                deferred.resolve(value);
            }
        },

        reject: function reject(value) {
            Ember['default'].get(this, '_deferred').reject(value);
        },

        _deferred: Ember['default'].computed(function () {
            return Ember['default'].RSVP.defer('Ember: DeferredMixin - ' + this);
        })
    });

    exports['default'] = LoadPromise;

});
define('mb-test-1/models/core/model-array', ['exports', 'ember', 'mb-test-1/models/core/mixins/load-promise', 'mb-test-1/models/core/type-mappings', 'mb-test-1/lib/ember-data/system/store/common', 'mb-test-1/lib/ember-data/system/store/serializers'], function (exports, Ember, LoadPromise, TypeMappings, common, serializers) {

    'use strict';

    var Promise = Ember['default'].RSVP.Promise;

    var getAdapter = function getAdapter() {
        return MbTestApp.__container__.lookup("adapter:main");
    };

    var ModelArray = Ember['default'].ArrayProxy.extend(LoadPromise['default'], {
        hasNextPage: false,
        loadingNextPage: false,

        loadNextPage: function loadNextPage() {
            var self = this;

            var promise = this.resolveOn("didLoad");
            self.set("loadingNextPage", true);

            if (this.get("hasNextPage")) {
                var typeClass = this.get("typeClass");
                getAdapter().find(typeClass, this.get("next_uri")).then(function (json) {
                    var deserializedJson = typeClass.serializer.extractCollection(json);
                    self._populateModels(deserializedJson);
                    self.set("loadingNextPage", false);
                });
            } else {
                promise.reject(this);
                self.set("loadingNextPage", false);
            }

            return promise;
        },

        loadAll: function loadAll() {
            var self = this;
            var loadAll = _.bind(this.loadAll, this);

            if (this.get("isLoaded")) {
                _.defer(function () {
                    if (self.get("hasNextPage") && !self.get("loadingNextPage")) {
                        self.loadNextPage().then(loadAll);
                    }
                });
            } else {
                this.one("didLoad", loadAll);
            }
        },

        reload: function reload() {
            var deferred = Ember['default'].RSVP.defer();
            if (!this.get("isLoaded")) {
                return this;
            }

            var self = this;
            this.set("isLoaded", false);
            var typeClass = this.get("typeClass");

            getAdapter().find(this.constructor, this.get("uri")).then(function (json) {
                // todo, maybe we should go through and reload each item rather
                // than nuking and re-adding
                self.clear();
                var deserializedJson = typeClass.serializer.extractCollection(json);
                self._populateModels(deserializedJson);
                deferred.resolve(self);
            }, function () {
                deferred.reject(self);
            });
            return deferred.promise;
        },

        _populateModels: function _populateModels(json) {
            //Ember.Logger.debug('input data:');
            //Ember.Logger.debug(json);
            var self = this;

            var typeClass = this.get("typeClass");

            var itemsArray;
            if (json && Ember['default'].$.isArray(json)) {
                itemsArray = json;
                this.setProperties({
                    next_uri: undefined,
                    hasNextPage: false,
                    counts: {},
                    total: json.length
                });
            } else {
                if (json && json.items && Ember['default'].$.isArray(json.items)) {
                    //Ember.Logger.debug('next step is here - parse json.items: ');
                    //Ember.Logger.debug(json.items);

                    itemsArray = json.items;

                    if (json.linked) {
                        this.set("linked", json.linked);
                    }

                    if (json.next_uri) {
                        this.set("next_uri", json.next_uri);
                        this.set("hasNextPage", true);
                    } else {
                        this.set("next_uri", undefined);
                        this.set("hasNextPage", false);
                    }

                    this.set("counts", json.counts);
                    this.set("total", json.total);
                } else {
                    this.set("isError", true);
                    return;
                }
            }

            var typedObjects = _.map(itemsArray, function (item) {
                var typedObj = typeClass._materializeLoadedObjectFromAPIResult(item);

                // if an object is deleted, remove it from the collection
                typedObj.on("didDelete", function () {
                    self.removeObject(typedObj);
                });

                return typedObj;
            });

            //Ember.Logger.debug('typedObjects is equal to: ');
            //Ember.Logger.debug(typedObjects);

            this.addObjects(typedObjects);
            this.set("isLoaded", true);
            this.trigger("didLoad");
        },

        _handleError: function _handleError(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400) {
                this.set("isValid", false);
                this.trigger("becameInvalid", jqXHR.responseText);
            } else {
                this.set("isError", true);
                this.trigger("becameError", jqXHR.responseText);
            }
        }
    });

    ModelArray.reopenClass({
        newArrayLoadedFromUri: function newArrayLoadedFromUri(uri, defaultType) {
            var typeClass = TypeMappings['default'].typeClass(defaultType);
            var modelObjectsArray = this.create({
                content: Ember['default'].A(),
                typeClass: typeClass,
                uri: uri
            });

            if (!uri) {
                //Ember.Logger.warn("DELETE ME: No URI");
                return modelObjectsArray;
            }
            modelObjectsArray.set("isLoaded", false);
            getAdapter().find(typeClass, uri).then(function (json) {
                var deserializedJson = typeClass.serializer.extractCollection(json);
                //Ember.Logger.debug('deserializedJson: ');
                //Ember.Logger.debug(deserializedJson);
                modelObjectsArray._populateModels(deserializedJson);
            }, function (jqXHR, textStatus, errorThrown) {
                //Ember.Logger.debug(arguments);
                modelObjectsArray._handleError(jqXHR, textStatus, errorThrown);
            }); //*/

            return modelObjectsArray;
        },

        newArrayCreatedFromJson: function newArrayCreatedFromJson(json, defaultType) {
            var typeClass = TypeMappings['default'].typeClass(defaultType);
            var modelObjectsArray = this.create({
                content: Ember['default'].A(),
                typeClass: typeClass,
                uri: null
            });

            if (!json) {
                return modelObjectsArray;
            }

            var deserializedJson = typeClass.serializer.extractCollection(json);
            modelObjectsArray._populateModels(deserializedJson);

            return modelObjectsArray;
        }
    });

    exports['default'] = ModelArray;

});
define('mb-test-1/models/core/model', ['exports', 'ember', 'mb-test-1/models/core/mixins/load-promise', 'mb-test-1/models/core/type-mappings', 'mb-test-1/utils/computed', 'mb-test-1/serializers/rev1', 'mb-test-1/lib/utils', 'mb-test-1/models/core/model-array'], function (exports, Ember, LoadPromise, TypeMappings, Computed, Rev1Serializer, Utils, ModelArray) {

    'use strict';

    var JSON_PROPERTY_KEY = "__json";
    var URI_POSTFIX = "_uri";
    var URI_METADATA_PROPERTY = "_uris";
    var INTEGER_REGEX = /\b[0-9]+\b/;
    var PRIVATE_PROPERTIES = ["id", "validationErrors", "_type"];
    var AJAX_ERROR_PARSERS = [];

    var Model = Ember['default'].Object.extend(Ember['default'].Evented, Ember['default'].Copyable, LoadPromise['default'], {
        isLoaded: false,
        isSaving: false,
        isDeleted: false,
        isError: false,
        isNew: true,
        isValid: true,

        displayErrorDescription: (function () {
            return (!this.get("isValid") || this.get("isError")) && (!this.get("validationErrors") || !_.keys(this.get("validationErrors")).length);
        }).property("isValid", "isError", "validationErrors"),

        id: Computed['default'].orProperties("__json.id", "_id"),

        // computes the ID from the URI - exists because at times Ember needs the
        // ID of our model before it has finished loading. This gets overridden
        // when the real model object gets loaded by the ID value from the JSON
        // attribute
        _id: (function () {
            var uri = this.get("uri");

            if (uri) {
                return uri.substring(uri.lastIndexOf("/") + 1);
            }
        }).property("uri"),

        save: function save(settings) {
            var Adapter = this.constructor.getAdapter();
            var self = this;
            settings = settings || {};
            var data = this.constructor.serializer.serialize(this);

            self.set("isSaving", true);

            var creatingNewModel = this.get("isNew");

            var resolveEvent = creatingNewModel ? "didCreate" : "didUpdate";
            var uri = creatingNewModel ? this._createUri() : this.get("uri");
            var adapterFunc = creatingNewModel ? Adapter.createRecord : Adapter.updateRecord;

            var promise = this.resolveOn(resolveEvent);

            Ember['default'].Logger.debug("Model.save: uri=", uri);
            Ember['default'].Logger.debug("Model.save: data=", data);

            adapterFunc.call(Adapter, this.constructor, uri, data, settings).then(function (json) {
                var deserializedJson = self.constructor.serializer.extractSingle(json, self.constructor, creatingNewModel ? null : self.get("href"));
                self._updateFromJson(deserializedJson);

                self.setProperties({
                    isNew: false,
                    isSaving: false,
                    isValid: true,
                    isError: false
                });

                self.trigger(resolveEvent);
                Model.Events.trigger(resolveEvent, self);
            }, Ember['default'].$.proxy(self._handleError, self));

            return promise;
        },

        ingestErrorResponse: function ingestErrorResponse(response) {
            var errorHandler = new ValidationServerErrorHandler(this, response);
            errorHandler.execute();
        },

        validateAndSave: function validateAndSave(settings) {
            this.get("validationErrors").clear();
            this.validate();
            if (this.get("isValid")) {
                var Adapter = this.constructor.getAdapter();
                var self = this;
                settings = settings || {};
                var data = this.constructor.serializer.serialize(this);

                self.set("isSaving", true);

                var creatingNewModel = this.get("isNew");
                var uri = creatingNewModel ? this._createUri() : this.get("uri");
                var adapterFunc = creatingNewModel ? Adapter.createRecord : Adapter.updateRecord;
                var deferred = Ember['default'].RSVP.defer();
                var successHandler = function successHandler(json) {
                    var deserializedJson = self.constructor.serializer.extractSingle(json, self.constructor, creatingNewModel ? null : self.get("href"));
                    self._updateFromJson(deserializedJson);
                    self.setProperties({
                        isNew: false,
                        isSaving: false,
                        isValid: true,
                        isError: false
                    });
                };

                adapterFunc.call(Adapter, this.constructor, uri, data, settings).then(function (json) {
                    successHandler(json);
                    deferred.resolve(self);
                }, function (response) {
                    self.ingestErrorResponse(response.responseJSON);
                    deferred.reject(self);
                });
                return deferred.promise;
            } else {
                return Ember['default'].RSVP.reject(this);
            }
        },

        _createUri: function _createUri() {
            return this.get("uri");
        },

        "delete": function _delete(settings) {
            var self = this;
            settings = settings || {};

            Ember['default'].Logger.debug("Model.delete:");
            Ember['default'].Logger.debug(this);
            Ember['default'].Logger.debug(this.get("uri"));

            this.setProperties({
                isDeleted: true,
                isSaving: true
            });

            this.constructor.getAdapter().deleteRecord(this.constructor, this.get("uri")).then(function (json) {
                self.set("isSaving", false);
                self.trigger("didDelete");
                Model.Events.trigger("didDelete", self);
            }, Ember['default'].$.proxy(self._handleError, self), settings);
            return this.resolveOn("didDelete");
        },

        reload: function reload() {
            if (!this.get("isLoaded")) {
                return this;
            }

            var self = this;
            this.set("isLoaded", false);

            var promise = this.resolveOn("didLoad");

            Ember['default'].Logger.debug("Model.reload: uri=", this.get("uri"));

            this.constructor.getAdapter().find(this.constructor, this.get("uri")).then(function (json) {
                var deserializedJson = self.constructor.serializer.extractSingle(json, self.constructor, self.get("href"));
                self._updateFromJson(deserializedJson);
                self.set("isLoaded", true);
                self.trigger("didLoad");
            }, Ember['default'].$.proxy(self._handleError, self));

            return promise;
        },

        copy: function copy() {
            var modelObject = this.constructor.create({
                uri: this.get("uri")
            });

            modelObject._updateFromJson(this.get(JSON_PROPERTY_KEY));
            return modelObject;
        },

        updateFromModel: function updateFromModel(modelObj) {
            this._updateFromJson(modelObj.get(JSON_PROPERTY_KEY));
        },

        populateFromJsonResponse: function populateFromJsonResponse(json) {
            var decodingUri = this.get("isNew") ? null : this.get("uri");
            var modelJson = this.constructor.serializer.extractSingle(json, this.constructor, decodingUri);

            if (modelJson) {
                this._updateFromJson(modelJson);
            } else {
                this.setProperties({
                    isNew: false,
                    isError: true
                });

                this.trigger("becameError");
            }
        },

        getPojoProperties: function getPojoProperties(pojo) {
            return Ember['default'].getProperties(pojo, Object.keys(pojo));
        },
        getProxiedProperties: function getProxiedProperties(proxyObject) {
            // Three levels, first the content, then the prototype, then the properties of the instance itself
            var contentProperties = this.getPojoProperties(proxyObject.get("content")),
                prototypeProperties = Ember['default'].getProperties(proxyObject, Object.keys(proxyObject.constructor.prototype)),
                objectProperties = this.getPojoProperties(proxyObject);
            return Ember['default'].merge(Ember['default'].merge(contentProperties, prototypeProperties), objectProperties);
        },
        getEmberObjectProperties: function getEmberObjectProperties(emberObject) {
            var prototypeProperties = Ember['default'].getProperties(emberObject, Object.keys(emberObject.constructor.prototype)),
                objectProperties = this.getPojoProperties(emberObject);
            return Ember['default'].merge(prototypeProperties, objectProperties);
        },
        getProperties: function getProperties(object) {
            if (object instanceof Ember['default'].ObjectProxy) {
                return this.getProxiedProperties(object);
            } else if (object instanceof Ember['default'].Object) {
                return this.getEmberObjectProperties(object);
            } else {
                return this.getPojoProperties(object);
            }
        },

        _updateFromJson: function _updateFromJson(json) {
            var self = this;
            if (!json) {
                return;
            }

            var changes = {
                isNew: false
            };
            changes[JSON_PROPERTY_KEY] = json;
            //changes['_type'] = this.type_plural;

            //Ember.Logger.debug('_updateFromJson: JSON=', json);

            this.setProperties(changes);

            var class_props = this.getProperties(this.constructor.proto());
            //Ember.Logger.debug('PROPS: ', class_props);

            Ember['default'].changeProperties(function () {
                for (var prop in json) {
                    if (json.hasOwnProperty(prop)) {
                        if (class_props[prop] || self[prop] instanceof Ember['default'].ComputedProperty) {
                            //Ember.Logger.debug('--> exclude property ', prop, json[prop]);//*/
                            continue;
                        }
                        if (Ember['default'].$.inArray(prop, PRIVATE_PROPERTIES) >= 0) {
                            //Ember.Logger.debug('--> exclude private property ', prop, json[prop]);//*/
                            continue;
                        }
                        if (prop === "type") {
                            self.set("_type", json[prop]);
                            continue;
                        }
                        //Ember.Logger.debug('--> SET property ', prop, json[prop]);//*/

                        //var desc = Ember.meta(self.constructor.proto(), false);
                        //Ember.Logger.debug(desc);

                        /*var desc = Ember.meta(self.constructor.proto(), false).descs[prop];
                        // don't override computed properties with raw json
                        if (!(desc && desc instanceof Ember.ComputedProperty)) {
                            self.set(prop, json[prop]);
                        }*/
                        var value = json[prop];
                        if (Ember['default'].typeOf(value) === "object") {
                            self.set(prop, Ember['default'].Object.create(value));
                        } else if (Ember['default'].typeOf(value) === "array") {
                            var arr = Ember['default'].A();
                            value.forEach(function (item) {
                                arr.pushObject(Ember['default'].Object.create(item));
                            });
                            self.set(prop, arr);
                        } else {
                            self.set(prop, json[prop]);
                        }
                    }
                }
            });

            this.set("isLoaded", true);
            this.trigger("didLoad");
        },

        _handleError: function _handleError(jqXHR, textStatus, errorThrown) {
            this.set("isSaving", false);

            if (jqXHR.status >= 400 && jqXHR.status < 500) {
                this.set("isValid", false);
                this.trigger("becameInvalid", jqXHR.responseJSON || jqXHR.responseText);
            } else {
                this.setProperties({
                    isError: true,
                    errorStatusCode: jqXHR.status
                });
                this.trigger("becameError", jqXHR.responseJSON || jqXHR.responseText);
            }

            if (jqXHR.responseJSON) {
                var res = jqXHR.responseJSON;

                if (res.errors && res.errors.length > 0) {
                    var error = res.errors[0];

                    _.each(AJAX_ERROR_PARSERS, function (ERROR_PARSER) {
                        var doesMatch = false;
                        if (_.isFunction(ERROR_PARSER.match)) {
                            doesMatch = ERROR_PARSER.match(error);
                        } else if (_.isRegExp(ERROR_PARSER.match)) {
                            doesMatch = ERROR_PARSER.match.test(error.category_code);
                        } else if (_.isString(ERROR_PARSER.match) && ERROR_PARSER.match === error.category_code) {
                            doesMatch = true;
                        } else if (!ERROR_PARSER.match) {
                            doesMatch = true;
                        }

                        if (doesMatch) {
                            error = ERROR_PARSER.parse(error);
                        }
                    });

                    this.setProperties({
                        validationErrors: Utils['default'].extractValidationErrorHash(res),
                        errorDescription: error.description,
                        requestId: error.request_id,
                        errorCategoryCode: error.category_code,
                        lastError: error
                    });
                } else {
                    if (res.description) {
                        this.set("errorDescription", res.description);
                    }

                    if (res.request_id) {
                        this.set("requestId", res.requestId);
                    }
                }
            }
        },

        _extractTypeClassFromUrisMetadata: function _extractTypeClassFromUrisMetadata(uriProperty) {
            var uriMetadataProperty = JSON_PROPERTY_KEY + "." + URI_METADATA_PROPERTY;

            var metadataType = this.get(uriMetadataProperty + "." + uriProperty + "._type");
            if (metadataType) {
                var mappedType = TypeMappings['default'].classForType(metadataType);
                if (mappedType) {
                    return mappedType;
                } else {
                    Ember['default'].Logger.warn("Couldn't map _type of %@ for URI: %@".fmt(metadataType, this.get("uri")));
                }
            }

            return undefined;
        },

        isEqual: function isEqual(a, b) {
            b = b || this;
            return Ember['default'].get(a, "id") === Ember['default'].get(b, "id");
        }
    });

    Model.reopenClass({
        getAdapter: function getAdapter() {
            return MbTestApp.__container__.lookup("adapter:main");
        },

        serializer: Rev1Serializer['default'].create(),

        find: function find(uri, settings) {
            Ember['default'].Logger.debug("Model.find: uri=", uri);
            var modelClass = this;
            var modelObject = modelClass.create({
                uri: uri
            });

            modelObject.setProperties({
                isLoaded: false,
                isNew: false
            });

            this.getAdapter().find(modelClass, uri).then(function (json) {
                Ember['default'].Logger.debug("Model.find: json=", json);
                modelObject.populateFromJsonResponse(json, uri);
            }, Ember['default'].$.proxy(modelObject._handleError, modelObject));

            //Ember.Logger.debug('modelObject:', modelObject);

            return modelObject;
        },

        fetch: function fetch(uri, settings) {
            var modelClass = this;
            var deferred = Ember['default'].RSVP.defer();
            this.getAdapter().get(modelClass, uri, function (json) {
                var object = modelClass.create({
                    uri: uri,
                    isLoaded: false,
                    isNew: false
                });
                object.populateFromJsonResponse(json, uri);
                deferred.resolve(object);
            }, function (error) {
                deferred.reject(error.responseJSON);
            });
            return deferred.promise;
        },

        findAll: function findAll(settings) {
            var uri = this.create().get("uri");

            if (!uri) {
                throw new Error("Can't call findAll for class that doesn't have a default URI: %@".fmt(this));
            }

            return ModelArray['default'].newArrayLoadedFromUri(uri, this);
        },

        constructUri: function constructUri(id) {
            var uri = this.create().get("uri");
            if (id) {
                return Utils['default'].combineUri(uri, id);
            }
            return uri;
        },

        /*
         * Used for adding a one-to-one association to a model.
         *
         * Params:
         * - propertyName - The property whose value we'll get to determine the URI
         *  or embedded data to use for the association
         *  - defaultType - Used as a fallback in case the object doesn't have a
         * _type or the _uris doesn't have data for this association
         *
         * Example:
         *
         * Marketplace = UserMarketplace.extend({
         *      owner_customer: Model.belongsTo('owner_customer_json', 'customer')
         * });
         */
        belongsTo: function belongsTo(propertyName, defaultType) {
            defaultType = defaultType || "model";

            var embeddedProperty = JSON_PROPERTY_KEY + "." + propertyName;
            var uriProperty = propertyName + URI_POSTFIX;
            var fullUriProperty = JSON_PROPERTY_KEY + "." + propertyName + URI_POSTFIX;

            return Ember['default'].computed(function () {
                var typeClass = TypeMappings['default'].typeClass(defaultType);

                var embeddedPropertyValue = this.get(embeddedProperty);
                var uriPropertyValue = this.get(fullUriProperty);

                if (embeddedPropertyValue) {
                    if (!embeddedPropertyValue._type) {
                        var response_like = {};
                        response_like[embeddedPropertyValue.type] = [embeddedPropertyValue];
                        embeddedPropertyValue = typeClass.serializer.extractSingle(response_like, typeClass) || embeddedPropertyValue;
                    }

                    var embeddedObj = typeClass._materializeLoadedObjectFromAPIResult(embeddedPropertyValue);
                    return embeddedObj;
                } else if (uriPropertyValue) {
                    var metadataTypeClass = this._extractTypeClassFromUrisMetadata(uriProperty);
                    if (metadataTypeClass) {
                        typeClass = metadataTypeClass;
                        return typeClass.find(uriPropertyValue);
                    } else {
                        // if we can't figure out what type it is from the
                        // metadata, fetch it and set the result as an embedded
                        // property in our JSON. That'll force an update of the
                        // association
                        var self = this;
                        this.constructor.getAdapter().get(defaultType, uriPropertyValue, function (json) {
                            var modelJson = typeClass.serializer.extractSingle(json, typeClass, uriPropertyValue);
                            self.set(embeddedProperty, modelJson);
                        });

                        return embeddedPropertyValue;
                    }
                } else {
                    return embeddedPropertyValue;
                }
            }).property(embeddedProperty, fullUriProperty);
        },

        belongsToWithUri: function belongsToWithUri(defaultType, uriPropertyName) {
            return Ember['default'].computed(function () {
                var typeClass = this.get("container").lookupFactory("model:" + defaultType);
                var uriPropertyValue = this.get(uriPropertyName);
                if (uriPropertyValue) {
                    return typeClass.find(uriPropertyValue);
                } else {
                    return null;
                }
            }).property(uriPropertyName);
        },

        /*
         * Used for adding a one-to-many association to a model.
         *
         * Params:
         * - propertyName - The property whose value we'll get to determine the URI
         *  or embedded data to use for the association
         *  - defaultType - Used to find/construct child objects. If the _type
         * field is present in the returned JSON, we'll map that to create objects
         * of the correct type. Since we use the type of object to pick which host
         * to use, it's important to set the defaultType, even if your returned
         * data uses the _type field.
         *
         * Example:
         *
         * Marketplace = UserMarketplace.extend({
         *      customers: Model.hasMany('customers_json', 'customer')
         * });
         */
        hasMany: function hasMany(propertyName, defaultType) {
            defaultType = defaultType || "model";

            var embeddedProperty = JSON_PROPERTY_KEY + "." + propertyName;
            var uriProperty = propertyName + URI_POSTFIX;
            var fullUriProperty = JSON_PROPERTY_KEY + "." + uriProperty;
            var uriMetadataProperty = JSON_PROPERTY_KEY + "." + URI_METADATA_PROPERTY;

            return Ember['default'].computed(function () {
                var typeClass = TypeMappings['default'].typeClass(defaultType);
                var embeddedPropertyValue = this.get(embeddedProperty);
                // if the URI isn't defined in the JSON, check for a property on
                // the model. This way we can hardcode URIs if necessary to support
                // undocumented URIs
                var uriPropertyValue = this.get(fullUriProperty) || this.get(uriProperty);

                if (embeddedPropertyValue) {
                    return ModelArray['default'].newArrayCreatedFromJson(embeddedPropertyValue, defaultType);
                } else if (uriPropertyValue) {
                    return ModelArray['default'].newArrayLoadedFromUri(uriPropertyValue, defaultType);
                } else {
                    return ModelArray['default'].create({
                        content: Ember['default'].A(),
                        typeClass: typeClass
                    });
                }
            }).property(embeddedProperty, uriProperty, fullUriProperty, uriMetadataProperty + ".@each");
        },

        _materializeLoadedObjectFromAPIResult: function _materializeLoadedObjectFromAPIResult(json) {
            //Ember.Logger.debug('ok, me. Lets test _materializeLoadedObjectFromAPIResult: ');
            //Ember.Logger.debug('input data: ');
            //Ember.Logger.debug(json);

            var objClass = this;

            if (json._type) {
                var mappedTypeClass = TypeMappings['default'].classForType(json._type);
                if (mappedTypeClass) {
                    objClass = mappedTypeClass;
                }
            } else {
                // HACK - once we fix the API response from the auth proxy, we should take out the if
                Ember['default'].Logger.warn("No _type field found on URI: " + json.uri);
            }

            var typedObj = objClass.create();
            typedObj.set("isNew", false);
            typedObj._updateFromJson(json);
            typedObj.trigger("didLoad");

            //Ember.Logger.debug('typedObj: ');
            //Ember.Logger.debug(typedObj);

            return typedObj;
        },

        _isEmbedded: function _isEmbedded(propertyName, settings) {
            settings = settings || {};

            var embedded = !/_uri$/.test(propertyName);
            if (settings.hasOwnProperty("embedded")) {
                embedded = settings.embedded;
            }

            return embedded;
        }
    });

    Model.Events = Ember['default'].Object.extend(Ember['default'].Evented).create();

    exports['default'] = Model;

});
define('mb-test-1/models/core/search-model-array', ['exports', 'ember', 'mb-test-1/models/core/model-array'], function (exports, Ember, ModelArray) {

    'use strict';

    var readOnly = function readOnly(type) {
        return Ember['default'].computed.readOnly("counts." + type);
    };

    var SearchModelArray = ModelArray['default'].extend(Ember['default'].SortableMixin, {});

    exports['default'] = SearchModelArray;

    //total_servers: readOnly('server'),
    //total_results: Computed.sumAll('total_servers')

});
define('mb-test-1/models/core/type-mappings', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var TypeMapping = Ember['default'].Object.extend({
        init: function init() {
            this.typesMap = {};
        },

        addTypeMapping: function addTypeMapping(typeCode, className) {
            this.typesMap[typeCode.toLowerCase()] = className;
        },

        classForType: function classForType(typeCode) {
            typeCode = typeCode.toLowerCase();
            var mappedType = this.typesMap[typeCode];
            if (!mappedType) {
                Ember['default'].Logger.warn("Couldn't map typeCode %@".fmt(typeCode));
            }
            return this.typeClass(mappedType);
        },

        typeClass: function typeClass(type) {
            if (_.isString(type)) {
                return this.classForType(type);
            } else {
                return type;
            }
        }
    });

    var TypeMappings = TypeMapping.create();
    exports['default'] = TypeMappings;

});
define('mb-test-1/models/floor', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            node: {
                presence: true
            }
        },
        /*name: DS.attr('string'),
        node: DS.belongsTo('node', { async: true }),
        rooms: DS.hasMany('room', { async: true })*/
        uri: "/floors",
        route_name: "floors",
        type_name: "Floor",
        type_plural: "Floors",

        node_name: (function () {
            var node = this.get("json_node");
            if (node) {
                return node.name;
            }
            return "---";
        }).property("json_node"),

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        //node: Model.belongsTo('node', 'nodes'),
        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),
        getResultsLoader: utils__model.generateResultsLoader("floors", "uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/node', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    //import DS from 'ember-data';
    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            address: {
                presence: true
            }
        },

        uri: "/nodes",
        route_name: "nodes",
        type_name: "Node",
        type_plural: "Nodes",

        //name: DS.attr('string'),
        //address: DS.attr('string'),

        //floors: DS.hasMany('floor', { async: true }),
        //racks: DS.hasMany('rack', { async: true }),
        //servers: DS.hasMany('server', { async: true }),

        /*servers_count: function(){
            return this.get('servers').get('length');
        }.property('servers'),*/

        servers: Model['default'].hasMany("servers", "server"),

        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),
        getResultsLoader: utils__model.generateResultsLoader("nodes", "uri"),

        servers_uri: (function () {
            return "/nodes/" + this.get("id") + "/servers";
        }).property("uri", "id") });

});
define('mb-test-1/models/property', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            }
        },

        uri: "/properties",
        route_name: "properties",
        type_name: "Property",
        type_plural: "Properties",

        getOptionsLoader: utils__model.generateResultsLoader("propertyoptions", "options_uri"),

        options_uri: (function () {
            return this.get("uri") + "/options";
        }).property("uri") });

});
define('mb-test-1/models/propertyoption', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model', 'mb-test-1/models/core/model-array'], function (exports, Ember, Model, utils__model, ModelArray) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            }
        },

        uri: "/properties",
        route_name: "properties",
        type_name: "PropertyOption",
        type_plural: "PropertyOptions",

        // Server Template
        getCPUSockets: function getCPUSockets() {
            return ModelArray['default'].newArrayLoadedFromUri(this.get("cpusockets_uri"), "PropertyOptions");
        },

        cpusockets_uri: (function () {
            return "/properties/cpu.socket/options";
        }).property(),

        getRAMStandards: function getRAMStandards() {
            return ModelArray['default'].newArrayLoadedFromUri(this.get("ramstandards_uri"), "PropertyOptions");
        },

        ramstandards_uri: (function () {
            return "/properties/ram.standard/options";
        }).property(),

        getHDDFormFactors: function getHDDFormFactors() {
            return ModelArray['default'].newArrayLoadedFromUri(this.get("hddformfactors_uri"), "PropertyOptions");
        },

        hddformfactors_uri: (function () {
            return "/properties/hdd.form_factor/options";
        }).property(),

        getHDDConnectionType: function getHDDConnectionType() {
            return ModelArray['default'].newArrayLoadedFromUri(this.get("hddconnectiontype_uri"), "PropertyOptions");
        },

        hddconnectiontype_uri: (function () {
            return "/properties/hdd.connection_type/options";
        }).property(),

        // Component
        getComponentKinds: function getComponentKinds() {
            return ModelArray['default'].newArrayLoadedFromUri(this.get("componentkinds_uri"), "PropertyOptions");
        },

        componentkinds_uri: (function () {
            return "/properties/component.kind/options";
        }).property() });

});
define('mb-test-1/models/rack', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            row: {
                presence: true
            },
            total_units: {
                presence: true
            }
        },
        /*name: DS.attr('string'),
        node: DS.belongsTo('node', { async: true }),
        row: DS.belongsTo('row', { async: true }),
        total_units: DS.attr('number'),
        max_gap: DS.attr('number'),
        units: DS.hasMany('unit', { async: true }),
        servers: DS.hasMany('server', { async: true })*/
        uri: "/racks",
        route_name: "racks",
        type_name: "Rack",
        type_plural: "Racks",

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        json_floor: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.floor;
            }
            this.reload().then(function () {
                return self.get("__json").floor;
            });
        }).property("__json"),

        json_room: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.room;
            }
            this.reload().then(function () {
                return self.get("__json").room;
            });
        }).property("__json"),

        json_row: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.row;
            }
            this.reload().then(function () {
                return self.get("__json").row;
            });
        }).property("__json"),

        getResultsLoader: utils__model.generateResultsLoader("racks", "uri"),
        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/results-loaders/base', ['exports', 'mb-test-1/lib/utils', 'ember', 'mb-test-1/models/core/model-array', 'mb-test-1/models/core/search-model-array', 'mb-test-1/models/results-loaders/results-loader-query-string-builder'], function (exports, Utils, Ember, ModelArray, SearchModelArray, ResultsLoaderQueryStringBuilder) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({
        limit: 50,
        sort: (function () {
            return this.get("sortDirection") + this.get("sortField");
        }).property("sortField", "sortDirection"),

        setSortField: function setSortField(field) {
            var oldValue = this.get("sortField");
            var direction = "";
            if (field === oldValue) {
                direction = this.get("sortDirection") === "asc" ? "-" : "";
            }
            this.setProperties({
                sortDirection: direction,
                sortField: field
            });
        },

        sortDirection: "-",
        sortField: "updated_at",

        resultsUri: (function () {
            var path = this.get("path");
            var query = this.get("queryStringArguments");

            if (path === undefined) {
                return undefined;
            } else {
                return Utils['default'].buildUri(path, query);
            }
        }).property("path", "queryStringArguments"),

        queryString: (function () {
            return Utils['default'].objectToQueryString(this.get("queryStringArguments"));
        }).property("queryStringArguments"),

        results: (function () {
            var uri = this.get("resultsUri");
            var type = this.get("resultsType");

            Ember['default'].Logger.debug("results-loaders.base.results: uri=", uri);

            if (Ember['default'].isBlank(uri)) {
                return ModelArray['default'].create({
                    isLoaded: true
                });
            } else {
                var searchArray = SearchModelArray['default'].newArrayLoadedFromUri(uri, type);
                searchArray.setProperties({
                    sortProperties: [this.get("sortField") || "created_at"],
                    sortAscending: this.get("sortDirection") === "asc"
                });
                return searchArray;
            }
        }).property("resultsUri", "resultsType", "sortField", "sortDirection"),

        isLoading: Ember['default'].computed.not("results.isLoaded"),

        queryStringArguments: (function () {
            var queryStringBuilder = new ResultsLoaderQueryStringBuilder['default']();
            queryStringBuilder.addValues({
                limit: this.get("limit"),
                sort: this.get("sort"),

                type: this.get("typeFilters"),
                status: this.get("statusFilters"),
                method: this.get("methodFilters"),
                endpoint: this.get("endpointFilters"),
                status_rollup: this.get("statusRollupFilters"),

                "created_at[>]": this.get("startTime"),
                "created_at[<]": this.get("endTime"),

                q: this.get("searchQuery")
            });

            return queryStringBuilder.getQueryStringAttributes();
        }).property("sort", "startTime", "endTime", "typeFilters", "statusFilters", "endpointFilters", "statusRollupFilters", "limit")
    });

});
define('mb-test-1/models/results-loaders/baskets', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/basket'], function (exports, BaseResultsLoader, Basket) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Basket['default'] });

});
define('mb-test-1/models/results-loaders/components', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/component'], function (exports, BaseResultsLoader, Component) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Component['default'] });

});
define('mb-test-1/models/results-loaders/floors', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/floor'], function (exports, BaseResultsLoader, Floor) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Floor['default'] });

});
define('mb-test-1/models/results-loaders/nodes', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/node'], function (exports, BaseResultsLoader, Node) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Node['default'] });

});
define('mb-test-1/models/results-loaders/properties', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/property'], function (exports, BaseResultsLoader, Property) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Property['default'] });

});
define('mb-test-1/models/results-loaders/propertyoptions', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/propertyoption'], function (exports, BaseResultsLoader, PropertyOption) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: PropertyOption['default'] });

});
define('mb-test-1/models/results-loaders/racks', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/rack'], function (exports, BaseResultsLoader, Rack) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Rack['default'] });

});
define('mb-test-1/models/results-loaders/results-loader-query-string-builder', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var isSerializableDate = function isSerializableDate(value) {
    return _.isDate(value) || moment.isMoment(value);
  };

  exports['default'] = Ember['default'].Object.extend({
    queryStringAttributes: {},

    addValues: function addValues(object) {
      var self = this;
      _.each(object, function (value, key) {
        self.addValue(key, value);
      });
    },

    addValue: function addValue(key, value) {
      if (Ember['default'].isArray(value)) {
        if (value.length === 1) {
          return this.queryStringAttributes[key] = value[0];
        } else if (value.length > 1) {
          return this.queryStringAttributes[key + "[in]"] = value.join(",");
        }
      } else if (isSerializableDate(value)) {
        return this.queryStringAttributes[key] = value.toISOString();
      } else if (!Ember['default'].isBlank(value)) {
        return this.queryStringAttributes[key] = value;
      }
    },

    getQueryStringAttributes: function getQueryStringAttributes() {
      return this.queryStringAttributes;
    }

  });

});
define('mb-test-1/models/results-loaders/rooms', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/room'], function (exports, BaseResultsLoader, Room) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Room['default'] });

});
define('mb-test-1/models/results-loaders/rows', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/row'], function (exports, BaseResultsLoader, Row) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: Row['default'] });

});
define('mb-test-1/models/results-loaders/servers', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/server'], function (exports, BaseResultsLoader, Server) {

    'use strict';

    var ServersResultsLoader = BaseResultsLoader['default'].extend({
        resultsType: Server['default'] });

    exports['default'] = ServersResultsLoader;

});
define('mb-test-1/models/results-loaders/servertemplates', ['exports', 'mb-test-1/models/results-loaders/base', 'mb-test-1/models/servertemplate'], function (exports, BaseResultsLoader, ServerTemplate) {

    'use strict';

    exports['default'] = BaseResultsLoader['default'].extend({
        resultsType: ServerTemplate['default'] });

});
define('mb-test-1/models/room', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            floor: {
                presence: true
            }
        },

        /*name: DS.attr('string'),
        floor: DS.belongsTo('floor', { async: true }),
        rows: DS.hasMany('row', { async: true })*/
        uri: "/rooms",
        route_name: "rooms",
        type_name: "Room",
        type_plural: "Rooms",

        node_name: (function () {
            var node = this.get("json_node");
            if (node) {
                return node.name;
            }
            return "---";
        }).property("json_node"),

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        floor_name: (function () {
            var obj = this.get("json_floor");
            if (obj) {
                return obj.name;
            }
            return "---";
        }).property("json_floor"),

        json_floor: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.floor;
            }
            this.reload().then(function () {
                return self.get("__json").floor;
            });
        }).property("__json"),

        //floor: Model.belongsTo('floor', 'floors'),
        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),
        getResultsLoader: utils__model.generateResultsLoader("rooms", "uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/row', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            room: {
                presence: true
            }
        },
        /*name: DS.attr('string'),
        room: DS.belongsTo('room', { async: true }),
        racks: DS.hasMany('rack', { async: true })*/
        uri: "/rows",
        route_name: "rows",
        type_name: "Row",
        type_plural: "Rows",

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        json_floor: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.floor;
            }
            this.reload().then(function () {
                return self.get("__json").floor;
            });
        }).property("__json"),

        json_room: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.room;
            }
            this.reload().then(function () {
                return self.get("__json").room;
            });
        }).property("__json"),

        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),
        getResultsLoader: utils__model.generateResultsLoader("rows", "uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/server', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            template: {
                presence: true
            }
        },
        uri: "/servers",
        route_name: "servers",
        type_name: "Server",
        type_plural: "Servers",

        json_node: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.node;
            }
            this.reload().then(function () {
                return self.get("__json").node;
            });
        }).property("__json"),

        json_floor: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.floor;
            }
            this.reload().then(function () {
                return self.get("__json").floor;
            });
        }).property("__json"),

        json_room: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.room;
            }
            this.reload().then(function () {
                return self.get("__json").room;
            });
        }).property("__json"),

        json_row: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.row;
            }
            this.reload().then(function () {
                return self.get("__json").row;
            });
        }).property("__json"),

        json_rack: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.rack;
            }
            this.reload().then(function () {
                return self.get("__json").rack;
            });
        }).property("__json"),

        json_basket: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.basket;
            }
            this.reload().then(function () {
                return self.get("__json").basket;
            });
        }).property("__json"),

        json_template: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.template;
            }
            this.reload().then(function () {
                return self.get("__json").template;
            });
        }).property("__json"),

        getResultsLoader: utils__model.generateResultsLoader("servers", "uri"),
        getComponentsLoader: utils__model.generateResultsLoader("components", "components_uri"),

        components_uri: (function () {
            return this.get("uri") + "/components";
        }).property("uri") });

});
define('mb-test-1/models/servertemplate', ['exports', 'ember', 'mb-test-1/models/core/model', 'mb-test-1/utils/model'], function (exports, Ember, Model, utils__model) {

    'use strict';

    exports['default'] = Model['default'].extend(Ember['default'].Validations, {
        validations: {
            name: {
                presence: true
            },
            cpu_socket: {
                presence: true
            },
            cpu_qty: {
                presence: true
            },
            ram_standard: {
                presence: true
            },
            ram_qty: {
                presence: true
            },
            unit_takes: {
                presence: true
            }
        },
        /*name: DS.attr('string'),
        cpu_socket: DS.belongsTo('property-option', { async: true }),
        cpu_qty: DS.attr('number'),
        ram_standard: DS.belongsTo('property-option', { async: true }),
        ram_qty: DS.attr('number'),
        unit_takes: DS.attr('number'),
        hdds: DS.hasMany('server-template-hdd', { async: true })*/
        uri: "/servertemplates",
        route_name: "servertemplates",
        type_name: "ServerTemplate",
        type_plural: "ServerTemplates",

        json_cpu_socket: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.cpu_socket;
            }
            this.reload().then(function () {
                return self.get("__json").cpu_socket;
            });
        }).property("__json"),

        json_ram_standard: (function () {
            var json = this.get("__json");
            var self = this;
            if (json) {
                return json.ram_standard;
            }
            this.reload().then(function () {
                return self.get("__json").ram_standard;
            });
        }).property("__json"),

        getResultsLoader: utils__model.generateResultsLoader("servertemplates", "uri"),
        getServersLoader: utils__model.generateResultsLoader("servers", "servers_uri"),

        servers_uri: (function () {
            return this.get("uri") + "/servers";
        }).property("uri") });

});
define('mb-test-1/models/unit', ['exports', 'mb-test-1/models/core/model'], function (exports, Model) {

    'use strict';

    exports['default'] = Model['default'].extend({
        /*rack: DS.belongsTo('rack', { async: true }),
        position: DS.attr('number'),
        basket: DS.belongsTo('basket', { async: true }),
        server: DS.belongsTo('server', { async: true })*/
        uri: '/units',
        route_name: 'units',
        type_name: 'Unit',
        type_plural: 'Units' });

});
define('mb-test-1/router', ['exports', 'ember', 'mb-test-1/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  exports['default'] = Router.map(function () {
    this.route('nodes', { path: '/nodes' });
    this.route('node', { path: '/nodes/:node_id' });

    this.route('racks', { path: '/racks' });
    this.route('rack', { path: '/racks/:rack_id' });

    this.route('rows', { path: '/rows' });
    this.route('row', { path: '/rows/:row_id' });

    this.route('rooms', { path: '/rooms' });
    this.route('room', { path: '/rooms/:room_id' });

    this.route('floors', { path: '/floors' });
    this.route('floor', { path: '/floors/:floor_id' });

    this.route('servers', { path: '/servers' });
    this.route('server', { path: '/servers/:server_id' });

    this.route('baskets', { path: '/baskets' });
    this.route('basket', { path: '/baskets/:basket_id' });

    this.route('servertemplates', { path: '/servertemplates' });
    this.route('servertemplate', { path: '/servertemplates/:servertemplate_id' });

    this.route('components', { path: '/components' });
    this.route('component', { path: '/components/:component_id' });
  });

});
define('mb-test-1/routes/application', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var INFINITE_LOOP_DURATION_MILLIS = 2500;
    var INFINITE_LOOP_NUM_ERRORS = 5;

    var ApplicationRoute = Ember['default'].Route.extend(Ember['default'].Evented, {
        init: function init() {
            this.set('errorTimestamps', []);
        },

        redirect: function redirect() {
            this.transitionTo('nodes');
        },

        actions: {
            closeModal: function closeModal() {
                return this.container.lookup('controller:modals-container').close();
            },

            openModal: function openModal(klass) {
                var container = this.get('container');
                var args = _.toArray(arguments).slice(1);
                return container.lookup('controller:modals-container').open(klass, args);
            },

            error: function error(_error, transition) {
                if (!window.TESTING) {
                    // Check for an infinite loop of error handling and short-circuit
                    // if we've seen too many errors in too short a period
                    var errorTimestamps = this.get('errorTimestamps');
                    var currentTimestamp = new Date().getTime();
                    errorTimestamps.push(currentTimestamp);
                    if (errorTimestamps.length > INFINITE_LOOP_NUM_ERRORS) {
                        var filtered = _.filter(errorTimestamps, function (t) {
                            return t > currentTimestamp - INFINITE_LOOP_DURATION_MILLIS;
                        });

                        this.set('errorTimestamps', filtered);
                        if (filtered.length > INFINITE_LOOP_NUM_ERRORS) {
                            this.get('auth').forgetLogin();
                            this.transitionTo('login');

                            return;
                        }
                    }
                }

                // the error object could be an ember object or a jqxhr
                var statusCode = _error.errorStatusCode || _error.status;
                var uri = _error.uri;

                Ember['default'].Logger.error('Error while loading route (%@: %@): '.fmt(statusCode, uri), _error.stack || _error.message || _error.name || _error);

                // if we had a problem loading the marketplace, check that it's not the current
                // marketplace, since that might send us into an infinite loop
                if (_error.get && _error.get('uri') === this.get('auth').getLastUsedMarketplaceUri()) {
                    this.get('auth').forgetLastUsedMarketplaceUri();
                }

                if (statusCode === 401 || statusCode === 403) {
                    if (_error.get && _error.get('uri')) {
                        // if we loaded an ember object and got a 401/403, let's forget about the transition
                        this.get('auth').set('attemptedTransition', null);

                        this.controllerFor('notification_center').alertError('You are not permitted to access this resource.');
                        this.transitionTo('marketplaces');
                    } else if (transition) {
                        this.get('auth').set('attemptedTransition', transition);

                        // If we're not authorized, need to log in (maybe as a different user),
                        // so let's log out
                        this.get('auth').forgetLogin();
                        this.transitionTo('login');
                    }
                } else if (statusCode === 404) {
                    this.controllerFor('notification_center').alertError('Couldn\'t find the resource for this page, please make sure the URL is valid.');
                    this.transitionTo('marketplaces');
                } else {
                    var controller = this.controllerFor('notification_center');
                    var name = 'PageLoadError';

                    controller.clearNamedAlert(name);
                    controller.alertError('There was an error loading this page.', {
                        name: name
                    });
                    this.transitionTo('marketplaces');
                }
            },

            willTransition: function willTransition() {
                this.controllerFor('modals_container').close();
                this.controllerFor('notification_center').expireAlerts();
            }
        }
    });

    exports['default'] = ApplicationRoute;

});
define('mb-test-1/routes/basket', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:basket');
            var uri = model.constructUri(params.basket_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/baskets', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/basket'], function (exports, TitleRoute, Basket) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Basket List",
        model: function model(params) {
            var instance = Basket['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/component', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:component');
            var uri = model.constructUri(params.component_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/components', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/component'], function (exports, TitleRoute, Component) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Component List",
        model: function model(params) {
            var instance = Component['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/floor', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:floor');
            var uri = model.constructUri(params.floor_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/floors', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/floor'], function (exports, TitleRoute, Floor) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Floor List",
        model: function model(params) {
            var instance = Floor['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/model', ['exports', 'mb-test-1/routes/title', 'mb-test-1/lib/utils'], function (exports, TitleRoute, Utils) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        model: function model(params) {
            /*var marketplace = this.modelFor('marketplace');
            var modelObject = this.get('modelObject');
            var uri = this.get('marketplaceUri');
             return marketplace.then(function(marketplace) {
                var modelUri = Utils.combineUri(marketplace.get(uri), params.item_id);
                return modelObject.find(modelUri);
            });*/
            var modelObject = this.get("modelObject");
            var modelUri = params.item_id;
            console.log("TitleRoute:model: before return");
            return modelObject.find(modelUri);
        }
    });

});
define('mb-test-1/routes/node', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var Node = this.get('container').lookupFactory('model:node');
            var nodeUri = Node.constructUri(params.node_id);
            return Node.find(nodeUri);
        }
    });

});
define('mb-test-1/routes/node/servers', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        pageTitle: "Servers",
        model: function model() {
            var node = this.modelFor("node");
            return node.getServersLoader();
        } });

});
define('mb-test-1/routes/nodes', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/node'], function (exports, TitleRoute, Node) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Node List",
        model: function model(params) {
            //var ret = Node.findAll();
            //Ember.Logger.debug('Route->Nodes->model: ');
            //Ember.Logger.debug(ret);
            //return ret;//*/
            var node = Node['default'].create();
            return node.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/rack', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:rack');
            var uri = model.constructUri(params.rack_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/racks', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/rack'], function (exports, TitleRoute, Rack) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Rack List",
        model: function model(params) {
            var instance = Rack['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/room', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:room');
            var uri = model.constructUri(params.room_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/rooms', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/room'], function (exports, TitleRoute, Room) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Room List",
        model: function model(params) {
            var instance = Room['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/row', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:row');
            var uri = model.constructUri(params.row_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/rows', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/row'], function (exports, TitleRoute, Row) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Row List",
        model: function model(params) {
            var instance = Row['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/server', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:server');
            var uri = model.constructUri(params.server_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/servers', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/server'], function (exports, TitleRoute, Server) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Server List",
        model: function model(params) {
            var instance = Server['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/servertemplate', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            var model = this.get('container').lookupFactory('model:servertemplate');
            var uri = model.constructUri(params.servertemplate_id);
            return model.find(uri);
        }
    });

});
define('mb-test-1/routes/servertemplates', ['exports', 'mb-test-1/routes/title', 'mb-test-1/models/servertemplate'], function (exports, TitleRoute, ServerTemplate) {

    'use strict';

    exports['default'] = TitleRoute['default'].extend({
        title: "Server Template List",
        model: function model(params) {
            var instance = ServerTemplate['default'].create();
            return instance.getResultsLoader();
        }
    });

});
define('mb-test-1/routes/title', ['exports', 'mb-test-1/lib/utils', 'ember'], function (exports, Utils, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        title: "Model",

        pageTitle: function pageTitle(route, setTitle) {
            var model = route.controller.get("content");
            var title = route.get("title");

            return Utils['default'].maybeDeferredLoading(model, setTitle, function () {
                return title + ": loading ...";
            }, function () {
                return title + ": %@".fmt(model.get("page_title"));
            });
        }
    });

});
define('mb-test-1/serializers/application', ['exports', 'mb-test-1/serializers/rev1'], function (exports, Rev1) {

	'use strict';

	exports['default'] = Rev1['default'];

});
define('mb-test-1/serializers/rev0', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var JSON_PROPERTY_KEY = '__json';

    var Rev0Serializer = Ember['default'].Object.extend({
        //  properties which are not echoed back to the server
        privateProperties: ['id', 'uri', 'validationErrors', JSON_PROPERTY_KEY, 'links', '_type'],

        serialize: function serialize(record) {
            var json = this._propertiesMap(record);
            return json;
        },

        extractSingle: function extractSingle(rootJson, type, href) {
            return rootJson;
        },

        extractCollection: function extractCollection(rootJson) {
            return rootJson;
        },

        // Taken from http://stackoverflow.com/questions/9211844/reflection-on-emberjs-objects-how-to-find-a-list-of-property-keys-without-knowi
        _propertiesMap: function _propertiesMap(record) {
            var computedProps = [];
            record.constructor.eachComputedProperty(function (prop) {
                computedProps.push(prop);
            });

            var lifecycleProperties = ['isLoaded', 'isNew', 'isSaving', 'isValid', 'isError', 'isDeleted'];

            var props = {};
            for (var prop in record) {
                if (record.hasOwnProperty(prop) && $.inArray(prop, computedProps) === -1 && $.inArray(prop, lifecycleProperties) === -1 && $.inArray(prop, this.privateProperties) === -1 && prop.indexOf('__ember') < 0 && prop.indexOf('_super') < 0 && Ember['default'].typeOf(record.get(prop)) !== 'function') {
                    props[prop] = record[prop];
                }
            }

            return props;
        }
    });

    exports['default'] = Rev0Serializer;

});
define('mb-test-1/serializers/rev1', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var JSON_PROPERTY_KEY = '__json';
    var LINKS_PROPERTY_KEY = '__links';
    var EMBEDDED_DATA_PROPERTY_KEY = '__embedded';

    var Rev1Serializer = Ember['default'].Object.extend({
        //  properties which are not echoed back to the server
        privateProperties: ['id', 'uri', 'validationErrors', JSON_PROPERTY_KEY, LINKS_PROPERTY_KEY, EMBEDDED_DATA_PROPERTY_KEY, '_type', 'links'],

        serialize: function serialize(record) {
            Ember['default'].Logger.debug('Rev1Serializer.serialize:', record);
            var attributes = this._propertiesMap(record);
            var json = {};
            json.data = attributes;
            return json;
        },

        extractSingle: function extractSingle(rawPayload, href) {
            var included_storage = Ember['default'].Object.createWithMixins(Ember['default'].Copyable);
            var payload = this.normalizePayload(rawPayload, included_storage);
            var primaryRecord;

            Ember['default'].Logger.debug('extractSingle: rawPayload=', rawPayload);

            if (!!!payload.data) {
                Ember['default'].warn('Key <data> is required in payload.');
                return null;
            }

            var value = payload.data;
            if (value === null) {
                return null;
            }

            if (Ember['default'].typeOf(value) === 'array') {
                Ember['default'].warn('Single object have to be returned under the key <data>.');
                return null;
            }

            //var typeName = value['type'];
            primaryRecord = this.normalize(value, included_storage);

            Ember['default'].Logger.debug('extractSingle: primaryRecord=', primaryRecord);

            return primaryRecord;
        },

        extractCollection: function extractCollection(rawPayload) {
            var self = this;
            var included_storage = Ember['default'].Object.createWithMixins(Ember['default'].Copyable);

            var nextUri = rawPayload.links ? rawPayload.links.next : null;
            var counts = rawPayload.meta ? rawPayload.meta.counts : null;
            var total = rawPayload.meta ? rawPayload.meta.total : null;

            var payload = this.normalizePayload(rawPayload, included_storage);

            if (Ember['default'].typeOf(payload.data) !== 'array') {
                Ember['default'].warn('Array must be returned.');
                return null;
            }

            var collection = [];
            payload.data.forEach(function (value) {
                collection.push(self.normalize(value, included_storage));
            });

            return {
                items: collection,
                //linked: linked,
                next_uri: nextUri,
                counts: counts,
                total: total
            };
        },

        resolveLink: function resolveLink(linkage, included_storage) {
            Ember['default'].Logger.debug('resoliveLink: linkage=', linkage);
            var collection_of_type = included_storage[linkage.type];
            var original = collection_of_type[linkage.id];
            return Ember['default'].copy(original, true);
        },

        /**
        * Flatten links
        */
        normalize: function normalize(hash, included_storage) {
            if (!hash) {
                return hash;
            }

            var key, relation, linkage, relation_key;
            var json = {};
            var links = hash.links;
            var meta = hash.meta;
            delete hash.links;
            delete hash.meta;

            if (links && links.self) {
                json.uri = links.self;
                delete links.self;
            }

            if (Ember['default'].typeOf('links') === 'object') {
                json.uri = links.self;
                delete links.self;
            }

            for (key in hash) {
                json[key] = hash[key];
            }
            json._type = json.type;
            delete json.type;

            if (Ember['default'].typeOf(links) === 'object') {
                for (relation_key in links) {
                    relation = links[relation_key];
                    if (!!!relation) {
                        json[relation_key] = null;
                        continue;
                    }
                    linkage = relation.linkage;
                    if (!!!linkage) {
                        Ember['default'].warn('Attribute <linkage> cannot be null.');
                        json[relation_key] = null;
                        continue;
                    }
                    if (Ember['default'].typeOf(linkage) === 'array') {
                        json[relation_key] = [];
                        for (var i = 0, l = linkage.length; i < l; i++) {
                            json[relation_key].push(this.resolveLink(linkage[i], included_storage));
                        }
                    } else if (Ember['default'].typeOf(linkage) === 'object') {
                        json[relation_key] = this.resolveLink(linkage, included_storage);
                    }
                }
            }
            return json;
        },

        /**
        * Extract top-level "links" before normalizing.
        */
        normalizePayload: function normalizePayload(payload, included_storage) {
            if (payload.included) {
                this.extractIncluded(payload.included, included_storage);
                delete payload.included;
            }
            return payload;
        },

        /*
        * Extract top-level "included" containing associated objects
        */
        extractIncluded: function extractIncluded(included, storage) {
            var link, value, relation;
            var typeName, objectId, linkage, linkedTypeName, relationId;

            // fill storage at first
            for (var i = 0, l = included.length; i < l; i++) {
                value = included[i];
                value._type = value.type;
                delete value.type;
                typeName = value._type;
                objectId = value.id + '';
                storage[typeName] = storage[typeName] || {};
                storage[typeName][objectId] = value;
            }

            // find && replace 'links'
            for (typeName in storage) {
                for (objectId in storage[typeName]) {
                    value = Ember['default'].copy(storage[typeName][objectId], true);
                    if (!value.links) {
                        continue;
                    }
                    for (relation in value.links) {
                        linkage = value.links[relation].linkage;
                        // linkage is 'null'
                        if (!!!linkage) {
                            continue;
                        }
                        relationId = linkage.id + '';
                        linkedTypeName = linkage.type;
                        value[relation] = Ember['default'].copy(storage[linkedTypeName][relationId], true);
                    }
                    delete value.links;
                    storage[typeName][objectId] = value;
                }
            }
        },

        // Taken from http://stackoverflow.com/questions/9211844/reflection-on-emberjs-objects-how-to-find-a-list-of-property-keys-without-knowi
        _propertiesMap: function _propertiesMap(record) {
            var self = this;
            var computedProps = [];
            record.constructor.eachComputedProperty(function (prop) {
                computedProps.push(prop);
            });

            var lifecycleProperties = ['isLoaded', 'isNew', 'isSaving', 'isValid', 'isError', 'isDeleted'];

            var props = {};
            for (var prop in record) {
                if (record.hasOwnProperty(prop) && Ember['default'].$.inArray(prop, computedProps) === -1 && Ember['default'].$.inArray(prop, lifecycleProperties) === -1 && Ember['default'].$.inArray(prop, this.privateProperties) === -1 && prop.indexOf('__ember') < 0 && prop.indexOf('_super') < 0 && Ember['default'].typeOf(record.get(prop)) !== 'function') {
                    if (Ember['default'].typeOf(record[prop]) === 'array') {
                        props[prop] = [];
                        record[prop].forEach(function (value, index) {
                            props[prop][index] = self._propertiesMap(value);
                        });
                    } else {
                        props[prop] = Ember['default'].String.htmlSafe(record[prop]).string;
                    }
                }
            }

            return props;
        }
    });

    exports['default'] = Rev1Serializer;

});
define('mb-test-1/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","starter-template");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.container ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2, 1]),1,1);
        var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "render", ["navigation"], {});
        content(env, morph1, context, "outlet");
        inline(env, morph2, context, "render", ["modals-container"], {});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/basket', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/basket-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Basket", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/baskets', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a basket");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/basket-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Basket List"}, child0, null);
        inline(env, morph1, context, "view", ["results/baskets-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/component', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/component-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Property List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/component-properties-table"], {"loader": get(env, context, "propertiesResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Component", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/components', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a component");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/component-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Component List"}, child0, null);
        inline(env, morph1, context, "view", ["results/components-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/components/link-li', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/detail-views/key-value', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("dd");
            var el2 = dom.createElement("a");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1, 0]);
            var morph0 = dom.createMorphAt(element0,0,0);
            element(env, element0, context, "bind-attr", [], {"href": get(env, context, "view.link")});
            content(env, morph0, context, "view.value");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("dd");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            content(env, morph0, context, "view.value");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("dt");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          content(env, morph0, context, "view.key");
          block(env, morph1, context, "if", [get(env, context, "view.hasLink")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "view.value")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/detail-views/side-panel-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.panelTitle");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "view.panelTitle")], {}, child0, null);
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/detail-views/titled-key-values-section', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","pull-right delete-model-link text-danger");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-trash-o");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          element(env, element1, context, "action", ["openModal", get(env, context, "view.deleteModelModalClass"), get(env, context, "view.model")], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","pull-right edit-model-link");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-edit");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "action", ["openModal", get(env, context, "view.editModelModalClass"), get(env, context, "view.model")], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", [get(env, context, "item")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","key-value-display");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("dl");
        dom.setAttribute(el2,"class","dl-horizontal");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [3]);
        var morph0 = dom.createMorphAt(element3,1,1);
        var morph1 = dom.createMorphAt(element3,3,3);
        var morph2 = dom.createMorphAt(element3,4,4);
        var morph3 = dom.createMorphAt(element4,1,1);
        var morph4 = dom.createMorphAt(element4,3,3);
        content(env, morph0, context, "view.title");
        block(env, morph1, context, "if", [get(env, context, "view.deleteModelModalClass")], {}, child0, null);
        block(env, morph2, context, "if", [get(env, context, "view.editModelModalClass")], {}, child1, null);
        block(env, morph3, context, "each", [get(env, context, "view.keyValueListViews")], {"keyword": "item"}, child2, null);
        content(env, morph4, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/floor', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/floor-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Floor", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/floors', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a floor");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/floor-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Floor List"}, child0, null);
        inline(env, morph1, context, "view", ["results/floors-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/form-fields/base-form-field', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "input", [], {"viewName": "inputElement", "name": get(env, context, "view.inputName"), "type": get(env, context, "view.inputType"), "value": get(env, context, "view.value"), "class": get(env, context, "view.inputClassNames"), "maxlength": get(env, context, "view.maxlength")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/form-fields/form-field-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1,"class","icon-tooltip");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["popover"], {"data-trigger": "hover", "data-placement": "left", "data-original-title": get(env, context, "view.tooltipTitle"), "data-content": get(env, context, "view.tooltipContent"), "data-html": "true"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            content(env, morph0, context, "view.errorMessages");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                    ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("li");
              var el2 = dom.createComment("");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
              content(env, morph0, context, "message");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("ul");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("            ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
            block(env, morph0, context, "each", [get(env, context, "view.errorMessages")], {"keyword": "message"}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-error");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.isOneError")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-info");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.explanationText");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("label");
        dom.setAttribute(el1,"class","control-label");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        var morph3 = dom.createMorphAt(fragment,4,4,contextualElement);
        var morph4 = dom.createMorphAt(fragment,6,6,contextualElement);
        dom.insertBoundary(fragment, null);
        element(env, element0, context, "bind-attr", [], {"for": get(env, context, "view.inputElement.elementId")});
        content(env, morph0, context, "view.labelText");
        block(env, morph1, context, "if", [get(env, context, "view.tooltipContent")], {}, child0, null);
        content(env, morph2, context, "yield");
        block(env, morph3, context, "if", [get(env, context, "view.isError")], {}, child1, null);
        block(env, morph4, context, "if", [get(env, context, "view.explanationText")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/form-fields/form-section', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","description col-md-4");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.sectionDescription");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pull-right col-md-8");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
        content(env, morph0, context, "view.sectionTitle");
        block(env, morph1, context, "if", [get(env, context, "view.sectionDescription")], {}, child0, null);
        content(env, morph2, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/form-fields/select-form-field', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["select"], {"class": "full", "content": get(env, context, "view.content"), "optionValuePath": get(env, context, "view.optionValuePath"), "optionLabelPath": get(env, context, "view.optionLabelPath"), "value": get(env, context, "view.value"), "selection": get(env, context, "view.selection"), "name": get(env, context, "view.name"), "prompt": get(env, context, "view.prompt"), "disabled": get(env, context, "view.disabled")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/form-fields/textarea-form-field', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "textarea", [], {"viewName": "textAreaElement", "name": get(env, context, "view.inputName"), "value": get(env, context, "view.value"), "class": get(env, context, "view.inputClassNames"), "maxlength": get(env, context, "view.maxlength")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/base-modal-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal-dialog");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-header");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","close");
        dom.setAttribute(el4,"data-dismiss","modal");
        var el5 = dom.createElement("i");
        dom.setAttribute(el5,"class","fa fa-times");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 3]),0,0);
        var morph1 = dom.createMorphAt(element0,3,3);
        content(env, morph0, context, "view.title");
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/basket-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Height in units", "field": "unit_takes", "name": "unit_takes"});
          inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Total slots Qty", "field": "slot_qty", "name": "slot_qty"});
          inline(env, morph3, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.racksForSelect"), "value": get(env, context, "view.parentView.selectedRack"), "labelText": "Rack", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "rack", "field": "rack", "prompt": "---"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/basket-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this basket?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/basket-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Height in units", "field": "unit_takes"});
          inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Total slots Qty", "field": "slot_qty"});
          inline(env, morph3, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.racksForSelect"), "value": get(env, context, "view.parentView.selectedRack"), "labelText": "Rack", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "rack", "field": "rack", "prompt": "---"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Basket information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/component-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Manufacturer", "field": "manufacturer", "name": "manufacturer"});
          inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Model name", "field": "model_name", "name": "model_name"});
          inline(env, morph3, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Serial number", "field": "serial_number", "name": "serial_number"});
          inline(env, morph4, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.kindsForSelect"), "value": get(env, context, "view.parentView.selectedKind"), "labelText": "Kind", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "kind", "field": "kind"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/component-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this component?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/component-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Manufacturer", "field": "manufacturer", "name": "manufacturer"});
          inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Model name", "field": "model_name", "name": "model_name"});
          inline(env, morph3, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Serial number", "field": "serial_number", "name": "serial_number"});
          inline(env, morph4, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.kindsForSelect"), "value": get(env, context, "view.parentView.selectedKind"), "labelText": "Kind", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "kind", "field": "kind", "disabled": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/floor-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.nodesForSelect"), "value": get(env, context, "view.model.node"), "labelText": "Node", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "node", "field": "node"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/floor-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this floor?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/floor-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.nodesForSelect"), "value": get(env, context, "view.parentView.selectedNode"), "labelText": "Node", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "node", "field": "node"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Floor information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/form-modal-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","balanced-logo-24");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          dom.setAttribute(el1,"class","description");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.description");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.subtitle");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal-dialog");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-content");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-header");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","close");
        dom.setAttribute(el4,"data-dismiss","modal");
        var el5 = dom.createElement("i");
        dom.setAttribute(el5,"class","icon-x");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("h2");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-body clearfix");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(element1,3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [5]),0,0);
        var morph2 = dom.createMorphAt(element1,7,7);
        var morph3 = dom.createMorphAt(element1,8,8);
        var morph4 = dom.createMorphAt(dom.childAt(element2, [1]),1,1);
        var morph5 = dom.createMorphAt(element2,3,3);
        block(env, morph0, context, "if", [get(env, context, "view.logo")], {}, child0, null);
        content(env, morph1, context, "view.title");
        block(env, morph2, context, "if", [get(env, context, "view.description")], {}, child1, null);
        block(env, morph3, context, "if", [get(env, context, "view.subtitle")], {}, child2, null);
        element(env, element2, context, "action", ["save"], {"on": "submit", "target": get(env, context, "view")});
        content(env, morph4, context, "yield");
        inline(env, morph5, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "beforeSubmitText": get(env, context, "view.beforeSubmitText"), "cancelButtonText": get(env, context, "view.cancelButtonText"), "submitButtonText": get(env, context, "view.submitButtonText")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/full-modal-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal-header");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"class","close");
        dom.setAttribute(el2,"data-dismiss","modal");
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","icon-x");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 3]),0,0);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        content(env, morph0, context, "view.title");
        content(env, morph1, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/modal-base-footer', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("button");
          dom.setAttribute(el1,"class","btn secondary");
          dom.setAttribute(el1,"type","button");
          dom.setAttribute(el1,"name","modal-cancel");
          dom.setAttribute(el1,"data-dismiss","modal");
          dom.setAttribute(el1,"aria-hidden","true");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,0,0);
          element(env, element0, context, "bind-attr", [], {"disabled": "view.isSaving"});
          content(env, morph0, context, "view.cancelButtonText");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","before-submit-text");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1,"type","submit");
        dom.setAttribute(el1,"name","modal-submit");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph2 = dom.createMorphAt(element1,0,0);
        content(env, morph0, context, "view.beforeSubmitText");
        block(env, morph1, context, "if", [get(env, context, "view.cancelButtonText")], {}, child0, null);
        element(env, element1, context, "bind-attr", [], {"disabled": "view.isSaving", "class": ":btn view.isSaving:disabled"});
        content(env, morph2, context, "view.submitButtonText");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/modal-errors', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert alert-error modal-content-error");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          content(env, morph0, context, "view.model.errorDescription");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "view.model.displayErrorDescription")], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/node-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/textarea-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Address", "field": "address", "name": "address"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/node-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this node?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/node-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/textarea-form-field"], {"model": get(env, context, "view.model"), "labelText": "Address", "field": "address", "maxlength": 434});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Node information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/rack-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Total units", "field": "total_units", "name": "total_units"});
          inline(env, morph2, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.rowsForSelect"), "value": get(env, context, "view.parentView.selectedRow"), "labelText": "Row", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "row", "field": "row"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/rack-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this rack?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/rack-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Total units", "field": "total_units"});
          inline(env, morph2, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.rowsForSelect"), "value": get(env, context, "view.parentView.selectedRow"), "labelText": "Row", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "row", "field": "row"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Rack information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/room-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.floorsForSelect"), "value": get(env, context, "view.model.floor"), "labelText": "Floor", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "floor", "field": "floor"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/room-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this room?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/room-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.floorsForSelect"), "value": get(env, context, "view.parentView.selectedFloor"), "labelText": "Floor", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "floor", "field": "floor"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Room information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/row-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "inputClassNames": "full", "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.roomsForSelect"), "value": get(env, context, "view.parentView.selectedRoom"), "labelText": "Room", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "room", "field": "room"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/row-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this row?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/row-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.roomsForSelect"), "value": get(env, context, "view.parentView.selectedRoom"), "labelText": "Room", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "room", "field": "room"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Row information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/server-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.templatesForSelect"), "value": get(env, context, "view.parentView.selectedTemplate"), "labelText": "Server template", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "template", "field": "template"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/server-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this server?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/server-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name"});
          inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.templatesForSelect"), "value": get(env, context, "view.parentView.selectedTemplate"), "labelText": "Server Template", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "template", "field": "template", "disabled": true});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model"), "sectionTitle": "Basket information"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/servertemplate-add-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","hdd-row clearfix");
            dom.setAttribute(el1,"style","background:#e6e6e6;padding:6px;margin:6px 0px;");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,1,1);
            var morph1 = dom.createMorphAt(element0,3,3);
            var morph2 = dom.createMorphAt(element0,5,5);
            inline(env, morph0, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "hdd"), "content": get(env, context, "view.parentView.hddFormFactorsForSelect"), "labelText": "HDD Form Factor", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "hdd_form_factor", "field": "hdd_form_factor"});
            inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "hdd"), "content": get(env, context, "view.parentView.hddConnectionTypeForSelect"), "labelText": "HDD Connection Type", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "hdd_connection_type", "field": "hdd_connection_type"});
            inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "hdd"), "labelText": "HDD Qty", "name": "hdd_qty", "field": "hdd_qty"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","hdds clearfix");
          dom.setAttribute(el1,"style","margin:10px 0;");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","clearfix");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          var el4 = dom.createTextNode("Add HDD");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [13]);
          var element2 = dom.childAt(element1, [3, 1]);
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          var morph5 = dom.createMorphAt(fragment,11,11,contextualElement);
          var morph6 = dom.createMorphAt(element1,1,1);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Unit takes", "field": "unit_takes", "name": "unit_takes"});
          inline(env, morph2, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.cpuSocketsForSelect"), "value": get(env, context, "view.parentView.selectedCPUSocket"), "labelText": "CPU Socket", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "cpu_socket", "field": "cpu_socket"});
          inline(env, morph3, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "CPU Quantity", "field": "cpu_qty", "name": "cpu_qty"});
          inline(env, morph4, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.ramStandardsForSelect"), "value": get(env, context, "view.parentView.selectedRAMStandard"), "labelText": "RAM Standard", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "ram_standard", "field": "ram_standard"});
          inline(env, morph5, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "RAM Quantity", "field": "ram_qty", "name": "ram_qty"});
          block(env, morph6, context, "each", [get(env, context, "view.model.hdds")], {"keyword": "hdd"}, child0, null);
          element(env, element2, context, "action", ["addHdd"], {"on": "click", "target": get(env, context, "view.parentView")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/servertemplate-delete-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-body modal-info");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("p");
        var el5 = dom.createTextNode("Are you sure you want to delete this server template?");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,3,3);
        element(env, element0, context, "action", ["save", get(env, context, "view.model")], {"target": "view", "on": "submit"});
        inline(env, morph0, context, "view", ["modals/modal-base-footer"], {"isSaving": get(env, context, "view.isSaving"), "submitButtonText": "Delete"});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/modals/servertemplate-update-modal', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","hdd-row clearfix");
            dom.setAttribute(el1,"style","background:#e6e6e6;padding:6px;margin:6px 0px;");
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,1,1);
            var morph1 = dom.createMorphAt(element0,3,3);
            var morph2 = dom.createMorphAt(element0,5,5);
            inline(env, morph0, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "hdd"), "content": get(env, context, "view.parentView.hddFormFactorsForSelect"), "value": get(env, context, "hdd.hdd_form_factor"), "labelText": "HDD Form Factor", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "hdd_form_factor", "field": "hdd_form_factor"});
            inline(env, morph1, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "hdd"), "content": get(env, context, "view.parentView.hddConnectionTypeForSelect"), "value": get(env, context, "hdd.hdd_connection_type"), "labelText": "HDD Connection Type", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "hdd_connection_type", "field": "hdd_connection_type"});
            inline(env, morph2, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "hdd"), "labelText": "HDD Qty", "name": "hdd_qty", "field": "hdd_qty"});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","hdds clearfix");
          dom.setAttribute(el1,"style","margin:10px 0;");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","clearfix");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("button");
          var el4 = dom.createTextNode("Add HDD");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [13]);
          var element2 = dom.childAt(element1, [3, 1]);
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,3,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,5,5,contextualElement);
          var morph3 = dom.createMorphAt(fragment,7,7,contextualElement);
          var morph4 = dom.createMorphAt(fragment,9,9,contextualElement);
          var morph5 = dom.createMorphAt(fragment,11,11,contextualElement);
          var morph6 = dom.createMorphAt(element1,1,1);
          inline(env, morph0, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Name", "field": "name", "name": "name"});
          inline(env, morph1, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "Unit takes", "field": "unit_takes", "name": "unit_takes"});
          inline(env, morph2, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.cpuSocketsForSelect"), "value": get(env, context, "view.parentView.selectedCPUSocket"), "labelText": "CPU Socket", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "cpu_socket", "field": "cpu_socket"});
          inline(env, morph3, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "CPU Quantity", "field": "cpu_qty", "name": "cpu_qty"});
          inline(env, morph4, context, "view", ["form-fields/select-form-field"], {"model": get(env, context, "view.model"), "content": get(env, context, "view.parentView.ramStandardsForSelect"), "value": get(env, context, "view.parentView.selectedRAMStandard"), "labelText": "RAM Standard", "optionValuePath": "content.value", "optionLabelPath": "content.label", "name": "ram_standard", "field": "ram_standard"});
          inline(env, morph5, context, "view", ["form-fields/text-form-field"], {"model": get(env, context, "view.model"), "labelText": "RAM Quantity", "field": "ram_qty", "name": "ram_qty"});
          block(env, morph6, context, "each", [get(env, context, "view.model.hdds")], {"keyword": "hdd"}, child0, null);
          element(env, element2, context, "action", ["addHdd"], {"on": "click", "target": get(env, context, "view.parentView")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["form-fields/form-section"], {"model": get(env, context, "view.model")}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/navigation', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "link-to", [get(env, context, "link.title"), get(env, context, "link.location")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "link-li", [], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" Brand and toggle get grouped for better mobile display ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","navbar-header");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"class","navbar-toggle collapsed");
        dom.setAttribute(el3,"data-toggle","collapse");
        dom.setAttribute(el3,"data-target","#bs-example-navbar-collapse-1");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","sr-only");
        var el5 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","icon-bar");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" Collect the nav links, forms, and other content for toggling ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","collapse navbar-collapse");
        dom.setAttribute(el2,"id","bs-example-navbar-collapse-1");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","nav navbar-nav");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" /.navbar-collapse ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.container-fluid ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3]),3,3);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [7, 1]),1,1);
        inline(env, morph0, context, "link-to", [get(env, context, "title"), "nodes"], {"classNames": "navbar-brand"});
        block(env, morph1, context, "each", [get(env, context, "model")], {"keyword": "link"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/node', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/node-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Node", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/nodes', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a node");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/node-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Node List"}, child0, null);
        inline(env, morph1, context, "view", ["results/nodes-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/notification-center', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
              dom.insertBoundary(fragment, null);
              dom.insertBoundary(fragment, 0);
              content(env, morph0, context, "alert.linkText");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            block(env, morph0, context, "link-to", [get(env, context, "alert.linkTo")], {}, child0, null);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","alert-row");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","notification-center-message");
          var el4 = dom.createTextNode("\n                ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("span");
          dom.setAttribute(el4,"class","message");
          var el5 = dom.createComment("");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n");
          dom.appendChild(el3, el4);
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          var element1 = dom.childAt(element0, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,0);
          var morph1 = dom.createMorphAt(element1,3,3);
          element(env, element0, context, "bind-attr", [], {"class": ":row-fluid :notification-center alert.type"});
          content(env, morph0, context, "alert.message");
          block(env, morph1, context, "if", [get(env, context, "alert.linkText")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "each", [get(env, context, "controller")], {"keyword": "alert"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/page-navigations/page-navigation-layout', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","page-type");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
          content(env, morph0, context, "view.pageType");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","page-navigation clearfix");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","page-title");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(element0,1,1);
        var morph1 = dom.createMorphAt(element0,3,3);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.pageType")], {}, child0, null);
        content(env, morph1, context, "yield");
        content(env, morph2, context, "view.title");
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/rack', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/rack-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Rack", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/racks', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a rack");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/rack-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Rack List"}, child0, null);
        inline(env, morph1, context, "view", ["results/racks-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/baskets-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 9});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),0,0);
          var morph4 = dom.createMorphAt(element0,9,9);
          var morph5 = dom.createMorphAt(element0,11,11);
          var morph6 = dom.createMorphAt(element0,13,13);
          var morph7 = dom.createMorphAt(element0,15,15);
          var morph8 = dom.createMorphAt(element0,17,17);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "basket", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          content(env, morph2, context, "result.slot_qty");
          content(env, morph3, context, "result.unit_takes");
          inline(env, morph4, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "rack", "item": get(env, context, "result.json_rack.id"), "labelText": get(env, context, "result.json_rack.name")});
          inline(env, morph5, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "row", "item": get(env, context, "result.json_row.id"), "labelText": get(env, context, "result.json_row.name")});
          inline(env, morph6, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "result.json_room.id"), "labelText": get(env, context, "result.json_room.name")});
          inline(env, morph7, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "result.json_floor.id"), "labelText": get(env, context, "result.json_floor.name")});
          inline(env, morph8, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "result.json_node.id"), "labelText": get(env, context, "result.json_node.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Baskets\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","9");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Slot Qty");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Unit Takes");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Rack");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Row");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Room");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/component-properties-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createElement("span");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createElement("span");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 0]),0,0);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 0]),0,0);
          content(env, morph0, context, "prop.title");
          content(env, morph1, context, "prop.value");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","2");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("No properties");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-4");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Title");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-8");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Value");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        block(env, morph0, context, "each", [get(env, context, "view.loader.results")], {"keyword": "prop"}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/components-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 8});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),0,0);
          var morph4 = dom.createMorphAt(dom.childAt(element0, [9]),0,0);
          var morph5 = dom.createMorphAt(dom.childAt(element0, [11]),0,0);
          var morph6 = dom.createMorphAt(dom.childAt(element0, [13]),0,0);
          var morph7 = dom.createMorphAt(element0,15,15);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "component", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          content(env, morph2, context, "result.manufacturer");
          content(env, morph3, context, "result.model_name");
          content(env, morph4, context, "result.serial_number");
          content(env, morph5, context, "result.json_kind.name");
          content(env, morph6, context, "result.state");
          inline(env, morph7, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "server", "item": get(env, context, "result.json_server.id"), "labelText": get(env, context, "result.json_server.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Components\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","8");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Manufacturer");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Model name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Serial Number");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Kind");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("State");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Server");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/floors-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 3});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(element0,5,5);
          content(env, morph0, context, "floor.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "floor"), "labelText": get(env, context, "floor.name")});
          inline(env, morph2, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "floor.json_node.id"), "labelText": get(env, context, "floor.node_name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Floors\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","3");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "floor"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/node-servers-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "basket", "item": get(env, context, "server.basket.id"), "labelText": get(env, context, "server.basket.name")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createTextNode("---");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child2 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "rack", "item": get(env, context, "server.rack.id"), "labelText": get(env, context, "server.rack.name")});
            return fragment;
          }
        };
      }());
      var child3 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createTextNode("---");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child4 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "row", "item": get(env, context, "server.row.id"), "labelText": get(env, context, "server.row.name")});
            return fragment;
          }
        };
      }());
      var child5 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createTextNode("---");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child6 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "server.room.id"), "labelText": get(env, context, "server.room.name")});
            return fragment;
          }
        };
      }());
      var child7 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createTextNode("---");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child8 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "server.floor.id"), "labelText": get(env, context, "server.floor.name")});
            return fragment;
          }
        };
      }());
      var child9 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("td");
            var el2 = dom.createTextNode("---");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(element0,5,5);
          var morph3 = dom.createMorphAt(element0,7,7);
          var morph4 = dom.createMorphAt(element0,9,9);
          var morph5 = dom.createMorphAt(element0,11,11);
          var morph6 = dom.createMorphAt(element0,13,13);
          content(env, morph0, context, "server.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "server", "item": get(env, context, "server.id"), "labelText": get(env, context, "server.name")});
          block(env, morph2, context, "if", [get(env, context, "server.basket")], {}, child0, child1);
          block(env, morph3, context, "if", [get(env, context, "server.rack")], {}, child2, child3);
          block(env, morph4, context, "if", [get(env, context, "server.row")], {}, child4, child5);
          block(env, morph5, context, "if", [get(env, context, "server.room")], {}, child6, child7);
          block(env, morph6, context, "if", [get(env, context, "server.floor")], {}, child8, child9);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","7");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("No servers");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Basket");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Rack");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Row");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Room");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        block(env, morph0, context, "each", [get(env, context, "view.loader.results")], {"keyword": "server"}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/nodes-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 3});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          content(env, morph0, context, "node.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "node"), "labelText": get(env, context, "node.name")});
          content(env, morph2, context, "node.servers_count");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Nodes\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","3");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-2");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Server Qty");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "node"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/racks-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 8});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),0,0);
          var morph4 = dom.createMorphAt(element0,9,9);
          var morph5 = dom.createMorphAt(element0,11,11);
          var morph6 = dom.createMorphAt(element0,13,13);
          var morph7 = dom.createMorphAt(element0,15,15);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "rack", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          content(env, morph2, context, "result.total_units");
          content(env, morph3, context, "result.max_gap");
          inline(env, morph4, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "row", "item": get(env, context, "result.json_row.id"), "labelText": get(env, context, "result.json_row.name")});
          inline(env, morph5, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "result.json_room.id"), "labelText": get(env, context, "result.json_room.name")});
          inline(env, morph6, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "result.json_floor.id"), "labelText": get(env, context, "result.json_floor.name")});
          inline(env, morph7, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "result.json_node.id"), "labelText": get(env, context, "result.json_node.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Racks\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","8");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Units");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Max gap");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Row");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Room");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/results-load-more', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","loader-container");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-spin fa-spinner");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("\n            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","btn secondary");
            var el2 = dom.createTextNode("Load more");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "action", ["loadMore", get(env, context, "view.results")], {"target": get(env, context, "view")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" ");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "view.results.hasNextPage")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("tr");
        dom.setAttribute(el1,"class","load-more-results");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("td");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(element1,1,1);
        element(env, element1, context, "bind-attr", [], {"colspan": get(env, context, "view.columns")});
        block(env, morph0, context, "if", [get(env, context, "view.results.loadingNextPage")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/rooms-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 4});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(element0,5,5);
          var morph3 = dom.createMorphAt(element0,7,7);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          inline(env, morph2, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "result.json_floor.id"), "labelText": get(env, context, "result.json_floor.name")});
          inline(env, morph3, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "result.json_node.id"), "labelText": get(env, context, "result.json_node.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Rooms\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","4");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/rows-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 5});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(element0,5,5);
          var morph3 = dom.createMorphAt(element0,7,7);
          var morph4 = dom.createMorphAt(element0,9,9);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "row", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          inline(env, morph2, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "result.json_room.id"), "labelText": get(env, context, "result.json_room.name")});
          inline(env, morph3, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "result.json_floor.id"), "labelText": get(env, context, "result.json_floor.name")});
          inline(env, morph4, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "result.json_node.id"), "labelText": get(env, context, "result.json_node.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Rows\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","5");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Room");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/server-components-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          content(env, morph0, context, "component.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "component", "item": get(env, context, "component.id"), "labelText": get(env, context, "component.name")});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","2");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          var el4 = dom.createTextNode("No components");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        block(env, morph0, context, "each", [get(env, context, "view.loader.results")], {"keyword": "component"}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/servers-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 8});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(element0,5,5);
          var morph3 = dom.createMorphAt(element0,7,7);
          var morph4 = dom.createMorphAt(element0,9,9);
          var morph5 = dom.createMorphAt(element0,11,11);
          var morph6 = dom.createMorphAt(element0,13,13);
          var morph7 = dom.createMorphAt(element0,15,15);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "server", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          inline(env, morph2, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "servertemplate", "item": get(env, context, "result.json_template.id"), "labelText": get(env, context, "result.json_template.name")});
          inline(env, morph3, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "rack", "item": get(env, context, "result.json_rack.id"), "labelText": get(env, context, "result.json_rack.name")});
          inline(env, morph4, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "row", "item": get(env, context, "result.json_row.id"), "labelText": get(env, context, "result.json_row.name")});
          inline(env, morph5, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "room", "item": get(env, context, "result.json_room.id"), "labelText": get(env, context, "result.json_room.name")});
          inline(env, morph6, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "floor", "item": get(env, context, "result.json_floor.id"), "labelText": get(env, context, "result.json_floor.name")});
          inline(env, morph7, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "node", "item": get(env, context, "result.json_node.id"), "labelText": get(env, context, "result.json_node.name")});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Servers\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","8");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Template");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Rack");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Row");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Room");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Floor");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Node");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/results/servertemplates-table', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
          inline(env, morph0, context, "view", ["results/results-load-more"], {"results": get(env, context, "view.loader.results"), "columns": 3});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
          var morph1 = dom.createMorphAt(element0,3,3);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
          content(env, morph0, context, "result.id");
          inline(env, morph1, context, "view", ["tables/cells/titled-linked-cell"], {"routeName": "servertemplate", "item": get(env, context, "result"), "labelText": get(env, context, "result.name")});
          content(env, morph2, context, "result.servers_uses");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    No Server Templates\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    Loading...\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          dom.setAttribute(el2,"colspan","3");
          dom.setAttribute(el2,"class","no-results");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),1,1);
          block(env, morph0, context, "if", [get(env, context, "view.loader.results.isLoaded")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("thead");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("tr");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-1");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("ID");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Name");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("th");
        dom.setAttribute(el3,"class","col-xs-2");
        var el4 = dom.createElement("span");
        var el5 = dom.createTextNode("Servers uses");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("tbody");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,2,2,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        block(env, morph0, context, "if", [get(env, context, "view.loader.results.hasNextPage")], {}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "view.loader.results")], {"keyword": "result"}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/room', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/room-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Room", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/rooms', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a room");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/room-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Room List"}, child0, null);
        inline(env, morph1, context, "view", ["results/rooms-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/row', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/row-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Row", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/rows', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a row");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/row-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Row List"}, child0, null);
        inline(env, morph1, context, "view", ["results/rows-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/server', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/server-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Component List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/server-components-table"], {"loader": get(env, context, "componentsResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Server", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/servers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a server");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/server-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Server List"}, child0, null);
        inline(env, morph1, context, "view", ["results/servers-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/servertemplate', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
            inline(env, morph0, context, "view", ["detail-views/description-lists/servertemplate-titled-key-values-section"], {"model": get(env, context, "model")});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("Server List");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","results");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            inline(env, morph0, context, "view", ["results/node-servers-table"], {"loader": get(env, context, "serversResultsLoader")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "view", ["detail-views/api-model-panel"], {"model": get(env, context, "model")}, child0, null);
          block(env, morph1, context, "view", ["detail-views/main-panel"], {}, child1, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        inline(env, morph0, context, "view", ["page-navigations/page-navigation"], {"pageType": "Server Template", "title": get(env, context, "model.name")});
        block(env, morph1, context, "view", ["detail-views/body-panel"], {}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/servertemplates', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","buttons page-actions");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn");
          var el3 = dom.createTextNode("Add a server template");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["openModal", "modals/servertemplate-add-modal"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","results-actions-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","results");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","items-wrapper");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [4, 1]),1,1);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "view", ["page-navigations/page-navigation"], {"title": "Server Template List"}, child0, null);
        inline(env, morph1, context, "view", ["results/servertemplates-table"], {"loader": get(env, context, "resultsLoader")});
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/templates/tables/cells/linked-text-cell', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
              inline(env, morph0, context, "sentence-case", [get(env, context, "view.displayValue")], {});
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            revision: "Ember@1.11.1",
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("        ");
              dom.appendChild(el0, el1);
              var el1 = dom.createComment("");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              var morph0 = dom.createMorphAt(fragment,1,1,contextualElement);
              content(env, morph0, context, "view.displayValue");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          revision: "Ember@1.11.1",
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("\n");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,1,1);
            element(env, element0, context, "bind-attr", [], {"class": "view.isBlank:sl-none view.spanClassNames"});
            block(env, morph0, context, "if", [get(env, context, "view.isStatusCell")], {}, child0, child1);
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, null);
          dom.insertBoundary(fragment, 0);
          block(env, morph0, context, "link-to", [get(env, context, "view.routeName"), get(env, context, "view.item")], {}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        revision: "Ember@1.11.1",
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("---");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      revision: "Ember@1.11.1",
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, null);
        dom.insertBoundary(fragment, 0);
        block(env, morph0, context, "if", [get(env, context, "view.item")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mb-test-1/tests/adapters/ajax.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/ajax.js should pass jshint', function() { 
    ok(true, 'adapters/ajax.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/adapters/base.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/base.js should pass jshint', function() { 
    ok(true, 'adapters/base.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/components/link-li.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/link-li.js should pass jshint', function() { 
    ok(true, 'components/link-li.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/components/modal.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/modal.js should pass jshint', function() { 
    ok(true, 'components/modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/basket.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/basket.js should pass jshint', function() { 
    ok(true, 'controllers/basket.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/baskets.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/baskets.js should pass jshint', function() { 
    ok(true, 'controllers/baskets.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/component.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/component.js should pass jshint', function() { 
    ok(true, 'controllers/component.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/components.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/components.js should pass jshint', function() { 
    ok(true, 'controllers/components.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/floor.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/floor.js should pass jshint', function() { 
    ok(true, 'controllers/floor.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/floors.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/floors.js should pass jshint', function() { 
    ok(true, 'controllers/floors.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/modal-notification-center.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/modal-notification-center.js should pass jshint', function() { 
    ok(true, 'controllers/modal-notification-center.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/modals-container.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/modals-container.js should pass jshint', function() { 
    ok(true, 'controllers/modals-container.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/navigation.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/navigation.js should pass jshint', function() { 
    ok(true, 'controllers/navigation.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/node.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/node.js should pass jshint', function() { 
    ok(true, 'controllers/node.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/nodes.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/nodes.js should pass jshint', function() { 
    ok(true, 'controllers/nodes.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/notification-center.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/notification-center.js should pass jshint', function() { 
    ok(true, 'controllers/notification-center.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/rack.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/rack.js should pass jshint', function() { 
    ok(true, 'controllers/rack.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/racks.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/racks.js should pass jshint', function() { 
    ok(true, 'controllers/racks.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/room.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/room.js should pass jshint', function() { 
    ok(true, 'controllers/room.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/rooms.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/rooms.js should pass jshint', function() { 
    ok(true, 'controllers/rooms.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/row.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/row.js should pass jshint', function() { 
    ok(true, 'controllers/row.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/rows.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/rows.js should pass jshint', function() { 
    ok(true, 'controllers/rows.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/server.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/server.js should pass jshint', function() { 
    ok(true, 'controllers/server.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/servers.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/servers.js should pass jshint', function() { 
    ok(true, 'controllers/servers.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/servertemplate.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/servertemplate.js should pass jshint', function() { 
    ok(true, 'controllers/servertemplate.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/controllers/servertemplates.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/servertemplates.js should pass jshint', function() { 
    ok(true, 'controllers/servertemplates.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/helpers/resolver', ['exports', 'ember/resolver', 'mb-test-1/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('mb-test-1/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/helpers/start-app', ['exports', 'ember', 'mb-test-1/app', 'mb-test-1/router', 'mb-test-1/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('mb-test-1/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/initializers/env-injector-initializer.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/env-injector-initializer.js should pass jshint', function() { 
    ok(true, 'initializers/env-injector-initializer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/initializers/mbtest-app-global-initializer.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/mbtest-app-global-initializer.js should pass jshint', function() { 
    ok(true, 'initializers/mbtest-app-global-initializer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/initializers/models-adapter-initializer.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/models-adapter-initializer.js should pass jshint', function() { 
    ok(true, 'initializers/models-adapter-initializer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/initializers/result-loaders-initializer.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/result-loaders-initializer.js should pass jshint', function() { 
    ok(true, 'initializers/result-loaders-initializer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/initializers/type-mappings-initializer.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/type-mappings-initializer.js should pass jshint', function() { 
    ok(true, 'initializers/type-mappings-initializer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/ajax.jshint', function () {

  'use strict';

  module('JSHint - lib');
  test('lib/ajax.js should pass jshint', function() { 
    ok(true, 'lib/ajax.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/connections/api-connection.jshint', function () {

  'use strict';

  module('JSHint - lib/connections');
  test('lib/connections/api-connection.js should pass jshint', function() { 
    ok(true, 'lib/connections/api-connection.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/connections/auth-connection.jshint', function () {

  'use strict';

  module('JSHint - lib/connections');
  test('lib/connections/auth-connection.js should pass jshint', function() { 
    ok(true, 'lib/connections/auth-connection.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/connections/base-connection.jshint', function () {

  'use strict';

  module('JSHint - lib/connections');
  test('lib/connections/base-connection.js should pass jshint', function() { 
    ok(true, 'lib/connections/base-connection.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/ember-data/system/store/common.jshint', function () {

  'use strict';

  module('JSHint - lib/ember-data/system/store');
  test('lib/ember-data/system/store/common.js should pass jshint', function() { 
    ok(true, 'lib/ember-data/system/store/common.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/ember-data/system/store/serializers.jshint', function () {

  'use strict';

  module('JSHint - lib/ember-data/system/store');
  test('lib/ember-data/system/store/serializers.js should pass jshint', function() { 
    ok(true, 'lib/ember-data/system/store/serializers.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/lib/utils.jshint', function () {

  'use strict';

  module('JSHint - lib');
  test('lib/utils.js should pass jshint', function() { 
    ok(false, 'lib/utils.js should pass jshint.\nlib/utils.js: line 8, col 5, \'SPACE_REPLACE_REGEX\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/models/basket.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/basket.js should pass jshint', function() { 
    ok(true, 'models/basket.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/component.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/component.js should pass jshint', function() { 
    ok(true, 'models/component.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/core/mixins/load-promise.jshint', function () {

  'use strict';

  module('JSHint - models/core/mixins');
  test('models/core/mixins/load-promise.js should pass jshint', function() { 
    ok(false, 'models/core/mixins/load-promise.js should pass jshint.\nmodels/core/mixins/load-promise.js: line 8, col 5, \'PENDING\' is defined but never used.\nmodels/core/mixins/load-promise.js: line 9, col 5, \'SEALED\' is defined but never used.\nmodels/core/mixins/load-promise.js: line 10, col 5, \'FULFILLED\' is defined but never used.\n\n3 errors'); 
  });

});
define('mb-test-1/tests/models/core/model-array.jshint', function () {

  'use strict';

  module('JSHint - models/core');
  test('models/core/model-array.js should pass jshint', function() { 
    ok(false, 'models/core/model-array.js should pass jshint.\nmodels/core/model-array.js: line 6, col 3, \'_bind\' is defined but never used.\nmodels/core/model-array.js: line 7, col 3, \'_guard\' is defined but never used.\nmodels/core/model-array.js: line 8, col 3, \'_objectIsAlive\' is defined but never used.\nmodels/core/model-array.js: line 11, col 3, \'serializerForAdapter\' is defined but never used.\nmodels/core/model-array.js: line 14, col 5, \'Promise\' is defined but never used.\nmodels/core/model-array.js: line 145, col 47, \'errorThrown\' is defined but never used.\nmodels/core/model-array.js: line 145, col 35, \'textStatus\' is defined but never used.\n\n7 errors'); 
  });

});
define('mb-test-1/tests/models/core/model.jshint', function () {

  'use strict';

  module('JSHint - models/core');
  test('models/core/model.js should pass jshint', function() { 
    ok(false, 'models/core/model.js should pass jshint.\nmodels/core/model.js: line 287, col 26, Don\'t make functions within a loop.\nmodels/core/model.js: line 82, col 32, \'ValidationServerErrorHandler\' is not defined.\nmodels/core/model.js: line 13, col 5, \'INTEGER_REGEX\' is defined but never used.\nmodels/core/model.js: line 146, col 76, \'json\' is defined but never used.\nmodels/core/model.js: line 300, col 47, \'errorThrown\' is defined but never used.\nmodels/core/model.js: line 300, col 35, \'textStatus\' is defined but never used.\nmodels/core/model.js: line 385, col 25, \'settings\' is defined but never used.\nmodels/core/model.js: line 409, col 26, \'settings\' is defined but never used.\nmodels/core/model.js: line 428, col 23, \'settings\' is defined but never used.\n\n9 errors'); 
  });

});
define('mb-test-1/tests/models/core/search-model-array.jshint', function () {

  'use strict';

  module('JSHint - models/core');
  test('models/core/search-model-array.js should pass jshint', function() { 
    ok(false, 'models/core/search-model-array.js should pass jshint.\nmodels/core/search-model-array.js: line 5, col 5, \'readOnly\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/models/core/type-mappings.jshint', function () {

  'use strict';

  module('JSHint - models/core');
  test('models/core/type-mappings.js should pass jshint', function() { 
    ok(true, 'models/core/type-mappings.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/floor.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/floor.js should pass jshint', function() { 
    ok(true, 'models/floor.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/node.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/node.js should pass jshint', function() { 
    ok(true, 'models/node.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/property.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/property.js should pass jshint', function() { 
    ok(true, 'models/property.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/propertyoption.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/propertyoption.js should pass jshint', function() { 
    ok(false, 'models/propertyoption.js should pass jshint.\nmodels/propertyoption.js: line 3, col 10, \'generateResultsLoader\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/models/rack.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/rack.js should pass jshint', function() { 
    ok(true, 'models/rack.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/base.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/base.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/base.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/baskets.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/baskets.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/baskets.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/components.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/components.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/components.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/floors.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/floors.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/floors.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/nodes.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/nodes.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/nodes.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/properties.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/properties.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/properties.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/propertyoptions.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/propertyoptions.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/propertyoptions.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/racks.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/racks.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/racks.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/results-loader-query-string-builder.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/results-loader-query-string-builder.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/results-loader-query-string-builder.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/rooms.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/rooms.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/rooms.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/rows.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/rows.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/rows.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/servers.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/servers.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/servers.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/results-loaders/servertemplates.jshint', function () {

  'use strict';

  module('JSHint - models/results-loaders');
  test('models/results-loaders/servertemplates.js should pass jshint', function() { 
    ok(true, 'models/results-loaders/servertemplates.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/room.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/room.js should pass jshint', function() { 
    ok(true, 'models/room.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/row.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/row.js should pass jshint', function() { 
    ok(true, 'models/row.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/server.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/server.js should pass jshint', function() { 
    ok(true, 'models/server.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/servertemplate.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/servertemplate.js should pass jshint', function() { 
    ok(true, 'models/servertemplate.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/models/unit.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/unit.js should pass jshint', function() { 
    ok(true, 'models/unit.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/basket.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/basket.js should pass jshint', function() { 
    ok(true, 'routes/basket.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/baskets.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/baskets.js should pass jshint', function() { 
    ok(false, 'routes/baskets.js should pass jshint.\nroutes/baskets.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/component.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/component.js should pass jshint', function() { 
    ok(true, 'routes/component.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/components.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/components.js should pass jshint', function() { 
    ok(false, 'routes/components.js should pass jshint.\nroutes/components.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/floor.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/floor.js should pass jshint', function() { 
    ok(true, 'routes/floor.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/floors.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/floors.js should pass jshint', function() { 
    ok(false, 'routes/floors.js should pass jshint.\nroutes/floors.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/model.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/model.js should pass jshint', function() { 
    ok(false, 'routes/model.js should pass jshint.\nroutes/model.js: line 2, col 8, \'Utils\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/node.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/node.js should pass jshint', function() { 
    ok(true, 'routes/node.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/node/servers.jshint', function () {

  'use strict';

  module('JSHint - routes/node');
  test('routes/node/servers.js should pass jshint', function() { 
    ok(true, 'routes/node/servers.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/nodes.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/nodes.js should pass jshint', function() { 
    ok(false, 'routes/nodes.js should pass jshint.\nroutes/nodes.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/rack.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/rack.js should pass jshint', function() { 
    ok(true, 'routes/rack.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/racks.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/racks.js should pass jshint', function() { 
    ok(false, 'routes/racks.js should pass jshint.\nroutes/racks.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/room.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/room.js should pass jshint', function() { 
    ok(true, 'routes/room.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/rooms.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/rooms.js should pass jshint', function() { 
    ok(false, 'routes/rooms.js should pass jshint.\nroutes/rooms.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/row.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/row.js should pass jshint', function() { 
    ok(true, 'routes/row.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/rows.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/rows.js should pass jshint', function() { 
    ok(false, 'routes/rows.js should pass jshint.\nroutes/rows.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/server.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/server.js should pass jshint', function() { 
    ok(true, 'routes/server.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/servers.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/servers.js should pass jshint', function() { 
    ok(false, 'routes/servers.js should pass jshint.\nroutes/servers.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/servertemplate.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/servertemplate.js should pass jshint', function() { 
    ok(true, 'routes/servertemplate.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/routes/servertemplates.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/servertemplates.js should pass jshint', function() { 
    ok(false, 'routes/servertemplates.js should pass jshint.\nroutes/servertemplates.js: line 6, col 21, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/routes/title.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/title.js should pass jshint', function() { 
    ok(true, 'routes/title.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/serializers/rev0.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/rev0.js should pass jshint', function() { 
    ok(false, 'serializers/rev0.js should pass jshint.\nserializers/rev0.js: line 34, col 17, \'$\' is not defined.\nserializers/rev0.js: line 35, col 17, \'$\' is not defined.\nserializers/rev0.js: line 36, col 17, \'$\' is not defined.\nserializers/rev0.js: line 14, col 45, \'href\' is defined but never used.\nserializers/rev0.js: line 14, col 39, \'type\' is defined but never used.\n\n5 errors'); 
  });

});
define('mb-test-1/tests/serializers/rev1.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/rev1.js should pass jshint', function() { 
    ok(false, 'serializers/rev1.js should pass jshint.\nserializers/rev1.js: line 217, col 22, Don\'t make functions within a loop.\nserializers/rev1.js: line 20, col 41, \'href\' is defined but never used.\nserializers/rev1.js: line 95, col 13, \'meta\' is defined but never used.\nserializers/rev1.js: line 156, col 13, \'link\' is defined but never used.\n\n4 errors'); 
  });

});
define('mb-test-1/tests/test-helper', ['mb-test-1/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('mb-test-1/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/components/link-li-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent('link-li', {});

  ember_qunit.test('it renders', function (assert) {
    assert.expect(2);

    // Creates the component instance
    var component = this.subject();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    this.render();
    assert.equal(component._state, 'inDOM');
  });

  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('mb-test-1/tests/unit/components/link-li-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/link-li-test.js should pass jshint', function() { 
    ok(true, 'unit/components/link-li-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/controllers/navigation-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:navigation', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/controllers/navigation-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/navigation-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/navigation-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/controllers/nodes-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:nodes', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/controllers/nodes-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/nodes-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/nodes-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/controllers/nodesdetail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:nodesdetail', {});

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/controllers/nodesdetail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/nodesdetail-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/nodesdetail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/basket-slot-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('basket-slot', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/basket-slot-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/basket-slot-test.js should pass jshint', function() { 
    ok(true, 'unit/models/basket-slot-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/basket-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('basket', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/basket-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/basket-test.js should pass jshint', function() { 
    ok(true, 'unit/models/basket-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/component-property-value-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('component-property-value', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/component-property-value-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/component-property-value-test.js should pass jshint', function() { 
    ok(true, 'unit/models/component-property-value-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/component-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('component', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/component-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/component-test.js should pass jshint', function() { 
    ok(true, 'unit/models/component-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/components-properties-relation-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('components-properties-relation', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/components-properties-relation-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/components-properties-relation-test.js should pass jshint', function() { 
    ok(true, 'unit/models/components-properties-relation-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/floor-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('floor', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/floor-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/floor-test.js should pass jshint', function() { 
    ok(true, 'unit/models/floor-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/groups-properties-relation-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('groups-properties-relation', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/groups-properties-relation-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/groups-properties-relation-test.js should pass jshint', function() { 
    ok(true, 'unit/models/groups-properties-relation-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/node-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('node', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/node-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/node-test.js should pass jshint', function() { 
    ok(true, 'unit/models/node-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/property-option-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('property-option', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/property-option-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/property-option-test.js should pass jshint', function() { 
    ok(true, 'unit/models/property-option-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/property-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('property', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/property-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/property-test.js should pass jshint', function() { 
    ok(true, 'unit/models/property-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/propertygroup-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('propertygroup', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/propertygroup-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/propertygroup-test.js should pass jshint', function() { 
    ok(true, 'unit/models/propertygroup-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/rack-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('rack', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/rack-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/rack-test.js should pass jshint', function() { 
    ok(true, 'unit/models/rack-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/room-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('room', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/room-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/room-test.js should pass jshint', function() { 
    ok(true, 'unit/models/room-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/row-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('row', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/row-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/row-test.js should pass jshint', function() { 
    ok(true, 'unit/models/row-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/server-template-hdd-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('server-template-hdd', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/server-template-hdd-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/server-template-hdd-test.js should pass jshint', function() { 
    ok(true, 'unit/models/server-template-hdd-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/server-template-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('server-template', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/server-template-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/server-template-test.js should pass jshint', function() { 
    ok(true, 'unit/models/server-template-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/server-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('server', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/server-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/server-test.js should pass jshint', function() { 
    ok(true, 'unit/models/server-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/models/unit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('unit', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mb-test-1/tests/unit/models/unit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/unit-test.js should pass jshint', function() { 
    ok(true, 'unit/models/unit-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/basket-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:basket-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/basket-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/basket-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/basket-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/baskets-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:baskets', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/baskets-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/baskets-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/baskets-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/floor-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:floor-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/floor-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/floor-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/floor-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/floors-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:floors', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/floors-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/floors-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/floors-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/node-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:node', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/node-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/node-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/node-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/nodesdetail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:nodesdetail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/nodesdetail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/nodesdetail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/nodesdetail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/rack-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:rack-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/rack-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/rack-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/rack-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/racks-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:racks', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/racks-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/racks-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/racks-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/room-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:room-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/room-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/room-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/room-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/rooms-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:rooms', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/rooms-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/rooms-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/rooms-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/row-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:row-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/row-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/row-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/row-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/rows-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:rows', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/rows-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/rows-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/rows-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/server-detail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:server-detail', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/server-detail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/server-detail-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/server-detail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/routes/servers-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:servers', {});

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mb-test-1/tests/unit/routes/servers-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/servers-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/servers-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/views/navigation-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('view:navigation');

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('mb-test-1/tests/unit/views/navigation-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/navigation-test.js should pass jshint', function() { 
    ok(true, 'unit/views/navigation-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/unit/views/nodesdetail-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('view:nodesdetail');

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('mb-test-1/tests/unit/views/nodesdetail-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/nodesdetail-test.js should pass jshint', function() { 
    ok(true, 'unit/views/nodesdetail-test.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/utils/computed.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/computed.js should pass jshint', function() { 
    ok(true, 'utils/computed.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/utils/constants.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/constants.js should pass jshint', function() { 
    ok(true, 'utils/constants.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/utils/constants/cookie.jshint', function () {

  'use strict';

  module('JSHint - utils/constants');
  test('utils/constants/cookie.js should pass jshint', function() { 
    ok(true, 'utils/constants/cookie.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/utils/error-handlers/base.jshint', function () {

  'use strict';

  module('JSHint - utils/error-handlers');
  test('utils/error-handlers/base.js should pass jshint', function() { 
    ok(true, 'utils/error-handlers/base.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/utils/error-handlers/validation-server-error-handler.jshint', function () {

  'use strict';

  module('JSHint - utils/error-handlers');
  test('utils/error-handlers/validation-server-error-handler.js should pass jshint', function() { 
    ok(false, 'utils/error-handlers/validation-server-error-handler.js should pass jshint.\nutils/error-handlers/validation-server-error-handler.js: line 1, col 8, \'Ember\' is defined but never used.\n\n1 error'); 
  });

});
define('mb-test-1/tests/utils/model.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/model.js should pass jshint', function() { 
    ok(true, 'utils/model.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/api-model-panel.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/api-model-panel.js should pass jshint', function() { 
    ok(true, 'views/detail-views/api-model-panel.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/body-panel.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/body-panel.js should pass jshint', function() { 
    ok(true, 'views/detail-views/body-panel.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/basket-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/basket-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/basket-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/component-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/component-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/component-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/floor-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/floor-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/floor-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/list-value-generator.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/list-value-generator.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/list-value-generator.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/node-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/node-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/node-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/rack-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/rack-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/rack-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/room-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/room-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/room-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/row-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/row-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/row-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/server-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/server-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/server-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/servertemplate-titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/servertemplate-titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/servertemplate-titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/description-lists/titled-key-values-section.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views/description-lists');
  test('views/detail-views/description-lists/titled-key-values-section.js should pass jshint', function() { 
    ok(true, 'views/detail-views/description-lists/titled-key-values-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/key-value.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/key-value.js should pass jshint', function() { 
    ok(true, 'views/detail-views/key-value.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/linked-key-value.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/linked-key-value.js should pass jshint', function() { 
    ok(true, 'views/detail-views/linked-key-value.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/main-panel.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/main-panel.js should pass jshint', function() { 
    ok(true, 'views/detail-views/main-panel.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/detail-views/side-panel.jshint', function () {

  'use strict';

  module('JSHint - views/detail-views');
  test('views/detail-views/side-panel.js should pass jshint', function() { 
    ok(true, 'views/detail-views/side-panel.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/form-fields/base-form-field.jshint', function () {

  'use strict';

  module('JSHint - views/form-fields');
  test('views/form-fields/base-form-field.js should pass jshint', function() { 
    ok(true, 'views/form-fields/base-form-field.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/form-fields/form-section.jshint', function () {

  'use strict';

  module('JSHint - views/form-fields');
  test('views/form-fields/form-section.js should pass jshint', function() { 
    ok(true, 'views/form-fields/form-section.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/form-fields/select-form-field.jshint', function () {

  'use strict';

  module('JSHint - views/form-fields');
  test('views/form-fields/select-form-field.js should pass jshint', function() { 
    ok(true, 'views/form-fields/select-form-field.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/form-fields/text-form-field.jshint', function () {

  'use strict';

  module('JSHint - views/form-fields');
  test('views/form-fields/text-form-field.js should pass jshint', function() { 
    ok(true, 'views/form-fields/text-form-field.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/form-fields/textarea-form-field.jshint', function () {

  'use strict';

  module('JSHint - views/form-fields');
  test('views/form-fields/textarea-form-field.js should pass jshint', function() { 
    ok(true, 'views/form-fields/textarea-form-field.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modal-notification-center.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/modal-notification-center.js should pass jshint', function() { 
    ok(true, 'views/modal-notification-center.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals-container.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/modals-container.js should pass jshint', function() { 
    ok(true, 'views/modals-container.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/basket-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/basket-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/basket-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/basket-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/basket-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/basket-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/basket-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/basket-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/basket-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/component-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/component-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/component-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/component-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/component-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/component-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/component-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/component-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/component-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/floor-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/floor-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/floor-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/floor-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/floor-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/floor-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/floor-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/floor-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/floor-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/display-model-errors-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/display-model-errors-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/display-model-errors-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/form-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/form-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/form-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/full-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/full-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/full-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/object-action-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/object-action-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/object-action-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/object-validate-and-save-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/object-validate-and-save-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/object-validate-and-save-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/open-next-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/open-next-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/open-next-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/search-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/search-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/search-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/mixins/wide-modal-mixin.jshint', function () {

  'use strict';

  module('JSHint - views/modals/mixins');
  test('views/modals/mixins/wide-modal-mixin.js should pass jshint', function() { 
    ok(true, 'views/modals/mixins/wide-modal-mixin.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/modal-base-footer.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/modal-base-footer.js should pass jshint', function() { 
    ok(true, 'views/modals/modal-base-footer.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/modal-base.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/modal-base.js should pass jshint', function() { 
    ok(true, 'views/modals/modal-base.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/modal.js should pass jshint', function() { 
    ok(true, 'views/modals/modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/node-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/node-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/node-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/node-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/node-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/node-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/node-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/node-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/node-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/rack-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/rack-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/rack-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/rack-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/rack-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/rack-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/rack-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/rack-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/rack-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/room-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/room-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/room-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/room-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/room-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/room-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/room-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/room-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/room-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/row-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/row-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/row-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/row-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/row-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/row-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/row-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/row-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/row-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/server-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/server-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/server-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/server-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/server-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/server-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/server-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/server-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/server-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/servertemplate-add-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/servertemplate-add-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/servertemplate-add-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/servertemplate-delete-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/servertemplate-delete-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/servertemplate-delete-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/modals/servertemplate-update-modal.jshint', function () {

  'use strict';

  module('JSHint - views/modals');
  test('views/modals/servertemplate-update-modal.js should pass jshint', function() { 
    ok(true, 'views/modals/servertemplate-update-modal.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/navigation.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/navigation.js should pass jshint', function() { 
    ok(true, 'views/navigation.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/notification-center.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/notification-center.js should pass jshint', function() { 
    ok(true, 'views/notification-center.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/page-navigations/page-navigation.jshint', function () {

  'use strict';

  module('JSHint - views/page-navigations');
  test('views/page-navigations/page-navigation.js should pass jshint', function() { 
    ok(true, 'views/page-navigations/page-navigation.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/baskets-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/baskets-table.js should pass jshint', function() { 
    ok(true, 'views/results/baskets-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/component-properties-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/component-properties-table.js should pass jshint', function() { 
    ok(true, 'views/results/component-properties-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/components-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/components-table.js should pass jshint', function() { 
    ok(true, 'views/results/components-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/floors-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/floors-table.js should pass jshint', function() { 
    ok(true, 'views/results/floors-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/node-servers-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/node-servers-table.js should pass jshint', function() { 
    ok(true, 'views/results/node-servers-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/nodes-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/nodes-table.js should pass jshint', function() { 
    ok(true, 'views/results/nodes-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/racks-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/racks-table.js should pass jshint', function() { 
    ok(true, 'views/results/racks-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/results-load-more.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/results-load-more.js should pass jshint', function() { 
    ok(true, 'views/results/results-load-more.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/results-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/results-table.js should pass jshint', function() { 
    ok(true, 'views/results/results-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/rooms-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/rooms-table.js should pass jshint', function() { 
    ok(true, 'views/results/rooms-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/rows-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/rows-table.js should pass jshint', function() { 
    ok(true, 'views/results/rows-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/server-components-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/server-components-table.js should pass jshint', function() { 
    ok(true, 'views/results/server-components-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/servers-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/servers-table.js should pass jshint', function() { 
    ok(true, 'views/results/servers-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/results/servertemplates-table.jshint', function () {

  'use strict';

  module('JSHint - views/results');
  test('views/results/servertemplates-table.js should pass jshint', function() { 
    ok(true, 'views/results/servertemplates-table.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/tables/cells/linked-text-cell.jshint', function () {

  'use strict';

  module('JSHint - views/tables/cells');
  test('views/tables/cells/linked-text-cell.js should pass jshint', function() { 
    ok(true, 'views/tables/cells/linked-text-cell.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/tables/cells/table-cell-base.jshint', function () {

  'use strict';

  module('JSHint - views/tables/cells');
  test('views/tables/cells/table-cell-base.js should pass jshint', function() { 
    ok(true, 'views/tables/cells/table-cell-base.js should pass jshint.'); 
  });

});
define('mb-test-1/tests/views/tables/cells/titled-linked-cell.jshint', function () {

  'use strict';

  module('JSHint - views/tables/cells');
  test('views/tables/cells/titled-linked-cell.js should pass jshint', function() { 
    ok(true, 'views/tables/cells/titled-linked-cell.js should pass jshint.'); 
  });

});
define('mb-test-1/utils/computed', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var get = Ember['default'].get,
        a_slice = Array.prototype.slice;

    var Computed = Ember['default'].Namespace.create({
        sum: function sum(dependentKey, itemKey) {
            // FIXME - should be wrapped in Ember.arrayComputed?
            return Ember['default'].computed(function () {
                var total = 0,
                    arr = get(this, dependentKey) || [];

                if (!arr || !arr.forEach) {
                    return 0;
                }

                arr.forEach(function (item) {
                    var number = get(item, itemKey);

                    if (number) {
                        total += number;
                    }
                });

                return total;
            }).property(dependentKey, dependentKey + '.length', dependentKey + '.@each.' + itemKey);
        },

        sumAll: function sumAll() {
            var args = a_slice.call(arguments);

            var computed = Ember['default'].computed(function () {
                var total = 0;

                for (var i = 0, l = args.length; i < l; ++i) {
                    total += get(this, args[i]) || 0;
                }

                return total;
            });

            return computed.property.apply(computed, args);
        },

        subtract: function subtract(key1, key2) {
            return Ember['default'].computed(function () {
                return this.get(key1) - this.get(key2);
            }).property(key1, key2);
        },

        slice: function slice(dependentKey, start, end) {
            return Ember['default'].computed(dependentKey, function () {
                var array = get(this, dependentKey) || [];
                // array might be an Ember.ArrayProxy object so use native slice method here
                return array.slice(start, end);
            });
        },

        concat: function concat(dependentKey, key, flip) {
            return Ember['default'].computed(dependentKey, function () {
                var value = get(this, dependentKey) || '';

                if (flip) {
                    return key + value;
                }

                return value + key;
            });
        },

        downcase: function downcase(dependentKey) {
            return Ember['default'].computed(dependentKey, function () {
                return (get(this, dependentKey) || '').toLowerCase();
            });
        },

        fmt: function fmt() {
            var formatString = '' + a_slice.call(arguments, -1),
                properties = a_slice.call(arguments, 0, -1);

            var computed = Ember['default'].computed(function () {
                var values = [];

                for (var i = 0, l = properties.length; i < l; ++i) {
                    values.push(get(this, properties[i]) || '');
                }

                return Ember['default'].String.fmt(formatString, values);
            });

            return computed.property.apply(computed, properties);
        },

        orProperties: function orProperties() {
            var args = a_slice.call(arguments);

            var computed = Ember['default'].computed(function () {
                var result;

                for (var i = 0, l = args.length; i < l; ++i) {
                    result = result || get(this, args[i]);

                    if (result) {
                        return result;
                    }
                }

                return result;
            });

            return computed.property.apply(computed, args);
        },

        ifThisOrThat: function ifThisOrThat(dependentKey, one, two, invert) {
            return Ember['default'].computed(dependentKey, function () {
                var check = get(this, dependentKey);

                if (invert) {
                    check = !check;
                }

                return check ? one : two;
            });
        },

        transform: function transform(dependentKey, func, self) {
            return Ember['default'].computed(dependentKey, function () {
                if (_.isString(func)) {
                    func = get(self || this, func) || get(this.constructor, func);
                }

                return func.call(self || this, get(self || this, dependentKey));
            });
        }
    });

    exports['default'] = Computed;

});
define('mb-test-1/utils/constants', ['exports'], function (exports) {

    'use strict';

    var Constants = {};

    Constants.TIME = {
        THREE_YEARS: 365 * 3,
        MONTHS: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        DAYS_IN_MONTH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        WEEK: 7
    };

    Constants.KEYS = {
        ENTER: 13,
        ESCAPE: 27
    };

    Constants.SEARCH = {
        CATEGORIES: ['order', 'transaction', 'search', 'customer', 'funding_instrument', 'dispute'],
        SEARCH_TYPES: ['debit', 'credit', 'card_hold', 'refund', 'reversal'],
        TRANSACTION_TYPES: ['debit', 'credit', 'hold', 'refund'],
        FUNDING_INSTRUMENT_TYPES: ['bank_account', 'card'],
        DISPUTE_TYPES: ['pending', 'won', 'lost', 'arbitration']
    };

    //  time in ms to throttle between key presses for search
    Constants.THROTTLE = {
        SEARCH: 400,
        REFRESH: 1000
    };

    Constants.PASSWORD = {
        MIN_CHARS: 6,
        REGEX: /(?=.*[A-z])(?=.*\d)/
    };

    Constants.MAXLENGTH = {
        DESCRIPTION: 150,
        APPEARS_ON_STATEMENT_BANK_ACCOUNT: 14,
        APPEARS_ON_STATEMENT_CARD: 18
    };

    Constants.EXPECTED_DAYS_OFFSET = {
        CREDIT_ACH: 1,
        CREDIT_DEBIT_CARD: 2,
        RESTART_VERIFICATION: 3
    };

    Constants.DATES = {
        CREATED_AT: moment('2011-04-01').startOf('day').toDate(),
        RESULTS_MAX_TIME: moment().add(2, 'hours').startOf('hour').toDate(),
        RESULTS_MIN_TIME: moment().subtract(1, 'months').startOf('hour').toDate()
    };

    exports['default'] = Constants;

});
define('mb-test-1/utils/constants/cookie', ['exports'], function (exports) {

    'use strict';

    exports['default'] = {
        EMBER_AUTH_TOKEN: 'ember-auth-rememberable',
        MARKETPLACE_URI: 'mru',
        API_KEY_SECRET: 'apiKeySecret',
        NEW_UPDATES: 'new-updates',

        CSRF_TOKEN: 'csrftoken',
        SESSION: 'session'
    };

});
define('mb-test-1/utils/error-handlers/base', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Object.extend({
        addErrorMessage: function addErrorMessage(key, message) {
            return this.model.get("validationErrors").add(key, "serverError", null, message);
        },

        clear: function clear() {
            return this.model.get("validationErrors").clear();
        }
    });

});
define('mb-test-1/utils/error-handlers/validation-server-error-handler', ['exports', 'ember', 'mb-test-1/utils/error-handlers/base'], function (exports, Ember, BaseErrorHandler) {

    'use strict';

    exports['default'] = BaseErrorHandler['default'].extend({
        init: function init(model, response) {
            this.model = model;
            this.response = response;
        },

        getServerExtraKeyMapping: function getServerExtraKeyMapping(key) {
            switch (key) {
                case "incorporation_date":
                    return "business.incorporation_date";
                case "tax_id":
                    return "business.tax_id";
                case "dob":
                    return "person.dob";
                default:
                    return key;
            }
        },

        execute: function execute() {
            var errorsList;
            errorsList = this.response.errors || [];
            _.each(errorsList, (function (_this) {
                return function (error) {
                    var message;
                    if (_.keys(error.extras).length > 0) {
                        return _.each(error.extras, function (message, key) {
                            key = _this.getServerExtraKeyMapping(key);
                            return _this.addErrorMessage(key, message);
                        });
                    } else if (error.additional) {
                        return _this.addErrorMessage(void 0, error.additional);
                    } else if (error.description) {
                        if (error.description.indexOf(" - ") > 0) {
                            message = error.description.split(" - ")[1];
                        } else {
                            message = error.description;
                        }
                        return _this.addErrorMessage(void 0, message);
                    } else {
                        return _this.addErrorMessage(void 0, error[0]);
                    }
                };
            })(this));
            return this.model.notifyPropertyChange("validationErrors");
        }
    });

});
define('mb-test-1/utils/model', ['exports'], function (exports) {

    'use strict';

    exports.getResultsLoader = getResultsLoader;
    exports.generateResultsLoader = generateResultsLoader;

    function getResultsLoader(loaderClassName, attributes) {
        return MbTestApp.__container__.lookupFactory("results-loader:" + loaderClassName).create(attributes);
    }

    function generateResultsLoader(loaderClassName, uriFieldName) {
        return function (attributes) {
            attributes = _.extend({
                path: this.get(uriFieldName)
            }, attributes);
            return getResultsLoader(loaderClassName, attributes);
        };
    }

});
define('mb-test-1/views/detail-views/api-model-panel', ['exports', 'mb-test-1/views/detail-views/side-panel'], function (exports, SidePanelView) {

	'use strict';

	exports['default'] = SidePanelView['default'];

});
define('mb-test-1/views/detail-views/body-panel', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNames: ['body-panel', 'clearfix'],

        didInsertElement: function didInsertElement() {
            var self = this;

            Ember['default'].run(function () {
                self.updatePanelHeight();

                Ember['default'].$(window).resize(function () {
                    self.updatePanelHeight();
                });
            });
        },

        updatePanelHeight: function updatePanelHeight() {
            if (Ember['default'].$('.side-panel').length) {
                var windowHeight = Ember['default'].$(window).height();
                var sidePanelTop = Ember['default'].$('.side-panel').offset().top;
                var sidePanelBottom = Ember['default'].$('.side-panel').height() + sidePanelTop;

                if (windowHeight > sidePanelBottom) {
                    Ember['default'].$('.side-panel').height(windowHeight - sidePanelTop);
                }
            }
        }
    });

});
define('mb-test-1/views/detail-views/description-lists/basket-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Basket information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/basket-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/basket-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Basket ID", "id").add("Name", "name").add("Total slots Qty", "slot_qty").add("Height in units", "unit_takes").add("Node name", "json_node.name").add("Floor name", "json_floor.name").add("Room name", "json_room.name").add("Row name", "json_row.name").add("Rack name", "json_rack.name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/component-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Component information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/component-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/component-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Component ID", "id").add("Name", "name").add("Manufacturer", "manufacturer").add("Model name", "model_name").add("Serial Number", "serial_number").add("Kind", "json_kind.name").add("State", "state").add("Server", "json_server.name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/floor-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Floor information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/floor-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/floor-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Floor ID", "id").add("Name", "name").add("Node name", "node_name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/list-value-generator', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({
    init: function init() {
      this._super.apply(this, arguments);
      this.values = [];
    },

    add: function add(label, fieldName, hrefField) {
      this.values.push({
        label: label,
        fieldName: fieldName,
        hrefField: hrefField
      });
      return this;
    },

    toProperty: function toProperty() {
      var fieldNames, method, values;
      values = this.values;
      fieldNames = values.mapBy("fieldName").map(function (name) {
        return "model." + name;
      });
      fieldNames.push("model");

      method = Ember['default'].computed(function () {
        return values.map((function (_this) {
          return function (value) {
            if (Ember['default'].isBlank(value.hrefField)) {
              return _this.getKeyValueView(value.label, value.fieldName);
            } else {
              return _this.getLinkedKeyValueView(value.label, value.fieldName, value.hrefField);
            }
          };
        })(this));
      });

      return method.property.apply(method, fieldNames);
    }
  });

});
define('mb-test-1/views/detail-views/description-lists/node-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Node information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/node-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/node-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Name", "name").add("Address", "address").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/rack-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Rack information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/rack-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/rack-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Rack ID", "id").add("Name", "name").add("Total units", "total_units").add("Max gap", "max_gap").add("Node name", "json_node.name").add("Floor name", "json_floor.name").add("Room name", "json_room.name").add("Row name", "json_row.name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/room-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Room information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/room-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/room-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Room ID", "id").add("Name", "name").add("Node name", "node_name").add("Floor name", "floor_name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/row-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Row information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/row-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/row-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Row ID", "id").add("Name", "name").add("Node name", "json_node.name").add("Floor name", "json_floor.name").add("Room name", "json_room.name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/server-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Server information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/server-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/server-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Server ID", "id").add("Name", "name").add("Template", "json_template.name").add("Node name", "json_node.name").add("Floor name", "json_floor.name").add("Room name", "json_room.name").add("Row name", "json_row.name").add("Rack name", "json_rack.name").add("Basket name", "json_basket.name").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/servertemplate-titled-key-values-section', ['exports', 'mb-test-1/views/detail-views/description-lists/titled-key-values-section', 'mb-test-1/views/detail-views/description-lists/list-value-generator'], function (exports, TitledKeyValuesSectionView, ListValueGenerator) {

    'use strict';

    exports['default'] = TitledKeyValuesSectionView['default'].extend({
        title: "Server Template information",
        editModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/servertemplate-update-modal");
        }).property("model"),

        deleteModelModalClass: (function () {
            return this.get("container").lookupFactory("view:modals/servertemplate-delete-modal");
        }).property("model"),

        keyValueListViews: ListValueGenerator['default'].create().add("Server Template ID", "id").add("Name", "name").add("Num servers uses", "servers_uses").toProperty()
    });

});
define('mb-test-1/views/detail-views/description-lists/titled-key-values-section', ['exports', 'ember', 'mb-test-1/views/detail-views/key-value', 'mb-test-1/views/detail-views/linked-key-value', 'mb-test-1/lib/utils'], function (exports, Ember, KeyValueView, LinkedKeyValueView, Utils) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        layoutName: "detail-views/titled-key-values-section",

        title: (function () {
            return "%@ information".fmt(this.get("model.type_name"));
        }).property("model.type_name"),

        getFieldValue: function getFieldValue(fieldName) {
            var model = this.get("model");
            var dateFields = ["created_at", "initiated_at", "respond_by", "from_date", "to_date"];

            if (model === undefined) {
                return;
            }
            var value = Ember['default'].get(model, fieldName);

            if (_.contains(dateFields, fieldName)) {
                value = Utils['default'].humanReadableDateTime(value);
            }

            return value;
        },

        getKeyValueView: function getKeyValueView(label, fieldName) {
            var value = this.getFieldValue(fieldName);
            return KeyValueView['default'].extend({
                key: label,
                value: value
            });
        },

        getLinkedKeyValueView: function getLinkedKeyValueView(label, fieldName, hrefFieldName) {
            if (Ember['default'].isBlank(this.get("model"))) {
                return this.getKeyValueView(label, fieldName);
            }

            var value = this.getFieldValue(fieldName);
            var link = Ember['default'].get(this.get("model"), hrefFieldName);

            if (Ember['default'].isBlank(link)) {
                return this.getKeyValueView(label, fieldName);
            }

            if (link.indexOf("@") > 0) {
                link = "mailto:" + link;
            } else if (link.indexOf("http") < 0) {
                link = "http://" + link;
            }

            return LinkedKeyValueView['default'].extend({
                key: label,
                value: value,
                link: link
            });
        } });

});
define('mb-test-1/views/detail-views/key-value', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        templateName: "detail-views/key-value",
        hasLink: false });

});
define('mb-test-1/views/detail-views/linked-key-value', ['exports', 'mb-test-1/views/detail-views/key-value'], function (exports, KeyValueView) {

    'use strict';

    exports['default'] = KeyValueView['default'].extend({
        hasLink: true
    });

});
define('mb-test-1/views/detail-views/main-panel', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNameBindings: [":main-panel", ":span"]
    });

});
define('mb-test-1/views/detail-views/side-panel', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNameBindings: [":side-panel"],
        layoutName: "detail-views/side-panel-layout"
    });

});
define('mb-test-1/views/form-fields/base-form-field', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    layoutName: "form-fields/form-field-layout",
    templateName: "form-fields/base-form-field",
    classNameBindings: [":form-group", "isError:has-error"],
    inputName: Ember['default'].computed("field", function () {
      return this.get("field").replace(/\./, "_");
    }),
    value: Ember['default'].computed("model", "field", function (a, value) {
      var field = this.get("field"),
          model = this.get("model");

      if (arguments.length > 1 && model) {
        model.set(field, value);
      }
      if (model) {
        return model.get(field);
      }
    }),
    displayAlertErrors: function displayAlertErrors() {
      Ember['default'].$(".alert-error").hide();
      return this.$(".alert-error").css("display", "inline");
    },
    didInsertElement: function didInsertElement() {
      var self = this,
          $el = this.$();

      var makeShowValidationErrors = function makeShowValidationErrors() {
        if (!(self.get("isDestroyed") || self.get("isDestroying"))) {
          self.set("isCanShowValidationErrors", true);
        }
      };

      $el.hover(function () {
        self.displayAlertErrors();
      });
      $el.find(":input").focus(function () {
        return self.displayAlertErrors();
      });
      $el.find(":input").blur(function () {
        return makeShowValidationErrors();
      });
      $el.closest("form").submit(function () {
        makeShowValidationErrors();
      });
    },
    isLegacyModel: Ember['default'].computed.none("model.errors"),
    errorMessages: Ember['default'].computed.reads("errorMessagesIndirectionHandler.messages"),
    isOneError: Ember['default'].computed.equal("errorMessages.length", 1),
    errorMessagesIndirectionHandler: Ember['default'].computed("isLegacyModel", "model", "field", function () {
      var errorsListKeyName,
          fieldName = this.get("field"),
          model = this.get("model");

      if (!this.get("isLegacyModel")) {
        errorsListKeyName = "model.errors." + fieldName;
      } else {
        errorsListKeyName = "model.validationErrors." + fieldName + ".messages";
      }
      return Ember['default'].Object.extend({
        messages: Ember['default'].computed.reads(errorsListKeyName)
      }).create({
        model: model
      });
    }),
    isCanShowValidationErrors: false,
    isError: Ember['default'].computed("isCanShowValidationErrors", "isLegacyModel", "errorMessages.length", function () {
      var length = this.get("errorMessages.length");
      if (this.get("isLegacyModel")) {
        return length > 0;
      } else {
        return length > 0 && this.get("isCanShowValidationErrors");
      }
    })
  });

});
define('mb-test-1/views/form-fields/form-section', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNameBindings: [":form-section", ":clearfix"],
        layoutName: "form-fields/form-section"
    });

});
define('mb-test-1/views/form-fields/select-form-field', ['exports', 'mb-test-1/views/form-fields/base-form-field'], function (exports, BaseFormFieldView) {

    'use strict';

    exports['default'] = BaseFormFieldView['default'].extend({
        templateName: "form-fields/select-form-field",
        optionValuePath: "content.value",
        optionLabelPath: "content.label"
    });

});
define('mb-test-1/views/form-fields/text-form-field', ['exports', 'mb-test-1/views/form-fields/base-form-field'], function (exports, BaseFormFieldView) {

    'use strict';

    exports['default'] = BaseFormFieldView['default'].extend({
        inputType: "text",
        inputClassNames: "full"
    });

});
define('mb-test-1/views/form-fields/textarea-form-field', ['exports', 'mb-test-1/views/form-fields/base-form-field'], function (exports, BaseFormFieldView) {

    'use strict';

    exports['default'] = BaseFormFieldView['default'].extend({
        templateName: "form-fields/textarea-form-field",
        maxlength: 434,
        inputClassNames: "full",
        explanationText: (function () {
            var maxLength = this.get("maxlength");

            if (maxLength > 0) {
                var noteLength = this.get("value") ? this.get("value.length") : 0;
                var remaining = maxLength - noteLength;
                return "%@ characters remaining".fmt(remaining);
            }
        }).property("value.length") });

});
define('mb-test-1/views/modal-notification-center', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        templateName: "notification-center"
    });

});
define('mb-test-1/views/modals-container', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ContainerView.extend({
        didInsertElement: function didInsertElement() {
            this._super();
            this.get("controller").registerContainer(this);
        }
    });

});
define('mb-test-1/views/modals/basket-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/basket', 'mb-test-1/models/rack'], function (exports, Ember, ModalBaseView, Form, Full, Save, Basket, Rack) {

    'use strict';

    var BasketAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/basket-add-modal",
        elementId: "add-basket",
        title: "Add a basket",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your basket was created successfully",

        racks: (function () {
            return Rack['default'].findAll();
        }).property(),

        racksForSelect: Ember['default'].computed.map("racks", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        /*preselect: function() {
            var rack_id = this.get('racksForSelect.firstObject').value;
            this.set('selectedRack', rack_id);
        }.observes('racksForSelect.@each'),*/

        model: (function () {
            return Basket['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("basket", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    BasketAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedRack: null
            });
        } });

    exports['default'] = BasketAddModal;

});
define('mb-test-1/views/modals/basket-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var BasketDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/basket-delete-modal",
        elementId: "delete-basket",
        classNames: ["wide-modal"],
        title: "Remove basket?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("baskets");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    BasketDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = BasketDeleteModalView;

});
define('mb-test-1/views/modals/basket-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/rack'], function (exports, Ember, ModalBaseView, Form, Full, Save, Rack) {

    'use strict';

    var BasketUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/basket-update-modal",
        elementId: "basket-update",
        title: (function () {
            return "Edit basket information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        racks: (function () {
            return Rack['default'].findAll();
        }).property(),

        racksForSelect: Ember['default'].computed.map("racks", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var rack = this.get("model").__json.rack;
            this.set("selectedRack", rack && rack.id || null);
        }).observes("racks.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Basket has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    BasketUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedRack: model.__json.rack && model.__json.rack.id || null
            });
            return view;
        }
    });

    exports['default'] = BasketUpdateModalView;

});
define('mb-test-1/views/modals/component-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/propertyoption', 'mb-test-1/models/component'], function (exports, Ember, ModalBaseView, Form, Full, Save, PropertyOption, Component) {

    'use strict';

    var ComponentAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/component-add-modal",
        elementId: "component-add",
        title: "Add a component",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your component was created successfully",

        // kind choices
        kinds: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getComponentKinds();
        }).property(),

        kindsForSelect: Ember['default'].computed.map("kinds", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectKinds: (function () {
            var o_id = this.get("kindsForSelect.firstObject").value;
            this.set("selectedKind", o_id);
        }).observes("kindsForSelect.@each"),

        model: (function () {
            return Component['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("component", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        } });

    ComponentAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedKind: null
            });
        } });

    exports['default'] = ComponentAddModal;

});
define('mb-test-1/views/modals/component-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var ComponentDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/component-delete-modal",
        elementId: "delete-component",
        classNames: ["wide-modal"],
        title: "Remove component?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("components");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    ComponentDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = ComponentDeleteModalView;

});
define('mb-test-1/views/modals/component-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/propertyoption'], function (exports, Ember, ModalBaseView, Form, Full, Save, PropertyOption) {

    'use strict';

    var ComponentUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/component-update-modal",
        elementId: "component-update",
        title: (function () {
            return "Edit component information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        // kind choices
        kinds: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getComponentKinds();
        }).property(),

        kindsForSelect: Ember['default'].computed.map("kinds", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectKinds: (function () {
            var o_id = this.get("kindsForSelect.firstObject").value;
            var current = this.get("model").__json.kind;
            this.set("selectedKind", current && current.id || o_id);
        }).observes("kindsForSelect.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Component has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    ComponentUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedKind: model.__json.kind && model.__json.kind.id || null
            });
            return view;
        }
    });

    exports['default'] = ComponentUpdateModalView;

});
define('mb-test-1/views/modals/floor-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/floor', 'mb-test-1/models/node'], function (exports, Ember, ModalBaseView, Form, Full, Save, Floor, Node) {

    'use strict';

    var FloorAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/floor-add-modal",
        elementId: "add-floor",
        title: "Add a floor",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your floor was created successfully",

        nodes: (function () {
            return Node['default'].findAll();
        }).property(),

        nodesForSelect: Ember['default'].computed.map("nodes", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        model: (function () {
            return Floor['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            Ember['default'].Logger.debug("FloorAddModal.onModelSaved: model=", model);
            controller.transitionToRoute("floor", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    FloorAddModal.reopenClass({
        open: function open() {
            return this.create();
        } });

    exports['default'] = FloorAddModal;

});
define('mb-test-1/views/modals/floor-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var FloorDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/floor-delete-modal",
        elementId: "delete-floor",
        classNames: ["wide-modal"],
        title: "Remove floor?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("floors");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    FloorDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = FloorDeleteModalView;

});
define('mb-test-1/views/modals/floor-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/node'], function (exports, Ember, ModalBaseView, Form, Full, Save, Node) {

    'use strict';

    var FloorUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/floor-update-modal",
        elementId: "floor-update",
        title: (function () {
            return "Edit floor information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        nodes: (function () {
            return Node['default'].findAll();
        }).property(),

        nodesForSelect: Ember['default'].computed.map("nodes", function (o) {
            return { label: o.get("name"), value: o.get("id") + "" };
        }),

        preselect: (function () {
            var node_id = this.get("model").__json.node.id;
            this.set("selectedNode", node_id);
        }).observes("nodes.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Floor has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    FloorUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedNode: null
            });
            return view;
        }
    });

    exports['default'] = FloorUpdateModalView;

});
define('mb-test-1/views/modals/mixins/display-model-errors-modal-mixin', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var getModelRootErrorMessages = function getModelRootErrorMessages(model) {
        return model.get("validationErrors.length") ? "Your information could not be saved. Please correct the errors below." : "Your information could not be saved.";
    };

    var DisplayModelErrorsModalMixin = Ember['default'].Mixin.create({
        updateErrorsBar: (function () {
            var model = this.get("model");
            if (model.get("validationErrors.length")) {
                var errorMessage = getModelRootErrorMessages(model);
                if (errorMessage) {
                    var controller = this.get("container").lookup("controller:modal_notification_center");
                    controller.clearAlerts();
                    controller.alertError(new Ember['default'].Handlebars.SafeString(errorMessage));
                }
            }
        }).observes("model.validationErrors.allMessages") });

    exports['default'] = DisplayModelErrorsModalMixin;

});
define('mb-test-1/views/modals/mixins/form-modal-mixin', ['exports', 'ember', 'mb-test-1/views/modals/mixins/display-model-errors-modal-mixin'], function (exports, Ember, DisplayModelErrors) {

    'use strict';

    exports['default'] = Ember['default'].Mixin.create(DisplayModelErrors['default'], {
        layoutName: "modals/form-modal-layout"
    });

});
define('mb-test-1/views/modals/mixins/full-modal-mixin', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Mixin.create({
        layoutName: "modals/full-modal-layout",
        classNameBindings: [":half-screen-modal"]
    });

});
define('mb-test-1/views/modals/mixins/object-action-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var getRootErrorMessages = function getRootErrorMessages(model) {
    var messages = model.get("errors._root") || model.get("validationErrors.messages");
    return Ember['default'].A(messages);
  };

  exports['default'] = Ember['default'].Mixin.create({
    isSaving: false,
    onModelSaved: function onModelSaved(model) {
      this.close();
      return Ember['default'].RSVP.resolve(model);
    },
    executeAction: function executeAction(callback) {
      var self = this;
      var notificationsController = this.getModalNotificationController();
      if (notificationsController) {
        notificationsController.clearAlerts();
      }
      var successHandler = function successHandler(model) {
        var successAlertText = self.get("successAlertText");
        if (!Ember['default'].isBlank(successAlertText)) {
          self.getNotificationController().alertSuccess(successAlertText);
        }
        return self.onModelSaved(model);
      };
      var errorHandler = function errorHandler(model) {
        if (!Ember['default'].isBlank(model)) {
          var messages = getRootErrorMessages(model);
          messages.forEach(function (message) {
            return notificationsController.alertError(message);
          });
          return Ember['default'].RSVP.reject(model);
        } else {
          return Ember['default'].RSVP.reject();
        }
      };
      this.set("isSaving", true);
      return callback().then(successHandler, errorHandler)["finally"](function () {
        return self.set("isSaving", false);
      });
    },
    "delete": function _delete(model) {
      return this.executeAction(function () {
        return model["delete"]();
      });
    },
    validateAndSaveModel: function validateAndSaveModel() {
      var model = this.get("model");
      return this.executeAction(function () {
        return model.validateAndSave();
      });
    },
    save: function save(model) {
      return this.executeAction(function () {
        if (model.get("validationErrors")) {
          model.get("validationErrors").clear();
        }
        return model.save();
      });
    }
  });

});
define('mb-test-1/views/modals/mixins/object-validate-and-save-mixin', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ObjectValidateAndSaveMixin = Ember['default'].Mixin.create({
        isSaving: false,
        save: function save(model) {
            var self = this;
            this.set("isSaving", true);
            model.validate();
            if (model.get("isValid")) {
                return model.save().then(function (savedModel) {
                    self.set("isSaving", false);
                    self.close();
                    return Ember['default'].RSVP.resolve(savedModel);
                }, function (errors) {
                    self.set("isSaving", false);
                    return Ember['default'].RSVP.reject(errors);
                });
            } else {
                self.set("isSaving", false);
                return Ember['default'].RSVP.reject();
            }
        }
    });

    exports['default'] = ObjectValidateAndSaveMixin;

});
define('mb-test-1/views/modals/mixins/open-next-modal-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    openNext: function openNext() {
      var applicationController = this.get("container").lookup("controller:application");
      var args = _.toArray(arguments);
      args.unshift("openModal");
      return applicationController.send.apply(applicationController, args);
    },
    openInstance: function openInstance(instance) {
      return this.get("container").lookup("controller:modals-container").openInstance(instance);
    }
  });

});
define('mb-test-1/views/modals/mixins/search-modal-mixin', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Mixin.create({
        layoutName: "modals/search-modal-layout",
        classNameBindings: [":search-screen-modal"]
    });

});
define('mb-test-1/views/modals/mixins/wide-modal-mixin', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var WideModalMixin = Ember['default'].Mixin.create({
        classNameBindings: [":wide-modal", ":modal-overflow"] });

    exports['default'] = WideModalMixin;

});
define('mb-test-1/views/modals/modal-base-footer', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        classNameBindings: [":modal-footer"],
        templateName: "modals/modal-base-footer"
    });

});
define('mb-test-1/views/modals/modal-base', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ModalBaseView = Ember['default'].View.extend({
        layoutName: "modals/base-modal-layout",
        classNames: ["modal"],
        submitButtonText: "Submit",

        getNotificationController: function getNotificationController() {
            return this.get("container").lookup("controller:notification-center");
        },

        getModalNotificationController: function getModalNotificationController() {
            return this.get("container").lookup("controller:modal-notification-center");
        },

        openModal: function openModal(name) {
            this.get("container").lookup("controller:modals-container").open(name, _.toArray(arguments).slice(1));
        },

        reposition: function reposition() {
            Ember['default'].$(window).resize();
        },

        open: function open() {
            var options = {
                show: true,
                backdrop: true,
                keyboard: true
            };

            if (this.get("staticBackdrop")) {
                _.extend(options, {
                    backdrop: "static",
                    keyboard: false
                });
            }
            return this.$().modal(options);
        },

        close: function close() {
            var element = this.$();
            if (element) {
                return element.modal("hide");
            }
        },

        didInsertElement: function didInsertElement() {
            Ember['default'].$(".modal input:eq(0)").focus();
        }
    });

    ModalBaseView.reopenClass({
        open: function open(attributes) {
            return this.create(attributes);
        }
    });

    exports['default'] = ModalBaseView;

});
define('mb-test-1/views/modals/modal', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    var ModalView = Ember['default'].View.extend({
        controllerEventName: 'openModal',
        modalElement: '.modal',
        defaultModelAction: 'save',
        controllerKey: 'controller',

        didInsertElement: function didInsertElement() {
            if (this.controllerEventName) {
                this.get(this.get('controllerKey')).on(this.controllerEventName, this, this.open);
            }

            this._super();
        },

        willDestroyElement: function willDestroyElement() {
            if (this.controllerEventName) {
                this.get(this.get('controllerKey')).off(this.controllerEventName, this, this.open);
            }

            this._super();
        },

        hide: function hide() {
            this.$(this.get('modalElement')).modal('hide');
        },

        _createModal: function _createModal(opts) {
            this.$(this.get('modalElement')).modal(_.extend({
                manager: this.$()
            }, opts || {}));
        },

        open: function open(model) {
            var self = this;
            if (model) {
                var eventName = this.get('defaultModelAction');
                if (eventName) {
                    if (eventName === 'save') {
                        eventName = 'didCreate';
                    } else if (eventName === 'delete') {
                        eventName = 'didDelete';
                    }

                    model.on(eventName, function () {
                        self.hide();
                    });
                }

                this.set('model', model);
            }

            this._createModal();
        },

        reposition: function reposition() {
            // trigger a resize to reposition the dialog
            Ember['default'].$(document.body).trigger('resize');
        },

        actions: {
            close: function close() {
                this.hide();
            },

            save: function save(model, opts) {
                model = model || this.get('model');

                if (Ember['default'].get(model, 'isSaving')) {
                    return;
                }

                var self = this;
                if (_.isFunction(this.beforeSave) && this.beforeSave(model) === false) {
                    return;
                }

                var errorCallback = this.errorSaving;
                if (_.isFunction(errorCallback)) {
                    errorCallback = _.bind(errorCallback, this);
                }

                model[this.get('defaultModelAction')].call(model, opts).then(function (model) {
                    if (_.isFunction(self.afterSave)) {
                        self.afterSave(model);
                    }

                    if (!self.get('submitAction')) {
                        return;
                    }

                    self.sendAction('submitAction', model);
                }, errorCallback);
            }
        }
    });

    exports['default'] = ModalView;

});
define('mb-test-1/views/modals/node-add-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/node'], function (exports, ModalBaseView, Form, Full, Save, Node) {

    'use strict';

    var AddNodeModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/node-add-modal",
        elementId: "add-node",
        title: "Add a node",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your node was created successfully",

        model: (function () {
            var node = Node['default'].create({});
            return node;
        }).property(),

        onModelSaved: function onModelSaved(model) {
            //var Node = this.get("container").lookupFactory("model:node");
            //var controller = this.container.lookup("controller:marketplace");
            var controller = this.get("controller");
            //return Node.find(model.get("id")).then(function(m) {
            controller.transitionToRoute("node", model);
            //});
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    AddNodeModal.reopenClass({
        open: function open() {
            var view = this.create({});
            //var store = view.container.lookup('store:main');
            //var model = store.createRecord('node', {});
            //view.set('model', model);
            //Ember.Logger.debug(model);
            return view;
        } });

    exports['default'] = AddNodeModal;

});
define('mb-test-1/views/modals/node-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var NodeDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/node-delete-modal",
        elementId: "delete-node",
        classNames: ["wide-modal"],
        title: "Remove node?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("nodes");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    NodeDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = NodeDeleteModalView;

});
define('mb-test-1/views/modals/node-update-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, Form, Full, Save) {

    'use strict';

    var EditNodeDetailModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/node-update-modal",
        elementId: "edit-node-detail",
        title: (function () {
            return "Edit node information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Node has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    EditNodeDetailModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model });
            return view;
        }
    });

    exports['default'] = EditNodeDetailModalView;

});
define('mb-test-1/views/modals/rack-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/row', 'mb-test-1/models/rack'], function (exports, Ember, ModalBaseView, Form, Full, Save, Row, Rack) {

    'use strict';

    var RackAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/rack-add-modal",
        elementId: "add-rack",
        title: "Add a rack",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your rack was created successfully",

        rows: (function () {
            return Row['default'].findAll();
        }).property(),

        rowsForSelect: Ember['default'].computed.map("rows", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var row_id = this.get("rowsForSelect.firstObject").value;
            this.set("selectedRow", row_id);
        }).observes("rowsForSelect.@each"),

        model: (function () {
            return Rack['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("rack", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RackAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedRow: null
            });
        } });

    exports['default'] = RackAddModal;

});
define('mb-test-1/views/modals/rack-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var RackDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/rack-delete-modal",
        elementId: "delete-rack",
        classNames: ["wide-modal"],
        title: "Remove rack?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("racks");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    RackDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = RackDeleteModalView;

});
define('mb-test-1/views/modals/rack-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/row'], function (exports, Ember, ModalBaseView, Form, Full, Save, Row) {

    'use strict';

    var RackUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/rack-update-modal",
        elementId: "rack-update",
        title: (function () {
            return "Edit rack information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        rows: (function () {
            return Row['default'].findAll();
        }).property(),

        rowsForSelect: Ember['default'].computed.map("rows", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var row_id = this.get("model").__json.row.id;
            this.set("selectedRow", row_id);
        }).observes("rows.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Rack has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RackUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedRow: model.json_row.id
            });
            return view;
        }
    });

    exports['default'] = RackUpdateModalView;

});
define('mb-test-1/views/modals/room-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/floor', 'mb-test-1/models/room'], function (exports, Ember, ModalBaseView, Form, Full, Save, Floor, Room) {

    'use strict';

    var RoomAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/room-add-modal",
        elementId: "add-room",
        title: "Add a room",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your room was created successfully",

        floors: (function () {
            return Floor['default'].findAll();
        }).property(),

        floorsForSelect: Ember['default'].computed.map("floors", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        model: (function () {
            return Room['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("room", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RoomAddModal.reopenClass({
        open: function open() {
            return this.create();
        } });

    exports['default'] = RoomAddModal;

});
define('mb-test-1/views/modals/room-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var RoomDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/room-delete-modal",
        elementId: "delete-room",
        classNames: ["wide-modal"],
        title: "Remove room?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("rooms");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    RoomDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = RoomDeleteModalView;

});
define('mb-test-1/views/modals/room-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/floor'], function (exports, Ember, ModalBaseView, Form, Full, Save, Floor) {

    'use strict';

    var RoomUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/room-update-modal",
        elementId: "room-update",
        title: (function () {
            return "Edit room information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        floors: (function () {
            return Floor['default'].findAll();
        }).property(),

        floorsForSelect: Ember['default'].computed.map("floors", function (o) {
            return { label: o.get("name"), value: o.get("id") + "" };
        }),

        preselect: (function () {
            var floor_id = this.get("model").__json.floor.id;
            this.set("selectedFloor", floor_id);
        }).observes("floors.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Room has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RoomUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedFloor: null
            });
            return view;
        }
    });

    exports['default'] = RoomUpdateModalView;

});
define('mb-test-1/views/modals/row-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/row', 'mb-test-1/models/room'], function (exports, Ember, ModalBaseView, Form, Full, Save, Row, Room) {

    'use strict';

    var RowAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/row-add-modal",
        elementId: "add-row",
        title: "Add a row",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your row was created successfully",

        rooms: (function () {
            return Room['default'].findAll();
        }).property(),

        roomsForSelect: Ember['default'].computed.map("rooms", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var room_id = this.get("roomsForSelect.firstObject").value;
            Ember['default'].Logger.debug("RowAddModal.preselect: room_id=", room_id);
            this.set("selectedRoom", room_id);
        }).observes("roomsForSelect.@each"),

        model: (function () {
            return Row['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("row", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RowAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedRoom: null
            });
        } });

    exports['default'] = RowAddModal;

});
define('mb-test-1/views/modals/row-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var RowDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/row-delete-modal",
        elementId: "delete-row",
        classNames: ["wide-modal"],
        title: "Remove row?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("rows");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    RowDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = RowDeleteModalView;

});
define('mb-test-1/views/modals/row-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/room'], function (exports, Ember, ModalBaseView, Form, Full, Save, Room) {

    'use strict';

    var RowUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/row-update-modal",
        elementId: "row-update",
        title: (function () {
            return "Edit row information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        rooms: (function () {
            return Room['default'].findAll();
        }).property(),

        roomsForSelect: Ember['default'].computed.map("rooms", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var room_id = this.get("model").__json.room.id;
            this.set("selectedRoom", room_id);
        }).observes("rooms.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Row has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    RowUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedRoom: model.json_room.id
            });
            return view;
        }
    });

    exports['default'] = RowUpdateModalView;

});
define('mb-test-1/views/modals/server-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/servertemplate', 'mb-test-1/models/server'], function (exports, Ember, ModalBaseView, Form, Full, Save, ServerTemplate, Server) {

    'use strict';

    var ServerAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/server-add-modal",
        elementId: "server-add",
        title: "Add a server",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your server was created successfully",

        templates: (function () {
            return ServerTemplate['default'].findAll();
        }).property(),

        templatesForSelect: Ember['default'].computed.map("templates", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var template_id = this.get("templatesForSelect.firstObject").value;
            this.set("selectedTemplate", template_id);
        }).observes("templatesForSelect.@each"),

        model: (function () {
            return Server['default'].create();
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("server", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    ServerAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedTemplate: null
            });
        } });

    exports['default'] = ServerAddModal;

});
define('mb-test-1/views/modals/server-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var ServerDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/server-delete-modal",
        elementId: "delete-server",
        classNames: ["wide-modal"],
        title: "Remove server?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("servers");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    ServerDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = ServerDeleteModalView;

});
define('mb-test-1/views/modals/server-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/servertemplate'], function (exports, Ember, ModalBaseView, Form, Full, Save, ServerTemplate) {

    'use strict';

    var ServerUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/server-update-modal",
        elementId: "server-update",
        title: (function () {
            return "Edit server information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        templates: (function () {
            return ServerTemplate['default'].findAll();
        }).property(),

        templatesForSelect: Ember['default'].computed.map("templates", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselect: (function () {
            var template = this.get("model").__json.template;
            this.set("selectedTemplate", template && template.id || null);
        }).observes("templates.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Server has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            }
        }
    });

    ServerUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                selectedTemplate: model.__json.template && model.__json.template.id || null
            });
            return view;
        }
    });

    exports['default'] = ServerUpdateModalView;

});
define('mb-test-1/views/modals/servertemplate-add-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/servertemplate', 'mb-test-1/models/propertyoption'], function (exports, Ember, ModalBaseView, Form, Full, Save, ServerTemplate, PropertyOption) {

    'use strict';

    var ServerTemplateAddModal = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/servertemplate-add-modal",
        elementId: "servertemplate-add",
        title: "Add a server template",
        cancelButtonText: "Cancel",
        submitButtonText: "Add",
        successAlertText: "Your server template was created successfully",

        // cpu socket
        cpuSockets: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getCPUSockets();
        }).property(),

        cpuSocketsForSelect: Ember['default'].computed.map("cpuSockets", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectCPUSockets: (function () {
            var o_id = this.get("cpuSocketsForSelect.firstObject").value;
            this.set("selectedCPUSocket", o_id);
        }).observes("cpuSocketsForSelect.@each"),

        // ram standard
        ramStandards: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getRAMStandards();
        }).property(),

        ramStandardsForSelect: Ember['default'].computed.map("ramStandards", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectRAMStandards: (function () {
            var o_id = this.get("ramStandardsForSelect.firstObject").value;
            this.set("selectedRAMStandard", o_id);
        }).observes("ramStandardsForSelect.@each"),

        // hdd form factor
        hddFormFactors: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getHDDFormFactors();
        }).property(),

        hddFormFactorsForSelect: Ember['default'].computed.map("hddFormFactors", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectHDDFormFactors: (function () {
            var o_id = this.get("hddFormFactorsForSelect.firstObject").value;
            this.get("model").hdds.forEach(function (hdd) {
                if (Ember['default'].get(hdd, "hdd_form_factor") === null) {
                    Ember['default'].set(hdd, "hdd_form_factor", o_id);
                }
            });
        }).observes("hddFormFactorsForSelect.@each"),

        // hdd connection type
        hddConnectionTypes: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getHDDConnectionType();
        }).property(),

        hddConnectionTypeForSelect: Ember['default'].computed.map("hddConnectionTypes", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectHDDConnectionTypes: (function () {
            var o_id = this.get("hddConnectionTypeForSelect.firstObject").value;
            this.get("model").hdds.forEach(function (hdd) {
                if (Ember['default'].get(hdd, "hdd_connection_type") === null) {
                    Ember['default'].set(hdd, "hdd_connection_type", o_id);
                }
            });
        }).observes("hddConnectionTypes.@each"),

        model: (function () {
            return ServerTemplate['default'].create({
                hdds: Ember['default'].A() });
        }).property(),

        onModelSaved: function onModelSaved(model) {
            var controller = this.get("controller");
            controller.transitionToRoute("servertemplate", model.__json.id);
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            },
            addHdd: function addHdd() {
                var obj = Ember['default'].Object.create({
                    hdd_qty: 1,
                    hdd_connection_type: null,
                    hdd_form_factor: null
                });
                this.get("model").hdds.pushObject(obj);
            }
        } });

    ServerTemplateAddModal.reopenClass({
        open: function open() {
            return this.create({
                selectedCPUSocket: null,
                selectedRAMStandard: null
            });
        } });

    exports['default'] = ServerTemplateAddModal;

});
define('mb-test-1/views/modals/servertemplate-delete-modal', ['exports', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/object-action-mixin'], function (exports, ModalBaseView, DeleteMixin) {

    'use strict';

    var ServerTemplateDeleteModalView = ModalBaseView['default'].extend(DeleteMixin['default'], {
        templateName: "modals/servertemplate-delete-modal",
        elementId: "delete-servertemplate",
        classNames: ["wide-modal"],
        title: "Remove server template?",
        isSaving: false,

        onModelSaved: function onModelSaved() {
            var controller = this.get("controller");
            controller.transitionToRoute("servertemplates");
        },

        actions: {
            save: function save(model) {
                this["delete"](model);
            }
        }
    });

    ServerTemplateDeleteModalView.reopenClass({
        open: function open(model) {
            return this.create({
                model: model
            });
        }
    });

    exports['default'] = ServerTemplateDeleteModalView;

});
define('mb-test-1/views/modals/servertemplate-update-modal', ['exports', 'ember', 'mb-test-1/views/modals/modal-base', 'mb-test-1/views/modals/mixins/form-modal-mixin', 'mb-test-1/views/modals/mixins/full-modal-mixin', 'mb-test-1/views/modals/mixins/object-action-mixin', 'mb-test-1/models/propertyoption'], function (exports, Ember, ModalBaseView, Form, Full, Save, PropertyOption) {

    'use strict';

    var ServerTemplateUpdateModalView = ModalBaseView['default'].extend(Full['default'], Form['default'], Save['default'], {
        templateName: "modals/servertemplate-update-modal",
        elementId: "servertemplate-update",
        title: (function () {
            return "Edit server template information";
        }).property(),

        cancelButtonText: "Cancel",
        submitButtonText: "Save",

        // cpu socket
        cpuSockets: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getCPUSockets();
        }).property(),

        cpuSocketsForSelect: Ember['default'].computed.map("cpuSockets", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectCPUSockets: (function () {
            var o_id = this.get("cpuSocketsForSelect.firstObject").value;
            var current = this.get("model").__json.cpu_socket;
            this.set("selectedCPUSocket", current && current.id || o_id);
        }).observes("cpuSocketsForSelect.@each"),

        // ram standard
        ramStandards: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getRAMStandards();
        }).property(),

        ramStandardsForSelect: Ember['default'].computed.map("ramStandards", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectRAMStandards: (function () {
            var o_id = this.get("ramStandardsForSelect.firstObject").value;
            var current = this.get("model").__json.ram_standard;
            this.set("selectedRAMStandard", current && current.id || o_id);
        }).observes("ramStandardsForSelect.@each"),

        // hdd form factor
        hddFormFactors: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getHDDFormFactors();
        }).property(),

        hddFormFactorsForSelect: Ember['default'].computed.map("hddFormFactors", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectHDDFormFactors: (function () {
            var o_id = this.get("hddFormFactorsForSelect.firstObject").value;
            var model = this.get("model");
            model.hdds.forEach(function (hdd) {
                var is_updated = false;
                model.__json.hdds.forEach(function (json_hdd) {
                    if (hdd.id === json_hdd.id) {
                        var current = json_hdd.hdd_form_factor;
                        Ember['default'].set(hdd, "hdd_form_factor", current && current.id || o_id);
                        is_updated = true;
                        return;
                    }
                });
                if (!is_updated) {
                    Ember['default'].set(hdd, "hdd_form_factor", o_id);
                }
            });
        }).observes("hddFormFactorsForSelect.@each"),

        // hdd connection type
        hddConnectionTypes: (function () {
            var obj = PropertyOption['default'].create();
            return obj.getHDDConnectionType();
        }).property(),

        hddConnectionTypeForSelect: Ember['default'].computed.map("hddConnectionTypes", function (o) {
            return { label: o.get("name"), value: o.get("id") };
        }),

        preselectHDDConnectionTypes: (function () {
            var o_id = this.get("hddConnectionTypeForSelect.firstObject").value;
            var model = this.get("model");
            model.hdds.forEach(function (hdd) {
                var is_updated = false;
                model.__json.hdds.forEach(function (json_hdd) {
                    if (hdd.id === json_hdd.id) {
                        var current = json_hdd.hdd_connection_type;
                        Ember['default'].set(hdd, "hdd_connection_type", current && current.id || o_id);
                        is_updated = true;
                        return;
                    }
                });
                if (!is_updated) {
                    Ember['default'].set(hdd, "hdd_connection_type", o_id);
                }
            });
        }).observes("hddConnectionTypes.@each"),

        onModelSaved: function onModelSaved() {
            this.getNotificationController().alertSuccess("Server template has been saved.", {
                expire: true
            });
            this.get("originalModel").reload();
            this.close();
        },

        actions: {
            save: function save() {
                this.save(this.get("model"));
            },
            addHdd: function addHdd() {
                var obj = Ember['default'].Object.create({
                    hdd_qty: 1,
                    hdd_connection_type: null,
                    hdd_form_factor: null
                });
                var model = this.get("model");
                model.hdds.pushObject(obj);
            }
        }
    });

    ServerTemplateUpdateModalView.reopenClass({
        open: function open(model) {
            var view = this.create({
                originalModel: model,
                model: model,
                //selectedTemplate: model.__json.template && model.__json.template.id || null
                selectedCPUSocket: model.__json.cpu_socket && model.__json.cpu_socket.id || null,
                selectedRAMStandard: model.__json.ram_standard && model.__json.ram_standard.id || null
            });
            return view;
        }
    });

    exports['default'] = ServerTemplateUpdateModalView;

});
define('mb-test-1/views/navigation', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    tagName: 'nav',
    classNames: ['navbar navbar-default navbar-fixed-top'],
    templateName: 'navigation'
  });

});
define('mb-test-1/views/notification-center', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].View;

});
define('mb-test-1/views/page-navigations/page-navigation', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        layoutName: "page-navigations/page-navigation-layout" });

});
define('mb-test-1/views/results/baskets-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'baskets',
        templateName: 'results/baskets-table'
    });

});
define('mb-test-1/views/results/component-properties-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'component-properties',
        templateName: 'results/component-properties-table'
    });

});
define('mb-test-1/views/results/components-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'components',
        templateName: 'results/components-table'
    });

});
define('mb-test-1/views/results/floors-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'floors',
        templateName: 'results/floors-table'
    });

});
define('mb-test-1/views/results/node-servers-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'node-servers',
        templateName: 'results/node-servers-table'
    });

});
define('mb-test-1/views/results/nodes-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'nodes',
        templateName: 'results/nodes-table'
    });

});
define('mb-test-1/views/results/racks-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'racks',
        templateName: 'results/racks-table'
    });

});
define('mb-test-1/views/results/results-load-more', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        tagName: "tfoot",
        templateName: "results/results-load-more",
        actions: {
            loadMore: function loadMore(results) {
                results.loadNextPage();
            }
        }
    });

});
define('mb-test-1/views/results/results-table', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        tagName: 'table',
        classNames: 'items'
    });

});
define('mb-test-1/views/results/rooms-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'rooms',
        templateName: 'results/rooms-table'
    });

});
define('mb-test-1/views/results/rows-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'rows',
        templateName: 'results/rows-table'
    });

});
define('mb-test-1/views/results/server-components-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'server-components',
        templateName: 'results/server-components-table'
    });

});
define('mb-test-1/views/results/servers-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'servers',
        templateName: 'results/servers-table'
    });

});
define('mb-test-1/views/results/servertemplates-table', ['exports', 'mb-test-1/views/results/results-table'], function (exports, ResultsTableView) {

    'use strict';

    exports['default'] = ResultsTableView['default'].extend({
        classNames: 'servertemplates',
        templateName: 'results/servertemplates-table'
    });

});
define('mb-test-1/views/tables/cells/linked-text-cell', ['exports', 'ember', 'mb-test-1/views/tables/cells/table-cell-base'], function (exports, Ember, TableCellBaseView) {

    'use strict';

    exports['default'] = TableCellBaseView['default'].extend({
        templateName: "tables/cells/linked-text-cell",
        blankText: "none",
        attributeBindings: ["title"],
        isBlank: Ember['default'].computed.empty("labelText"),
        displayValue: (function () {
            if (this.get("isBlank")) {
                return this.get("blankText");
            } else {
                return this.get("labelText");
            }
        }).property("blankText", "isBlank", "labelText") });

});
define('mb-test-1/views/tables/cells/table-cell-base', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        tagName: "td" });

});
define('mb-test-1/views/tables/cells/titled-linked-cell', ['exports', 'ember', 'mb-test-1/views/tables/cells/linked-text-cell'], function (exports, Ember, LinkedTextCellView) {

    'use strict';

    exports['default'] = LinkedTextCellView['default'].extend({
        title: Ember['default'].computed.oneWay("labelText") });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('mb-test-1/config/environment', ['ember'], function(Ember) {
  var prefix = 'mb-test-1';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("mb-test-1/tests/test-helper");
} else {
  require("mb-test-1/app")["default"].create({"API_HOST":"http://46.101.149.14","API_NAMESPACE":"api/v1","API_ADD_TRAILING_SLASHES":false,"name":"mb-test-1","version":"0.0.0.9090aaaa"});
}

/* jshint ignore:end */
//# sourceMappingURL=mb-test-1.map