
from svgwrite import Drawing
from webbrowser import get
from xml.dom import minidom
from os import listdir
import struct
import imghdr

def mm(pos):
    return '%fmm' % (pos)

def get_image_size(fname):
    '''Determine the image type of fhandle and return its size.
    from draco'''
    with open(fname, 'rb') as fhandle:
        head = fhandle.read(24)
        if len(head) != 24:
            return
        if imghdr.what(fname) == 'png':
            check = struct.unpack('>i', head[4:8])[0]
            if check != 0x0d0a1a0a:
                return
            width, height = struct.unpack('>ii', head[16:24])
        elif imghdr.what(fname) == 'gif':
            width, height = struct.unpack('<HH', head[6:10])
        elif imghdr.what(fname) == 'jpeg':
            try:
                fhandle.seek(0) # Read 0xff next
                size = 2
                ftype = 0
                while not 0xc0 <= ftype <= 0xcf:
                    fhandle.seek(size, 1)
                    byte = fhandle.read(1)
                    while ord(byte) == 0xff:
                        byte = fhandle.read(1)
                    ftype = ord(byte)
                    size = struct.unpack('>H', fhandle.read(2))[0] - 2
                # We are at a SOFn block
                fhandle.seek(1, 1)  # Skip `precision' byte.
                height, width = struct.unpack('>HH', fhandle.read(4))
            except Exception: #IGNORE:W0703
                return
        else:
            return
        return width, height

def text(text, xpos, ypos, width=25.0, fill='black'):
    chars = len(text)
    for ch in text:
        if ch in 'il':
            chars -= 0.4
        if ch == ch.upper():
            chars += 0.2
        
    size = width / (2*chars)
    tobj = d.text(text, fill=fill)
    tobj.attribs['x'] = '%fmm'  % (xpos/size)
    tobj.attribs['y'] = '%fmm' % (ypos/size)
    tobj.scale(size)
    d.add(tobj)

def image(filename, xpos, ypos, size, image_size=None, xspec=True):
    if image_size is None:
        image_size = get_image_size(filename)
    if xspec:
        ysize = (float(size) * image_size[1]) / image_size[0]
        sizetup = (mm(size), mm(ysize))
        postup = (mm(xpos-size/2), mm(ypos-ysize/2))
    else:
        xsize = size * image_size[0] / image_size[1]
        sizetup = (mm(xsize), mm(size))
        postup = (mm(xpos-xsize/2), mm(ypos-size/2))
    d.add(d.image(filename, size=sizetup, insert=postup))

def start():
    global d, bx, by, startx, count, page, svgfilename
    
    count = 0
    bx = startx = 10.0
    by = 10.0
    svgfilename = 'badges%d.svg' % page
    d = Drawing(svgfilename, profile='tiny', size=('210mm', '297mm'))
    page += 1
    
def finish():
    global svgfilename
    if svgfilename is None:
        return
    d.save()
    browser = get()
    browser.open(svgfilename)
    svgfilename = None
    
LOGO = '../xcellr8 logo hi res.png'
BACKDROP='backdrop_rr.png'
IMGDIR = 'team jpeg 2'

LEADERS = ['SteveWhyatt', 'CarolineNorth', 'TimNorth', 'DickonReed', 'SusanMeah', 'ElianeHamaia', 'JonnyStaplehurst', 'AndyStaplehurst']

gap = 10
page =1
badgex = 88.0

bgsize = get_image_size(BACKDROP)
print('bgsize',bgsize)
logosize = get_image_size(LOGO)
badgey = badgex * bgsize[1]/bgsize[0]
print ('badge mm', badgex, badgey)
start()

for filename in listdir(IMGDIR):
    if not filename.endswith('.JPG'):
        continue
    image(BACKDROP, bx+badgex/2, by+badgey/2, badgex, image_size=bgsize)
    image(LOGO, 70+bx, 10+by, 30)
    imgfile = IMGDIR+'/'+filename
    imgsize = get_image_size(imgfile)
    ratio = imgsize[1] / imgsize[0]
    xspec = ratio < 1.05
    image(imgfile, bx+28, by+badgey/2, 50 if xspec else badgey*0.95, xspec=xspec)
    names = filename.split('.')[0].split(' ')
    text(names[0], 55+bx, 28+by)
    text(names[1], 55+bx, 38+by)
    #text('%.3f %s' % (ratio, 'X' if xspec else 'Y'), 55+bx, 10+by)
    text('Team Member' if ''.join(names) not in LEADERS else 'Leader', 55+bx, 53+by, fill='#ffffff')
    count += 1
    bx +=  badgex+ gap
    if count % 2 == 0:
        bx = startx
        by += badgey + gap
    if count > 7:
        finish()
        start()

finish()
