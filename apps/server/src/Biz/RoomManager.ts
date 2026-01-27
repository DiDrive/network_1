
import Singleton from "../Base/Singleton";
import { ApiMsgEnum, IApiPlayerJoinReq } from "../Common";
import { Connection } from "../Core";
import { Player } from "./Player";
import { PlayerManager } from "./PlayerManager";
import { Room } from "./Room";

export class RoomManager extends Singleton {
  static get Instance() {
    return super.GetInstance<RoomManager>();
  }

  nextRoomId = 1
  rooms:Set<Room> = new Set() //房间集合
  idMapRoom:Map<number,Room> = new Map()//房间id映射

  createRoom(){
    const room = new Room(this.nextRoomId++)
    this.rooms.add(room)
    this.idMapRoom.set(room.id,room)
    return room
  }

  joinRoom(rid:number,uid:number){
    const room = this.idMapRoom.get(rid)
    if(room){
      room.join(uid)
      return room
    }
  }

  leaveRoom(rid:number,uid:number){//离开房间
    const room = this.idMapRoom.get(rid)
    if(room){
      room.leave(uid)
    }
  }

  closeRoom(rid:number){//关闭房间
    const room = this.idMapRoom.get(rid)
    if(room){
      room.close()
      this.rooms.delete(room)
      this.idMapRoom.delete(room.id)
    }
  }
  
  startRoom(rid:number){//开始游戏
    const room = this.idMapRoom.get(rid)
    if(room){
      room.start()
      this.syncRooms() // 房间开始游戏后，同步房间列表
    }
  }

  syncRooms(){//同步房间列表
    for (const player of PlayerManager.Instance.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgRoomList,{
        list:this.getRoomsView()
      })
    }
  }
  syncInRoom(rid:number){//同步房间内玩家列表
    const room = this.idMapRoom.get(rid)
    if(room){
      room.sync()
    }
  }

  getRoomsView(rooms:Set<Room> = this.rooms){ //获取玩家前端视图数据
    return  [...rooms].map((p)=>this.getRoomView(p))
  }

  getRoomView({id,players}:Room){  //获取玩家前端视图数据，过滤掉不需要的数据
    return {
      id,
      players:PlayerManager.Instance.getPlayersView(players),
    }
  }

}
