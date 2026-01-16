import { _decorator, Component, director, EditBox, EventTouch, Input, input, instantiate, Node, UITransform, Vec2 } from 'cc';
import { NetWorkManager } from '../Global/NetWorkManager';
import { ApiMsgEnum } from '../Common/Enum';
import DataManager from '../Global/DataManager';
import { SceneEnum } from '../Enum';

const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    input:EditBox
    onLoad(){
        this.input = this.getComponentInChildren(EditBox)
        director.preloadScene(SceneEnum.Hall)
    }

    async start(){
        await NetWorkManager.Instance.connect()
    }

    async handleClick(){
        if(!NetWorkManager.Instance.isConnected){
        console.log('检测到连接断开，正在重新连接...')
        try {
            await NetWorkManager.Instance.connect()
            console.log('重连成功！')
        } catch (error) {
            console.log('重连失败：', error)
            return
        }
    }
        const nickname = this.input.string
        if(!nickname){
            console.log('请输入昵称')
            return
        }
        const {success,res,error} = await NetWorkManager.Instance.callApi(ApiMsgEnum.ApiPlayerJoin,
            {
                nickname,
            }
        )
        if(!success){
            console.log(error)
            return
        }
        DataManager.Instance.myPlayerId = res.player.id
        console.log('res！',res)
        director.loadScene(SceneEnum.Hall)
    }
}

