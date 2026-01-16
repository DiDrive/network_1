import { ApiMsgEnum } from "../Common"
import { Connection } from "../Core"
import { Player } from "./Player"
import { PlayerManager } from "./PlayerManager"
import { RoomManager } from "./RoomManager"

export class Room{
    id:number
    players:Set<Player> = new Set()

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
    sync(){//同步房间内玩家列表
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgRoom,{
                room:RoomManager.Instance.getRoomView(this)
            })
        }
    }
}