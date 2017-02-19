const wpbd = require('./singleton');

window.wpbd_cost = (bridge) => {
    /*
    materialShapePairs.clear();
    materialSectionPairs.clear();
    Iterator<Member> e = members.iterator();
    while (e.hasNext()) {
        Member member = e.next();
        MaterialShapePair msPair = new MaterialShapePair(member.getMaterial(), member.getShape());
        Integer iVal = materialShapePairs.get(msPair);
        materialShapePairs.put(msPair, new Integer(iVal == null ? 1 : iVal + 1));
        double weight = member.getShape().getArea() * member.getLength() * member.getMaterial().getDensity();
        MaterialSectionPair mcPair = new MaterialSectionPair(member.getMaterial(), member.getShape().getSection());
        Double dVal = materialSectionPairs.get(mcPair);
        materialSectionPairs.put(mcPair, new Double(dVal == null ? weight : dVal + weight));
    }
    costs.materialShapePairs = materialShapePairs;
    costs.materialSectionPairs = materialSectionPairs;
    costs.conditions = designConditions;
    costs.inventory = inventory;
    costs.nConnections = joints.size();
    costs.notes = null;
    return costs;
    */
    const f={};
    var msps=[];
    var mcps=[];
    bridge.members.forEach(function(m){
        //update msps
        var i=null;
        msps.forEach(function(msp){
            if(m.material==msp.material&&m.shape==msp.shape){
                i=msp;
            }
        });
        if(i==null){
            msps.push({
                "material":m.material,
                "shape":m.shape,
                "number":1
            });
        }else{
            i.number+=1;
        }
        var i=null;
        mcps.forEach(function(mcp){
            if(m.material==mcp.material&&m.shape.sectionIndex==mcp.sectionIndex){
                i=mcp;
            }
        });
        var weight=m.shape.area*m.material.density*m.getLength();
        if(i==null){
            mcps.push({
                material: m.material,
                sectionIndex: m.shape.sectionIndex,
                weight: weight
            });
        }else{
            i.weight+=weight;
        }
    });
    f.bridge=bridge;
    f.materialShapePairs=msps;
    f.materialSectionPairs=mcps;
    var productCost=msps.length*wpbd.orderingFee;
    var connectionCost=bridge.joints.length*wpbd.connectionFee;
    var mtlCost=0;
    mcps.forEach(function(mcp){
        mtlCost+=mcp.weight*mcp.material.cost[mcp.sectionIndex];
    });
    f.totalCost=2*(mtlCost+connectionCost)+productCost+bridge.condition.totalFixedCost;
    return f;
}
