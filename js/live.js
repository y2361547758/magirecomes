/*
gNodeInfos[0] //0
$("#charaName").text(gNodeInfos[0][1]); //角色名
//基础数据
gBakHp = gNodeInfos[0][2];
gBakAtk = gNodeInfos[0][3];
gBakDef = gNodeInfos[0][4];

gRouteInfos = ROUTE_INFO_ALL["ROUTE" + gNodeInfos[0][5]] // 六边形路径列（五种之一）

gAttribute = ATTRIBUTE_TYPE[gNodeInfos[0][6]]; // 属性

gLv2SozaiNm = gNodeInfos[0][7]; // 2级node素材数

//加成比例
gAccele = gNodeInfos[0][8];
gCharge = gNodeInfos[0][9];
gBlast = gNodeInfos[0][10];

// NODE_FLAG_LIST[r] 碎片类型
// [初级材料=MATERIALS[g[0]], 高级材料名=MATERIALS[g[1]]]
gKeno = [gNodeInfos[0][11][0], gNodeInfos[0][11][1]];   //1嫌恶
gHitan = [gNodeInfos[0][12][0], gNodeInfos[0][12][1]];  //2悲叹
gGekido = [gNodeInfos[0][13][0], gNodeInfos[0][13][1]]; //3激怒
gKyofu = [gNodeInfos[0][14][0], gNodeInfos[0][14][1]];  //4恐怖
gKyotan = [gNodeInfos[0][15][0], gNodeInfos[0][15][1]]; //5惊叹
gKitai = [gNodeInfos[0][16][0], gNodeInfos[0][16][1]];  //6期待
gKokotsu = [gNodeInfos[0][17][0], gNodeInfos[0][17][1]];//7恍惚
gKeiai = [gNodeInfos[0][18][0], gNodeInfos[0][18][1]];  //8敬愛

//各级node加成值（0-6）
gHpList = gNodeInfos[0][19];
gAtkList = gNodeInfos[0][20];
gDefList = gNodeInfos[0][21];

NODE_TYPE[gNodeInfos[>0][1]] // node类型

gNodeInfos[>0][0]   //node级别
ABILITY_LIST[gNodeInfos[>0][2]] //node类型为Ability：能力（索引）
gNodeInfos[>0][2] //node类型为skill：技能（文本）
gNodeInfos[>0][2] //node类型为hp/atk/def：变化值（数值）
gNodeInfos[>0][3] //覆盖TeshitaName
gNodeInfos[>0][4] //覆盖BossName
*/
_attrId = {
    "FIRE": 1,
    "WATER": 2,
    "TIMBER": 3,
    "LIGHT": 4,
    "DARK": 5,
    "VOID": 6,
}
_idColor = {
    "FIRE":   "red-text",
    "WATER":  "blue-text",
    "TIMBER": "",
    "LIGHT":  "orange-text",
    "DARK":   "purple-text",
    "VOID":   "brown-text",
}
_level = {
    undefined: 0,
    null: 0,
    NaN: 0,
    0: 0,
    5000: 1,
    10000: 2,
    30000: 3,
    80000: 4,
    100000: 5,
    500000: 6
}
_nodeType = {
    START: 0,
    HP: 1,
    ATTACK: 2,
    DEFENSE: 3,
    ABILITY: 4,
    SKILL: 5,
    DISK_ACCELE: 6,
    DISK_CHARGE: 7,
    DISK_BLAST: 8
}
_growtypeRate = {// hp, atk, def
    BALANCE: [4.00, 4.00, 4.00],
    ATTACK:  [3.94, 4.09, 3.91],
    DEFENSE: [3.91, 3.94, 4.15],
    ATKHP:   [4.06, 4.03, 3.97],
    ATKDEF:  [3.97, 4.06, 4.03],
    DEFHP:   [4.03, 3.97, 4.06],
    HP:      [4.12, 3.91, 3.94]
}
_routeCount = 1

Set.prototype.equal = function (setB) {
    if (this.size !== setB.length) return false
    for (var v of setB) {
        if (!this.has(JSON.stringify(v))) return false
    }
    return true
}

function getAbilityKey(name) {
    for (var k in ABILITY_LIST) {
        if (name == ABILITY_LIST[k]) return k
    }
    // 没有现成就加一条
}
function getMaterialKey(name) {
    for (var k in MATERIALS) {
        if (name == MATERIALS[k]) return k
    }
    // 没有现成就加一条
}

$(document).ready(() => {

$.ajax({
    // url: "charaCard.json?" + (new Date()).getTime(),
    url: "/data/charaCard.json",
    dataType: "json"
}).done((data) => {
    CHARA_DATA = []
    var dict = {
        "FIRE": [],
        "WATER": [],
        "TIMBER": [],
        "LIGHT": [],
        "DARK": [],
        "VOID": [],
    }
    ROUTE_INFO_ALL = {}
    for (var i in data) {
        var item = data[i]
        if (!item.enhancementCellList || !item.enhancementCellList.length) continue
        var name = item.name.replace(" ", "") + (item.title ? " " + item.title : "")
        var card = item.evolutionCard4 || item.evolutionCard3 || item.evolutionCard2 || item.evolutionCard1 || item.defaultCard
        var grow = _growtypeRate[card.growthType]
        var gBakHp = Math.floor(grow[0] * card.hp)
        var gBakAtk = Math.floor(grow[1] * card.attack)
        var gBakDef = Math.floor(grow[2] * card.defense)
        var gRouteInfos = null
        var gAttribute = _attrId[item.attributeId]
        var gLv2SozaiNm = null
        var gAccele = null
        var gCharge = null
        var gBlast = null
        var gKeno = []
        var gHitan = []
        var gGekido = []
        var gKyofu = []
        var gKyotan = []
        var gKitai = []
        var gKokotsu = []
        var gKeiai = []
        var gHpList = []
        var gAtkList = []
        var gDefList = []
        var gNodeInfo = []
        var node = new Map()
        var endNode = []
        item.enhancementCellList.forEach((v, k) => {
            v.c = k
            node.set(v.charaEnhancementCellId, [k, v.needOpenedCellId])
            if (!v.connectedCellIds || v.connectedCellIds == '0') endNode.push(v.charaEnhancementCellId)
            var level = _level[v.needCC]
            switch (v.enhancementType) {
                case "DISK_ACCELE":
                    gAccele = v.effectValue
                break
                case "DISK_BLAST":
                    gBlast = v.effectValue
                break
                case "DISK_CHARGE":
                    gCharge = v.effectValue
                break
                case "HP":
                    gHpList[level - 1] = v.effectValue
                break
                case "ATTACK":
                    gAtkList[level - 1] = v.effectValue
                break
                case "DEFENSE":
                    gDefList[level - 1] = v.effectValue
                break
            }
            if (level === 5 && ~["HP", "ATTACK", "DEFENSE"].indexOf(v.enhancementType)) switch (v.openGift1.name.substr(0,2)) {
                case "嫌悪": gKeno    = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "悲嘆": gHitan   = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "激怒": gGekido  = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "恐怖": gKyofu   = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "驚嘆": gKyotan  = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "期待": gKitai   = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "恍惚": gKokotsu = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
                case "敬愛": gKeiai   = [ getMaterialKey(v.openGift4.name), getMaterialKey(v.openGift3.name) ]
                break
            }
            if (v.enhancementType === "SKILL") {
                switch (v.emotionSkill.type) {
                    case "SKILL":
                        gNodeInfo[k] = [
                            level,
                            5,
                            v.emotionSkill.shortDescription
                        ]
                    break
                    case "ABILITY":
                        gNodeInfo[k] = [
                            level,
                            4,
                            getAbilityKey(v.emotionSkill.shortDescription)
                        ]
                    break
                }
            } else gNodeInfo[k] = [
                level,
                _nodeType[v.enhancementType]
            ]
            if (level === 2) gLv2SozaiNm = v.openGiftQuantity1
        })
        var routes = new Set()
        endNode.forEach((v) => {
            var route = []
            var k = node.get(v)
            while (k) {
                route.push(k[0])
                k = node.get(k[1])
            }
            routes.add(JSON.stringify(route.reverse()))
        })
        for (var k in ROUTE_INFO_ALL) {
            if (routes.equal(ROUTE_INFO_ALL[k])) {
                var r = /\D+(\d+)/.exec(k)
                gRouteInfos = parseInt(r[1])
                break
            }
        }
        if (!gRouteInfos) {
            var newRoute = []
            routes.forEach((v) => {
                newRoute.push(JSON.parse(v))
            })
            newRoute.sort((a, b) => {
                var len = a.length < b.length ? a.length : b.length
                var i = 0
                while (i < len && a[i] == b[i]) ++i
                if (i >= len) return a.length - b.length
                return a[i] - b[i]
            })
            gRouteInfos = _routeCount
            ROUTE_INFO_ALL["ROUTE" + _routeCount++] = newRoute
        }
        gNodeInfo[0] = [
            0,
            name,
            gBakHp,
            gBakAtk,
            gBakDef,
            gRouteInfos,
            gAttribute,
            gLv2SozaiNm,
            gAccele,
            gCharge,
            gBlast,
            gKeno,
            gHitan,
            gGekido,
            gKyofu,
            gKyotan,
            gKitai,
            gKokotsu,
            gKeiai,
            gHpList,
            gAtkList,
            gDefList
        ]
        dict[item.attributeId].push(name)
        CHARA_DATA[name] = gNodeInfo
    }
    var drop = $("#dropdownChara")
    drop.empty()
    for (var i in dict) for (var j of dict[i]) {
        var li = $("<li></li>")
        var color = _idColor[i]
        li.html('<a href="javascript:void(0)" class="' + color + '">' + j + '<i class="material-icons red-text" style="display:none;">check</i></a>')
        drop.append(li)
    }
    $("#dropdownChara li").click(function (a) {
        gLockMode || (a = $(this).children("a").text().replace("check", ""), void 0 != CHARA_DATA[a] && (gNodeInfos = CHARA_DATA[a], funcRouteSelect(), funcCharacterSelect($(this))))
    });
})

})