interface XMLHttpRequest {}
var GoldenLayout: any;
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
    badges: any;
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

    select(badgeId) {
        console.log(`selected ${badgeId}`);       
        let badge = this.badgemap[badgeId];
        let oldImage=Snap(`#badgeImageMain`);
        if (oldImage != null) oldImage.remove();
        const paper = Snap(`#editorImage`);
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size`, imageSize => {
            let dimensions = paper.getBBox();
            console.log(`dimensions ${JSON.stringify(dimensions)}`);
            
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            const aspectRatio = badge.imageHeight / badge.imageWidth;
            let width = Math.min(dimensions.width, dimensions.height / aspectRatio);
            if (width == 0) width = 512;
            paper.image(`/api/configs/${this.config.name}/image/${badge.filename}`, 0, 0, width,  aspectRatio*width).transform(`r${badge.rotation}`).attr({id:'badgeImageMain'});
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
            $('#badges').append(`<span class="badgeContainer" id="badge${badge.id}" onclick="editor.select(${badge.id})"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></span>`);
            let paper = Snap(`#badgeSvg${badge.id}`);
            paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
            for (var name of ['first', 'last', 'title']) {
                let text = paper.text(this.config.badgeWidth*0.21, this.config.badgeHeight*(name=='first' ? 0.55 : (name == 'title'? 0.91 : 0.75 )), capitalise(badge[name])).attr({'font-family': name == 'first' ? 'Arial black':'Arial', 'text-anchor':'middle', fill:(name == 'title' ? '#c0c40b':'white'), stroke:'none', 'font-size':'10pt' });
                let bbox = text.getBBox();
                //text.transform(`S(${Math.min(this.config.badgeHeight*(name == 'first' ? 0.35:0.2)/bbox.height, this.config.badgeWidth*0.35/bbox.width)})`);
                text.attr({'style.font-size': `${Math.min(this.config.badgeHeight*(name == 'first' ? 0.35:0.2)*10/bbox.height, 
                                                         this.config.badgeWidth*0.35*10/bbox.width)}pt`});
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
        const imageWidthAlpha = this.config.badgeWidth*(1-imLeft)*(1+badge.left+badge.right);
        const imageWidthBeta = this.config.badgeHeight*(imHeight-imTop)*(1+badge.top+badge.bottom)/aspectRatio;
        const imageWidth = Math.min(imageWidthAlpha, imageWidthBeta);
        const imageHeight = imageWidth * aspectRatio;
        const haveWidth = (1 - badge.left - badge.right)*imageWidth;
        var ox = (imLeft - badge.left*(imWidth))*this.config.badgeWidth;
        const shortage = Math.max(0,imWidth*this.config.badgeWidth - haveWidth);
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
                this.select(+(badgeseq[0].split(' ')[2]));
                $.getJSON(`/api/configs/${this.config.name}/images`, images=> 
                    images.map(image=> {
                        if (Object.keys(this.badges).filter(b => this.badges[b].filename == image).length == 0)
                            $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div>`+
                                                     `<IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" `+
                                                     `class="thumbnail" src="/api/configs/${this.config.name}/image/${image}"/></div>`);
                    }));
            });
        });
    }
}

let editor: Editor = null;

let config = {
    content: [{
        type: 'column',
        content:[
        //     {
        //     type: 'component',
        //     componentName: 'editor',
        // },
        {
            type: 'component',
            componentName: 'badges',
        },{
            type: 'component',
            componentName: 'spare',
        }]
    }]
};
let myLayout = new GoldenLayout( config );
myLayout.registerComponent( 'editor', function( c, s ){
    c.getElement().html( `<div id="editor" class="scroller"><span id="svgContainer" width="60%" height="100%"><svg id="editorImage" width="100%" height="100%"></svg><span><span><form><input type="text"></input></form></span></div>` );
});
myLayout.registerComponent( 'badges', function( container, componentState ){
    container.getElement().html( '<div id="badges" class="scroller"></div>' );
});
myLayout.registerComponent( 'spare', function( container, componentState ){
    container.getElement().html( '<div id="spareImages" class="scroller"></div>' );
});
myLayout.init();
setTimeout(()=> {
    $.getJSON('/api/configs', configs=> {
        if (configs.length != 1) {
            console.log("did not get exactly one config");
            // TODO: allow user to choose
            return;
        }    

        editor = new Editor(configs[0]); 
        editor.loadBadges();
    });
}, 100);

