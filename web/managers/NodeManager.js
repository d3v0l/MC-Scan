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
            axios.post(`${node.host}/connect?node=${node.id}&secret=${node.secret}`).then((data)=>{
                if(data.data.status.success & data.data.status.online) {
                    cache.set(node.id, node)
                }
            })
            .catch(e => {})
        })
    }
    static getNode() {
        return [...cache.entries()][Math.floor(Math.random()*cache.size)][1]
    }

}