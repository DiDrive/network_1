import { PlayerManager } from "./Biz/PlayerManager";
import { RoomManager } from "./Biz/RoomManager";
import { ApiMsgEnum, IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes, IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes, IApiRoomListRes } from "./Common";
import { Connection, MyServer } from "./Core";
import { symlinkCommon } from "./Utils";
import { WebSocketServer } from "ws";

// yarn dev 启动服务

symlinkCommon();

declare module "./Core"{
    interface Connection{
        playerId:number
    }
}

const Server = new MyServer({
     port: 8081,
})

Server.on("connection",(connection)=>{
    console.log("连接成功，链接数:",Server.connections.size)
})

Server.on("disconnection",(connection:Connection)=>{
    console.log("连接失败，连接数:",Server.connections.size)
    if(connection.playerId){
        PlayerManager.Instance.removePlayer(connection.playerId)
    }
    PlayerManager.Instance.syncPlayers()    // 玩家退出后，同步玩家列表
    console.log("玩家退出，玩家数:",PlayerManager.Instance.players.size)
})



Server.setApi(ApiMsgEnum.ApiPlayerJoin,(connection:Connection,data:IApiPlayerJoinReq):IApiPlayerJoinRes=>{
   const {nickname} = data
   const player = PlayerManager.Instance.createPlayer({nickname,connection})
   connection.playerId = player.id
   PlayerManager.Instance.syncPlayers() // 玩家加入后，同步玩家列表
   return {
    player:PlayerManager.Instance.getPlayerView(player),
   }
})

Server.setApi(ApiMsgEnum.ApiPlayerList,(connection:Connection,data:IApiPlayerListReq):IApiPlayerListRes=>{
   return {
    list:PlayerManager.Instance.getPlayersView(

    ),
   }
})
Server.setApi(ApiMsgEnum.ApiRoomList,(connection:Connection,data:IApiPlayerListReq):IApiRoomListRes=>{
   return {
    list:RoomManager.Instance.getRoomsView(

    ),
   }
})
Server.setApi(ApiMsgEnum.ApiRoomCreate,(connection:Connection,data:IApiRoomCreateReq):IApiRoomCreateRes=>{
    if(connection.playerId){
        const newRoom = RoomManager.Instance.createRoom()
        const room = RoomManager.Instance.joinRoom(newRoom.id,connection.playerId)
        if(room){
            PlayerManager.Instance.syncPlayers() // 玩家加入房间后，同步玩家列表
            RoomManager.Instance.syncRooms() // 房间创建后，同步房间列表
            return{
                room:RoomManager.Instance.getRoomView(room),
            }
        }
        else{
            throw new Error("房间不存在")
        }

    }
    else{
        throw new Error("玩家未登录")
    }
})
Server.setApi(ApiMsgEnum.ApiRoomJoin,(connection:Connection,{rid}:IApiRoomJoinReq):IApiRoomJoinRes=>{
    if(connection.playerId){
        const room = RoomManager.Instance.joinRoom(rid,connection.playerId)
        if(room){
            PlayerManager.Instance.syncPlayers() // 玩家加入房间后，同步玩家列表
            RoomManager.Instance.syncRooms() // 房间加入后，同步房间列表
            RoomManager.Instance.syncInRoom(room.id) // 房间加入后，同步房间内玩家列表
            return{
                room:RoomManager.Instance.getRoomView(room),
            }
        }
        else{
            throw new Error("房间不存在")
        }
    }
    else{
        throw new Error("玩家未登录")
    }
})



Server.start().then(()=>{
    console.log("服务启动成功")
}).catch((e)=>{
    console.log("服务启动失败",e)
})

// const wss = new WebSocketServer({
//     port: 8080,
// })

// let inputs = [] //暂存客户端输入的数组

// wss.on('connection',(socket)=>{
//     socket.on('message',(buffer)=>{
//         const str = buffer.toString()
//         try {
//             const msg = JSON.parse(str)
//             const {name,data} = msg
//             const {frameId,input} = data
//             inputs.push(input)
//         } catch (error) {
//             console.log(error)
//         }
        
//     })

//     setInterval(()=>{   // 10ms 发送一次同步数据
//         const temp = inputs
//         inputs = []
//         const msg = {
//             name:ApiMsgEnum.MsgServerSync,
//             data:{
//                 inputs:temp
//             }
//         }
//         socket.send(JSON.stringify(msg))
//     },10)
// })

// wss.on('listening',()=>{
//     console.log('服务启动！')
// })

