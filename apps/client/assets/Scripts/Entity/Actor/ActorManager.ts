import { _decorator, Component, EventTouch, Input, input, instantiate, Node, ProgressBar, tween, Tween, UITransform, Vec2, Vec3 } from 'cc';
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
    private targetPos:Vec3
    private tw:Tween<unknown>
    bulletType:EntityTypeEnum

    init(data:IActor){
        this.id = data.id
        this.hp = this.node.getComponentInChildren(ProgressBar)
        this.bulletType = data.bulletType
        this.fsm = this.addComponent(ActorStateMachine)
        this.fsm.init(data.type)
        this.state = EntityStateEnum.Idle
        this.node.active = false
        this.targetPos = undefined

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
                    id:DataManager.Instance.myPlayerId,
                    type:InputTypeEnum.ActorMove,
                    direction:{
                        x:Number(x.toFixed(3)),
                        y:Number(y.toFixed(3)),
                    },
                    dt:Number(dt.toFixed(3)),
                })
            //console.log(DataManager.Instance.state.actors[0])
            //this.state = EntityStateEnum.Run
        }else{
            //this.state = EntityStateEnum.Idle
        }
    }

    render(data:IActor){
       this.renderPos(data)
       this.renderDire(data)
       this.renderHp(data)        
    }

    renderPos(data:IActor){ //渲染位置
        const {position} = data 
        const newPos = new Vec3(position.x,position.y)
        if(!this.targetPos){
            this.node.active = true
            this.node.setPosition(newPos)
            this.targetPos = new Vec3(newPos)
        }else if(!this.targetPos.equals(newPos)){
            this.tw?.stop()
            this.node.setPosition(this.targetPos)
            this.targetPos.set(newPos)
            this.state = EntityStateEnum.Run
            this.tw = tween(this.node).to(0.1,{
                position:this.targetPos,
            }).call(()=>{
                this.state = EntityStateEnum.Idle
            }).start()
        }
        //this.node.setPosition(position.x,position.y)
    }

    renderDire(data:IActor){    //渲染方向
        const {direction,position} = data
        if(direction.x !== 0){
            this.node.setScale(direction.x>0?1:-1,1)    //如果x轴方向为正，那么缩放为1，否则为-1（翻转）
            this.hp.node.setScale(direction.x>0?1:-1,1) //hp也翻转保证无论是朝向哪都是从右往左扣血
        }
        //const side = Math.sqrt(direction.x**2 + direction.y**2)
        const angle = getAngle(Math.atan2(direction.y,Math.abs(direction.x)))   //需要把direction.x绝对值，不然由于setScale(direction.x>0?1:-1,1)的原因会只能在一边旋转
        this.weaponManager.node.setRotationFromEuler(0,0,angle)
    }

    renderHp(data:IActor){  //渲染血量
        this.hp.progress = data.hp/this.hp.totalLength
    }

}

