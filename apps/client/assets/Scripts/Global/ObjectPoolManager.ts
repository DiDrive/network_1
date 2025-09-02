import { _decorator, resources, Asset , Node, instantiate} from "cc";
import Singleton from "../Base/Singleton";
import { EntityTypeEnum } from "../Common";
import DataManager from "./DataManager";

export class ObjectPoolManager extends Singleton {
  static get Instance() {
    return super.GetInstance<ObjectPoolManager>();
  }

  private objectPool:Node
  private map:Map<EntityTypeEnum,Node[]> = new Map()

  get(type:EntityTypeEnum){
    if(!this.objectPool){
        this.objectPool = new Node("ObjectPool")
        this.objectPool.setParent(DataManager.Instance.stage)
    }

    if(!this.map.has(type)){
        this.map.set(type,[])
        const container = new Node(type + "Pool")
        container.setParent(this.objectPool)
    }

    const nodes = this.map.get(type)    
    if(!nodes.length){
        const prefab = DataManager.Instance.prefabMap.get(type)
        const node = instantiate(prefab)
        node.name = type
        node.setParent(this.objectPool.getChildByName(type + "Pool"))
        node.active = true
        //console.log(`创建新的 ${type} 节点，当前池中数量: ${nodes.length}`);
        return node
    }else{
        const node = nodes.pop()
        node.active = true
        //console.log(`从池中获取 ${type} 节点，剩余数量: ${nodes.length}`);
        return node
    }
}

ret(node:Node){
    node.active = false
    const nodename = node.name as EntityTypeEnum
    this.map.get(nodename).push(node)
    //console.log(`回收 ${type} 节点，池中数量: ${this.map.get(type).length}`);
}
}
