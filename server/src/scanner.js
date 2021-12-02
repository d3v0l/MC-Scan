const AdmZip = require('adm-zip')
const fs = require('fs')
const c = require('chalk')
const ScannedSchema = require('../../database/scanned');
const ForScansSchema = require('../../database/forscans')
let config = require('../config.json');
const path = require('path');
const fsExtra = require('fs-extra')
let scanning = false;
module.exports=class Scanner{ 

    static init ( ) {
        console.log(c.blueBright("[INFO]") + ` Started scanning.`)
        setInterval(async () => {
            if(scanning) return;
            else { 
                let result = await ForScansSchema.findOne({node: config["NODE"], recieved: true})
                if(!result) return;
                else {
                    console.log(c.blueBright("[INFO]") + ` Scanning ${result.id}`)
                    this.scan(path.join(`${__dirname}/../storage/${result.id}`), result.id, result.sumbitedOn)
                }
            }
        }, 5000)
    }

    static async unzip(file, target) {
        try {
            let zip = new AdmZip(file);
            await zip.extractAllTo(target, true);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
        
        
    }

    static async scan(dir, id, sumbitedOn) {
        if(!fs.existsSync(dir)) {
            scanning = false;
            return;
        };
        if(!id) {
            scanning = false;
            return;
        };
        let pluginsArray = fs.readdirSync(dir)
        pluginsArray = pluginsArray.filter(plugin => plugin.includes('.jar'))
        if(pluginsArray.length < 1) {
            scanning = false;
            console.log(c.red("[ERROR]") + ` No plugins found in the plugins folder. ${c.red(dir)}`)
            let scanned = new ScannedSchema({
                id,
                node: config["NODE"],
                files: [],
                scanErrors: []
            })
            scanned.scanErrors.push("No plugins were found")
            if(sumbitedOn) scanned.sumbitedOn=sumbitedOn
            scanned.save()
            .catch(e => console.log(e))
        }
        if(pluginsArray.length > 0) console.log(c.blueBright("[INFO]") + ` Found the following plugins: (${pluginsArray.length}) ` + pluginsArray.join(", "))
        console.log(c.blueBright("[INFO]" + ` Looking at the plugins.`))
        scanning = true;
        let scanned = new ScannedSchema({
            id: id,
            node: config["NODE"],
            files: [],
            scanErrors: []
        })
        pluginsArray.forEach((plugin, index) => {
            new Promise((res, rej) => {
                let zip;
                try {
                    zip = new AdmZip(path.join(`${__dirname}/../storage/${id}/${plugin}`));
                } catch (e) {
                    scanning = false;
                    scanned.scanErrors.push("Error: "+e.message)
                    console.log(scanned)
                    scanned.save()
                    fsExtra.emptyDirSync(dir)
                    fsExtra.removeSync(dir)
                    this.remove(id)
                    return;
                }
                
                let files = this.getFiles(zip)
                let malicious = ['javassist', '.l1', '.l_ignore', 'PingMessage.class', 'ResponseContainer.class']
                if(sumbitedOn) scanned.sumbitedOn=sumbitedOn
                let trueChecks = [];
                malicious.forEach(mal => {
                    if(files.includes(mal)) trueChecks.push(1)
                    else trueChecks.push(0)
                })
                files.forEach(file => {
                    if(file.includes('L10')) trueChecks.push(2);
                })
                if(trueChecks.includes(2)) { 
                    scanned.files.push({file: plugin, status: "INFECTED", type: "HOSTFLOW"})
                    console.log(c.red("[DANGER]") + ` ${c.underline(plugin)} is infected by HostFlow virus. Reinstall it immediately. [${index+1} / ${pluginsArray.length}]`)
                    res(scanned)
                    return;
                }
                if(trueChecks.includes(1)) { 
                    scanned.files.push({file: plugin, status: "SUSPICIOUS", type: "HOSTFLOW"})
                    console.log(c.yellow("[WARN]") + ` ${c.underline(plugin)} maybe is infected by HostFlow virus. Reinstall it just to be sure [${index+1} / ${pluginsArray.length}]`)
                    res(scanned)
                    return;
                }
                if(!trueChecks.includes(2) && !trueChecks.includes(1)) {
                    scanned.files.push({file: plugin, status: "CLEAN"})
                    console.log(c.green("[CLEAR]") + ` ${c.underline(plugin)} is not infected. [${index+1} / ${pluginsArray.length}]`)
                    res(scanned)
                    return;
                }
            }).then(async (scanned) => {
                if(index === pluginsArray.length-1) {
                    console.log(c.blueBright("[INFO]") + ` Action finished.`)
                    scanning = false;
                    scanned.save()
                    .catch(e => console.log(e))
                    await ForScansSchema.findOneAndDelete({id: id})
                    fsExtra.emptyDirSync(dir)
                    fsExtra.removeSync(dir)
                }
            }).catch(e => {})
            
        })
    }
    static getFiles(zip){
        let zipEntries = []
        zip.getEntries().forEach(zipE => {
            
            if(zipE.isDirectory) {
                let strArr = zipE.entryName.split('/')
                zipEntries.push(strArr[strArr.length-2])
            }
            if(zipE.name.length > 1) zipEntries.push(zipE.name)
        })
        return zipEntries
    }
    static async remove(id) {
        await ForScansSchema.findOneAndDelete({id: id})
    }
}