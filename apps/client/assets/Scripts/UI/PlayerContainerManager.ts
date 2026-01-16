import { _decorator, Component, EventTouch, Input, input, instantiate, Label, Node, UITransform, Vec2 } from 'cc';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
import { IPlayer } from '../Common';
const { ccclass, property } = _decorator;

@ccclass('PlayerContainerManager')
export class PlayerContainerManager extends Component {
    init({id,rid,nickname}:IPlayer){
        const nicknamelabel = this.getComponent(Label).string = nickname
        this.node.active = true
        
    }
}

