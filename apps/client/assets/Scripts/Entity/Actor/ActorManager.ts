import { _decorator, Component, EventTouch, Input, input, instantiate, Node, ProgressBar, UITransform, Vec2 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityStateEnum, EntityTypeEnum, IActor, InputTypeEnum } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { ActorStateMachine } from './ActorStateMachine';
import { WeaponManager } from '../Weapon/WeaponManager';
import { getAngle } from '../../Utils';
import EventManager from '../../Global/EventManager';
import { EventEnum } from '../../Enum';
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export class ActorManager extends EntityManager {
    id:number
    hp:ProgressBar
    private weaponManager:WeaponManager
    bulletType:EntityTypeEnum

    init(data:IActor){
        this.id = data.id
        this.hp = this.node.getComponentInChildren(ProgressBar)
        this.bulletType = data.bulletType
        this.fsm = this.addComponent(ActorStateMachine)
        this.fsm.init(data.type)
        this.state = EntityStateEnum.Idle

        const prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Weapon1)
        const weapon = instantiate(prefab)
        weapon.setParent(this.node)
        this.weaponManager = weapon.addComponent(WeaponManager)
        this.weaponManager.init(data)
    }

    tick(dt){
        if(this.id !== DataManager.Instance.myPlayerId){    //玩家只能操控自己id的角色
            return
        } 
        if(DataManager.Instance.jm.input.length()){
            const {x,y} = DataManager.Instance.jm.input
            EventManager.Instance.emit(EventEnum.ClientSync,{
                    id:1,
                    type:InputTypeEnum.ActorMove,
                    direction:{
                        x,
                        y,
                    },
                    dt,
                })
            //console.log(DataManager.Instance.state.actors[0])
            this.state = EntityStateEnum.Run
        }else{
            this.state = EntityStateEnum.Idle
        }
    }

    render(data:IActor){
        const {direction,position} = data
        this.node.setPosition(position.x,position.y)
        if(direction.x !== 0){
            this.node.setScale(direction.x>0?1:-1,1)    //如果x轴方向为正，那么缩放为1，否则为-1（翻转）
            this.hp.node.setScale(direction.x>0?1:-1,1) //hp也翻转保证无论是朝向哪都是从右往左扣血
        }


        //const side = Math.sqrt(direction.x**2 + direction.y**2)
        const angle = getAngle(Math.atan2(direction.y,Math.abs(direction.x)))   //需要把direction.x绝对值，不然由于setScale(direction.x>0?1:-1,1)的原因会只能在一边旋转
        this.weaponManager.node.setRotationFromEuler(0,0,angle)

        this.hp.progress = data.hp/this.hp.totalLength
    }
}

