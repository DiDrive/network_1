import { Prefab, SpriteFrame, Node, find, UITransform } from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum, IActorMove, IBullet, IClientInput, InputTypeEnum, IState } from "../Common";
import { ActorManager } from "../Entity/Actor/ActorManager";
import { JoyStickMananger } from "../UI/JoyStickMananger";
import { BulletManager } from "../Entity/Bullet/BulletManager";
import EventManager from "./EventManager";
import { EventEnum } from "../Enum";

const ACTOR_SPEED = 100 //玩家移动速度
const BULLET_SPEED = 600 //子弹移动速度
const Actor_Radius = 50 //角色半径
const Bullet_Radius = 10 //子弹半径
const BULLET_DAMAGE = 5 //子弹伤害
const ACTOR_HP = 100 //角色血量

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }
  myPlayerId:number = 1
  stage:Node
  jm:JoyStickMananger
  actorMap:Map<number,ActorManager> = new Map()
  prefabMap:Map<string,Prefab> = new Map()
  bulletMap:Map<number,BulletManager> = new Map()
  textureMap:Map<string,SpriteFrame[]> = new Map()

  private screenWidth:number = 960
  private screenHeight:number = 640

  state : IState = {
    actors:[
      {
        id:1,
        hp:ACTOR_HP,
        type:EntityTypeEnum.Actor1,
        weaponType:EntityTypeEnum.Weapon1,
        bulletType:EntityTypeEnum.Bullet2,
        position:{
          x:-150,
          y:-150
        },
        direction:{
          x:1,
          y:0,
        },
      },
      {
        id:2,
        hp:ACTOR_HP,
        type:EntityTypeEnum.Actor1,
        weaponType:EntityTypeEnum.Weapon1,
        bulletType:EntityTypeEnum.Bullet2,
        position:{
          x:150,
          y:150
        },
        direction:{
          x:-1,
          y:0,
        },
      },
    ],
    bullets:[],
    nextBulletId:1,
  }

  applyInput(input:IClientInput){
    switch(input.type){
      case InputTypeEnum.ActorMove:{
        const {
          id,
          dt,
          direction:{
            x,y
          },
        } = input
        const actor = this.state.actors.find((item)=>item.id === id)
        if(actor){
          actor.direction.x = x
          actor.direction.y = y

          actor.position.x += x * dt * ACTOR_SPEED
          actor.position.y += y * dt * ACTOR_SPEED
        }
        break;
      } 
      case InputTypeEnum.WeaponShoot:{
          const {
          owner,
          position,
          direction,
        } = input
        const bullet:IBullet ={
          id:this.state.nextBulletId++,
          owner,
          position,
          direction,
          type:this.actorMap.get(owner).bulletType
        }
        EventManager.Instance.emit(EventEnum.BulletBorn,owner)
        this.state.bullets.push(bullet)
        break;
      }

      case InputTypeEnum.Timepast:{
        // 确保获取到最新的屏幕尺寸
        this.getScreenSize()
        
        const {dt} = input
        const {bullets,actors} = this.state
        const margin = 0 // 边界缓冲距离，超过屏幕边界 margin 距离触发
        
        const leftBoundary = -this.screenWidth / 2 - margin;
        const rightBoundary = this.screenWidth / 2 + margin;
        const bottomBoundary = -this.screenHeight / 2 - margin;
        const topBoundary = this.screenHeight / 2 + margin; 
        
        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i]
          
          // 子弹与人物碰撞检测
          for (let j = actors.length - 1; j >= 0; j--) {
            const actor = actors[j]
            if((actor.position.x-bullet.position.x)**2+(actor.position.y-bullet.position.y)**2<(Actor_Radius+Bullet_Radius)**2){
              actor.hp -= BULLET_DAMAGE
              console.log(`子弹 ${bullet.id} 击中了角色 ${actor.id}`);
              
              // 只触发爆炸事件，让 BulletManager 处理回收
              EventManager.Instance.emit(EventEnum.ExplosionBorn,bullet.id,{
                x:(actor.position.x+bullet.position.x)/2,
                y:(actor.position.y+bullet.position.y)/2
              })
              
              // 从bullets数组中移除
              this.state.bullets.splice(i, 1);
            
              break;  
            }
          }
          
      
          
          // 更新子弹位置
          bullet.position.x += bullet.direction.x * dt * BULLET_SPEED
          bullet.position.y += bullet.direction.y * dt * BULLET_SPEED
          
          // 边界检测 - 检查子弹是否超出屏幕范围
          if (bullet.position.x < leftBoundary || 
            bullet.position.x > rightBoundary || 
            bullet.position.y < bottomBoundary || 
            bullet.position.y > topBoundary) {
            
            console.log(`子弹 ${bullet.id} 在位置 (${bullet.position.x.toFixed(2)}, ${bullet.position.y.toFixed(2)}) 超出边界被回收`);
            
            // 只触发爆炸事件，让 BulletManager 处理回收
            EventManager.Instance.emit(EventEnum.ExplosionBorn,bullet.id,{x:bullet.position.x,y:bullet.position.y})
            
            // 从bullets数组中移除
            this.state.bullets.splice(i, 1);
          }
        }
        break;
      } 
    }
  }

  private getScreenSize(){
    const canvas = find("Canvas")
    if(canvas){
      const uiTransform = canvas.getComponent(UITransform)
      if(uiTransform){
        this.screenWidth = uiTransform.contentSize.width
        this.screenHeight = uiTransform.contentSize.height
      }
    }
  }
}
