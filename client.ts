/// <reference path="typings/globals/jquery/index.d.ts" />

function imageDrag(ev,image) {
    console.log(`dragging ${ev.target.id} ${image}`);
    ev.dataTransfer.setData("text", image);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    console.log("dropping");
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    console.log(`dropping ${data}`);
}

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
        // TODO: allow user to choose
        return;
    }
    let config = configs[0].name;
    $.getJSON(`/api/configs/${config}/badges`, badges=> {
        for (let badge of badges) {
            $('#badges').append(`<div class="badge" ondragover="allowDrop(event)" ondrop="drop(event)">${badge.first} ${badge.last}</div>`);
        }
        $.getJSON(`/api/configs/${config}/images`, images=> {
            for (let image of images) {
                 $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div> <IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" class="thumbnail" src="/api/configs/${config}/image/${image}"/></div>`);
             }        
        }); 
    });
});