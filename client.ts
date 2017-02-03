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
    left, right, top, bottom: number;
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

    drop(ev, index:number) {
        ev.preventDefault();
        let badge = this.badges[index];
        let data = ev.dataTransfer.getData("text");
        console.log(`dropping ${data} on ${index} (${badge.first} ${badge.last}) for ${this.config.name}`);
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

    createBadge(badgeKey) {
        let elems = badgeKey.split(' ');
        let id = +elems[2];
        let badge = this.badges[id];
        this.badgemap[badge.id] = badge;
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            console.log(`image size ${imageSize.width} ${imageSize.height} config ${JSON.stringify(this.config)}`);
            $('#badges').append(`<div class="badgeContainer" id="badge${badge.id}"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></div>`);
            let paper = Snap(`#badgeSvg${badge.id}`);
            paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
            for (var name of ['first', 'last', 'title']) {
                let text = paper.text(this.config.badgeWidth*0.21, this.config.badgeHeight*(name=='first' ? 0.55 : (name == 'title'? 0.91 : 0.75 )), capitalise(badge[name])).attr({'font-family': name == 'first' ? 'Arial black':'Arial', 'text-anchor':'middle', fill:(name == 'title' ? '#c0c40b':'white'), stroke:'none', 'font-size':'10pt' });
                let bbox = text.getBBox();
                text.transform(`S(${Math.min(this.config.badgeHeight*(name == 'first' ? 0.35:0.2)/bbox.height, this.config.badgeWidth*0.40/bbox.width)})`);
                text.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.7))});
            }           
            this.render(badge.id);
        });
    }

    render(badgeId) {
        let badge = this.badgemap[badgeId];
        let oldImage=Snap(`#badgeImage${badgeId}`);
        if (oldImage != null) oldImage.remove();
        let paper = Snap(`#badgeSvg${badgeId}`);
        const imLeft = 0.45;
        const imRight = 0.98;
        const imTop = 0.05;
        const imWidth = imRight - imLeft;
        const imHeight = 1 - imTop*2;
        if (badge.left == null) badge.left = 0;
        if (badge.right == null) badge.right = 0;
        if (badge.top == null) badge.top = 0;
        if (badge.bottom == null) badge.bottom = 0;
        const aspectRatio = badge.imageHeight / badge.imageWidth;
        console.log(`badge ${JSON.stringify(badge)} aspect ratio ${aspectRatio}`);
        const imageWidthAlpha = this.config.badgeWidth*(1-imLeft)*(1+badge.left+badge.right);
        const imageWidthBeta = this.config.badgeHeight*(imHeight-imTop)*(1+badge.top+badge.bottom)/aspectRatio;
        const imageWidth = Math.min(imageWidthAlpha, imageWidthBeta);
        console.log(`image width ${imageWidthAlpha} ${imageWidthBeta} ${this.config.badgeHeight} ${imHeight-imTop} ${1+badge.top+badge.bottom} ${aspectRatio} chose ${imageWidth}`);
        const imageHeight = imageWidth * aspectRatio;
        const haveWidth = (1 - badge.left - badge.right)*imageWidth;
        var ox = (imLeft - badge.left*(imWidth))*this.config.badgeWidth;
        const shortage = Math.max(0,imWidth*this.config.badgeWidth - haveWidth);
        console.log(`haveWidth ${haveWidth} wantWidth ${imWidth*this.config.badgeWidth} shortage ${shortage}`);
        let im = paper.image(`/api/configs/${this.config.name}/image/${badge.filename}`, ox+(shortage/2),  (this.config.badgeHeight - imageHeight)/2 - badge.top*this.config.badgeHeight, 
                 imageWidth, imageHeight);
        if (badge.brightness == null) badge.brightness = 1.0;
        if (badge.brightness != 1)
            im.attr({filter: paper.filter(Snap.filter.brightness(badge.brightness))});
        im.transform(`r${badge.rotation}`);
        let cliprect = paper.rect(this.config.badgeWidth*imLeft, this.config.badgeHeight * imTop, this.config.badgeWidth*imWidth, this.config.badgeHeight*imHeight).attr({fill:'#fff'});
        let group = paper.group(im);
        group.attr({mask:cliprect});
        let g2 = paper.group(group).attr({id:`badgeImage${badgeId}`});
        g2.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.7))});

        /*
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
        */
  
        
    }


    loadBadges() {
        $.getJSON(`/api/configs/${this.config.name}/background/size`, badgeSize=> {
            $.getJSON(`/api/configs/${this.config.name}/badges`, (badges: any[])=> {
                this.badges = {};
                let badgeseq = [];
                badges.map(x=>badgeseq.push(x.first+' '+x.last+' '+x.id));
                badges.map(x=> {
                    this.badges[x.id] = x;
                });
                badgeseq.sort();
                badgeseq.map(x=>this.createBadge(x));
                $.getJSON(`/api/configs/${this.config.name}/images`, images=> 
                    images.map(image=> {
                        if (Object.values(this.badges).filter(b => b.filename == image).length == 0)
                            $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div>`+
                                                     `<IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" `+
                                                     `class="thumbnail" src="/api/configs/${this.config.name}/image/${image}"/></div>`);
                    }));
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