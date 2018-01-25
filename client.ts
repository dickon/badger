interface XML1HttpRequest {}
var GoldenLayout: any;
var io: any;
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
    brightness: number;

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

interface Box {
    origin: Vector;
    size: Vector;
}

class Vector {
    x: number;
    y: number;

    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
    }

    multiply (beta: Vector) {
        return new Vector(this.x * beta.x, this.y * beta.y);
    }
}

function vectorAdd (alpha:Vector, beta:Vector): Vector{
    return new Vector(alpha.x+beta.x, alpha.y+beta.y);
}

function boxScale(box:Box, scale:Vector):Box {
    return {origin: box.origin.multiply(scale), size: box.size.multiply(scale)};
}

function boxCentre(box:Box):Vector {
    return new Vector(box.origin.x+box.size.x/2, box.origin.y+box.size.y/2);
}

function ratio(vec: Vector):number {
    return vec.y/vec.x;
}

function drawBox(paper: any, box: Box) {
    return paper.rect(box.origin.x, box.origin.y, box.size.x, box.size.y);
}

class Editor {
    badges: any;
    badgemap: any;
    config: Config;
    lowPostfix: string;
    spareImages: string[];
    grid: boolean;
    limit: number;
    current: Badge;

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
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert("Status: " + textStatus); 
                alert("Error: " + errorThrown); 
            }   
        });
    }

    select(badgeId) {
        console.log(`selected ${badgeId}`);       
        let badge = this.badgemap[badgeId];
        console.log(`selected ${badge.first} ${badge.last}`);
        let handle = this.getHandle(badge);
        $('.badgeContainer').removeClass('highlight');
        $(`#${handle}`).addClass('highlight');
        $(`#controlbadge`).text(`${badge.first} ${badge.last}`);
        for (let dim of ['left', 'right', 'top', 'bottom', 'brightness'])
            $(`#control${dim}`).val(badge[dim]);
        this.current = badge;
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
        console.log(`badge elements ${elems}`);
        let id = +elems.slice(-1)[0];
        let badge = this.badges[id];
        console.log(`badge ${JSON.stringify(badge)} grid ${this.grid} limit ${this.limit}`);
        if (Object.keys(this.badgemap).length >= this.limit && this.limit!=-1) return;
        if (badge.printed === 1  && !this.grid) return;
        this.badgemap[badge.id] = badge;
        console.log(`appending`);
        if (badge.filename != null) {
            // we should retrieve the image size asynchronously from the server if there is an image
            this.sizeBadge(badge);
        } else { 
            // otherwise let's skip directly to rendering the badge
            this.render(badge);
        }
    }

    // called to display a badge that has an image
    sizeBadge(badge) {
        $.getJSON(`/api/configs/${this.config.name}/image/${badge.filename}/size${this.lowPostfix}`, imageSize => {
            badge.imageWidth = imageSize.width;
            badge.imageHeight = imageSize.height;
            this.render(badge);
        });
    }

    drawSpareImage(image) {
        $('#spareImages').append(`<div  class="imagefile"><div class="filename">${image}</div>`+
        `<IMG draggable="true"  ondragstart="imageDrag(event, '${image}')" `+
        `class="thumbnail" src="/api/configs/${this.config.name}/image/${image}${this.lowPostfix}"/></div>`)
    } 

    getHandle(badge:Badge):string {
        return `badge${badge.first}_${badge.last}_${badge.id}`;
    }

    render(badge:Badge) {
        for (let field of ['left', 'right', 'top', 'bottom']) {
            if (badge[field] == null) badge[field] = 0;
            badge[field] = +badge[field];
        }
        console.log(`rendering ${badge.id} ${badge.first} ${badge.last}`);
        console.log(`badge ${JSON.stringify(badge)}`);
        let handle = this.getHandle(badge);
        let oldBadge = $(`#${handle}`).first();
        if (oldBadge) {
            console.log(`found old bage element element`);
            oldBadge.remove();
        } else {
            console.log(`no badge found in DOM with id ${oldBadge}`);
        }
        $('#badges').append(`<div class="badgeContainer" id="${handle}" onclick="editor.select(${badge.id})"><svg class="badge" id="badgeSvg${badge.id}" width="${this.config.badgeWidth}mm" height="${this.config.badgeHeight}mm" viewbox="0 0 ${this.config.badgeWidth} ${this.config.badgeHeight}" ondragover="allowDrop(event)" ondrop="editor.drop(event, ${badge.id})"> </svg></span>`);


        let paper = Snap(`#badgeSvg${badge.id}`);
        if (!this.grid) paper.image(`/api/configs/${this.config.name}/background`, 0,0, this.config.badgeWidth, this.config.badgeHeight);
        const badgeSize = new Vector(this.config.badgeWidth, this.config.badgeHeight);
        
        const imageLimitsFraction: Box = {origin: new Vector(0.05, 0.025), size:new Vector(0.5, 0.95)}; // image limits as fractons
        const imageLimitsBadge = boxScale(imageLimitsFraction, badgeSize); // image limits in badge coordinates
        const imageCentreBadge = boxCentre(imageLimitsBadge); // where the image centre should go

        const clipBoxFraction:Box = {origin:new Vector(badge.left, badge.top), size: new Vector(1-badge.left-badge.right, 1-badge.top-badge.bottom)}; // image cllpping as fractions
        const imageSize = new Vector(badge.rotation == 0 ? badge.imageWidth : badge.imageHeight, badge.rotation == 0 ? badge.imageHeight : badge.imageWidth); // rotated original image size
        const clipBoxImage = boxScale(clipBoxFraction, imageSize); // clip box in the coordinate space of the original image

        let clipSizeChange: Vector = null;
        let gapBadge = 0;
        let imageTaller = ratio(clipBoxImage.size) > ratio(imageLimitsBadge.size);
        let major = imageTaller ? 'x' : 'y';
        let minor = imageTaller ? 'y' : 'x';
        let clipmode = imageTaller ? 'hgaps':'vgaps';
        let clipOffset = new Vector(0,0);
        if (imageTaller) {
            // image is taller than clipbox; leave gaps at the left and right edge
            let clipWidthBadge = imageLimitsBadge.size.y/ratio(clipBoxImage.size);
            gapBadge = (imageLimitsBadge.size.x - clipWidthBadge)/2;
            clipOffset = new Vector(gapBadge, 0);
            clipSizeChange = new Vector(-gapBadge*2, 0);
        } else {
            // image is shorter than clipbox; leave gaps at the top and bottom edge
            let clipHeightBadge = imageLimitsBadge.size.x*ratio(clipBoxImage.size);
            gapBadge = (imageLimitsBadge.size.y - clipHeightBadge)/2;
            clipOffset = new Vector(0, gapBadge);
            clipSizeChange = new Vector(0, -gapBadge*2);
        }
        let clipBoxBadge: Box = {origin:vectorAdd(imageLimitsBadge.origin, clipOffset), size:vectorAdd(imageLimitsBadge.size, clipSizeChange)};

        // we now have clipBoxBadge, in badge coordinates, and clipBoxFraction in [0,1] of the original image
        // Let's work out the full unclipped image size
        let imageSizeBadge = new Vector(clipBoxBadge.size.x/clipBoxFraction.size.x, clipBoxBadge.size.y/clipBoxFraction.size.y);
        // and from that derive the origin of the image in badge space
        let imageOriginBadge = new Vector(clipBoxBadge.origin.x - imageSizeBadge.x * clipBoxFraction.origin.x,
                                          clipBoxBadge.origin.y - imageSizeBadge.y * clipBoxFraction.origin.y);
        let imageBoxBadge = {origin:imageOriginBadge, size:imageSizeBadge};
        if (DEBUG) drawBox(paper, imageLimitsBadge).attr({fill:'red'});
        if (badge.filename != null) {
            let im = paper.image(`/api/configs/${this.config.name}/image/${badge.filename}${this.lowPostfix}`, 
                                imageBoxBadge.origin.x, imageBoxBadge.origin.y, imageBoxBadge.size.x, imageBoxBadge.size.y);
            if (badge.brightness == null) badge.brightness = 1.0;
            if (badge.brightness != 1)
                im.attr({filter: paper.filter(Snap.filter.brightness(badge.brightness))});
            im.transform(`r${badge.rotation}`);
            let cliprect = drawBox(paper, clipBoxBadge).attr({fill:'#fff'});
            let group = paper.group(im);
            group.attr({mask:cliprect});
            let g2 = paper.group(group).attr({id:`badgeImage${badge.id}`});
            g2.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.9))});
            
        }
        
        //if ($.inArray(image.filename, this.spareImages) != -1) return;
        //if (image.hidden == 1) return;
        //this.spareImages.push(image.filename);
        //let index = this.spareImages.length;
        //$('#spareImages').append(`<div  class="imagefile" id="imagefile${index}"><div class="imagecaption"><span class="filename">${image.filename}</span><span class="close"><button class="close" onclick="editor.closeSpareImage('${image.filename}',${index})").remove();">X</button></span></div>`+
        //                        `<IMG draggable="true"  ondragstart="imageDrag(event, '${image.filename}')" `+
        //                        `class="thumbnail" src="/api/configs/${this.config.name}/image/${image.filename}${this.lowPostfix}"/></div>`);

        for (var name of ['first', 'last', 'title']) {
            let fill = this.grid ? 'black': ((name == 'title' ? '#c0c40b':'white'));
            let text = paper.text(this.config.badgeWidth*0.775, this.config.badgeHeight*(name=='first' ? 0.28 : (name == 'title'? 0.61 : 0.47 )), 
                capitalise(badge[name])).attr({'font-family': 'Arial', 'text-anchor':'middle', fill:fill, stroke:'none', 'font-size':'10pt' });
            let bbox = text.getBBox();
            text.attr({'style.font-size': `${Math.min(this.config.badgeHeight*(name == 'first' ? 0.35:0.2)*10/bbox.height, 
                                                     this.config.badgeWidth*0.2*10/bbox.width)}pt`});
            if (!this.grid) text.attr({filter: paper.filter(Snap.filter.shadow(0.5, 0.5, 0.2, "black", 0.7))});
        }           

        // $(selector) does have sort but the JQuery<HTMLElement> doesn't
        // TODO: raise a bug against the JQuery @types declaration?
        ($(".badgeContainer") as any).sort((a, b) => a.id.toLowerCase() > b.id.toLowerCase() ? 1: -1).detach().appendTo("#badges");  
        
        if (DEBUG)  {
            drawBox(paper, clipBoxBadge).attr({stroke:'blue', 'stroke-width': '0.3px', fill:'none'});;
            drawBox(paper, imageBoxBadge).attr({stroke:'black', 'stroke-width': '0.3px', fill:'none'});;

            paper.circle(imageCentreBadge.x, imageCentreBadge.y, 1).attr({fill:'red'});
            paper.text(3,3, `${clipmode} gap=${gapBadge} ${badge.rotation==0?"straight":"rotated"} clipBoxFraction =${JSON.stringify(clipBoxFraction)}`).attr({'font-size':'1pt', fill:'white'});
            paper.text(3,6, `image limits box = ${JSON.stringify(imageLimitsBadge)}`).attr({'font-size':'1pt', fill:'yellow'});
            paper.text(3,9, `clip box = ${JSON.stringify(clipBoxBadge)}`).attr({'font-size':'1pt', fill:'yellow'});
            paper.text(3,12, `image box = ${JSON.stringify(imageBoxBadge)}`).attr({'font-size':'1pt', fill:'yellow'});
            paper.text(3,15, `Xscale = ${1/clipBoxFraction.size.x} Yscale = ${1/clipBoxFraction.size.y}`).attr({'font-size':'1pt', fill:'yellow'});

        }
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


    // significnt entry point called from all 3 current view modes;
    // downloads all the badge data.
    loadBadges(spare=true) {
        $.getJSON(`/api/configs/${this.config.name}/background/size`, badgeSize=> {
            console.log(`badge background size ${JSON.stringify(badgeSize)}`)
            $.getJSON(`/api/configs/${this.config.name}/badges`, (badges: any[])=> {
                console.log(`got ${badges.length} badges`)
                badges.map(x=> console.log(`badge ${JSON.stringify(x)}`));
                this.badges = {};
                let badgeseq = [];
                badges.filter(x=>x.printed == 0 || x.printed === null).map(x=>badgeseq.push(x.first+' '+x.last+' '+x.id));
                console.log(`badgeseq = ${badgeseq.length}`);
                badges.map(x=> {
                    this.badges[x.id] = x;
                });
                badgeseq.sort();
                badgeseq.map(x=>this.createBadge(x));
                if (badgeseq.length != 0) this.select(+(badgeseq[0].split(' ')[2]));
                if (spare) {
                    $.getJSON(`/api/configs/${this.config.name}/images`, images=> {
                        console.log(`got ${images.length} images`);
                        images.map(image=> {
                            console.log(`got image ${image}`);
                            if (Object.keys(this.badges).filter(b => this.badges[b].filename == image).length == 0)
                                this.drawSpareImage(image);
                        });
                    });
                }
            }).fail(x=>console.log(' badge error '+JSON.stringify(x)))
        }).fail(x=>console.log(' get background size error '+x))
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
        },
        {
            type: 'component',
            componentName: 'controls',
            height: 40,
        },
        {
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
        console.log('creating editor');
        c.getElement().html( `<div id="editor" class="scroller"><span id="svgContainer" width="60%" height="100%"><svg id="editorImage" width="100%" height="100%"></svg><span><span><form><input type="text"></input></form></span></div>` );
    });
    myLayout.registerComponent( 'badges', function( container, componentState ){
        container.getElement().html( '<div id="badges" class="scroller"></div>' );
    });
    myLayout.registerComponent( 'controls', function( container, componentState ){
        console.log('creating controls');
        container.getElement().html( `<div id="controls" class="scroller">
        <span>Currently selected badge: <span id="controlbadge">none</span></span>
        <span>Left: <input type="range" id="controlleft" min="0"  max="1" step="0.001" value="0" </input> </span>
        <span>Right: <input type="range" id="controlright" min="0"  max="1" step="0.001" value="0" </input> </span>
        <span>Top: <input type="range" id="conoorltop" min="0"  max="1" step="0.001" value="0" </input> </span>
        <span>Bottom: <input type="range" id="controlbottom" min="0"  max="1" step="0.001" value="0"> </input> </span>
        <span>Brightness: <input type="range" id="controlbrightness" min="0"  max="10" step="0.001" value="0"> </input> </span>
    </div>` );
        
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
            $('input[type=range]').on('input', function () {
                let badge = editor.current;
                let control = $(this);
                let controlid = $(this).attr('id').substr('control'.length);
                let v = control.val();
                badge[controlid] = v;
                let update = {};
                update[controlid] = v;
                let url = `/api/configs/${editor.config.name}/image/${badge.filename}/${controlid}`;
                console.log(`POST to ${url}`);
                // we fire off async ajax requests and don't wait for them
                // since this is a slider generating lots of events there's no guarantee that the last database update
                // is the one that ends up in the database, so we optimistically for now try this approach and see if it is close enough
                $.ajax({url: url,
                        type: 'POST',
                        success: (response) => console.log(`server acknowledge response ${response} when stroing ${controlid} ${control.val()} for ${badge.filename}`),
                        data: update,
                        dataType: 'json'
                });
                editor.render(badge);
                let handle = editor.getHandle(badge);
                $(`#${handle}`).get(0).scrollIntoView();
            });
            socket.on('newImage', (image:Image) => editor.drawSpareImage(image));
        });
    }, 100);
}


function view() {       
     $.getJSON('/api/configs', configs=> {
         editor = new Editor(choose(configs), false, false, 8); 
         editor.loadBadges(false);
     });
}

function makeIndex() {
    console.log("make index starting");
    $.getJSON('/api/configs', configs=> {
        console.log(`retrieved ${configs.length} configs`);
        $('body').append($('<h1>').append('Badger'));
        configs.map(x=> {
            $('body').append($('<h2>').append(x.name));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/compose`).append('Compose'));
            $('body').append($('<span>').append(' or '));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/view`).append('View'));            
            $('body').append($('<span>').append(' or '));
            $('body').append($('<a>').attr('href', `/configs/${x.name}/grid`).append('Grid'));            
        });
        if (configs.length == 0) 
            $('body').append("No configs set up! please add at least one row to the config table. TODO: add a form to create configs")
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