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
    lowPostfix: string;

    constructor(config:Config, low=false) {
        this.config = config;
        this.badgemap = {};
        this.lowPostfix = low ? "?low=1":"";
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
        // console.log(`selected ${badgeId}`);       
        // let badge = this.badgemap[badgeId];
        // let oldImage=Snap(`#badgeImageMain`);
        // if (oldImage != null) oldImage.remove();
        // const paper = Snap(`#editorImage`);
        // $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size`, imageSize => {
        //     let dimensions = paper.getBBox();
        //     console.log(`dimensions ${JSON.stringify(dimensions)}`);
            
        //     badge.imageWidth = imageSize.width;
        //     badge.imageHeight = imageSize.height;
        //     const aspectRatio = badge.imageHeight / badge.imageWidth;
        //     let width = Math.min(dimensions.width, dimensions.height / aspectRatio);
        //     if (width == 0) width = 512;
        //     paper.image(`/api/configs/${this.config.name}/image/${badge.filename}${this.lowPostfix}`, 0, 0, width,  aspectRatio*width).transform(`r${badge.rotation}`).attr({id:'badgeImageMain'});
        // });
    }

    createBadge(badgeKey) {
        let elems = badgeKey.split(' ');
        let id = +elems[2];
        let badge = this.badges[id];
        console.log(`create ${badgeKey}`);
        this.badgemap[badge.id] = badge;
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size${this.lowPostfix}`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            $('#badges').append(`<span class="badgeContainer" id="badge${badge.id}" onclick="editor.select(${badge.id})"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></span>`);
            let paper = Snap(`#badgeSvg${badge.id}`);
            paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
            for (var name of ['first', 'last', 'title']) {
                let text = paper.text(this.config.badgeWidth*0.245, this.config.badgeHeight*(name=='first' ? 0.55 : (name == 'title'? 0.91 : 0.75 )), 
                    capitalise(badge[name])).attr({'font-family': 'Arial', 'text-anchor':'middle', fill:(name == 'title' ? '#c0c40b':'white'), stroke:'none', 'font-size':'10pt' });
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
        const imTop = 0.025;
        const imBottom = 0.975;
        const imXCentre = this.config.badgeWidth * (imLeft + imRight)/2;
        const imYCentre = this.config.badgeHeight * (imTop + imBottom)/2
        const portWidth = (imRight - imLeft) * this.config.badgeWidth;
        const portHeight = (imBottom - imTop) * this.config.badgeHeight;
        const portRatio = portHeight / portWidth;
        const imHeight = imBottom - imTop

        if (badge.left == null) badge.left = 0;
        if (badge.right == null) badge.right = 0;
        if (badge.top == null) badge.top = 0;
        if (badge.bottom == null) badge.bottom = 0;
        const originalAspectRatio = badge.imageHeight / badge.imageWidth;
        const rotatedImageWidth = badge.rotation == 0 ? badge.imageWidth : badge.imageHeight;
        const rotatedImageHeight = badge.rotation == 0 ? badge.imageHeight : badge.imageWidth;
        const rotatedAspectRatio = rotatedImageHeight / rotatedImageWidth;
        const clipBoxRatio = (1-badge.top-badge.bottom) / (1-badge.right-badge.left);
        const clippedRatio = rotatedAspectRatio * clipBoxRatio;

        const hfit = clippedRatio < portRatio;

        const visibleWidth = hfit ?  portWidth                : portHeight / clippedRatio;
        const visibleHeight = hfit ?  portWidth*clippedRatio  : portHeight;

        const clippedFullWidth = ( badge.rotation == 0 ? visibleWidth * (1 + badge.left + badge.right) : visibleHeight * (1 + badge.top + badge.bottom));
        const clippedFullHeight = originalAspectRatio*clippedFullWidth;

        const scale = (badge.rotation == 0) ? (clippedFullHeight < visibleHeight ? visibleHeight/clippedFullHeight : 1):
                                             (clippedFullWidth < visibleWidth ? visibleWidth / clippedFullHeight : 1);
        const fullWidth = scale * clippedFullWidth;
        const fullHeight = (fullWidth * originalAspectRatio);

        const imagePositionLeft = imXCentre-fullWidth*(badge.left - badge.right + 1)/2;  
        const imagePositionTop = imYCentre-fullHeight*(badge.top - badge.bottom +1)/2;
        //paper.rect(imLeft*this.config.badgeWidth, imTop*this.config.badgeHeight, (imRight-imLeft)*this.config.badgeWidth, (imBottom-imTop)*this.config.badgeHeight).attr({fill:'red'});
        let im = paper.image(`/api/configs/${this.config.name}/image/${badge.filename}${this.lowPostfix}`, 
                 imagePositionLeft, imagePositionTop, fullWidth, fullHeight);
        if (badge.brightness == null) badge.brightness = 1.0;
        if (badge.brightness != 1)
             im.attr({filter: paper.filter(Snap.filter.brightness(badge.brightness/2))});
        im.transform(`r${badge.rotation}`);
        let cliprect = paper.rect(imXCentre - visibleWidth/2, imYCentre - visibleHeight/2, 
                                visibleWidth, visibleHeight).attr({fill:'#fff'});
        let group = paper.group(im);
        group.attr({mask:cliprect});
        let g2 = paper.group(group).attr({id:`badgeImage${badgeId}`});
        g2.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.9))});
        if (false)  {
            paper.circle(imXCentre, imYCentre, 2).attr({fill:'red'});
            paper.text(3,3, `${hfit?'hfit':'vfit'} ${badge.rotation==0?"straight":"rotated"} visible ${Math.floor(visibleWidth)}x${Math.floor(visibleHeight)} port ${Math.floor(portWidth)}x${Math.floor(portHeight)} full ${Math.floor(fullWidth)}x${Math.floor(fullHeight)} (scale ${scale})`).attr({'font-size':'2pt', fill:'white'});
            paper.text(3,6, `original aspect ratio ${originalAspectRatio.toPrecision(3)} rotated aspect ratio ${rotatedAspectRatio.toPrecision(3)} clipBoxRatio ${clipBoxRatio.toPrecision(3)} clipped ratio ${clippedRatio.toPrecision(3)} port ratio ${portRatio.toPrecision(3)} full ratio ${(fullHeight/fullWidth).toPrecision(3)} visible ratio ${(visibleHeight/visibleWidth).toPrecision(3)}`).attr({'font-size':'1.1pt', fill:'white'});
        }
    }


    loadBadges(spare=true) {
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
                if (spare) {
                    $.getJSON(`/api/configs/${this.config.name}/images`, images=> 
                        images.map(image=> {
                            if (Object.keys(this.badges).filter(b => this.badges[b].filename == image).length == 0)
                                $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div>`+
                                                        `<IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" `+
                                                        `class="thumbnail" src="/api/configs/${this.config.name}/image/${image}${this.lowPostfix}"/></div>`);
                        }));
                }
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
            height: 20,
        }]
    }]
};

function compose() {
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

            editor = new Editor(configs[0], true); 
            editor.loadBadges(true);
        });
    }, 100);
}

function view() {       
     $.getJSON('/api/configs', configs=> {
         editor = new Editor(configs[0], false); 
         editor.loadBadges(false);
     });
}