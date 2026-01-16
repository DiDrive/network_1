import { _decorator, Component, EventTouch, Input, input, instantiate, Node, Prefab, SpriteFrame, UITransform, Vec2 } from 'cc';
import DataManager from '../Global/DataManager';
import { JoyStickMananger } from '../UI/JoyStickMananger';
import { ResourceManager } from '../Global/ResourceManager';
import { ActorManager } from '../Entity/Actor/ActorManager';
import { EventEnum, PrefabPathEnum, TexturePathEnum } from '../Enum';
import { ApiMsgEnum, EntityTypeEnum, IClientInput, IMsgClientSync, IMsgServerSync, InputTypeEnum } from '../Common';
import { BulletManager } from '../Entity/Bullet/BulletManager';
import { ObjectPoolManager } from '../Global/ObjectPoolManager';
import { NetWorkManager } from '../Global/NetWorkManager';
import EventManager from '../Global/EventManager';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    private stage:Node
    private ui:Node

    private shouldUpdate:boolean = false

    protected onLoad(): void {
       
        
    }

    async start(){
        this.clearGame()
        await Promise.all([
            this.loadRes(),
            this.connectServer(),
        ])
        // NetWorkManager.Instance.sendMsg('nihao')
        // NetWorkManager.Instance.ListenMsg('hello',(data)=>{
        //     console.log('ListenMsg',data)
        // },this)
        //await this.loadRes()  
        this.initGame()
    }

    initGame(){ //初始化游戏
        DataManager.Instance.jm = this.ui.getComponentInChildren(JoyStickMananger)
        this.initMap()
        this.shouldUpdate = true  
        EventManager.Instance.on(EventEnum.ClientSync,this.handleClientSync,this)
        NetWorkManager.Instance.ListenMsg(ApiMsgEnum.MsgServerSync,this.handleServerSync,this)
    }

    clearGame(){    //清除游戏
        EventManager.Instance.off(EventEnum.ClientSync,this.handleClientSync,this)
        NetWorkManager.Instance.unListenMsg(ApiMsgEnum.MsgServerSync,this.handleServerSync,this)
        DataManager.Instance.stage = this.stage = this.node.getChildByName('Stage')
        this.ui = this.node.getChildByName('UI')
        this.stage.destroyAllChildren()
    }

    //加载资源
    async loadRes(){    
        const list = []
        for (const type in EntityTypeEnum) {    
            //console.log("type:",type)
            const p =await ResourceManager.Instance.loadRes(PrefabPathEnum[type],Prefab).then((prefab)=>{
            DataManager.Instance.prefabMap.set(type,prefab)
        })
        list.push(p)
        } 

        for (const type in TexturePathEnum) {    
            //console.log("type:",type)
            const p =await ResourceManager.Instance.loadDir(TexturePathEnum[type],SpriteFrame).then((spriteFrames)=>{
            DataManager.Instance.textureMap.set(type,spriteFrames)
        })
        list.push(p)
        } 
        await Promise.all(list)
    }


    update(dt){
        if(!this.shouldUpdate){     //等待资源加载完成，再渲染
            return
        }
        this.render()
        this.tick(dt)
    }

    tick(dt){
        this.tickActor(dt)
        DataManager.Instance.applyInput({
            type:InputTypeEnum.Timepast,
            dt,
        })
    }

    tickActor(dt){
        for(const data of DataManager.Instance.state.actors){
            const {id} = data
            let actormanager  = DataManager.Instance.actorMap.get(id)
            actormanager.tick(dt)

        }
    }


    render(){
        this.renderActor()
        this.renderBullet()
    }

    initMap(){
        const prefab = DataManager.Instance.prefabMap.get(EntityTypeEnum.Map)
        const map = instantiate(prefab)
        map.setParent(this.stage)
    }


    renderActor(){  //渲染actor

        for(const data of DataManager.Instance.state.actors){
            const {id,type} = data
            let actormanager  = DataManager.Instance.actorMap.get(id)
            if(!actormanager){
                const prefab = DataManager.Instance.prefabMap.get(type)
                const actor = instantiate(prefab)
                actor.setParent(this.stage)
                actormanager = actor.addComponent(ActorManager)
                DataManager.Instance.actorMap.set(data.id,actormanager)
                actormanager.init(data)
            }
            else{
                actormanager.render(data)
            }
        }

    }

    renderBullet(){
        // 渲染当前存在的子弹
        for(const data of DataManager.Instance.state.bullets){
            const {id, type} = data
            let bulletmanager = DataManager.Instance.bulletMap.get(id)
            
            if(!bulletmanager){
                // 使用 ObjectPoolManager 获取子弹节点
                const bullet = ObjectPoolManager.Instance.get(type)
                
                bulletmanager = bullet.getComponent(BulletManager) || bullet.addComponent(BulletManager)
                DataManager.Instance.bulletMap.set(data.id, bulletmanager)
                bulletmanager.init(data)
            }
            else{
                bulletmanager.render(data)
            }
        }
    }
    async connectServer(){
        if(!await NetWorkManager.Instance.connect().catch(()=>false)){
            await  new Promise((resolve)=>{
                setTimeout(()=>{
                    resolve(true)
                },1000)
            })
            this.connectServer()
        }
    }

    handleClientSync(input:IClientInput){   //客户端同步输入
        const Msg ={
            input,
            frameId:DataManager.Instance.frameId++,
        }
        NetWorkManager.Instance.sendMsg(ApiMsgEnum.MsgClientSync,Msg)
    }

    handleServerSync({ inputs,lastframeId }:IMsgServerSync){       //服务器同步输入
        for (const input of inputs) {
            DataManager.Instance.applyInput(input)
        }
    }
}

