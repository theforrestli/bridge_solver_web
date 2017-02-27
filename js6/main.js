require('./singleton');
require('./singleton2');
require('./gui');
require('./history');
require('./condition');
require('./bridge');
require('./analysis');
require('./cost');
require('./button');
require('./rc4');
//
// import * as _ from "underscore";
// import * as BP from "@blueprintjs/core";
// import * as React from "react";
// import * as ReactDOM from 'react-dom';

// console.log(Object.keys(BP));

// const menu = BP.MenuFactory(
//   null,
//   BP.MenuItemFactory({iconName: "graph", text: "graph"}),
//   BP.MenuItemFactory({iconName: "graph", text: "graph"}),
//   BP.MenuItemFactory({iconName: "graph", text: "graph"}),
//   BP.MenuItemFactory({iconName: "graph", text: "graph"}),
//   BP.MenuDividerFactory(),
//   BP.MenuItemFactory({iconName: "graph", text: "graph"}),
//   BP.MenuItemFactory({iconName: "graph", text: "graph", disabled: true}),
// )
//   // <Menu>
//   //   <MenuItem iconName="graph" text="Graph" />
//   //   <MenuItem iconName="map" text="Map" />
//   //   <MenuItem iconName="th" text="Table" shouldDismissPopover={false} />
//   //   <MenuItem iconName="zoom-to-fit" text="Nucleus" disabled={true} />
//   //   <MenuDivider />
//   //   <MenuItem iconName="cog" text="Settings...">
//   //   <MenuItem iconName="add" text="Add new application" disabled={true} />
//   //   <MenuItem iconName="remove" text="Remove application" />
//   // </Menu>
// // const btn = C(BP.Button, {className: "pt-small", text: "test"})();
// const navbar1 = () => {
//   return React.DOM.nav(
//     {className: "pt-navbar"},
//     React.DOM.div(
//       {className: "pt-navbar-group pt-align-left"},
//       React.DOM.div({className: "pt-navbar-heading"}, "Blueprint"),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "File")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Edit")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "View")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Tool")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Test")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Report")
//       ),
//       BP.PopoverFactory(
//         { content: menu, position: BP.Position.BOTTOM },
//         BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "About")
//       ),
//     ),
//   );
// };
// const navbar2 = () => {
//   return React.DOM.div(
//     { style: {margin: "3px"} },
//     React.DOM.div(
//       { className: "pt-button-group",},
//       BP.ButtonFactory({ className: "pt-button pt-icon-floppy-disk", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-folder-open", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-print", type: "button"}),
//     ),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       BP.ButtonFactory({ className: "pt-button pt-icon-edit", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-drive-time", type: "button"}),
//     ),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       BP.ButtonFactory({ className: "pt-button pt-icon-undo", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-redo", type: "button"}),
//     ),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       BP.ButtonFactory({ className: "pt-button pt-icon-calculator", type: "button", text: "$123,456.78"}),
//     ),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       BP.ButtonFactory({ className: "pt-button pt-icon-th", type: "button"}),
//     ),
//     BP.TagFactory({ intent: BP.Intent.SUCCESS, className: "pt-minimal pt-large"}, "PASS"),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       React.DOM.div(
//         { className: "pt-select" },
//         React.DOM.select(
//           { style: {"vertical-align": "baseline"} },
//           React.DOM.option({value: "1", selected: true}, "Quenched & Tempered Steel"),
//           React.DOM.option({value: "2"}, "Hollow"),
//           React.DOM.option({value: "3"}, "Hollow"),
//         ),
//       ),
//       React.DOM.div(
//         { className: "pt-select" },
//         React.DOM.select(
//           { style: {"vertical-align": "baseline"} },
//           React.DOM.option({value: "1", selected: true}, "Hollow Tube"),
//           React.DOM.option({value: "2"}, "Hollow"),
//           React.DOM.option({value: "3"}, "Hollow"),
//         ),
//       ),
//       React.DOM.div(
//         { className: "pt-select" },
//         React.DOM.select(
//           { style: {"vertical-align": "baseline"} },
//           React.DOM.option({value: "1", selected: true}, "500x500x10"),
//           React.DOM.option({value: "2"}, "Hollow"),
//           React.DOM.option({value: "3"}, "Hollow"),
//         ),
//       ),
//     ),
//     React.DOM.div(
//       { className: "pt-button-group" },
//       BP.ButtonFactory({ className: "pt-button pt-icon-widget", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-grid", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-layout-grid", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-grid-view", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-column-layout", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-draw", type: "button"}),
//       BP.ButtonFactory({ className: "pt-button pt-icon-numerical", type: "button"}),
//     ),
//   );
// };
// // const navbar = C("nav", {className: "pt-navbar"})(
// //   C("div", {className: "pt-navbar-group pt-align-left"})(
// //     C("div", {className: "pt-navbar-heading"})("Blueprint"),
// //     C(B.Popover, { content: compassMenu, position: B.Position.RIGHT_BOTTOM })(
// //       B.ButtonFactory({ className: "pt-minimal pt-button pt-icon-share", type: "button"})( "Open in...")
// //     )
// //   )
// // );

// const div = React.DOM.div(
//   null,
//   navbar1(),
//   navbar2(),
// );

// import * as App from './components/app';
// const AppFactory = React.createFactory(require('./components/app'));
// const App = require('./components/app');
// const App = require('./components/app');


// ReactDOM.render(
//   React.createElement(App),
//   document.querySelector("#test"),
// );
// require('babel-polyfill');
// const React = require('react');
// const ReactDOM = require("react-dom");
// const {Provider} = require('react-redux');
// const {createStore, applyMiddleware} = require('redux');
// const thunk = require('redux-thunk');
// const promise = require('redux-promise');
// const createLogger = require('redux-logger');
// const allReducers = require('./reducers/index');
// const App = require('./components/app');

// const logger = createLogger();
// const store = createStore(
//   allReducers
//   // applyMiddleware(thunk, promise, logger)
// );

// ReactDOM.render(
//   React.createElement(Provider, {store}, React.createElement(App)),
//   document.getElementById('test')
// );
