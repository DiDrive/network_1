import { _decorator, resources, Asset, error } from "cc";
import Singleton from "../Base/Singleton";
import { IModel, strdecode, strencode } from "../Common";

interface IItem { //监听消息项接口
  cb: Function;
  ctx: unknown;
}

interface ICallApiRet<T>{  //调用api返回结果接口
    success:boolean
    res?:T
    error?:Error
}
export class NetWorkManager extends Singleton {
  static get Instance() {
    return super.GetInstance<NetWorkManager>();
  }

  private map: Map<string, Array<IItem>> = new Map();
  isConnected:boolean = false
  ws:WebSocket
  port:number = 8081

  connect(){
    return new Promise((resolve,reject)=>{
      if(this.isConnected){
        resolve(true)
        return
      }
      this.ws = new WebSocket(`ws://localhost:${this.port}`)
      this.ws.binaryType = 'arraybuffer'// 接收二进制数据
      this.ws.onopen = ()=>{
        this.isConnected = true
        resolve(true)
      }
      this.ws.onerror = (err)=>{
        this.isConnected = false
        reject(err)
        console.log(err)
      }
      this.ws.onmessage = (msg)=>{  
        try {
          const ta = new Uint8Array(msg.data) // 将buffer转换为utf-8字节数组
          const str = strdecode(ta) // 将utf-8字节数组解码为字符串
          console.log('onmessage',str)
          const josn = JSON.parse(str)
          const {name,data} = josn
          if (this.map.has(name)) {
            this.map.get(name).forEach(({cb,ctx}) => {
              cb.call(ctx, data);
            });
          }
        } catch (error) {
          console.log(error)
        }
        
      }
      this.ws.onclose = ()=>{  
        this.isConnected = false
        reject(false)
        console.log('连接关闭')
      }
    })
  }

  callApi<T extends keyof IModel['api']>(name:T,data:IModel['api'][T]["req"]):Promise<ICallApiRet<IModel['api'][T]["res"]>>{ //调用api
    return new Promise((resolve)=>{
      try {
        const timer = setTimeout(()=>{
          resolve({success:false,error: new Error("Time Out!!!")})
          this.unListenMsg(name as any,cb,null)
        },5000)   //等待超过5s，返回超时错误提示
        const cb = (res)=>{
          resolve(res)
          clearTimeout(timer)
          this.unListenMsg(name as any,cb,null)
        }
        this.ListenMsg(name as any,cb,null)
        this.sendMsg(name as any,data)
      } catch (error) {
        resolve({success:false,error})
      }
      
    })
  }

  async sendMsg<T extends keyof IModel['msg']>(name:T,data:IModel['msg'][T]){ //发送消息
    const msg = {
      name,
      data,
    }
    //await new Promise((rs)=>setTimeout(rs,2000))  // 延迟2s
    const str = JSON.stringify(msg) // 先将消息转换为字符串
    const ta = strencode(str) // 对字符串进行编码
    const ab = new ArrayBuffer(ta.length) 
    const da = new DataView(ab)
    for(let i=0;i<ta.length;i++){
      da.setUint8(i,ta[i])
    }

    if(this.ws){
      this.ws.send(da.buffer)
    }
  }

  ListenMsg<T extends keyof IModel['msg']>(name:T,cb:(args:IModel['msg'][T])=>void,ctx:unknown){ //监听消息
    if (this.map.has(name)) {
      this.map.get(name).push({ cb, ctx });
    } else {
      this.map.set(name, [{ cb, ctx }]);
    }
  }

  unListenMsg<T extends keyof IModel['msg']>(name:T,cb:(args:IModel['msg'][T])=>void,ctx:unknown){ //取消监听消息
    if (this.map.has(name)) {
      const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this.map.get(name).splice(index, 1);
    }
  }
}
