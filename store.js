(function () {

  var typeFlags = {
    'Number()': 'n|',
    'String()': 's|',
    'Boolean()': 'b|',
    'Object()': 'o|',
    'Array()': 'a|',
    'Function()': 'f|',
    'undefined': 'u|',
    'null': 'l|'
  };

  var convertFlag = {
    's|': function (val) {
      return val;
    },
    'n|': function (val) {
      return val * 1;
    },
    'b|': function (val) {
      return val === 'true' ? true : false;
    },
    'o|': function (val) {
      return JSON.parse(val);
    },
    'a|': function (val) {
      return JSON.parse(val);
    },
    'f|': function (val) {
      var fnName = val.slice(8, val.indexOf('('));
      var fnArgs = val.slice(val.indexOf('(') + 1, val.indexOf(')'))
                  .replace(' ', '')
                  .split(',');
      var fnBody = val.slice(val.indexOf('{') + 1, val.lastIndexOf('}'));

      var fn = new Function('return function ' + fnName + '(' + fnArgs.toString() + '){' + fnBody + '}');
      return fn();
    },
    'u|': function (val) {
      return undefined;
    },
    'l|': function (val) {
      return null;
    }
  }

  var storeBase = function (storeType) {

    return {
      get: function (key) {

        if (!key) {
          return new Error('Key is required');
        } else {

          // get value
          var data = storeType.getItem(key);
          var typeHint = data.slice(0,2);

          // convert to type
          data = convertFlag[typeHint](data.slice(2));
 
          return data;
        }

      },
 
      set: function (key, val) {

        // check argument length because val === undefined or null is valid
        if (arguments.length < 2) {
          return new Error('Key and value are required');
        } else {

          // store value
          var typeKey;

          if (val === null) {
            typeKey = 'null';
          }
          if (val === undefined) {
            typeKey = 'undefined';
          }
          if (val !== null && val !== undefined) {
            typeKey = val.constructor.toString().split(' ')[1];
          }

          if (typeFlags[typeKey] === 'a|' || typeFlags[typeKey] === 'o|') {
            val = JSON.stringify(val);
          }

          //store value with type hint
          storeType.setItem(key, typeFlags[typeKey] + val);
        }

      },

      remove: function (key) {
        if (key === undefined) {
          return new Error('Key is required');
        } else {
          storeType.removeItem(key);
        }
      },

      clear: function () {
        storeType.clear();
      }
    }

  }

  // taken from modernizr
  // safe to presume if a client has localStorage, also has sessionStorage
  var hasStorage = false;
  try {
    window.localStorage.setItem(mod, mod);
    window.localStorage.removeItem(mod);
    hasStorage = true;
  } catch(e) {}

  // ns (namespace) object stores should be set on
  window.store = function (ns) {
    if (!hasStorage) {
      return throw new Error('localStorage/sessionStorage not available');
    } else {
      ns.store = storeBase(localStorage);
      ns.session = storeBase(sessionStorage);
    }
  };

})();
