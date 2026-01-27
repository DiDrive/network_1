export interface IPlayer{
    id:number
    nickname:string
    rid:number 
}
export interface IRoom{
    id:number
    players:IPlayer[]
}
export interface IApiPlayerJoinRes{ // 加入游戏返回的玩家信息
    player:IPlayer
}

export interface IApiPlayerJoinReq{ // 加入游戏请求的玩家信息
    nickname:string
}

export interface IApiPlayerListRes{ // 玩家列表返回的玩家信息
    list:IPlayer[]
}

export interface IApiPlayerListReq{ // 玩家列表请求的玩家信息
}

export interface IApiRoomCreateRes{ // 房间创建返回的房间信息
    room:IRoom
}
export interface IApiRoomCreateReq{ // 房间创建请求的房间信息
}

export interface IApiRoomListRes{ // 房间列表返回的房间信息
    list:IRoom[]
}
export interface IApiRoomListReq{ // 房间列表请求的房间信息
}

export interface IApiRoomJoinRes{ // 加入房间返回的房间信息
    room:IRoom
}
export interface IApiRoomJoinReq{ // 加入房间请求的房间信息
    rid:number
}
export interface IApiRoomLeaveRes{ // 离开房间返回的房间信息
    
}
export interface IApiRoomLeaveReq{ // 离开房间请求的房间信息
    
}
export interface IApiGameStartRes{ // 开始游戏返回的房间信息

}
export interface IApiGameStartReq{ // 开始游戏请求的房间信息

}