import { MyServer } from "./MySever";
import { WebSocket } from "ws";
import { EventEmitter } from "stream";
import { IModel, strdecode, strencode } from "../Common";
import { buffer } from "stream/consumers";

interface IItem {
  cb: Function;
  ctx: unknown;
}
const em = new EventEmitter()

export class Connection extends EventEmitter{
    private msgMap: Map<string, Array<IItem>> = new Map();   
    constructor(private server:MyServer,private ws:WebSocket){
        super()
        this.ws.on("close",()=>{
            this.emit("close")
        })
        this.ws.on("message",(buffer:Buffer)=>{
          const ta = new Uint8Array(buffer) // 将buffer转换为utf-8字节数组
          const str = strdecode(ta) // 将utf-8字节数组解码为字符串
            try {
                const msg = JSON.parse(str)
                const {name,data} = msg
                if(this.server.apiMap.has(name)){
                  try {
                    const cb = this.server.apiMap.get(name)
                    const res = cb.call(null,this,data)
                    this.sendMsg(name,{
                      success:true,
                      res,
                    })
                  } catch (e) {
                    this.sendMsg(name,{
                      success:false,
                      error:e.message,
                    })
                  }
                }
                else{
                  try {
                    if (this.msgMap.has(name)) {
                      this.msgMap.get(name).forEach(({cb,ctx}) => {
                        cb.call(ctx, this, data);
                      });
                    }
                  } catch (error) {
                    console.log(error)
                  }                 
                }
            } catch (error) {
                console.log(error)
            }
        })
    }

    sendMsg<T extends keyof IModel['msg']>(name:T,data:IModel['msg'][T]){
    const msg = {
      name,
      data,
    }
    const str = JSON.stringify(msg) // 先将消息转换为字符串
    const ta = strencode(str) // 对字符串进行编码
    const buffer = Buffer.from(ta)  // 将utf-8字节数组转换为buffer
    if(this.ws){
      this.ws.send(buffer)
    }
  }

  ListenMsg<T extends keyof IModel['msg']>(name:T,cb:(connection:Connection,data:IModel['msg'][T])=>void,ctx:unknown){
    if (this.msgMap.has(name)) {
      this.msgMap.get(name).push({ cb, ctx });
    } else {
      this.msgMap.set(name, [{ cb, ctx }]);
    }
  }

  unListenMsg<T extends keyof IModel['msg']>(name:T,cb:(connection:Connection,data:IModel['msg'][T])=>void,ctx:unknown){
    if (this.msgMap.has(name)) {
      const index = this.msgMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this.msgMap.get(name).splice(index, 1);
    }
  }
}