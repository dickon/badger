# badger

A client and server

# the problem with printing

I'm using SnapSVG to generate some badges including background image, titles, a cropped ID photo with brightness control, etc. Code (and it is a bit hacky, needs refactoring and has no test coverage) is at http://github.com/dickon/badger/. I'm happy with the way the badges look on screen, as this screen capture shows:

![Nice screenshot](https://www.flickr.com/photos/81004116@N00/39101359065/in/dateposted-public/)

If I print a page of these badges in Chrome Version 63.0.3239.132 on macOS 10.12.6 then the foreground image and caption text comes out pretty low resolution and looks terrible. Here's a screen capture from a PDF viewer, showing the effect I see when I make an inkjet print:

![Partially blurry PDF capture](https://www.flickr.com/photos/81004116@N00/39967820622/in/dateposted-public/)

 So, last time I needed to print badges I zoomed in and used the ["Full Page Screen Capture" Chrome extension](https://chrome.google.com/webstore/detail/full-page-screen-capture/fdpohaocaechififmbbbbbknoalclacl) and got a nice high resolution image,
 then loaded that up into Affinity Designer to set the size appropriately and printed from there. However, I'm now getting rendering bugs with 
 the full page screen capture extension. 

Firefox Quantum 58.0.1 also produces blurry PDFs, similar to Chrome.


Safari does not render the SVG as I wanted; the brightness filtering responds differently. However the PDF looks similar to the screen version,
and specifically does not have the blurriness.

So far I have no good solution. Options:

1. get my SVG to look good in Safari and try printing from there.
2. use headless chrome and puppeteer to save an image
3. wkhtml2pdf
4. run SnapSVG in nodejs to produce a single SVG, then load the SVG into a vector editor and print from there.

# development
To run server in dev cycle:

    nodemon --watch app.ts --exec 'ts-node'  app.ts

