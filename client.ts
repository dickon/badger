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
        let svg = `<image width="500" height="300" visibility="visibile" href="/api/configs/${this.config}/background"></image>`;
        if (badge.filename) {
            svg += `<g transform="translate(350 5)"><image draggable="true"  ondragstart="imageDrag(event, '${badge.filename}')" transform='scale(0.8) rotate(${badge.rotation} 150 200) ' class="thumbnail" href="/api/configs/${this.config}/image/${badge.filename}"> </image></g>`;
        }
        svg += `<text x=100 y=100 style="font-size: 20pt; text-anchor: middle">${capitalise(badge.first)}</text>`;
        svg += `<text x=100 y=200 style="font-size: 40pt; text-anchor: middle">${capitalise(badge.last)}</text>`;
        $(`#badge${badgeId}`).html(`<svg class="badge" ondragover="allowDrop(event)" ondrop="drop(event, '${this.config}', ${badge.id}, '${badge.first}', '${badge.last}')">${badge.first} ${badge.last} ${svg}`);
    }

    createBadge(badge) {
        this.badgemap[badge.id] = badge;
        console.log(`create badge ${JSON.stringify(badge)}`);
        $('#badges').append(`<svg class="badge" id="badge${badge.id}"></svg>`);
        this.render(badge.id);
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