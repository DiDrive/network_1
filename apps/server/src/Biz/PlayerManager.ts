
import Singleton from "../Base/Singleton";
import { ApiMsgEnum, IApiPlayerJoinReq } from "../Common";
import { Connection } from "../Core";
import { Player } from "./Player";
import { RoomManager } from "./RoomManager";

export class PlayerManager extends Singleton {
  static get Instance() {
    return super.GetInstance<PlayerManager>();
  }

  nextPlayerId = 1
  players:Set<Player> = new Set() //玩家集合
  idMapPlayer:Map<number,Player> = new Map()//玩家id映射

  createPlayer({nickname,connection}:IApiPlayerJoinReq & {connection:Connection}){
    const player = new Player({id:this.nextPlayerId++,nickname,connection})
    this.players.add(player)
    this.idMapPlayer.set(player.id,player)
    return player
  }

  removePlayer(playerid:number){
    const player = this.idMapPlayer.get(playerid)
    if(player){
      const rid = player.rid
      if(rid){//如果玩家在房间内，先离开房间
        RoomManager.Instance.leaveRoom(rid,player.id)
        RoomManager.Instance.syncInRoom(rid) // 房间离开后，同步房间内玩家列表
        RoomManager.Instance.syncRooms() // 房间离开后，同步房间列表
      }
      this.players.delete(player)
      this.idMapPlayer.delete(player.id)
    }
  }

  syncPlayers(){
    for (const player of this.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgPlayerList,{
        list:this.getPlayersView()
      })
    }
  }

  getPlayersView(players:Set<Player> = this.players){ //获取玩家前端视图数据
    return  [...players].map(player=>this.getPlayerView(player))
  }

  getPlayerView({id,nickname,rid}:Player){  //获取玩家前端视图数据，过滤掉不需要的数据
    return {
      id,
      nickname,
      rid,
    }
  }

}
