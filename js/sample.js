singleton=
{


"inventory":
{
  "gridSize":0.25,
  "compressionResistanceFactor":0.90,
  "tensionResistanceFactor":0.95,
  "gravity":9.8,
  "deadLoadFactor":1.25,
  "liveLoadFactor":2.3275,
  "c":1,
  "bundleCost":1000,
  "jointSingleCost":300,
  "deckTypes":[
    {"name":"med","cost":4700,"weightExpr":"inventory.deadLoadFactor * 120.265 + 33.097"},
    {"name":"high","cost":5000,"weightExpr":"inventory.deadLoadFactor * 82.608 + 33.097"}
  ],
  "truckTypes":[{"name":"standard","frontRaw":44,"backRaw":181},{"name":"heavy","frontRaw":115,"backRaw":115}],
  "types":[
    {"name":"BS100","e": 1,"fy": 1,"density":1,"area":1,"moment":1,"cost_vol":1}
  ],
  "conditions":{
    "testCondition1":{
      "boundingRect":{"x":-2,"y":-14,"width":36,"height":36},
      "boundingPoly":[
        {"y":-12,"minX":6,"maxX":26},
        {"y": -2,"minX":1,"maxX":31},
        {"y":-0.25,"minX":1,"maxX":31},
        {"y":  0,"minX":0,"maxX":32},
        {"y": 20,"minX":0,"maxX":32}
      ],
      "joints":[
        {"x": 0,"y":0},
        {"x": 4,"y":0},
        {"x": 8,"y":0},
        {"x":12,"y":0},
        {"x":16,"y":0},
        {"x":20,"y":0},
        {"x":24,"y":0},
        {"x":28,"y":0},
        {"x":32,"y":0}
      ],
      "fixedIndex":[0,1,17],
      "baseCost":300,
      "deckSize":8,
      "deckType":"med",
      "truckType":"heavy",
      "slenderness":300.0
    }
  },
  "bridges":{
    "testBridge1":{
      "conditionName":"testCondition1",
      "joints":[
        {"x":2,"y":-4},
        {"x":6,"y":-4},
        {"x":10,"y":-4},
        {"x":14,"y":-4},
        {"x":18,"y":-4},
        {"x":22,"y":-4},
        {"x":26,"y":-4},
        {"x":30,"y":-4}
      ],
      "members":[
        {"j1":0,"j2":1},
        {"j1":1,"j2":2},
        {"j1":2,"j2":3},
        {"j1":3,"j2":4},
        {"j1":4,"j2":5},
        {"j1":5,"j2":6},
        {"j1":6,"j2":7},
        {"j1":7,"j2":8},
        {"j1":9,"j2":10},
        {"j1":10,"j2":11},
        {"j1":11,"j2":12},
        {"j1":12,"j2":13},
        {"j1":13,"j2":14},
        {"j1":14,"j2":15},
        {"j1":15,"j2":16},
        {"j1":0,"j2":9},
        {"j1":9,"j2":1},
        {"j1":1,"j2":10},
        {"j1":10,"j2":2},
        {"j1":2,"j2":11},
        {"j1":11,"j2":3},
        {"j1":3,"j2":12},
        {"j1":12,"j2":4},
        {"j1":4,"j2":13},
        {"j1":13,"j2":5},
        {"j1":5,"j2":14},
        {"j1":14,"j2":6},
        {"j1":6,"j2":15},
        {"j1":15,"j2":7},
        {"j1":7,"j2":16},
        {"j1":16,"j2":8}
      ],
      "type":{
        "bundle":["TH180","TH220","BH_90"],
        "member":[0,0,1,1,1,1,0,0,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]
      }
    }
  }
},
"bridgeName":"testBridge1",

"preference":
{
  "jointColor":"#808080",
  "hoverColor":"#000000",
  "bundleColor":["#FF0000","#00FF00"],
  "size":1,
  "minSelectDist":1
}
}







