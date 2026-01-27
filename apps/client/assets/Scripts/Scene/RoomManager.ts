import { _decorator, Component, director, EditBox, EventTouch, Input, input, instantiate, Node, Prefab, UITransform, Vec2 } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes,IMsgGameStart, IMsgRoom  } from '../Common';
import { PlayerContainerManager } from '../UI/PlayerContainerManager';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';
import { RoomContainerManager } from '../UI/RoomContainerManager';
import { deepClone } from '../Utils';

const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    @property(Node)
    playerContainer:Node = null

    @property(Prefab)
    playerItem:Prefab = null


    
    onLoad(){
        NetWorkManager.Instance.ListenMsg(ApiMsgEnum.MsgRoom,this.renderPlayer,this)
        NetWorkManager.Instance.ListenMsg(ApiMsgEnum.MsgGameStart,this.handleGameStart,this)
    }
    start(){
        this.renderPlayer({room:DataManager.Instance.roomInfo})
    } 
    
    onDestroy(){
        NetWorkManager.Instance.unListenMsg(ApiMsgEnum.MsgRoom,this.renderPlayer,this)
        NetWorkManager.Instance.unListenMsg(ApiMsgEnum.MsgGameStart,this.handleGameStart,this)
    }   

    renderPlayer({room:{players:list}}:IMsgRoom){ // 渲染玩家列表
        for (const element of this.playerContainer.children) {
            element.active = false
        }

        while(this.playerContainer.children.length < list.length){
            const item = instantiate(this.playerItem)
            item.setParent(this.playerContainer)
            item.active = false
        }

        console.log("渲染玩家列表:",list)

        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            const item = this.playerContainer.children[i]
            item.getComponent(PlayerContainerManager).init(data)
        }
    }

    async handleLeaveRoom(){ // 离开房间
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave,{})
            if(!success){
                console.log(error)
                return
            }
        DataManager.Instance.roomInfo = null
        director.loadScene(SceneEnum.Hall)
    }


    async handleStart(){ // 开始游戏
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiGameStart,{})
        if(!success){
            console.log(error)
            return
        }
    }

    handleGameStart({state}:IMsgGameStart){ // 开始游戏，事件函数
        //console.log('MsgGameStart state:', state?.actors?.length, state)
        // if (!state || !Array.isArray(state.actors)) {
        //     console.warn('MsgGameStart payload invalid, skip scene switch:', state)
        //     return
        // }
        DataManager.Instance.state = state
        DataManager.Instance.lastState = deepClone(state)
        director.loadScene(SceneEnum.Battle)
    }

    
}

