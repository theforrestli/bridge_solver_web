/*
 * joints, members, condition will not change reference 
 */
function wpbd_bridge_new(){
    var f={};
    f.listener=[];
    f.joints=[];
    f.members=[];
    f.condition={};
    jQuery.extend(f,wpbd_bridge_prototype);
    f.parseByte(wpbd.defaultBridgeString);
    return f;
}
wpbd_bridge_prototype={
"parseByte":function (s){
    var f=this;
    //throws IOException
    var buf={"readBuf":s,"readPtr":0};
    //TODO
    f.joints.splice(0,Infinity);
    f.members.splice(0,Infinity);
    if (wpbd_scanUnsigned(4, "bridge designer version",buf) != 2014) {
        throw ("bridge design file version is not 2014");
    }
    var scenarioCode = wpbd_scanUnsigned(10, "scenario code",buf);
    //TODO
    wpbd_condition_get_from_code(f.condition,scenarioCode);
    if (f.condition== null) {
        throw ("invalid scenario " + scenarioCode);
    }
    var n_joints = wpbd_scanUnsigned(2, "number of joints",buf);
    var n_members = wpbd_scanUnsigned(3, "number of members",buf);
    for (var n = 1; n <= n_joints; n++){
        var x = wpbd_scanInt(3, "joint " + n + " x-coordinate",buf)/4.;
        var y = wpbd_scanInt(3, "joint " + n + " y-coordinate",buf)/4.;
        //TODO getNPrescribedJoints
        if (n <= f.condition.prescribedJoints.length){
            var joint = f.condition.prescribedJoints[n-1];
            if ((x != joint.x) || (y != joint.y)) {
                throw ("bad prescribed joint " + n);
            }
            f.joints.push(joint);
        }else{
            f.joints.push(wpbd_joint_new(n-1,x,y,false));
        }
    }
    for (var n = 1; n <= n_members; n++)
    {
        var jointANumber = wpbd_scanUnsigned(2, "first joint of member " + n,buf);
        var jointBNumber = wpbd_scanUnsigned(2, "second joint of member " + n,buf);
        var materialIndex = wpbd_scanUnsigned(1, "material index of member " + n,buf);
        var sectionIndex = wpbd_scanUnsigned(1, "section index of member " + n,buf);
        var sizeIndex = wpbd_scanUnsigned(2, "size index of member " + n,buf);
        //TODO
        f.members.push(wpbd_member_new(n-1, f.joints[jointANumber - 1], f.joints[jointBNumber - 1], wpbd.materials[materialIndex],wpbd.shapes[sectionIndex][sizeIndex]));
    }
    console.debug("parse test");
    for (var i = 0; i < n_members; i++){
        var member = f.members[i];
        member.compressionForceStrengthRatio=parseFloat(wpbd_scanToDelimiter("compression/strength ratio",buf));
        member.tensionForceStrengthRatio=parseFloat(wpbd_scanToDelimiter("tension/strength ratio",buf));
    }
    f.designedBy = wpbd_scanToDelimiter("name of designer",buf);
    f.projectId = wpbd_scanToDelimiter("project ID",buf);
    f.iterationNumber = parseInt(wpbd_scanToDelimiter("iteration",buf));
    f.labelPosition = parseFloat(wpbd_scanToDelimiter("label position",buf));
},
toString:function (){
  var bridge=this;
  var f="";
  f+="2014";
  //TODO
  f+=wpbd_writeNumber(10,bridge.condition.codeLong);
  f+=wpbd_writeNumber(2,bridge.joints.length);
  f+=wpbd_writeNumber(3,bridge.members.length);
  bridge.joints.forEach(function(joint){
    f+=wpbd_writeNumber(3,Math.floor(joint.x*4));
    f+=wpbd_writeNumber(3,Math.floor(joint.y*4));
  });
  bridge.members.forEach(function(member){
    f+=wpbd_writeNumber(2,member.jointA.index+1);
    f+=wpbd_writeNumber(2,member.jointB.index+1);
  //TODO
    f+=wpbd_writeNumber(1,member.material.index);
    f+=wpbd_writeNumber(1,member.shape.section.index);
    f+=wpbd_writeNumber(2,member.shape.sizeIndex);
  });
  bridge.members.forEach(function(member){
    f+=member.compressionForceStrengthRatio.toFixed(2)+"|"+member.tensionForceStrengthRatio.toFixed(2)+"|";
  });
  f+=bridge.designedBy+"|"+bridge.projectId+"|"+bridge.iterationNumber+"|"+bridge.labelPosition.toFixed(3)+"|";
  return f;
},

tryAddJoint:function(p){
    if(this.joints.some(function(j){
        return j.x==p.x&&j.y==p.y;
    })){
        return wpbd.ADD_JOINT_JOINT_EXISTS;
    }
    if(this.joints>=wpbd.maxJointCount){
        return wpbd.ADD_JOINT_AT_MAX;
    }
    wpbdg.manager.doOrder(wpbdg_order_new([wpbd_joint_new(this.joints.length,p.x,p.y,false)],[],[],[],[],[]));
    wpbdg.update_bridge();
    return wpbd.ADD_JOINT_OK;
},

tryAddMember:function(jointA,jointB,materialIndex,sectionIndex,sizeIndex){
    if (jointA == jointB) {
        return wpbd.ADD_MEMBER_SAME_JOINT;
    }
    if (getMember(jointA, jointB) != null) {
        return wpbd.ADD_MEMBER_MEMBER_EXISTS;
    }
    if(this.members.some(function(m){
        return (m.jointA==jointA&&m.jointB==jointB)||(m.jointA==jointB&&m.jointB==jointA);
    })){
        return wpbd.ADD_MEMBER_MEMBER_EXISTS;
    }
    // Reject members that intersect a pier.  This works in concert with DraftingCoordinates, which prevents 
    // joints from ever occurring on top of a pier.
    if (this.condition.hiPier) {
        var pierLocation = this.condition.prescribedJoints[condition.pierJointIndex];
        var eps = 1e-6;
        if ((a.x < pierLocation.x && pierLocation.x < b.x) ||
            (b.x < pierLocation.x && pierLocation.x < a.x)) {
            var dx = b.x - a.x;
            if (Math.abs(dx) > eps) {
                var y = (pierLocation.x - jointA.x) * (jointB.y - jointA.y) / dx + jointA.y;
                if (y < pierLocation.y - eps) {
                    return wpbd.ADD_MEMBER_CROSSES_PIER;
                }
            }
        }
    }
    if (this.members.length >= wpbd.maxMemberCount) {
        return wpbd.ADD_MEMBER_AT_MAX;
    }
    var member = wpbd_member_new(this.members.length,jointA,jointB,wpbd_material_get(materialIndex),wpbd_shape_get(sectionIndex,sizeIndex));
    wpbdg.manager.doOrder(wpbd_order_new([],[],[],[member],[],[]));
    wpbdg.update_bridge();
    return ADD_MEMBER_OK;
},
moveJoint:function(joints,dp){
    /*
    if(dp.x==0&&dp.y==0){
        return wpbd.MOVE_JOINT_ALREADY_THERE;
    }
    Joint existing = findJointAt(ptWorld);
    if (existing != null && existing != joint) {
        return MOVE_JOINT_JOINT_EXISTS;
    }
    if (new MoveJointCommand(this, joint, ptWorld).execute(undoManager) == EditableBridgeModel.ADD_MEMBER_AT_MAX) {
        return MOVE_JOINT_MEMBER_AT_MAX;
    }
    return MOVE_JOINT_OK;
    */
}

};//end of prototype
    
function wpbd_scanUnsigned(width,what,buf){
    //throws IOException
    /*
    val = 0;
    while ((width > 0) && (buf.readBuf[buf.readPtr] == " "))
    {
        width--;
        buf.readPtr += 1;
    }
    while (width > 0) {
        if (("0" <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= "9")){
            val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
            width--;
            buf.readPtr += 1;
        }else{
            throw ("couldn't scan " + what);
        }
    }
    return val;
    */
    var f=parseInt(buf.readBuf.substring(buf.readPtr,buf.readPtr+width));
    buf.readPtr+=width;
    if(isNaN(f)){
        throw ("couldn't scan " + what);
    }
    return f;
}

function wpbd_writeNumber(width,number){
    var f=""+number;
    return Array(width-f.length+1).join(" ")+f;
}

function wpbd_scanInt(width,what,buf){
    //throws IOException
    /*
    var val = 0;
    var negate_p = false;
    while ((width > 0) && (buf.readBuf[buf.readPtr] == " ")){
        width--;
        buf.readPtr += 1;
    }
    if ((width >= 2) && (buf.readBuf[buf.readPtr] == "-")){
        width--;
        buf.readPtr += 1;
        negate_p = true;
    }
    while (width > 0) {
        if (("0" <= buf.readBuf[buf.readPtr]) && (buf.readBuf[buf.readPtr] <= "9")){
            val = val * 10 + (buf.readBuf[buf.readPtr] - 48);
            width--;
            buf.readPtr += 1;
        }else{
            throw ("couldn't scan " + what);
        }
    }
    return negate_p ? -val : val;
    */
    var f=parseInt(buf.readBuf.substring(buf.readPtr,buf.readPtr+width));
    buf.readPtr+=width;
    if(isNaN(f)){
        throw ("couldn't scan " + what);
    }
    return f;
}
function wpbd_scanToDelimiter(what,buf){
    var readPtrOld=buf.readPtr;
    while (buf.readBuf[buf.readPtr] != "|")
    {
        buf.readPtr += 1;
    }
    var f=buf.readBuf.substring(readPtrOld,buf.readPtr);
    buf.readPtr += 1;
    return f;
}
function wpbd_joint_new(i,x,y,fixed){
    return {"index":i,"x":x,"y":y,"fixed":fixed,"selected":false};
}
function wpbd_member_new(i,j1,j2,material,shape){
    return {"index":i,"jointA":j1,"jointB":j2,"material":material,"shape":shape,"selected":false};
}
/**
 * DesignCondition
 */
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
    return f;
}
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



