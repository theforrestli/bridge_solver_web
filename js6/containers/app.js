const App = require('../components/app');
const {connect} = require('react-redux');

function mapStateToProps(state) {
  return state;
}

// function matchDispatchToProps(dispatch){
//     return bindActionCreators({selectUser: selectUser}, dispatch);
// }

module.exports = connect(mapStateToProps)(App);
