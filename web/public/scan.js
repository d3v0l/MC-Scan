window.onload = (e) => {
    let pIcon = `<span class="u-icon u-text-custom-color-4"><svg class="u-svg-content" viewBox="0 0 192 192" style="width: 1em; height: 1em;"><path d="m155.109 74.028a4 4 0 0 0 -3.48-2.028h-52.4l8.785-67.123a4.023 4.023 0 0 0 -7.373-2.614l-63.724 111.642a4 4 0 0 0 3.407 6.095h51.617l-6.962 67.224a4.024 4.024 0 0 0 7.411 2.461l62.671-111.63a4 4 0 0 0 .048-4.027z"></path></svg><img></span>`
    const form = document.getElementById("form");
    const button = document.getElementById("submit")
    const status = document.getElementById("status")
    const fileInput = document.getElementById("fileInput")
    button.addEventListener("click", () => {
        let formData = new FormData(form)
        if(!fileInput.value || fileInput.value.length < 1) {
            status.style.display=""
            status.innerHTML=`${pIcon} Error: Please choose one file.`
            return;
        }
        let fileSplit = fileInput.value.split(".")
        if(!["zip", "jar"].includes(fileSplit[fileSplit.length-1])) {
            status.style.display=""
            status.innerHTML=`${pIcon} Error: Please provide a .jar or .zip file.`
            return;
        }
        axios.request({
            method: "post",
            url: "/scan",
            data: {file: fileInput.value.split("C:\\fakepath\\")[1]},
            onUploadProgress: (p)=>{
                form.style.display = "none"
                button.style.display = "none"
                status.style.display = ""
                status.innerHTML = `${pIcon} Generating link ...`
            }
        })
        .then(data1 => {
            if(data1.data.link){
                axios.request({
                    method: "post",
                    url: data1.data.link,
                    data: formData,
                    onUploadProgress: (p)=>{
                        form.style.display = "none"
                        status.style.display = ""
                        status.innerHTML = `${pIcon} Uploading: ${Number.parseFloat(p.loaded / 1024 / 1024).toFixed(2)}MB / ${Number.parseFloat(p.total / 1024 / 1024).toFixed(2)}MB`
                    }
                }).then((data2) => {
                    console.log(data2.data.status.message)
                    form.style.display=""
                    status.style.display=""
                    if(data2.data.status.success){
                        status.innerHTML=`${pIcon} Summary: <a href="${data2.data.link}">${data2.data.link}</a>`
                        window.location = data2.data.link
                    } else {
                        if(data2.data.status.message === "INVALID_FILE"){
                            status.innerHTML=`${pIcon} Error: Please provide a .jar or .zip file.`
                            button.style.display=""
                        } else if(data2.data.status.message === "SOMETHING_WENT_WRONG") {
                            button.style.display=""
                            status.innerHTML=`${pIcon} Error: Something went wrong. <br> Try uploading 10 plugins at a time.`
                        }
                    }
                })
                .catch(e=>{
                    console.log(e)
                    button.style.display=""
                    status.innerHTML=`${pIcon} Error: Something went wrong. <br> See console log.`
                })
            }
        })
        .catch(e=>{
            console.log(e)
            button.style.display=""
            status.innerHTML=`${pIcon} Error: Something went wrong. <br> See console log.`
        })
    })
}