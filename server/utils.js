
module.exports = {
    pick: function (target, keys) {
        if (Array.isArray(keys)) {
          return keys.reduce((pre, next, idx, initialArray) => ({
              ...pre,
              [next]: target[next]
          }), {})
        }
        return target;
    }
};