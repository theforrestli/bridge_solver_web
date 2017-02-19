const wpbd = require('./singleton');

window.wpbd_analyze = (bridge,failureStatus) => {
    var f={};
    f.bridge=bridge;
    var condition=bridge.condition;
    f.status=wpbd.NO_STATUS;
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
            f.status = wpbd.UNSTABLE;
            return f;
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
    f.memberForce=Array(nLoadInstances);
    f.memberFails=Array(nLoadInstances);
    f.jointDisplacement=Array(nLoadInstances);
    for(var i=0;i<nLoadInstances;i++){
        f.memberForce[i]=Array(nMembers);
        f.memberFails[i]=Array(nMembers);
        f.jointDisplacement[i]=Array(nEquations);
    }
    for (var ilc = 0; ilc < nLoadInstances; ilc++) {
        for (var ie = 0; ie < nEquations; ie++) {
            var tmp = 0;
            for (var je = 0; je < nEquations; je++) {
                tmp += stiffness[ie*nEquations+je] * pointLoads[ilc][je];
            }
            f.jointDisplacement[ilc][ie] = tmp;
        }
        // Compute member forces.
        for (var im = 0; im < nMembers; im++) {
            var e = members[im].material.E;
            if (failureStatus != null && failureStatus[im] != wpbd.NOT_FAILED) {
                e *= failedMemberDegradation;
            }
            var aeOverL = members[im].shape.area * e / length[im];
            var ija = members[im].jointA.index;
            var ijb = members[im].jointB.index;
            f.memberForce[ilc][im] = aeOverL *
                    ((cosX[im] * (f.jointDisplacement[ilc][ijb*2] - f.jointDisplacement[ilc][ija*2])) +
                    (cosY[im] * (f.jointDisplacement[ilc][ijb*2+1] - f.jointDisplacement[ilc][ija*2+1])));
        }
    }
    
    f.memberCompressiveStrength = Array(nMembers);
    f.memberTensileStrength = Array(nMembers);
    f.maxMemberCompressiveForces = Array(nMembers);
    f.maxMemberTensileForces = Array(nMembers);
    
    for (var im = 0; im < nMembers; im++) {
        var material = members[im].material;
        var shape = members[im].shape;
        f.memberCompressiveStrength[im] = wpbd_compressiveStrength(material, shape, length[im]);
        f.memberTensileStrength[im] = wpbd_tensileStrength(material, shape);
    }
    f.status = wpbd.PASSES;
    for (var im = 0; im < nMembers; im++) {
        var maxCompression = 0;
        var maxTension = 0;
        for (var ilc = 0; ilc < nLoadInstances; ilc++) {
            var force = f.memberForce[ilc][im];
            if (force < 0) {
                force = -force;
                if (force > maxCompression) {
                    maxCompression = force;
                }
                f.memberFails[ilc][im] = (force / f.memberCompressiveStrength[im] > 1.0);
            } else {
                if (force > maxTension) {
                    maxTension = force;
                }
                f.memberFails[ilc][im] = (force / f.memberTensileStrength[im] > 1.0);
            }
        }
        var cRatio = maxCompression / f.memberCompressiveStrength[im];
        var tRatio = maxTension / f.memberTensileStrength[im];
        // A fail for any member of any kind is a fail overall.
        if (cRatio > 1 || tRatio > 1) {
            f.status = wpbd.FAILS_LOAD_TEST;
        }
        // Copy ratio information back to the bridge unless we're computing the intentionally distorted 
        // failure bridge.
        if (failureStatus == null) {
            members[im].compressionForceStrengthRatio=cRatio;
            members[im].tensionForceStrengthRatio=tRatio;
        }
        f.maxMemberCompressiveForces[im] = maxCompression;
        f.maxMemberTensileForces[im] = maxTension;
    }
    var slenderness=condition.allowableSlenderness;
    for(var i=0;i<nMembers;i++){
        if(length[i]*members[i].shape.inverseRadiusOfGyration>slenderness){
            f.status=wpbd.FAILS_SLENDERNESS;
            break;
        }
    }
    return f;
}
