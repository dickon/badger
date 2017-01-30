interface XMLHttpRequest {}
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
    let config = configs[0].name;
    $.getJSON(`/api/configs/${config}/background/size`, badgeSize=> {
        $.getJSON(`/api/configs/${config}/badges`, badges=> {
            for (let badge of badges) {
                let svg = `<image width="500" height="300" visibility="visibile" href="/api/configs/${config}/background"></image>`;
                if (badge.filename) {
                    svg += `<g transform="translate(350 5)"><image draggable="true"  ondragstart="imageDrag(event, '${badge.filename}')" transform='scale(0.8) rotate(${badge.rotation} 150 200) ' class="thumbnail" href="/api/configs/${config}/image/${badge.filename}"> </image></g>`;
                }
                svg += `<text x=100 y=100 style="font-size: 20pt; text-anchor: middle">${badge.first}</text>`;
                svg += `<text x=100 y=200 style="font-size: 40pt; text-anchor: middle">${badge.last}</text>`;
                $('#badges').append(`<svg class="badge" ondragover="allowDrop(event)" ondrop="drop(event, '${config}', ${badge.id}, '${badge.first}', '${badge.last}')">${badge.first} ${badge.last} ${svg}</svg>`);
            }
            $.getJSON(`/api/configs/${config}/images`, images=> {
                for (let image of images) 
                    $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div> <IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" class="thumbnail" src="/api/configs/${config}/image/${image}"/></div>`);
            }); 
        });
    });
});