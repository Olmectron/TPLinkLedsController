const { app, BrowserWindow } = require('electron')
const ambilight = require("ambilight-provider")
const noble = require('noble-winrt');
var ledInterface=null;
var beforeColor=null;

function toHSL(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    s = s*100;
s = Math.round(s);
l = l*100;
l = Math.round(l);
h = Math.round(360*h);

    var colorInHSL = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    return [h,s,l];
}
function setRGBOrder(rgb_order){

  console.log("setRGB> rgb_order " + rgb_order);

  /*
      <array name="rgb_model">
          <item>RGB,1</item>
          <item>RBG,2</item>
          <item>GRB,3</item>
          <item>GBR,4</item>
          <item>BRG,5</item>
          <item>BGR,6</item>
      </array>
   */
  var bytes = [];

  bytes[0] = 126;
  bytes[1] = 4;
  bytes[2] = 8;
  bytes[3] = rgb_order;
  bytes[4] = 255;
  bytes[5] = 255;
  bytes[6] = 255;
  bytes[8] = 239;



  return bytes;
}
function setRGB(red, blue, green) {
 // console.log("setRGB> red: " + red + " green:" + green + " blue:" +blue);

  var bytes = []; //new int[9]

  bytes[0] = 126;
  bytes[1] = 7;
  bytes[2] = 5;
  bytes[3] = 3;
  //TODO make sure you fire off setRGBOrder(1) first!
  bytes[4] = red;
  bytes[5] = blue;
  bytes[6] = green;
  bytes[8] = 239;

  return bytes;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function getRandomColor(callback){
  
  setTimeout(function(){

    var list=[
      [255,0,0],
      [0,255,0],
      [0,0,255],
      [255,255,0],
      [0,255,255],
      [255,0,255],
      [210,105,30]
      
    ];
    var random=Math.floor(Math.random()*list.length);

    callback(list[random]);
    getRandomColor(callback);

  },60 * 1000);
}
function createWindow(){
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  const TPLSmartDevice = require('tplink-lightbulb');
  const ledInterface = new TPLSmartDevice('192.168.1.83');
  const ledInterface2 = new TPLSmartDevice('192.168.1.208');
  const ledInterface3 = new TPLSmartDevice('192.168.1.82');

/*  light.info()
  .then(info => {
    console.log("INFO LIGHT",info);
  })*/

  var uids=[];
  var skipped=0;
  getRandomColor((color) => {
    // console.log("ambicolor:",color)
    
     //  if(!beforeColor || (beforeColor[0]!=color[0] && beforeColor[1]!=color[1] && beforeColor[2]!=color[2])){
        console.log("Getting random color!",color);
        
        var converted=toHSL(rgbToHex(color[0],color[1],color[2]));

        //brightness: converted[2]
        if(ledInterface)
        ledInterface.power(true,50,{mode:'normal',hue:converted[0],saturation:converted[1],color_temp:0, brightness:100});
          if(ledInterface2)
          ledInterface2.power(true,50,{mode:'normal',hue:converted[0],saturation:converted[1],color_temp:0, brightness:100});

            if(ledInterface3)
            ledInterface3.power(true,50,{mode:'normal',hue:converted[0],saturation:converted[1],color_temp:0, brightness:100});
  


/*        }).catch(function(err){
          if(err){
            console.log("ERROR RGB COLOR",err);
            return;
          }
        });*/
/*         ledInterface.write(Buffer.from(setRGB(color[0],color[1],color[2])),true,function(err){
   
           if(err){
             console.log("ERROR RGB COLOR",err);
             return;
           }
     
       //    console.log("RGB COLOR update success");
         });*/
     /*  }
       else{
         
         skipped++;
//           console.log("Skipped",skipped);
         
       }*/
       beforeColor=color;
      
     
     
   
     // Ex -> [183, 67, 102, 1] <-> [Red, Green, Blue, Hue]
   })
//var converted=toHSL("#FF0000");
//console.log("CONVERTED",converted);



  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.