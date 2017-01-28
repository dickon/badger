/// <reference path="jquery.d.ts" />

$.getJSON('/api/configs', configs=> {
    if (configs.length != 1) {
        console.log("did not get exactly one config");
    } else {
        let config = configs[0].name;
        console.log(`using config ${config}`);
    }
});
