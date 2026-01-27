import { _decorator, Component, EventTouch, Input, input, instantiate, Node, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
import DataManager from '../../Global/DataManager';
import { EntityStateEnum, EntityTypeEnum, IActor, IBullet, InputTypeEnum, IVec2 } from '../../Common';
import { EntityManager } from '../../Base/EntityManager';
import { WeaponManager } from '../Weapon/WeaponManager';
import { getAngle } from '../../Utils';
import { BulletStateMachine } from './BulletStateMachine';
import EventManager from '../../Global/EventManager';
import { EventEnum } from '../../Enum';
import { ExplosionManager } from '../Explosion/ExplosionManager';
import { ObjectPoolManager } from '../../Global/ObjectPoolManager';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {
    Type:EntityTypeEnum
    id:number
    private targetPos:Vec3
    private tw:Tween<unknown>
    init(data:IBullet){
        this.Type = data.type
        this.id = data.id
        this.fsm = this.addComponent(BulletStateMachine)
        this.fsm.init(data.type)
        this.state = EntityStateEnum.Idle
        this.node.active = false
        this.targetPos = undefined

        EventManager.Instance.on(EventEnum.ExplosionBorn,this.handleExplosionBorn,this)
    }


    render(data:IBullet){
        this.renderPos(data)
        this.renderDire(data)
    }

    renderPos(data:IBullet){
        const {position} = data
        this.node.setPosition(position.x,position.y)
        const newPos = new Vec3(position.x,position.y)
        if(!this.targetPos){
            this.node.active = true
            this.node.setPosition(newPos)
            this.targetPos = new Vec3(newPos)
        }else if(!this.targetPos.equals(newPos)){
            this.tw?.stop()
            this.node.setPosition(this.targetPos)
            this.targetPos.set(newPos)
            this.tw = tween(this.node).to(0.1,{
                position:this.targetPos,
            }).start()
        }
    }

    renderDire(data:IBullet){
        const {direction} = data
        if(direction.x !== 0){
            this.node.setScale(direction.x>0?1:-1,1)    //如果x轴方向为正，那么缩放为1，否则为-1（翻转）
        }
        //const side = Math.sqrt(direction.x**2 + direction.y**2)
        const angle = direction.x>0? getAngle(Math.atan2(direction.y,Math.abs(direction.x))) : -getAngle(Math.atan2(direction.y,Math.abs(direction.x)))   //需要把direction.x绝对值，不然由于setScale(direction.x>0?1:-1,1)的原因会只能在一边旋转
        this.node.setRotationFromEuler(0,0,angle)
    }
    //处理爆炸事件
    handleExplosionBorn(id:number,{x,y}:IVec2){
        if(id !== this.id){
            return
        }

        const explosion = ObjectPoolManager.Instance.get(EntityTypeEnum.Explosion)
        const explosionManager = explosion.getComponent(ExplosionManager) || explosion.addComponent(ExplosionManager)
        explosionManager.init(EntityTypeEnum.Explosion,{x,y})
        EventManager.Instance.off(EventEnum.ExplosionBorn, this.handleExplosionBorn, this); //移除事件，不然会一直生成
        DataManager.Instance.bulletMap.delete(this.id)
        ObjectPoolManager.Instance.ret(this.node)
        
    }
}

