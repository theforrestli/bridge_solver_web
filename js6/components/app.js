// import * as _ from "underscore";
// import * as BP from "@blueprintjs/core";
// import * as React from "react";
// import * as ReactDOM from 'react-dom';
const {Component, DOM, createFactory} = require('react');
const wpbd = require('../singleton');
const BP = require('@blueprintjs/core');
const _ = require('underscore');
const MaterialSelect = require('../containers/material_select');
const CrossSectionSelect = require('../containers/cross_section_select');
const WidthSelect = require('../containers/width_select');
const TypeSelectFactory = createFactory(require('./type_select'));

const menu = () => {
  return BP.MenuFactory(
    null,
    BP.MenuItemFactory({iconName: "graph", text: "graph"}),
    BP.MenuItemFactory({iconName: "graph", text: "graph"}),
    BP.MenuItemFactory({iconName: "graph", text: "graph"}),
    BP.MenuItemFactory({iconName: "graph", text: "graph"}),
    BP.MenuDividerFactory(),
    BP.MenuItemFactory({iconName: "graph", text: "graph"}),
    BP.MenuItemFactory({iconName: "graph", text: "graph", disabled: true})
  );
};

class App extends Component {
  render(){
    return DOM.div(
      { id: "app" },
      DOM.nav(
        {className: "pt-navbar"},
        DOM.div(
          {className: "pt-navbar-group pt-align-left"},
          DOM.div({className: "pt-navbar-heading"}, "Blueprint"),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "File")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Edit")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "View")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Tool")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Test")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Report")
          ),
          BP.PopoverFactory(
            { content: menu(), position: BP.Position.BOTTOM },
            BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "About")
          )
        )
      ),
      DOM.div(
        { id: "app-nav" },
        BP.PopoverFactory(
          { content: menu(), position: BP.Position.BOTTOM_LEFT },
          BP.ButtonFactory({ className: "pt-minimal pt-button", type: "button"}, "Blueprint")
        ),
        DOM.div(
          { className: "pt-button-group pt-minimal" },
          BP.ButtonFactory({ className: "pt-button pt-icon-floppy-disk", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-folder-open", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-print", type: "button"})
        ),
        DOM.div(
          { className: "pt-button-group pt-minimal" },
          BP.ButtonFactory({ className: "pt-button pt-icon-edit", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-drive-time", type: "button"})
        ),
        DOM.div(
          { className: "pt-button-group pt-minimal" },
          BP.ButtonFactory({ className: "pt-button pt-icon-undo", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-redo", type: "button"})
        ),
        DOM.div(
          { className: "pt-button-group pt-minimal" },
          BP.ButtonFactory({ className: "pt-button pt-icon-calculator", type: "button", text: "$123,456.78"})
        ),
        DOM.div(
          { className: "pt-button-group pt-minimal" },
          BP.ButtonFactory({ className: "pt-button pt-icon-th", type: "button"})
        ),
        BP.TagFactory({ intent: BP.Intent.SUCCESS, className: "pt-minimal pt-large"}, "PASS"),
        DOM.div(
          { className: "pt-button-group" },
          MaterialSelect(),
          CrossSectionSelect(),
          WidthSelect(),
          // TypeSelectFactory({
          //   items: this.state.constants.materials,
          //   selectedIndex: 0
          // }),
          // TypeSelectFactory({
          //   items: this.state.constants.crossSections,
          //   selectedIndex: 0
          // }),
          DOM.div(
            { className: "pt-select" },
            DOM.select(
              { style: {"vertical-align": "baseline"} },
              DOM.option({value: "1", selected: true}, "500x500x10"),
              DOM.option({value: "2"}, "Hollow"),
              DOM.option({value: "3"}, "Hollow")
            )
          )
        ),
        DOM.div(
          { className: "pt-button-group" },
          BP.ButtonFactory({ className: "pt-button pt-icon-widget", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-grid", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-layout-grid", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-grid-view", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-column-layout", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-draw", type: "button"}),
          BP.ButtonFactory({ className: "pt-button pt-icon-numerical", type: "button"})
        )
      ),
      DOM.div(
        { id: "app-main" },
        DOM.div(
          { id: "canvas" }
        ),
        DOM.div(
          { id: "member-table", className: this.state.setting.showMemberTable }
        )
      )
    );
  }
};




// // export default App;
module.exports = App;
