export enum InputTypeEnum{
    ActorMove = 'ActorMove',
    ActorAttack = 'ActorAttack',
    WeaponShoot = 'WeaponShoot',
    Timepast = 'Timepast',
}

export enum EntityTypeEnum {
    Actor1 = 'Actor1',
    Map = 'Map',
    Weapon1 = 'Weapon1',
    Bullet1 = 'Bullet1',
    Bullet2 = 'Bullet2',
    Explosion = 'Explosion',
}

export enum EntityStateEnum {
    Idle = 'Idle',
    Run = 'Run',
    Attack = 'Attack',
}

export enum ApiMsgEnum {
    ApiPlayerJoin = 'ApiPlayerJoin',
    ApiPlayerList = 'ApiPlayerList',
    ApiRoomList = 'ApiRoomList',
    ApiRoomJoin = 'ApiRoomJoin',
    MsgPlayerList = 'MsgPlayerList',
    MsgRoomList = 'MsgRoomList',
    MsgRoom = 'MsgRoom',
    MsgClientSync = 'MsgClientSync',
    MsgServerSync = 'MsgServerSync',
    ApiRoomCreate = 'ApiRoomCreate',
    ApiRoomLeave = 'ApiRoomLeave',
    ApiGameStart = 'ApiGameStart',
    MsgGameStart = 'MsgGameStart',
}

