let database = {
  add: function (key, value) {
    try {
      return window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  },

  update: function (key, value) {
    try {
      return window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  },

  get: function (key) {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch (e) {
      return false;
    }
  },

  getAll: function (key) {
    try {
      let result = [];
      for (key2 in window.localStorage) {
        if (key2.indexOf(key) == 0) {
          result[result.length++] = {
            [key2]: JSON.parse(window.localStorage.getItem(key2)),
          };
        }
      }
      return result;
    } catch (e) {
      return false;
    }
  },

  remove: function (key) {
    try {
      return window.localStorage.removeItem(key);
    } catch (e) {
      return false;
    }
  },

  clear: function () {
    try {
      window.localStorage.clear();
    } catch (e) {
      return false;
    }
  },
};
