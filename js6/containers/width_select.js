const _ = require('underscore');
const TypeSelect = require('../components/type_select');
const {connect} = require('react-redux');
const {createFactory} = require('react');

function mapStateToProps(state) {
  return {
    items: _.map(state.versionConstants.shapes[0], (shape) => {
      return {
        name: shape.name,
        index: shape.sizeIndex
      };
    }),
    selectedIndex: -1
  }
}

// function matchDispatchToProps(dispatch){
//     return bindActionCreators({selectUser: selectUser}, dispatch);
// }

module.exports = createFactory(connect(mapStateToProps)(TypeSelect));
