class Observable {
    constructor(value, cloneValue) {
      this._cloneValue = cloneValue || defaultCloneValue;
      this._curValue = this._cloneValue(value);
      this._listeners = [];
  
      function defaultCloneValue(v) {
        return JSON.parse(JSON.stringify(v));
      }
    }
  
    /**
     * Adds a listener that is notified of value changes (when `fireChanged()` is called).
     * A listener is a function that accepts the old value and the new value.
     * If the listener needs to unsubscribe, it can return `false`, all other values
     * will be ignored.
     * Parameters: listener function.
     */
    addListener(listenerFun) {
      this._listeners.push({f: listenerFun, delay: null});
    }
  
    /**
     * Adds an asynchronous listener that is notified of value changes (when `fireChanged()` is called)
     * not more frequently than once in `delay` ms.
     * A listener is a function that accepts the old value and the new value.
     * If the listener needs to unsubscribe, it can return `false`, all other values
     * will be ignored.
     * Parameters: listener function, delay in ms.
     */
    addAsyncListener(listenerFun, delay) {
      this._listeners.push({f: listenerFun, delay: delay});
    }
  
    removeListener(listenerFun) {
      this._listeners = this._listeners.filter(listener => listener.f === listenerFun);
    }
  
    fireChanged(newValue) {
      var curValue = this._curValue;// better use const or let
      var listeners = this._listeners;//need to clone listeners for immutable data
      for (var i = 0; i < listeners.length; ++i) {
        var listener = listeners[i];
        var delay = listener.delay;
        function callListener(oldValue) {
          if (listener.f(oldValue, newValue) == false) {
            listeners.splice(i--, 1);//need use removeListener. listeners.splice changed listeners length and listeners[i] not the same
          }
        }
        if (!delay && delay !== 0) {
          callListener(curValue);
        } else {
          var job = listener.job;//doesnt work if cloned listeners. Maybe use different value like this.jobs for storage jobs ? 
          if (job) {
            clearTimeout(job);
          } else {
            listener.oldValue = curValue;
          }
          listener.job = setTimeout(function callListenerAsync() {
            listener.job = null;
            callListener(listener.oldValue);
          }, delay);
        }
      }
      this._curValue = this._cloneValue(newValue);
    }
  }
  
  export default Observable;