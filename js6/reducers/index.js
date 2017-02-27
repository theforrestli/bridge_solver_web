const versionConstants = require('./version_constants');
const {combineReducers} = require('redux');

/*
 *  * We combine all reducers into a single object before updated data is
 *  dispatched (sent) to store
 *   * Your entire applications state (store) is just whatever gets returned
 *   from all your reducers
 *    * */

module.exports = combineReducers({
  versionConstants
});
module.exports = (state, action) => {
  if(state == null){
    return {
      versionConstants: versionConstants
    }
  };
  return state;
};



