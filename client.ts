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

interface Config {
    name: string;
    badgeWidth: number;
    badgeHeight: number;
}

interface HTMLElement {
    getBBox():any;
}

class Editor {
    badges: Badge[];
    badgemap: any;
    config: Config;

    constructor(config:Config) {
        this.config = config;
        this.badgemap = {};
    }

    drop(ev, index:number, first:string, last:string, config:string) {
        ev.preventDefault();
        let data = ev.dataTransfer.getData("text");
        console.log(`dropping ${data} on ${index} (${first} ${last}) for ${this.config.name}`);
        $.ajax({
            url: `/api/configs/${this.config.name}/badges/${index}/image/${data}`,
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
        let svg = `<image width="${this.config.badgeWidth}" height="${this.config.badgeHeight}" visibility="visibile" href="/api/configs/${this.config.name}/background"></image>`;
        if (badge.filename) {

            const imageMiddleX = 62;
            const imageMiddleY = 22;
            const imageSize = 40; 
            let x= badge.x == null ? 0 : badge.x;
            let y = badge.y == null ? 0 : badge.y;
            let width = badge.width == null ? 1 : badge.width;
            let height = badge.height == null ? 1 : badge.height; 
            const badgeDom = Math.max(badge.imageWidth, badge.imageHeight);
            const scaleDown = 640 / badgeDom;
            const badgeNormalisationTransform = `scale(${scaleDown})`;
            const transform = badge.rotation == -90? `translate(52 2) scale(${scaleDown}) rotate(-90 150 150)` : 
                                                    `translate(42 2) scale(${scaleDown}) `;
            svg += `<g transform="${transform}" >`; // clip-path="url('#iclip')"
            //svg += `<defs> <clipPath id="iclip"> <rect x="${x}" y="${y}" width="${width}" height="${height}"></rect></clipPath></defs>`;
            svg += `<rect x=-0.5 y=-0.5 width=1 height=1 style="fill: yellow"/>`;
            svg += `<g draggable="true" ondragstart="imageDrag(event, '${badge.filename}')">`;
            svg += `<image class="thumbnail" href="/api/configs/${this.config.name}/image/${badge.filename}"> </image>`;
            svg += `</g>`;
            svg += `</g>`;
            console.log(svg);
        }
        svg += `<text id="first${badgeId}" x=21 y=28 style="font-size: 1pt; font-family: 'Arial black'; text-anchor: middle; fill:white; stroke:none">${capitalise(badge.first)}</text>`;
        svg += `<text id="last${badgeId}" x=21 y=38 style="font-size: 1pt; font-family: 'Arial'; text-anchor: middle; fill:white; stroke:none">${capitalise(badge.last)}</text>`;
        $(`#badge${badgeId}`).html(`<svg class="badge" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id}, '${badge.first}', '${badge.last}')">${badge.first} ${badge.last} ${svg}`);
        for (let name of ['first', 'last']) {
            const elem = $(`#${name}${badgeId}`)[0];
            const bbox = elem.getBBox();
            elem.style['font-size'] = `${Math.min(14/bbox.height, 32/bbox.width)}pt`;
        }
    }

    createBadge(badge) {
        this.badgemap[badge.id] = badge;
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            console.log(`image size ${imageSize.width} ${imageSize.height} config ${JSON.stringify(this.config)}`);
            $('#badges').append(`<div class="badgeContainer" id="badge${badge.id}"></div>`);
            this.render(badge.id);
        });
    }

    loadBadges() {
        $.getJSON(`/api/configs/${this.config.name}/background/size`, badgeSize=> {
            $.getJSON(`/api/configs/${this.config.name}/badges`, (badges: any[])=> {
                this.badges = badges.sort((a,b)=>a.first.localeCompare(b.first));
                this.badges.map(x=>this.createBadge(x));
                $.getJSON(`/api/configs/${this.config.name}/images`, images=> {
                    images.map(image=>  
                       $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div> <IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" class="thumbnail" src="/api/configs/${this.config.name}/image/${image}"/></div>`));
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

    editor = new Editor(configs[0]); 
    editor.loadBadges();
});