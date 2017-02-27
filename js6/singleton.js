const _ = require('underscore');
/**
 * singleton should be constant
 */
const widths = [
  30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,                /* 0 to 10 */
  90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, /* 11 to 22 */
  220, 240, 260, 280, 300,                                   /* 23 to 27 */
  320, 340, 360, 400, 500                                    /* 28 to 32 */
];

const crossSections = [
  {
    index: 0,
    name:"Solid Bar",
    shortName:"Bar",
    getShape(sectionIndex, sizeIndex, width){
      const area = width*width * 1e-6;
      const moment = width*width*width*width / 12 * 1e-12;
      return {
        sectionIndex: sectionIndex,
        sizeIndex: sizeIndex,
        name: `${width}x${width}`,
        width: width,
        area: area,
        moment: moment,
        inverseRadiusOfGyration: Math.sqrt(area/moment),
        thickness: width,
      }
    }
  },
  {
    index: 1,
    name:"Hollow Tube",
    shortName:"Tube",
    getShape(sectionIndex, sizeIndex, width){
      const thickness = Math.floor(Math.max(width / 20, 2));
      const area = thickness*(width-thickness)* 4 * 1e-6;
      const moment = (width*width*width*width - Math.pow(width - 2 * thickness,4)) / 12 * 1e-12;
      return {
        sectionIndex: sectionIndex,
        sizeIndex: sizeIndex,
        name: `${width}x${width}x${thickness}`,
        width: width,
        area: area,
        moment: moment,
        inverseRadiusOfGyration: Math.sqrt(area/moment),
        thickness: thickness,
      }
    }
  },
];

const wpbd = module.exports = {
  anchorOffset: 8.0,
  panelSizeWorld: 4.0,
  gapDepth: 24.0,
  minOverhead: 8.0,
  maxSlenderness: 300.0,
  NDARD_TRUCK: 0,
  HEAVY_TRUCK: 1,
  MEDIUM_STRENGTH_DECK: 0,
  HI_STRENGTH_DECK: 1,
  maxJointCount: 100,
  maxMemberCount: 200,
  fromKeyCodeTag: "99Z",
  excavationCostRate: 1.0,
  anchorageCost: 6000.0,
  deckCostPerPanelMedStrength: 4700.0,
  deckCostPerPanelHiStrength: 5000.0,
  standardAbutmentBaseCost: 5500.0,
  standardAbutmentIncrementalCostPerDeckPanel: 500.0,
  archIncrementalCostPerDeckPanel: 3600.0,
  pierIncrementalCostPerDeckPanel: 4500.0,
  pierBaseCost: 3000.0,
  deckElevationIndexToExcavationVolume: [ 100000.0, 85000.0, 67000.0, 50000.0, 34000.0, 15000.0, 0.0 ],
  deckElevationIndexToKeycodeAbutmentCosts: [ 7000.0, 7000.0, 7500.0, 7500.0, 8000.0, 8000.0, 8500.0 ],
  underClearanceIndexToCost: [ -2000.0, 5400.0, 15000.0, 24400.0, 35500.0, 49700.0 ],
  pierHeightToCost: [ 0.0, 2800.0, 5600.0, 8400.0, 11200.0, 14000.0, 16800.0 ],
  conditions: {
      "1110824000":"01A", "2110824000":"01B", "3110824000":"01C", "4110824000":"01D",
      "1101220000":"02A", "2101220000":"02B", "3101220000":"02C", "4101220000":"02D",
      "1091616000":"03A", "2091616000":"03B", "3091616000":"03C", "4091616000":"03D",
      "1082012000":"04A", "2082012000":"04B", "3082012000":"04C", "4082012000":"04D",
      "1072408000":"05A", "2072408000":"05B", "3072408000":"05C", "4072408000":"05D",
      "1062804000":"06A", "2062804000":"06B", "3062804000":"06C", "4062804000":"06D",
      "1053200000":"07A", "2053200000":"07B", "3053200000":"07C", "4053200000":"07D",
      "1110824200":"08A", "2110824200":"08B", "3110824200":"08C", "4110824200":"08D",
      "1101220200":"09A", "2101220200":"09B", "3101220200":"09C", "4101220200":"09D",
      "1091616200":"10A", "2091616200":"10B", "3091616200":"10C", "4091616200":"10D",
      "1082012200":"11A", "2082012200":"11B", "3082012200":"11C", "4082012200":"11D",
      "1072408200":"12A", "2072408200":"12B", "3072408200":"12C", "4072408200":"12D",
      "1062804200":"13A", "2062804200":"13B", "3062804200":"13C", "4062804200":"13D",
      "1053200200":"14A", "2053200200":"14B", "3053200200":"14C", "4053200200":"14D",
      "1110824300":"15A", "2110824300":"15B", "3110824300":"15C", "4110824300":"15D",
      "1101220300":"16A", "2101220300":"16B", "3101220300":"16C", "4101220300":"16D",
      "1091616300":"17A", "2091616300":"17B", "3091616300":"17C", "4091616300":"17D",
      "1082012300":"18A", "2082012300":"18B", "3082012300":"18C", "4082012300":"18D",
      "1072408300":"19A", "2072408300":"19B", "3072408300":"19C", "4072408300":"19D",
      "1062804300":"20A", "2062804300":"20B", "3062804300":"20C", "4062804300":"20D",
      "1053200300":"21A", "2053200300":"21B", "3053200300":"21C", "4053200300":"21D",
      "1100804100":"22A", "2100804100":"22B", "3100804100":"22C", "4100804100":"22D",
      "1090808100":"23A", "2090808100":"23B", "3090808100":"23C", "4090808100":"23D",
      "1080812100":"24A", "2080812100":"24B", "3080812100":"24C", "4080812100":"24D",
      "1070816100":"25A", "2070816100":"25B", "3070816100":"25C", "4070816100":"25D",
      "1060820100":"26A", "2060820100":"26B", "3060820100":"26C", "4060820100":"26D",
      "1050824100":"27A", "2050824100":"27B", "3050824100":"27C", "4050824100":"27D",
      "1091204100":"28A", "2091204100":"28B", "3091204100":"28C", "4091204100":"28D",
      "1081208100":"29A", "2081208100":"29B", "3081208100":"29C", "4081208100":"29D",
      "1071212100":"30A", "2071212100":"30B", "3071212100":"30C", "4071212100":"30D",
      "1061216100":"31A", "2061216100":"31B", "3061216100":"31C", "4061216100":"31D",
      "1051220100":"32A", "2051220100":"32B", "3051220100":"32C", "4051220100":"32D",
      "1081604100":"33A", "2081604100":"33B", "3081604100":"33C", "4081604100":"33D",
      "1071608100":"34A", "2071608100":"34B", "3071608100":"34C", "4071608100":"34D",
      "1061612100":"35A", "2061612100":"35B", "3061612100":"35C", "4061612100":"35D",
      "1051616100":"36A", "2051616100":"36B", "3051616100":"36C", "4051616100":"36D",
      "1072004100":"37A", "2072004100":"37B", "3072004100":"37C", "4072004100":"37D",
      "1062008100":"38A", "2062008100":"38B", "3062008100":"38C", "4062008100":"38D",
      "1052012100":"39A", "2052012100":"39B", "3052012100":"39C", "4052012100":"39D",
      "1062404100":"40A", "2062404100":"40B", "3062404100":"40C", "4062404100":"40D",
      "1052408100":"41A", "2052408100":"41B", "3052408100":"41C", "4052408100":"41D",
      "1052804100":"42A", "2052804100":"42B", "3052804100":"42C", "4052804100":"42D",
      "1110824060":"43A", "2110824060":"43B", "3110824060":"43C", "4110824060":"43D",
      "1110820060":"44A", "2110820060":"44B", "3110820060":"44C", "4110820060":"44D",
      "1110816060":"45A", "2110816060":"45B", "3110816060":"45C", "4110816060":"45D",
      "1110812060":"46A", "2110812060":"46B", "3110812060":"46C", "4110812060":"46D",
      "1110808060":"47A", "2110808060":"47B", "3110808060":"47C", "4110808060":"47D",
      "1110804060":"48A", "2110804060":"48B", "3110804060":"48C", "4110804060":"48D",
      "1110824061":"49A", "2110824061":"49B", "3110824061":"49C", "4110824061":"49D",
      "1101220060":"50A", "2101220060":"50B", "3101220060":"50C", "4101220060":"50D",
      "1101216060":"51A", "2101216060":"51B", "3101216060":"51C", "4101216060":"51D",
      "1101212060":"52A", "2101212060":"52B", "3101212060":"52C", "4101212060":"52D",
      "1101208060":"53A", "2101208060":"53B", "3101208060":"53C", "4101208060":"53D",
      "1101204060":"54A", "2101204060":"54B", "3101204060":"54C", "4101204060":"54D",
      "1101220061":"55A", "2101220061":"55B", "3101220061":"55C", "4101220061":"55D",
      "1091616050":"56A", "2091616050":"56B", "3091616050":"56C", "4091616050":"56D",
      "1091612050":"57A", "2091612050":"57B", "3091612050":"57C", "4091612050":"57D",
      "1091608050":"58A", "2091608050":"58B", "3091608050":"58C", "4091608050":"58D",
      "1091604050":"59A", "2091604050":"59B", "3091604050":"59C", "4091604050":"59D",
      "1091616051":"60A", "2091616051":"60B", "3091616051":"60C", "4091616051":"60D",
      "1082012050":"61A", "2082012050":"61B", "3082012050":"61C", "4082012050":"61D",
      "1082008050":"62A", "2082008050":"62B", "3082008050":"62C", "4082008050":"62D",
      "1082004050":"63A", "2082004050":"63B", "3082004050":"63C", "4082004050":"63D",
      "1082012051":"64A", "2082012051":"64B", "3082012051":"64C", "4082012051":"64D",
      "1072408040":"65A", "2072408040":"65B", "3072408040":"65C", "4072408040":"65D",
      "1072404040":"66A", "2072404040":"66B", "3072404040":"66C", "4072404040":"66D",
      "1072408041":"67A", "2072408041":"67B", "3072408041":"67C", "4072408041":"67D",
      "1062804040":"68A", "2062804040":"68B", "3062804040":"68C", "4062804040":"68D",
      "1062804041":"69A", "2062804041":"69B", "3062804041":"69C", "4062804041":"69D",
      "1053200031":"70A", "2053200031":"70B", "3053200031":"70C", "4053200031":"70D",
      "1110824360":"71A", "2110824360":"71B", "3110824360":"71C", "4110824360":"71D",
      "1110820360":"72A", "2110820360":"72B", "3110820360":"72C", "4110820360":"72D",
      "1110816360":"73A", "2110816360":"73B", "3110816360":"73C", "4110816360":"73D",
      "1110812360":"74A", "2110812360":"74B", "3110812360":"74C", "4110812360":"74D",
      "1110808360":"75A", "2110808360":"75B", "3110808360":"75C", "4110808360":"75D",
      "1110804360":"76A", "2110804360":"76B", "3110804360":"76C", "4110804360":"76D",
      "1110824361":"77A", "2110824361":"77B", "3110824361":"77C", "4110824361":"77D",
      "1101220360":"78A", "2101220360":"78B", "3101220360":"78C", "4101220360":"78D",
      "1101216360":"79A", "2101216360":"79B", "3101216360":"79C", "4101216360":"79D",
      "1101212360":"80A", "2101212360":"80B", "3101212360":"80C", "4101212360":"80D",
      "1101208360":"81A", "2101208360":"81B", "3101208360":"81C", "4101208360":"81D",
      "1101204360":"82A", "2101204360":"82B", "3101204360":"82C", "4101204360":"82D",
      "1101220361":"83A", "2101220361":"83B", "3101220361":"83C", "4101220361":"83D",
      "1091616350":"84A", "2091616350":"84B", "3091616350":"84C", "4091616350":"84D",
      "1091612350":"85A", "2091612350":"85B", "3091612350":"85C", "4091612350":"85D",
      "1091608350":"86A", "2091608350":"86B", "3091608350":"86C", "4091608350":"86D",
      "1091604350":"87A", "2091604350":"87B", "3091604350":"87C", "4091604350":"87D",
      "1091616351":"88A", "2091616351":"88B", "3091616351":"88C", "4091616351":"88D",
      "1082012350":"89A", "2082012350":"89B", "3082012350":"89C", "4082012350":"89D",
      "1082008350":"90A", "2082008350":"90B", "3082008350":"90C", "4082008350":"90D",
      "1082004350":"91A", "2082004350":"91B", "3082004350":"91C", "4082004350":"91D",
      "1082012351":"92A", "2082012351":"92B", "3082012351":"92C", "4082012351":"92D",
      "1072408340":"93A", "2072408340":"93B", "3072408340":"93C", "4072408340":"93D",
      "1072404340":"94A", "2072404340":"94B", "3072404340":"94C", "4072404340":"94D",
      "1072408341":"95A", "2072408341":"95B", "3072408341":"95C", "4072408341":"95D",
      "1062804340":"96A", "2062804340":"96B", "3062804340":"96C", "4062804340":"96D",
      "1062804341":"97A", "2062804341":"97B", "3062804341":"97C", "4062804341":"97D",
      "1053200331":"98A", "2053200331":"98B", "3053200331":"98C", "4053200331":"98D",
  },
  SHAPE_INCREASE_SIZE: 1,
  SHAPE_DECREASE_SIZE: 2,
  compressionResistanceFactor: 0.90,
  tensionResistanceFactor: 0.95,
  connectionFee: 500.00,
  orderingFee: 1000.00,
  widths: widths,
  crossSections: _.map(crossSections, ({name, shortName}, index) => {
    return {index, name, shortName};
  }),
  materials: [
    {index: 0, name: "Carbon Steel",                  shortName: "CS",  E: 200000000, Fy: 250000, density: 7850, cost: [4.50, 6.30]},
    {index: 1, name: "High-Strength Low-Alloy Steel", shortName: "HSS", E: 200000000, Fy: 345000, density: 7850, cost: [5.00, 7.00]},
    {index: 2, name: "Quenched & Tempered Steel",     shortName: "QTS", E: 200000000, Fy: 485000, density: 7850, cost: [5.55, 7.75]},
  ],
  shapes: _.map(crossSections, ({getShape}, sectionIndex) => {
    return _.map(widths, (width, sizeIndex) => {
      return getShape(sectionIndex, sizeIndex, width);
    });
  }),

  //Analysis
  deadLoadFactor: 1.25,
  liveLoadFactor: 1.75 * 1.33,

  iledMemberDegradation: 1.0 / 50.0,

  T_FAILED: -1,
  FAILED: 1e6,
  NO_STATUS: 0,
  FAILS_SLENDERNESS: 1,
  UNSTABLE: 2,
  FAILS_LOAD_TEST: 3,
  PASSES: 4,
  defaultBridgeString: "2014205320000011 19  0  0 16  0 32  0 48  0 64  0 80  0  8 16 24 16 40 17 56 16 72 16 1 71118 7 81116 8 91118 91011181011111611 61118 6 50112 5 420 5 4 320 5 3 220 5 2 10112 7 220 5 2 81116 8 30112 3 90112 9 40112 410011210 51116 51120 50.40|0.00|0.31|0.00|0.46|0.00|0.46|0.00|0.31|0.00|0.40|0.00|0.00|0.09|0.00|0.21|0.00|0.26|0.00|0.21|0.00|0.09|0.00|0.20|0.24|0.00|0.00|0.12|0.08|0.04|0.08|0.04|0.00|0.12|0.24|0.00|0.00|0.20||00007B-|1|2.000|",

  //grid
  abutmentClearanc:1,
  wearSurfaceHeight: 0.80,

  //custom
  guiLayer:3,
  flags: {
    "condition":1,
    "bridge":2,
    "analyze":4,
    "select":8
  },
  key: "QuenchHollow"
};
window.wpbd_material_get = (index) => {
    return wpbd.materials[index];
}
window.wpbd_shape_get = (sectionIndex,sizeIndex) => {
    return wpbd.shapes[sectionIndex][sizeIndex];
}
window.wpbd_shape_new = (section,sizeIndex,name,width,area,moment,inverseRadiusOfGyration,thickness) => {
    return {
        "section":section,
        "sizeIndex":sizeIndex,
        "name":name,
        "width":width,
        "area":area,
        "moment":moment,
        "inverseRadiusOfGyration":Math.sqrt(area/moment),
        "thickness":thickness};
}
window.wpbd_compressiveStrength = (material,shape,length) => {
    var Fy = material.Fy;
    var area = shape.area;
    var E = material.E;
    var moment = shape.moment;
    var lambda = length * length * Fy * area / (9.8696044 * E * moment);
    return (lambda <= 2.25) ? 
        wpbd.compressionResistanceFactor * Math.pow(0.66, lambda) * Fy * area : 
        wpbd.compressionResistanceFactor * 0.88 * Fy * area / lambda;
}
window.wpbd_tensileStrength = (material, shape) =>  {
    return wpbd.tensionResistanceFactor * material.Fy * shape.area;
}
window.wpbd_material_new = (index,name,shortName,E,Fy,density,cost) => {
    return {
        "index":index,
        "name":name,
        "shortName":shortName,
        "E":E,
        "Fy":Fy,
        "density":density,
        "cost":cost};
}
window.wpbd_round = (a,n) => {
    return Math.round(a/n)*n;
}
