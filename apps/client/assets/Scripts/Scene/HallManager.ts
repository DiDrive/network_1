import { _decorator, Component, director, EditBox, EventTouch, Input, input, instantiate, Node, Prefab, UITransform, Vec2 } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes } from '../Common';
import { PlayerContainerManager } from '../UI/PlayerContainerManager';
import DataManager from '../Global/DataManager';
import { EventEnum, SceneEnum } from '../Enum';
import { RoomContainerManager } from '../UI/RoomContainerManager';
import EventManager from '../Global/EventManager';

const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {
    @property(Node)
    playerContainer:Node = null

    @property(Prefab)
    playerItem:Prefab = null

    @property(Node)
    roomContainer:Node = null

    @property(Prefab)
    roomItem:Prefab = null

    
    onLoad(){
        EventManager.Instance.on(EventEnum.RoomJoin,this.handleJoinRoom,this)
        NetWorkManager.Instance.ListenMsg(ApiMsgEnum.MsgPlayerList,this.renderPlayer,this)
        NetWorkManager.Instance.ListenMsg(ApiMsgEnum.MsgRoomList,this.renderRoom,this)
    }
    start(){
        this.playerContainer.destroyAllChildren()
        this.roomContainer.destroyAllChildren()
        this.getPlayers()
        this.getRooms()
    }
    
    onDestroy(){
        EventManager.Instance.off(EventEnum.RoomJoin,this.handleJoinRoom,this)
        NetWorkManager.Instance.unListenMsg(ApiMsgEnum.MsgPlayerList,this.renderPlayer,this)
        NetWorkManager.Instance.unListenMsg(ApiMsgEnum.MsgRoomList,this.renderRoom,this)
    }
    async getPlayers(){ // 获取玩家列表
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiPlayerList,{})
            if(!success){
                console.log(error)
                return
            }
        console.log("玩家列表:",res)
        this.renderPlayer(res)
    }

    renderPlayer({list}:IApiPlayerListRes){ // 渲染玩家列表
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

    async handleCreateRoom(){ // 创建房间
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomCreate,{})
            if(!success){
                console.log(error)
                return
            }
        DataManager.Instance.roomInfo = res.room
        //console.log("创建房间DataManager.Instance.roomInfo:",DataManager.Instance.roomInfo)
        director.loadScene(SceneEnum.Room)
    }

    async handleJoinRoom(rid:number){ // 加入房间
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomJoin,{rid})
            if(!success){
                console.log(error)
                return
            }
        DataManager.Instance.roomInfo = res.room
        console.log("加入房间DataManager.Instance.roomInfo:",DataManager.Instance.roomInfo)
        director.loadScene(SceneEnum.Room)
    }

    async getRooms(){ // 获取房间列表
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiRoomList,{})
            if(!success){
                console.log(error)
                return
            }
        console.log("房间列表:",res)
        this.renderRoom(res)
    }

    renderRoom({list}:IApiRoomListRes){ // 渲染房间列表
        for (const element of this.roomContainer.children) {
            element.active = false
        }

        while(this.roomContainer.children.length < list.length){
            const item = instantiate(this.roomItem)
            item.setParent(this.roomContainer)
            item.active = false
        }

        console.log("渲染房间列表:",list)

        for (let i = 0; i < list.length; i++) {
            const data = list[i];
            const item = this.roomContainer.children[i]
            item.getComponent(RoomContainerManager).init(data)
        }
    }
    
}

