/// <reference path="typings/globals/jquery/index.d.ts" />
function imageDrag(ev, image) {
    console.log(`dragging ${ev.target.id} ${image}`);
    ev.dataTransfer.setData("text", image);
    
}
function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev, confname: string, index:number, first:string, last:string, config:string) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    console.log(`dropping ${data} on ${index} (${first} ${last}) for ${confname}`);
    $.ajax({
        url: `/api/configs/${confname}/badges/${index}/image/${data}`,
        type:'PUT',
        success: (result) => {
            console.log("put to server");
            location.reload();

        }
    });
}

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
        // TODO: allow user to choose
        return;
    }
    var config = configs[0].name;

    $.getJSON(`/api/configs/${config}/badges`, badges=> {
        for (let badge of badges) {
            let im = "";
            if (badge.filename) {
                im = `<IMG draggable="true"  ondragstart="imageDrag(event, '${badge.filename}')" class="thumbnail" src="/api/configs/${config}/image/${badge.filename}"> </IMG>`;
            }
            $('#badges').append(`<div class="badge" ondragover="allowDrop(event)" ondrop="drop(event, '${config}', ${badge.id}, '${badge.first}', '${badge.last}')">${badge.first} ${badge.last} ${im}</div>`);
        }
        $.getJSON(`/api/configs/${config}/images`, images=> {
            for (let image of images) {
                 $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div> <IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" class="thumbnail" src="/api/configs/${config}/image/${image}"/></div>`);
             }        
        }); 
    });
});