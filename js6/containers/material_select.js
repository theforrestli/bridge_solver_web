const TypeSelect = require('../components/type_select');
const {connect} = require('react-redux');
const {createFactory} = require('react');

function mapStateToProps(state) {
  return {
    items: state.versionConstants.materials,
    selectedIndex: -1
  }
}

// function matchDispatchToProps(dispatch){
//     return bindActionCreators({selectUser: selectUser}, dispatch);
// }

module.exports = createFactory(connect(mapStateToProps)(TypeSelect));
