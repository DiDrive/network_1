import { _decorator, Component, EventTouch, Input, input, instantiate, Label, Node, UITransform, Vec2 } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
import { IPlayer, IRoom } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('RoomContainerManager')
export class RoomContainerManager extends Component {
    id:number
    init({id,players}:IRoom){
        this.id = id
        const roomidlabel = this.getComponent(Label).string = `房间id:${id}`
        this.node.active = true
        
    }

    handleClick(){
        EventManager.Instance.emit(EventEnum.RoomJoin,this.id)
    }
}

