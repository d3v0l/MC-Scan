const axios = require('axios')
const nodes = require('../nodes.json')
const cache = new Map()
module.exports = class NodeManager{

    static init() {
        setInterval(() => {
            this.refresh()
        }, 15000)
        this.refresh()
    }
    static refresh() {
        nodes.forEach(node => {
            axios.post(`${node.host}/connect?node=${node.id}&secret=GNyw5rc7syrdZyZndfxc`).then((data)=>{
                if(data.data.status.success & data.data.status.online) {
                    cache.set(node.id, node)
                }
            })
            .catch(e => {})
        })
    }
    static getNode() {
        return nodes[0]
    }

}