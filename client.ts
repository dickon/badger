interface XMLHttpRequest {}
function imageDrag(ev, image) {
    console.log(`dragging ${ev.target.id} ${image}`);
    ev.dataTransfer.setData("text", image);
    
}
function allowDrop(ev) {
    ev.preventDefault();
}
function capitalise(x) {
    return x[0].toUpperCase() + x.substring(1);
}

interface Badge {
    first: string;
    last: string;
    id: string;
    filename: string;
    rotation: number;
    imageWidth: number;
    imageHeight: number;
}

class Editor {
    badges: Badge[];
    badgemap: any;
    config: string;

    constructor(confName:string) {
        this.config = confName;
        this.badgemap = {};
    }

    drop(ev, confname: string, index:number, first:string, last:string, config:string) {
        ev.preventDefault();
        let data = ev.dataTransfer.getData("text");
        console.log(`dropping ${data} on ${index} (${first} ${last}) for ${confname}`);
        $.ajax({
            url: `/api/configs/${confname}/badges/${index}/image/${data}`,
            type:'PUT',
            success: (result) => {
                console.log(`put to server ${index}`);
                this.badges[index].filename = data;
                this.render(index);
                console.log(`redrew ${index}`);
            }
        });
    }

    render(badgeId) {
        let badge = this.badgemap[badgeId];
        let svg = `<image width="880" height="480" visibility="visibile" href="/api/configs/${this.config}/background"></image>`;
        if (badge.filename) {
            let x= badge.x == null ? 0 : badge.x;
            let y = badge.y == null ? 0 : badge.y;
            let width = badge.width == null ? badge.imageWidth : badge.width;
            let height = badge.height == null ? badge.imageHeight : badge.height; 
            console.log(JSON.stringify(badge));
            svg += `<defs> <clipPath id="iclip"> <rect x="${x}" y="${y}" width="${width}" height="${height}"></rect></clipPath></defs>`;
            svg += `<g transform="translate(380 50)"><image draggable="true" ondragstart="imageDrag(event, '${badge.filename}')" clip-path="url('#iclip')" transform='scale(1.5) rotate(${badge.rotation} 180 100) ' class="thumbnail" href="/api/configs/${this.config}/image/${badge.filename}"> </image></g>`;
        }
        svg += `<text x=120 y=280 style="font-size: 20pt; text-anchor: middle">${capitalise(badge.first)}</text>`;
        svg += `<text x=120 y=380 style="font-size: 40pt; text-anchor: middle">${capitalise(badge.last)}</text>`;
        $(`#badge${badgeId}`).html(`<svg class="badge" ondragover="allowDrop(event)" ondrop="drop(event, '${this.config}', ${badge.id}, '${badge.first}', '${badge.last}')">${badge.first} ${badge.last} ${svg}`);
    }

    createBadge(badge) {
        this.badgemap[badge.id] = badge;
        $.getJSON(`/api/configs/${this.config}/image/${badge.filename}/size`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            console.log(`image size ${imageSize.width} ${imageSize.height}`);
            $('#badges').append(`<svg class="badge" id="badge${badge.id}"></svg>`);
            this.render(badge.id);
        });
    }

    loadBadges() {
        $.getJSON(`/api/configs/${this.config}/background/size`, badgeSize=> {
            $.getJSON(`/api/configs/${this.config}/badges`, (badges: any[])=> {
                this.badges = badges.sort((a,b)=>a.first.localeCompare(b.first));
                this.badges.map(x=>this.createBadge(x));
                $.getJSON(`/api/configs/${this.config}/images`, images=> {
                    images.map(image=>  
                       $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div> <IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" class="thumbnail" src="/api/configs/${this.config}/image/${image}"/></div>`));
                }); 
            });
        });
    }
}

let editor: Editor = null;

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
        // TODO: allow user to choose
        return;
    }    

    editor = new Editor(configs[0].name); 
    editor.loadBadges();
});