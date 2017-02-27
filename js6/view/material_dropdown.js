{createElement: rCreate} = require('react');

  return rCreate(
    "div",
    { id: "material", "class": "btn-group" },
    rCreate(
      "button",
      { "class": "btn btn-default dropdown-toggle" type: "button", "data-toggle": "dropdown" },
      selected?selected.name:"",
      rCreate("span", {"class": "caret"})
    ),
    rCreate(
      "ul",
      { "class": "dropdown-menu" },
      rCreate("li", null, rCreate("a", {href: "#"}, "CS")),
      rCreate("li", null, rCreate("a", {href: "#"}, "CS")),
      rCreate("li", null, rCreate("a", {href: "#"}, "CS")),
    )
  );

                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                  QTS
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                  <li><a href="#">CS</a></li>
                  <li><a href="#">HSS</a></li>
                  <li><a href="#">QTS</a></li>
                </ul>
