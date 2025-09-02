import { _decorator, Component, EventTouch, Input, input, Node, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoyStickMananger')
export class JoyStickMananger extends Component {
    input :Vec2 = Vec2.ZERO
    private body:Node
    private stick:Node
    private defaultPos:Vec2     //大操纵盘默认位置
    private radius:number       //小操纵杆活动半径
    protected onLoad(): void {
        this.body = this.node.getChildByName('Body')
        this.stick = this.body.getChildByName('Stick')
        this.defaultPos = new Vec2(this.body.position.x,this.body.position.y)
        this.radius =  this.body.getComponent(UITransform).contentSize.x / 2
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this) 
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    protected onDestroy(): void {
       input.off(Input.EventType.TOUCH_START, this.onTouchStart, this)
       input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this) 
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    private onTouchStart(event: EventTouch) {
       const touchPos = event.getUILocation()
       this.body.setPosition(touchPos.x,touchPos.y)
   }

    private onTouchMove(event: EventTouch) {
      const touchPos = event.getUILocation()
      const stickPos = new Vec2(touchPos.x - this.body.position.x,touchPos.y - this.body.position.y)
      if(stickPos.length() > this.radius) {
        stickPos.normalize()    //归一化
        stickPos.multiplyScalar(this.radius)    //限制小操纵杆活动半径
      }
      this.stick.setPosition(stickPos.x,stickPos.y)
      this.input = stickPos.clone().normalize()
      //console.log(this.input)
   }

   private onTouchEnd() {
      this.body.setPosition(this.defaultPos.x,this.defaultPos.y)        //大操纵盘返回默认位置
      this.stick.setPosition(0,0)   //小操纵杆返回默认中心位置
      this.input = Vec2.ZERO
   }
}

