import { _decorator, Component, EventTouch, Input, input, instantiate, Node, UITransform, Vec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityStateEnum, EntityTypeEnum, IActor, IBullet, InputTypeEnum, IVec2 } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { getAngle } from '../../Utils';
import EventManager from '../../Global/EventManager';
import { EventEnum } from '../../Enum';
import { ExplosionStateMachine } from './ExplosionStateMachine';
const { ccclass, property } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {
    Type:EntityTypeEnum
    id:number
    init(type:EntityTypeEnum,{x,y}:IVec2){
        this.node.setPosition(x,y)
        this.Type = type
        this.fsm = this.addComponent(ExplosionStateMachine)
        this.fsm.init(type)
        this.state = EntityStateEnum.Idle
    }
}

