interface XMLHttpRequest {}
var GoldenLayout: any;
let DEBUG = false;
function imageDrag(ev, image) {
    console.log(`dragging ${ev.target.id} ${image}`);
    ev.dataTransfer.setData("text", image);
    
}
function allowDrop(ev) {
    ev.preventDefault();
}
function capitalise(x) {
    if (x.toLowerCase() != x) return x;
    if (x === undefined) return '';
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
    id: number;
    name: string;
    badgeWidth: number;
    badgeHeight: number;
    imageLeft: number;
    imageRight: number;
    imageTop: number;
    imageBottom: number;
}

interface Image {
    filename: string;
    hidden: number;
    configId: number;
}

interface HTMLElement {
    getBBox():any;
}

function choose(configs:Config[]) {
    let config = window.location.pathname.split('/')[2];
    let matches = configs.filter(x=>x.name == config);
    console.log(`config matches ${JSON.stringify(matches)}`);
    return matches[0];
}

class Editor {
    badges: any;
    badgemap: any;
    config: Config;
    lowPostfix: string;
    spareImages: string[];
    grid: boolean;
    limit: number;

    constructor(config:Config, low=false, grid=false, limit=-1) {
        this.config = config;
        this.badgemap = {};
        this.lowPostfix = low ? "?low=1":"";
        this.spareImages = [];
        this.grid = grid;
        this.limit = limit;
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
                let badge = this.badges[index];
                badge.filename = data;
                this.sizeBadge(badge);
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
        let id = +elems.slice(-1)[0];
        let badge = this.badges[id];
        if (Object.keys(this.badgemap).length >= this.limit || this.limit==-1) return;
        if (badge.printed && !this.grid) return;
        this.badgemap[badge.id] = badge;
         $('#badges').append(`<span class="badgeContainer" id="badge${badge.id}" onclick="editor.select(${badge.id})"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></span>`);
        if (badge.filename == null) {
            this.processBadge(badge);
        } else {
            this.sizeBadge(badge);
        }
    }

    sizeBadge(badge) {
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size${this.lowPostfix}`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            $('#badges').append(`<span class="badgeContainer" id="badge${badge.id}" onclick="editor.select(${badge.id})"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></span>`);
            let paper = Snap(`#badgeSvg${badge.id}`);
            paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
            for (var name of ['first', 'last', 'title']) {
                let text = paper.text(this.config.badgeWidth*0.245, this.config.badgeHeight*(name=='first' ? 0.58 : (name == 'title'? 0.91 : 0.77 )), 
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

    processBadge(badge) {
       
        let paper = Snap(`#badgeSvg${badge.id}`);
        if (!this.grid) paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
        this.render(badge.id);
        for (var name of ['first', 'last', 'title']) {
            let width = this.grid && name == 'last' && this.config.name != 'c2017' ? 0.18 : 0.35;
            let y = name=='first' ? (this.grid ? (this.config.name == 'c2017'?0.75:0.25):0.75) : (name == 'title'? 0.88 : (this.grid?0.86:0.83) );
            let text = paper.text(this.config.badgeWidth*(this.grid?0.5:(this.config.name == 'c2017' ? 0.32 : 0.245)), this.config.badgeHeight*y, 
                capitalise(badge[name])).attr({'font-family': 'Arial', 'text-anchor':'middle', fill:(name == 'title' ? '#c0c40b':'white'), stroke:'none', 'font-size':'10pt' });
            let bbox = text.getBBox();
            text.attr({'style.font-size': `${Math.min(this.config.badgeHeight*(0.1)*10/bbox.height, 
                                                        this.config.badgeWidth*width*10/bbox.width)}pt`});
            text.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.7))});
        }           
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

        for (let field of ['left', 'right', 'top', 'bottom']) {
            if (badge[field] == null) badge[field] = 0;
            badge[field] = +badge[field];
        }

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
        if (DEBUG) paper.rect(imLeft*this.config.badgeWidth, imTop*this.config.badgeHeight, (imRight-imLeft)*this.config.badgeWidth, (imBottom-imTop)*this.config.badgeHeight).attr({fill:'red'});
        let im = paper.image(`/api/configs/${this.config.name}/image/${badge.filename}${this.lowPostfix}`, 
                 imagePositionLeft, imagePositionTop, fullWidth, fullHeight);
        if (badge.brightness == null) badge.brightness = 1.0;
        if (badge.brightness != 1)
             im.attr({filter: paper.filter(Snap.filter.brightness(badge.brightness))});
        im.transform(`r${badge.rotation}`);
        let cliprect = paper.rect(imXCentre - visibleWidth/2, imYCentre - visibleHeight/2, 
                                visibleWidth, visibleHeight).attr({fill:'#fff'});
        let group = paper.group(im);
        group.attr({mask:cliprect});
        let g2 = paper.group(group).attr({id:`badgeImage${badgeId}`});
        g2.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.9))});
        if (DEBUG)  {
            paper.circle(imXCentre, imYCentre, 2).attr({fill:'red'});
            paper.text(3,3, `${hfit?'hfit':'vfit'} ${badge.rotation==0?"straight":"rotated"} visible ${Math.floor(visibleWidth)}x${Math.floor(visibleHeight)} port ${Math.floor(portWidth)}x${Math.floor(portHeight)} full ${Math.floor(fullWidth)}x${Math.floor(fullHeight)} (scale ${scale})`).attr({'font-size':'2pt', fill:'white'});
            paper.text(3,6, `original aspect ratio ${originalAspectRatio.toPrecision(3)} rotated aspect ratio ${rotatedAspectRatio.toPrecision(3)} clipBoxRatio ${clipBoxRatio.toPrecision(3)} clipped ratio ${clippedRatio.toPrecision(3)} port ratio ${portRatio.toPrecision(3)} full ratio ${(fullHeight/fullWidth).toPrecision(3)} visible ratio ${(visibleHeight/visibleWidth).toPrecision(3)}`).attr({'font-size':'1.1pt', fill:'white'});
            paper.text(3,9, `${JSON.stringify(badge)}`).attr({'font-size':'0.4pt', fill:'white'});
        }
        if ($.inArray(image.filename, this.spareImages) != -1) return;
        if (image.hidden == 1) return;
        this.spareImages.push(image.filename);
        let index = this.spareImages.length;
        $('#spareImages').append(`<div  class="imagefile" id="imagefile${index}"><div class="imagecaption"><span class="filename">${image.filename}</span><span class="close"><button class="close" onclick="editor.closeSpareImage('${image.filename}',${index})").remove();">X</button></span></div>`+
                                `<IMG draggable="true"  ondragstart="imageDrag(event, '${image.filename}')" `+
                                `class="thumbnail" src="/api/configs/${this.config.name}/image/${image.filename}${this.lowPostfix}"/></div>`);
    }

    closeSpareImage(filename:string, index: number) {
        $(`#imagefile${index}`).remove();
        $.ajax({
            url: `/api/configs/${this.config.name}/image/${filename}`,
            type:'DELETE',
            success: (result) => {
                console.log(`delete on server ${index} ${filename} ${JSON.stringify(result)}`);
            }
        });
    }


    loadBadges(spare=true) {
        $.getJSON(`/api/configs/${this.config.name}/background/size`, badgeSize=> {
            $.getJSON(`/api/configs/${this.config.name}/badges`, (badges: any[])=> {
                this.badges = {};
                let badgeseq = [];
                badges.filter(x=>x.printed == 0).map(x=>badgeseq.push(x.first+' '+x.last+' '+x.id));
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
            badgeseq.sort();
            badgeseq.map(x=>this.createBadge(x));
            if (badgeseq.length != 0) this.select(+(badgeseq[0].split(' ')[2]));
            if (spare) {
                $.getJSON(`/api/configs/${this.config.name}/images`, images=> 
                    images.map((image:Image)=> {
                        if (Object.keys(this.badges).filter(b => this.badges[b].filename == image).length == 0) {
                            this.drawSpareImage(image);
                        }
                    }));
            }
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
    let socket = io.connect();
    socket.on('message', (data) => { 
        console.log(`socket received ${JSON.stringify(data)}`);
    });
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
            let config = choose(configs);
            editor = new Editor(config, true); 
            socket.emit('usingConfig', config.id);
            editor.loadBadges(true);
            socket.on('newImage', (image:Image) => editor.drawSpareImage(image));
        });
    }, 100);
}


function view() {       
     $.getJSON('/api/configs', configs=> {
         editor = new Editor(choose(configs), false, false, 1); 
         editor.loadBadges(false);
     });
}

function makeIndex() {
    $.getJSON('/api/configs', configs=> {
        $('body').append($('<h1>').append('Badger'));
        configs.map(x=> {
            $('body').append($('<h2>').append(x.name));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/compose`).append('Compose'));
            $('body').append($('<span>').append(' or '));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/view`).append('View'));            
            $('body').append($('<span>').append(' or '));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/grid`).append('Grid'));            
        });
    });
}

function grid() {
    $.getJSON('/api/configs', configs=> {
         let config = choose(configs);
         config.badgeHeight = config.name == 'c2017' ? 24 :30;
         config.badgeWidth = config.name == 'c2017' ? 20 : 28;
         config.imageLeft = 0;
         config.imageRight = 1;
         config.imageTop = 0;
         config.imageBottom = 1;
         
         let editor = new Editor(config, false, true); 
         editor.loadBadges(false);
    });
}