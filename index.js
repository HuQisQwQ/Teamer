/// <reference path="h:\pluginServer/dts/helperlib/src/index.d.ts"/> 
ll.registerPlugin(
/* name */ "Teamer管理",
/* introduction */ "让玩家自由创建Team",
/* version */[0, 0, 1],
/* otherInformation */ {})


const { v4: uuidv4 } = require("uuid")

const CreaterConfig = new JsonConfigFile("plugins/teamer/creater.json")

var Teamer = mc.newCommand("teamer-h", "Teamer指令的帮助", PermType.Any)

Teamer.setCallback(function (_cmd, _ori, _out, _res) {
    if (_ori.player) {
        var _Player = _ori.player;
        _Player.tell("/creater命令创建队伍, /deleter命令解散队伍, /joiner命令加入队伍, /lefter命令退出队伍, /inviter命令邀请玩家, /infoer命令查看队伍信息, /finder命令查询队伍")
    }
})

var Creater = mc.newCommand("creater", "通过Teamer创建队伍", PermType.Any);

Creater.setCallback(function (_cmd, _ori, _out, _res) {
    if (_ori.player) {
        var _Player = _ori.player
        var Json = CreaterConfig.read()
        var JsonObject = JSON.parse(Json)
        var TestLength = []
        for (const key in JsonObject) {
            const object = JsonObject[key]
            if (object["head"] == _Player.realName) {
                TestLength.push(key)
            }
        }
        if (TestLength.length == 0) {
            var CreateTeamer = mc.newCustomForm()
            CreateTeamer.setTitle("创建队伍");
            CreateTeamer.addInput("输入队伍名称", "John Doe's team")
            CreateTeamer.addLabel("队伍名称不得超过12个字符, 不得输入空字符, 而且必须包含8个字符, 不得使用§字符")
            _Player.sendForm(CreateTeamer, function (_Player_, _Data_) {
                /**
                 * 0.Input
                 * 1.Label
                 */
                var content = _Data_[0];
                if (content !== null) {
                    logger.info(content)
                    if (content.length <= 12 && content.length >= 8 && content !== "" && !content.includes("§")) {
                        var UUID = uuidv4()
                        var team = {
                            "head": _Player_.realName
                        }
                        CreaterConfig.init(UUID, team)
                        _Player_.tell(`已创建队伍, 队伍序列号: ${UUID.substring(0, 8)}`)
                    } else {
                        var CreateTeamerErr = mc.newSimpleForm()
                        CreateTeamerErr.setTitle("错误!")
                        CreateTeamerErr.setContent("您输入的队伍名称不符合规范")
                        _Player_.sendForm(CreateTeamerErr, (_Error_, _Error__) => { })
                    }
                }
            })
        } else {
            _Player.sendToast("无法创建!", "您已创建了一个队伍!")
        }
    }
})

Creater.overload([])
Creater.setup()


const Deleter = mc.newCommand("deleter", "删除个人队伍")


Deleter.setCallback((_cmd, _ori, _out, _res) => {
    if (_ori.player) {
        const _Player = _ori.player
        var DeleteTeamer = mc.newCustomForm()
        DeleteTeamer.setTitle("删除队伍",)
        var Json = CreaterConfig.read()
        var Arr = []
        var ArrDisplay = []
        var JsonObject = JSON.parse(Json)
        for (const key in JsonObject) {
            const object = JsonObject[key]
            if (object["head"] == _Player.realName) {
                Arr.push(key)
                ArrDisplay.push(key.substring(0, 8))
            }
        }
        DeleteTeamer.addDropdown("选择队伍的序列号(前8位)", ArrDisplay, 0)
        _Player.sendForm(DeleteTeamer, (_Player_, _Data_) => {
            /**
             * _Data_数组不可能包含null
             * _Data_数组第一个是下拉菜单, 返回的是ArrDisplay的序列号
             */
            const content = _Data_[0]
            /**
             * 可能会出现问题, 此处没比较Arr和ArrDisplay
             */
            CreaterConfig.delete(Arr[content])
            _Player_.sendToast(`删除成功!`, `已删除 ${ArrDisplay[content]} 队伍!`)
        })
    }
})

Deleter.overload([])
Deleter.setup()