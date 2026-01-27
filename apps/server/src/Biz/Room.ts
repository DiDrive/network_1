import { ApiMsgEnum, EntityTypeEnum, IClientInput, IMsgClientSync, InputTypeEnum, IState } from "../Common"
import { Connection } from "../Core"
import { Player } from "./Player"
import { PlayerManager } from "./PlayerManager"
import { RoomManager } from "./RoomManager"

export class Room{
    id:number
    players:Set<Player> = new Set()

    lastTime:number
    pendingInput:IClientInput[] = []     // 待处理的输入
    lastPlayerFrameIdMap:Map<number,number> = new Map() // 玩家最后一次处理的输入帧id

    constructor(rid){
        this.id = rid
    }

    join(uid:number){   // 加入房间
        const player = PlayerManager.Instance.idMapPlayer.get(uid)
        if(player){
            player.rid = this.id
            this.players.add(player)
        }
    }

     leave(uid:number){//离开房间
        const player = PlayerManager.Instance.idMapPlayer.get(uid)
        if(player){
            player.rid = undefined
            this.players.delete(player)
            if(!this.players.size){//如果房间内没有玩家了，就删除房间
                RoomManager.Instance.closeRoom(this.id)
            }
        }
    }

    close(){//关闭房间
        this.players.clear()
    }

    sync(){//同步房间内玩家列表
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgRoom,{
                room:RoomManager.Instance.getRoomView(this)
            })
        }
    }
    
    start(){//开始游戏
        const state : IState = {
            actors:[...this.players].map((player,index)=>(
                {
                id:player.id,
                nickName:player.nickname,
                hp:100,
                type:EntityTypeEnum.Actor1,
                weaponType:EntityTypeEnum.Weapon1,
                bulletType:EntityTypeEnum.Bullet2,
                position:{
                x:-150+index*300,
                y:-150+index*300,
                },
                direction:{
                x:1,
                y:0,
                },
            })),
            bullets:[],
            nextBulletId:1,
        }

        console.log('Room.start players:', this.players.size, 'state.actors:', state.actors.length)
        for (const player of this.players) {
            console.log('send MsgGameStart to player:', player.id)
            player.connection.sendMsg(ApiMsgEnum.MsgGameStart,{
                state,
            })
            player.connection.ListenMsg(ApiMsgEnum.MsgClientSync,this.getClientMsg,this)
        }

        const timer1 = setInterval(()=>{
            this.sendServerMsg()
        },100)  // 每100ms发送一次服务器同步消息

        const timer2 = setInterval(()=>{
            this.timePast()
        },16)  // 每16ms处理一次时间流逝
    }

    getClientMsg(connection:Connection,{input,frameId}:IMsgClientSync){
        this.pendingInput.push(input)
        this.lastPlayerFrameIdMap.set(connection.playerId,frameId)  // 更新保存玩家最后一次处理的输入帧id
    }

    sendServerMsg(){ 
        const inputs = this.pendingInput
        this.pendingInput = []
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgServerSync,{
                lastframeId:this.lastPlayerFrameIdMap.get(player.id) ?? 0,
                inputs,
            })
        }
    }
   
    timePast(){ // 处理时间流逝
        const now = process.uptime()
        const dt = now - (this.lastTime ?? now) // 第一次调用时，dt为0
        this.pendingInput.push({
            type:InputTypeEnum.Timepast,
            dt:Number(dt.toFixed(3)),
        })
        this.lastTime = now 
    }
}