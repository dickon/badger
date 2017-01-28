/// <reference path="typings/globals/jquery/index.d.ts" />

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
        // TODO: allow user to choose
        return;
    }
    let config = configs[0].name;
    $.getJSON(`/api/configs/${config}/badges`, badges=> {
        for (let badge of badges) {
            $('#badges').append(`<div class="badge">${badge.first} ${badge.last}</div>`);
        }
        $.getJSON(`/api/configs/${config}/images`, images=> {
            for (let image of images) {
                 $('#spareImages').append(`<div class="imagefile"><div class="filename">${image}</div> <IMG class="thumbnail" src="/api/configs/${config}/image/${image}"/></div>`);
             }        
        }); 
    });
});