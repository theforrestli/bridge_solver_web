
//hard coded
function wpbd_condition_get_from_code(f,codeLong){
    f.tag=wpbd.conditions[codeLong];
    if(f.tag===undefined){
        f.tag=wpbd.fromKeyCodeTag;
    }
    f.codeLong=codeLong;
    f.code=Array(10);
    for(var t=0;t<10;t++){
        f.code[9-t]=codeLong%10;
        codeLong=Math.floor(codeLong/10);
    }
    
    if(wpbd_condition_getCodeError(f.code)!=0){
        throw ("illegal condition code: "+f.codeLong);
    }
    // code dependencies
    // digit 10 => (0 = low pier, 1 = high pier)
    f.hiPier = (f.code[9] > 0);
    // digit 9 => panel point at which pier is located. (-1 = no pier).
    f.pierJointIndex = (f.pierPanelIndex = f.code[8] - 1);
    var pier = f.pierPanelIndex >= 0;
    // digit 8 => (0 = simple, 1 = arch, 2 = cable left, 3 = cable both)
    var arch = f.code[7] == 1;
    var leftCable = (f.code[7] == 2) || (f.code[7] == 3);
    var rightCable = f.code[7] == 3;
    // digits 6 and 7 => under span clearance
    f.underClearance = (10 * f.code[5] + f.code[6]);
    // digits 4 and 5 => overhead clearance
    f.overClearance = (10 * f.code[3] + f.code[4]);
    // digits 2 and 3 => number of bridge panels
    f.nPanels = (10 * f.code[1] + f.code[2]);
    // digit 1 is the load case, 1-based
    // -1 correction for 0-based load_case table
    var loadCaseIndex = f.code[0] - 1;
    f.loadType = ((loadCaseIndex & 0x1) == 0 ? wpbd.STANDARD_TRUCK : wpbd.HEAVY_TRUCK);
    f.deckType = ((loadCaseIndex & 0x2) == 0 ? wpbd.MEDIUM_STRENGTH_DECK : wpbd.HI_STRENGTH_DECK);

    ////////////////////////////
    // Second tier dependencies.
    ////////////////////////////

    // Work space dimensions.
    if (arch)
    {
      f.deckElevation = (4 * (f.nPanels - 5) + f.underClearance);
      f.archHeight = f.underClearance;
    }
    else
    {
      f.deckElevation = (4 * (f.nPanels - 5));
      f.archHeight = -1.0;
    }
    f.overMargin = wpbd.gapDepth + wpbd.minOverhead - f.deckElevation;
    f.pierHeight = f.hiPier?f.deckElevation:pier?deckElevation-underClearance:-1;
    
    // Prescribed joint information.
    f.nPrescribedJoints = (f.nPanels + 1);
    f.archJointIndex = f.leftAnchorageJointIndex = f.rightAnchorageJointIndex = -1;
    // Add one prescribed joint for the intermediate support, if any.
    if ((pier) && (!f.hiPier))
    {
      f.pierJointIndex = f.nPrescribedJoints;
      f.nPrescribedJoints += 1;
    }
    // Another two for the arch bases, if we have an arch.
    if (arch)
    {
      f.archJointIndex = f.nPrescribedJoints;
      f.nPrescribedJoints += 2;
    }

    // And more for the anchorages, if any.
    f.nAnchorages = 0;
    if (leftCable)
    {
      f.leftAnchorageJointIndex = f.nPrescribedJoints;
      f.nAnchorages += 1;
      f.nPrescribedJoints += 1;
    }
    if (rightCable)
    {
      f.rightAnchorageJointIndex = f.nPrescribedJoints;
      f.nAnchorages += 1;
      f.nPrescribedJoints += 1;
    }
    f.spanLength = (f.nPanels * wpbd.panelSizeWorld);
    f.nLoadedJoints = (f.nPanels + 1);
    f.prescribedJoints = Array(f.nPrescribedJoints);
    

    var x = 0.0;
    var y = 0.0;
    var i;
    for (i = 0; i < f.nLoadedJoints; i++)
    {
      f.prescribedJoints[i] = wpbd_joint_new(i,x,y,true);
      x += wpbd.panelSizeWorld;
    }
    f.xLeftmostDeckJoint = f.prescribedJoints[0].x;
    f.xRightmostDeckJoint = f.prescribedJoints[f.nLoadedJoints - 1].x;
    
    f.nJointRestraints = 3;
    if (pier) {
      if (f.hiPier)
      {
        // Pier joint has 2, but we make the left support a roller.
        f.nJointRestraints += 1;
      }
      else
      {
        f.prescribedJoints[i] = wpbd_joint_new(i, f.pierPanelIndex * wpbd.panelSizeWorld, -f.underClearance, true);
        i++;
        f.nJointRestraints += 2;
      }
    }
    if (arch)
    {
      f.prescribedJoints[i] = wpbd_joint_new(i, f.xLeftmostDeckJoint, -f.underClearance, true);
      i++;
      f.prescribedJoints[i] = wpbd_joint_new(i, f.xRightmostDeckJoint, -f.underClearance, true);
      i++;
      
      // Both abutment joints are fully constrained, but the deck joints become unconstrained.
      f.nJointRestraints += 1;
    }
    if (leftCable)
    {
      f.prescribedJoints[i] = wpbd_joint_new(i, f.xLeftmostDeckJoint - wpbd.anchorOffset, 0, true);
      i++;
      f.nJointRestraints += 2;
    }
    if (rightCable)
    {
      f.prescribedJoints[i] = wpbd_joint_new(i, f.xRightmostDeckJoint + wpbd.anchorOffset, 0, true);
      i++;
      f.nJointRestraints += 2;
    }
    f.allowableSlenderness = (leftCable) || (rightCable) ? 1e100 : wpbd.maxSlenderness;
    
    //TODO
    f.excavationVolume = wpbd.deckElevationIndexToExcavationVolume[Math.floor(f.deckElevation / 4)];
    f.deckCostRate = (f.deckType == wpbd.MEDIUM_STRENGTH_DECK ? wpbd.deckCostPerPanelMedStrength : wpbd.deckCostPerPanelHiStrength);
    if (f.tag==wpbd.fromKeyCode)
    {
      f.totalFixedCost = 170000.0;
      if (pier)
      {
        f.abutmentCost = wpbd.deckElevationIndexToKeycodeAbutmentCosts[Math.floor(f.deckElevation / 4)];
        f.pierCost = (f.totalFixedCost
            - f.nPanels * f.deckCostRate
            - f.excavationVolume * wpbd.excavationCostRate
            - f.abutmentCost
            - f.nAnchorages * wpbd.anchorageCost);
      }
      else
      {
        f.abutmentCost = (f.totalFixedCost
            - f.nPanels * f.deckCostRate
            - f.excavationVolume * wpbd.excavationCostRate
            - f.nAnchorages * wpbd.anchorageCost);
        f.pierCost = 0.0;
      }
    }
    else
    {
      // Standard case.
      f.abutmentCost =
          arch ? f.nPanels * wpbd.archIncrementalCostPerDeckPanel + wpbd.underClearanceIndexToCost[Math.floor(f.underClearance / 4 - 1)] :
          pier ? wpbd.standardAbutmentBaseCost
          + Math.max(f.pierPanelIndex , f.nPanels - f.pierPanelIndex) * wpbd.standardAbutmentIncrementalCostPerDeckPanel
          : wpbd.standardAbutmentBaseCost + f.nPanels * wpbd.standardAbutmentIncrementalCostPerDeckPanel;

      f.pierCost = (pier ? Math.max(f.pierPanelIndex, f.nPanels - f.pierPanelIndex) * wpbd.pierIncrementalCostPerDeckPanel
              + wpbd.pierHeightToCost[Math.floor(f.pierHeight / 4)]
              + wpbd.pierBaseCost
              :0);
      f.totalFixedCost = (f.excavationVolume * wpbd.excavationCostRate+ f.abutmentCost + f.pierCost + f.nPanels * f.deckCostRate + f.nAnchorages * wpbd.anchorageCost);
    }
    // Steve's calcs are for both abutments. UI presents unit cost.
    f.abutmentCost *= 0.5;
    

    f.abutmentJointIndices =
    arch? [0, f.nPanels, f.archJointIndex, f.archJointIndex+1]:
    pier? [0, f.nPanels, f.pierJointIndex]:
    [0, f.nPanels];

    // custom attribute
    f.bounding=wpbd_condition_getBounding(f);


    return f;
}
//TODO deprecated
function wpbd_condition_getBounding(condition){
    var padding=2;
    var f={};
    var tmp=condition.leftAnchorageJointIndex;
    if(tmp!==-1){
        f.left=condition.nPrescribedJoints[tmp].x-padding;
    }else{
        f.left=-padding;
    }
    tmp=condition.rightAnchorageJointIndex;
    if(tmp!==-1){
        f.right=condition.nPrescribedJoints[tmp].x+padding;
    }else{
        f.right=condition.spanLength+padding;
    }
    f.top=condition.overClearance+padding;
    f.bottom=condition.underClearance-padding;
    f.width=f.right-f.left;
    f.height=f.top-f.bottom;
    return f;
}
//hard coded
function wpbd_condition_getCodeError(code){
    if (code === undefined) {
      return -1;
    }
    if (!(0<=code[0]<=4)) {
      return 1;
    }
    var nPanels = 10 * code[1] + code[2];
    if (!(1<=nPanels<=20)) {
      return 2;
    }
    var over = 10 * code[3] + code[4];
    if (!(0<=over<=40)) {
      return 4;
    }
    if (!(0<=code[9]<=1)) {
      return 10;
    }
    var under = 10 * code[5] + code[6];
    if (!(0<=under<=32)) {
      return 6;
    }
    if (!(0<=code[7]<=3)) {
      return 8;
    }
    var arch = (code[7] == 1);
    
    var pierPanelIndex = code[8] - 1;
    var pier = pierPanelIndex >= 0;
    var hiPier = code[9] > 0;
    
    if ((hiPier) && (!pier)) {
      return 90;
    }
    if (pierPanelIndex >= nPanels) {
      return 91;
    }
    if ((nPanels < 5) || (nPanels > 11)) {
      return 92;
    }
    var deckElev = arch ? 4 * (nPanels - 5) + under : 4 * (nPanels - 5);
    if ((deckElev < 0) || (deckElev > wpbd.gapDepth)) {
      return 93;
    }
    if (deckElev + over > wpbd.gapDepth+wpbd.minOverhead) {
      return 94;
    }
    if ((!arch) && (deckElev - under < 0)) {
      return 95;
    }
    if (((pier) && (pierPanelIndex == 0)) || (pierPanelIndex >= nPanels - 1)) {
      return 96;
    }
    if ((arch) && (pier)) {
      return 97;
    }
    if ((pier) && (!hiPier))
    {
      var xp = pierPanelIndex * wpbd.panelSizeWorld;
      var yp = deckElev - under;
      var xL = 0.0;
      var yL = deckElev;
      var xR = nPanels * 4.0;
      var yR = yL;
      if (xp < xL + (yL - yp) * 0.5) {
        return 98;
      }
      if (xp > xR - (yR - yp) * 0.5) {
        return 99;
      }
    }
    return 0;
}



wpbd_condition_prototype={

//TODO refactor
isLegalPosition:function(p){
    return true;
    /*
    var x=p.x;
    var y=p.y;
    
    var yTop=this.overClearance;
    var yBottom=-this.underClearance;
    var xLeft=0;
    var xRight=this.spanLength;
    
    // Be safe about testing which world zone we're in.
    final double tol = 0.5 * fineGridSize;
    

    // Adjust for abutments and slope. No worries for arches.
    if(this.condition.arch&&p.y<=0.125){
        xLeft += wpbd.abutmentClearance;
        xRight -= wpbd.abutmentClearance;
        yGradeLevel = wpbd.gapDepth - this.deckElevation + wpbd.wearSurfaceHeight;
        var dy = wpbd.gapDepth - this.deckElevation + wpbd.wearSurfaceHeight - y;
        double xLeftSlope = bridgeView.getLeftBankX() + 0.5 * dy - 0.5;            
        if (xLeftSlope > xLeft) {
            xLeft = xLeftSlope;
        }
        double xRightSlope = bridgeView.getRightBankX() - 0.5 * dy + 0.5;
        if (xRightSlope < xRight) {
            xRight = xRightSlope;
        }
    }
    
    // Move off high pier.
    if (bridgeView.getConditions().isHiPier()) {
        Affine.Point pierLocation = bridgeView.getPierLocation();
        if (y <= pierLocation.y + tol) {
            if (pierLocation.x - pierClearance <= x && x <= pierLocation.x + pierClearance) {
                x = (x < pierLocation.x) ? pierLocation.x - pierClearance : pierLocation.x + pierClearance;
            }
        }
    }
    dst.x = x < xLeft ? xLeft : x > xRight ? xRight : x;
    dst.y = y < yBottom ? yBottom : y > yTop ? yTop : y;
    
    // Snap
    worldToGrid(dstGrid, dst);
    gridToWorld(dst, dstGrid);
    
    // If snapping took us out of bounds, move one grid and reconvert.
    if (dst.x < xLeft) {
        dstGrid.x += snapMultiple;
        gridToWorld(dst, dstGrid);
    }
    else if (dst.x > xRight) {
        dstGrid.x -= snapMultiple;
        gridToWorld(dst, dstGrid);
    }
    */
}

};
