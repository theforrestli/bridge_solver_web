const wpbd = require('./singleton');
const _ = require('underscore');

module.exports = (bridge,failureStatus) => {
    var rtn={};
    // rtn.bridge=bridge;
    var condition=bridge.condition;
    rtn.status=wpbd.NO_STATUS;
    var nJoints=bridge.joints.length;
    var nEquations=2*nJoints;
    var nMembers=bridge.members.length;
    var members=bridge.members;
    var length=Array(nMembers);
    var cosX=Array(nMembers);
    var cosY=Array(nMembers);
    var nLoadInstances=condition.nLoadedJoints;
    var pointLoads=Array(nLoadInstances);
    for(var i=0;i<nLoadInstances;i++){
        pointLoads[i]=Array(nEquations);
        for(var ii=0;ii<nEquations;ii++){
            pointLoads[i][ii]=0;
        }
    }
    for(var i=0;i<nMembers;i++){
        var a=members[i].jointA;
        var b=members[i].jointB;
        var dx=b.x-a.x;
        var dy=b.y-a.y;
        length[i]=Math.sqrt(dx*dx+dy*dy);
        cosX[i]=dx/length[i];
        cosY[i]=dy/length[i];
        var deadLoad =
                wpbd.deadLoadFactor *
                members[i].shape.area *
                length[i] *
                members[i].material.density * 9.8066 / 2.0 / 1000.0;
        var dof1 = 2 * a.index + 1;
        var dof2 = 2 * b.index + 1;
        for (var ilc = 0; ilc < nLoadInstances; ilc++) {
            pointLoads[ilc][dof1] -= deadLoad;
            pointLoads[ilc][dof2] -= deadLoad;
        }
    }
    var pointDeadLoad=condition.deckType==wpbd.MEDIUM_STRENGTH_DECK?
        wpbd.deadLoadFactor*120.265+33.097:
        wpbd.deadLoadFactor*82.608+33.097;
    for (var ij = 0; ij < condition.nLoadedJoints; ij++) {
        var dof = 2 * ij + 1;
        for (var ilc = 0; ilc < nLoadInstances; ilc++) {
            var load = pointDeadLoad;
            if (ij == 0 || ij == condition.nLoadedJoints - 1) {
                load /= 2;
            }
            pointLoads[ilc][dof] -= load;
        }
    }
    // Standard (light) truck.
    var frontAxleLoad = 44;
    var rearAxleLoad = 181;
    if (condition.loadType != wpbd.STANDARD_TRUCK) {
        // Heavy truck.
        frontAxleLoad = 120;
        rearAxleLoad = 120;
    }
    for (var ilc = 1; ilc < nLoadInstances; ilc++) {
        var iFront = 2 * ilc + 1;
        var iRear = iFront - 2;
        pointLoads[ilc][iFront] -= wpbd.liveLoadFactor * frontAxleLoad;
        pointLoads[ilc][iRear] -= wpbd.liveLoadFactor * rearAxleLoad;
    }
    var xRestraint = Array(nJoints);
    var yRestraint = Array(nJoints);
    for(var i=0;i<nJoints;i++){
        xRestraint[i]=false;
        yRestraint[i]=false;
    }
    xRestraint[0] = yRestraint[0] = yRestraint[condition.nLoadedJoints - 1] = true;
    if (condition.pierPanelIndex >= 0) {
        var i = condition.pierPanelIndex;
        xRestraint[i] = yRestraint[i] = true;
        if (condition.hiPier) {
            xRestraint[0] = false;
        }
    }
    if (condition.archHeight >= 0) {
        var i = condition.archJointIndex;
        xRestraint[0] = yRestraint[0] = yRestraint[condition.nLoadedJoints - 1] = false;
        xRestraint[i] = yRestraint[i] = true;
        xRestraint[i + 1] = yRestraint[i + 1] = true;
    }
    if (condition.leftAnchorageJointIndex >= 0) {
        var i = condition.leftAnchorageJointIndex;
        xRestraint[i] = yRestraint[i] = true;
    }
    if (condition.rightAnchorageJointIndex>=0) {
        var i = condition.rightAnchorageJointIndex;
        xRestraint[i] = yRestraint[i] = true;
    }
    var stiffness=Array(nEquations*nEquations);
    for(var i=0;i<nEquations*nEquations;i++){
        stiffness[i]=0;
    }
    for (var im = 0; im < nMembers; im++) {
        var e = members[im].material.E;
        if (failureStatus != null && failureStatus[im] != wpbd.NOT_FAILED) {
            e *= wpbd.failedMemberDegradation;
        }
        var aEOverL = members[im].shape.area * e / length[im];
        var xx = aEOverL * cosX[im]*cosX[im];
        var yy = aEOverL * cosY[im]*cosY[im];
        var xy = aEOverL * cosX[im]*cosY[im];
        var j1 = members[im].jointA.index;
        var j2 = members[im].jointB.index;
        var j1x = 2 * j1;
        var j1y = 2 * j1 + 1;
        var j2x = 2 * j2;
        var j2y = 2 * j2 + 1;
        stiffness[j1x*nEquations+j1x] += xx;
        stiffness[j1x*nEquations+j1y] += xy;
        stiffness[j1x*nEquations+j2x] -= xx;
        stiffness[j1x*nEquations+j2y] -= xy;
        stiffness[j1y*nEquations+j1x] += xy;
        stiffness[j1y*nEquations+j1y] += yy;
        stiffness[j1y*nEquations+j2x] -= xy;
        stiffness[j1y*nEquations+j2y] -= yy;
        stiffness[j2x*nEquations+j1x] -= xx;
        stiffness[j2x*nEquations+j1y] -= xy;
        stiffness[j2x*nEquations+j2x] += xx;
        stiffness[j2x*nEquations+j2y] += xy;
        stiffness[j2y*nEquations+j1x] -= xy;
        stiffness[j2y*nEquations+j1y] -= yy;
        stiffness[j2y*nEquations+j2x] += xy;
        stiffness[j2y*nEquations+j2y] += yy;
    }
    for (var ilc = 0; ilc < nLoadInstances; ilc++) {
        for (var ij = 0; ij < nJoints; ij++) {
            if (xRestraint[ij]) {
                var ix = 2 * ij;
                for (var ie = 0; ie < nEquations; ie++) {
                    stiffness[ix*nEquations+ie] = stiffness[ie*nEquations+ix] = 0;
                }
                stiffness[ix*nEquations+ix] = 1;
                pointLoads[ilc][ix] = 0;
            }
            if (yRestraint[ij]) {
                var iy = 2 * ij + 1;
                for (var ie = 0; ie < nEquations; ie++) {
                    stiffness[iy*nEquations+ie] = stiffness[ie*nEquations+iy] = 0;
                }
                stiffness[iy*nEquations+iy] = 1;
                pointLoads[ilc][iy] = 0;
            }
        }
    }
    for (var ie = 0; ie < nEquations; ie++) {
        var pivot = stiffness[ie*nEquations+ie];
        if (Math.abs(pivot) < 0.99) {
            rtn.status = wpbd.UNSTABLE;
            return rtn;
        }
        var pivr = 1.0 / pivot;
        for (var k = 0; k < nEquations; k++) {
            stiffness[ie*nEquations+k] /= pivot;
        }
        for (var k = 0; k < nEquations; k++) {
            if (k != ie) {
                pivot = stiffness[k*nEquations+ie];
                for (var j = 0; j < nEquations; j++) {
                    stiffness[k*nEquations+j] -= stiffness[ie*nEquations+j] * pivot;
                }
                stiffness[k*nEquations+ie] = -pivot * pivr;
            }
        }
        stiffness[ie*nEquations+ie] = pivr;
    }
    rtn.loadInstances = Array(nLoadInstances);
    rtn.loadInstances = _.times(nLoadInstances, (ilc) => {
      const jointDisplacements = _.times(nEquations, (ie) => {
        let tmp = 0;
        for (var je = 0; je < nEquations; je++) {
          tmp += stiffness[ie*nEquations+je] * pointLoads[ilc][je];
        }
        return tmp;
      });
      return {
        joints: _.times(nJoints, (ij) => {
          return {
            xDisplacement: jointDisplacements[ij*2],
            yDisplacement: jointDisplacements[ij*2+1],
          }
        }),
        members: _.map(members, (member, im) => {
          var e = member.material.E;
          if (failureStatus != null && failureStatus[im] != wpbd.NOT_FAILED) {
            e *= failedMemberDegradation;
          }
          var aeOverL = member.shape.area * e / length[im];
          var ija = member.jointA.index;
          var ijb = member.jointB.index;

          const force = aeOverL *
            ((cosX[im] * (jointDisplacements[ijb*2] -   jointDisplacements[ija*2])) +
             (cosY[im] * (jointDisplacements[ijb*2+1] - jointDisplacements[ija*2+1])));
             return { force };
        })
      };
    });

    rtn.members = Array(nMembers);


    rtn.memberCompressiveStrength = Array(nMembers);
    rtn.memberTensileStrength = Array(nMembers);
    rtn.maxMemberCompressiveForces = Array(nMembers);
    rtn.maxMemberTensileForces = Array(nMembers);
    rtn.members = _.map(members, ({material, shape}, im) => {
      const forcesAndZero = _.map(rtn.loadInstances, (loadInstance) => {
        return loadInstance.members[im].force;
      });
      forcesAndZero.push(0);
      const compressiveStrength = wpbd_compressiveStrength(material, shape, length[im]);
      const tensileStrength = wpbd_tensileStrength(material, shape);
      const maxCompressiveForce = -_.min(forcesAndZero);
      const maxTensileForce = _.max(forcesAndZero);
      return {
        compressiveStrength,
        tensileStrength,
        maxCompressiveForce,
        maxTensileForce,
      };
    });
    rtn.status = wpbd.PASSES;
    if(_.any(rtn.members, (memberResult) => {
      return memberResult.maxCompressiveForce > memberResult.compressiveStrength ||
        memberResult.maxTensileForce > memberResult.tensileStrength;
    })){
      rtn.status = wpbd.FAILS_LOAD_TEST;
    }
    var slenderness=condition.allowableSlenderness;
    if(_.any(members, ({shape}, im) => {
      return length[im]*shape.inverseRadiusOfGyration>slenderness;
    })){
      rtn.status=wpbd.FAILS_SLENDERNESS;
    }
    return rtn;
}
