/// <reference path="jquery.d.ts" />

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
        // TODO: allow user to choose
        return;
    }
    let config = configs[0].name;
    $('body').append(`using ${config}`);
    $.getJSON(`/api/config/${config}/images`, images=> {
        for (let image of images) {
            $('body').append(`<div class="imagefile"><div class="filename">${image}</div> <IMG class="thumbnail" src="/api/config/${config}/image/${image}"/></div>`);
        }        
    } 
});