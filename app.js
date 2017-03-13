var express = require('express')
var app = express()
var http = require('http').Server(app)
var path = require('path')
var fs = require('fs');

var bodyParser = require('body-parser');
app.set('port', 8081);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var w0, w1, w2;
var iteration = 0;
var jsonfile = require('jsonfile');
var file = './public/data/line.json';
jsonfile.writeFileSync(file, []);

generatePoints(20);

function generatePoints(numberOfPoints){
  var i = 0;

  var dataPointsJSON = [];

  while(i < numberOfPoints){
    var new_x = Math.floor(Math.random() * 200);
    var new_y= Math.floor(Math.random() * 200);
    var new_D;

    var d = 2*(new_x) - new_y;
    
    if(d == 0){
      i--;
      continue;
    }else if(d < 0) {
      new_D = -1;
    }else if(d > 0){
      new_D = 1;
    }

    var obj = {
      "X1":new_x,
      "X2":new_y,
      "D":new_D
   }

   dataPointsJSON.push(obj);
   i++;
  }

  var jsonfile = require('jsonfile');
  var file = './public/data/update.json';
  jsonfile.writeFileSync(file, dataPointsJSON);
}

app.get('/', function(req, res){
  w0 = 10;
  w1 = 10;
  w2 = 50;
  var obj = linePointsJSON(w0, w1, w2);
  var jsonfileLine = require('jsonfile');
  var fileLine = './public/data/line.json';
  iteration = 0;
  jsonfileLine.writeFileSync(fileLine, obj);
  res.render('pla', {itr:iteration, w0 : w0, w1:w1, w2:w2});
});

app.get('/pla', function(req, res){
  var jsonfile = require('jsonfile');
  var file = './public/data/update.json';
  var dataJSON = jsonfile.readFileSync(file);
  for(i = 0;i < dataJSON.length; i++){
    var x1 = dataJSON[i].X1;
    var x2 = dataJSON[i].X2;
    var y = dataJSON[i].D;

    var SignValue = (w0) + (w1*x1) + (w2*x2);
    var sign = (SignValue)/(Math.abs(SignValue));

    // update W vector
    if(sign != y){
      w0 = w0 + (y)*1;
      w1 = w1 + (y)*x1;
      w2 = w2 + (y)*x2;
      var obj2 = linePointsJSON(w0, w1, w2);
      var jsonfileLine2 = require('jsonfile');
      var fileLine2 = './public/data/line.json';
      jsonfileLine2.writeFileSync(fileLine2, obj2);
      iteration = iteration + 1;
      break;
    }
  }
  res.render('pla', {itr:iteration, w0 : w0, w1:w1, w2:w2});
});

function linePointsJSON(A, B, C){
    // line A + BX + CY = 0
    // make X=0 to calculate Y
    // Y = -A/C
    var y1 = (-1)*(A/C);
    // X = -(A + CY) / B
    var x1 = ((-1) * (A + (C*y1))) / B;

    // now make Y=0 to calculate X
    // X = -A / B
    var x2 = (-1)*(A/B);
    // Y = -(A + BX) / C
    var y2 = ((-1) * (A + (B * x2))) / C;
    
    var point1 = pointAtX([x1,y1], [x2, y2] , -200);
    var point2 = pointAtX([x1,y1], [x2, y2], 200);

    var obj = [
                {
                  "X1":point1[0],
                  "Y1":point1[1],
                  "X2":point2[0],
                  "Y2":point2[1]
               }
             ];

    return obj;
};

function pointAtX(a, b, x) {
  var slope = (b[1] - a[1]) / (b[0] - a[0])
  var y = a[1] + (x - a[0]) * slope
  return [x, y]
}



http.listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});
