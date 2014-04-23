(function(){
  var data, rgbFromHsv, ImageLoader, imageManager, View, SelectorView, PainterView, PreviewView, HueRing, ColorpickerView, views, selector, painter, preview, colorpicker;
  data = {
    image: 'img/kuma.png',
    mask: void 8,
    sprite: {
      width: 24,
      height: 32
    },
    relations: [void 8, void 8, void 8, 1, void 8, void 8, void 8, 5, void 8, void 8, void 8, 9, void 8, void 8, void 8, 13, void 8]
  };
  console.log(data);
  rgbFromHsv = function(h, s, v){
    var c, x, m, rgb, i$, len$, results$ = [];
    h = (h + 360) % 360;
    c = v * s;
    h /= 60;
    x = c * (1 - Math.abs(h % 2 - 1));
    m = v - c;
    rgb = (function(){
      switch (false) {
      case !(h < 1):
        return [c, x, 0];
      case !(h < 2):
        return [x, c, 0];
      case !(h < 3):
        return [0, c, x];
      case !(h < 4):
        return [0, x, c];
      case !(h < 5):
        return [x, 0, c];
      case !(h <= 6):
        return [c, 0, x];
      }
    }());
    for (i$ = 0, len$ = rgb.length; i$ < len$; ++i$) {
      v = rgb[i$];
      results$.push(0xff * (v + m));
    }
    return results$;
  };
  ImageLoader = (function(){
    ImageLoader.displayName = 'ImageLoader';
    var prototype = ImageLoader.prototype, constructor = ImageLoader;
    function ImageLoader(paths){
      this.paths = paths;
      this.images = {};
      this.loaded = 0;
    }
    prototype.load = function(onLoad){
      var i$, ref$, len$, path, x$, img, this$ = this;
      for (i$ = 0, len$ = (ref$ = this.paths).length; i$ < len$; ++i$) {
        path = ref$[i$];
        x$ = img = new Image;
        x$.src = path;
        x$.onload = fn$;
        this.images[path] = img;
      }
      function fn$(){
        if (++this$.loaded === this$.paths.length) {
          return typeof onLoad === 'function' ? onLoad() : void 8;
        }
      }
    };
    prototype.get = function(path){
      return this.images[path];
    };
    return ImageLoader;
  }());
  imageManager = new ImageLoader([data.image]);
  View = (function(){
    View.displayName = 'View';
    var prototype = View.prototype, constructor = View;
    function View(data){
      this.data = data;
      this.domElement = document.createElement('canvas');
    }
    prototype.update = function(){
      var x$;
      x$ = this.domElement.getContext('2d');
      x$.mozImageSmoothingEnabled = false;
      x$.webkitImageSmoothingEnabled = false;
      x$.msImageSmoothingEnabled = false;
      x$.imageSmoothingEnabled = false;
      x$.clearRect(0, 0, this.domElement.width, this.domElement.height);
      return x$;
    };
    return View;
  }());
  SelectorView = (function(superclass){
    var prototype = extend$((import$(SelectorView, superclass).displayName = 'SelectorView', SelectorView), superclass).prototype, constructor = SelectorView;
    function SelectorView(data){
      var x$;
      SelectorView.superclass.call(this, data);
      this.index = 0;
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 17;
      x$.height = this.data.sprite.height;
    }
    prototype.update = function(){
      return superclass.prototype.update.call(this).drawImage(imageManager.get(this.data.image), 0, 0);
    };
    return SelectorView;
  }(View));
  PainterView = (function(superclass){
    var prototype = extend$((import$(PainterView, superclass).displayName = 'PainterView', PainterView), superclass).prototype, constructor = PainterView;
    function PainterView(data){
      var x$;
      PainterView.superclass.call(this, data);
      this.index = 0;
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 17;
      x$.height = this.data.sprite.height * 17;
    }
    prototype.update = function(){
      return superclass.prototype.update.call(this).drawImage(imageManager.get(this.data.image), this.index * this.data.sprite.width, 0, this.data.sprite.width, this.data.sprite.height, 0, 0, this.data.sprite.width * 17, this.data.sprite.height * 17);
    };
    return PainterView;
  }(View));
  PreviewView = (function(superclass){
    var prototype = extend$((import$(PreviewView, superclass).displayName = 'PreviewView', PreviewView), superclass).prototype, constructor = PreviewView;
    function PreviewView(data){
      var x$;
      PreviewView.superclass.call(this, data);
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 6;
      x$.height = this.data.sprite.height * 6;
    }
    prototype.update = function(){
      return superclass.prototype.update.call(this).drawImage(imageManager.get(this.data.image), 0, 0, this.data.sprite.width, this.data.sprite.height, 0, 0, this.data.sprite.width * 6, this.data.sprite.height * 6);
    };
    return PreviewView;
  }(View));
  HueRing = (function(){
    HueRing.displayName = 'HueRing';
    var prototype = HueRing.prototype, constructor = HueRing;
    function HueRing(outerRadius, innerRadius, offset){
      this.outerRadius = outerRadius;
      this.innerRadius = innerRadius;
      this.offset = offset != null ? offset : 90;
      this.domElement = document.createElement('canvas');
    }
    prototype.paint = function(){
      var x$, center, ctx, imageData, i$, to$, i, x, y, rad, deg, rgb, y$;
      x$ = this.domElement;
      x$.width = this.outerRadius * 2;
      x$.height = this.outerRadius * 2;
      center = {
        x: this.outerRadius,
        y: this.outerRadius
      };
      ctx = this.domElement.getContext('2d');
      imageData = ctx.getImageData(0, 0, this.domElement.width, this.domElement.height);
      for (i$ = 0, to$ = this.domElement.width * this.domElement.height; i$ < to$; ++i$) {
        i = i$;
        x = ~~(i % this.domElement.width);
        y = ~~(i / this.domElement.width);
        rad = Math.atan2(y - center.y, x - center.x);
        deg = rad * 180 / Math.PI + this.offset;
        rgb = rgbFromHsv(deg, 1, 1);
        imageData.data[i * 4 + 0] = ~~rgb[0];
        imageData.data[i * 4 + 1] = ~~rgb[1];
        imageData.data[i * 4 + 2] = ~~rgb[2];
        imageData.data[i * 4 + 3] = 0xff;
      }
      y$ = ctx;
      y$.putImageData(imageData, 0, 0);
      y$.save();
      y$.globalCompositeOperation = 'destination-in';
      y$.fillStyle = 'black';
      y$.beginPath();
      y$.arc(center.x, center.y, this.outerRadius, 0, Math.PI * 2);
      y$.fill();
      y$.globalCompositeOperation = 'destination-out';
      y$.beginPath();
      y$.arc(center.x, center.y, this.innerRadius, 0, Math.PI * 2);
      y$.fill();
      y$.restore();
      return y$;
    };
    return HueRing;
  }());
  ColorpickerView = (function(superclass){
    var prototype = extend$((import$(ColorpickerView, superclass).displayName = 'ColorpickerView', ColorpickerView), superclass).prototype, constructor = ColorpickerView;
    function ColorpickerView(data){
      var x$, y$;
      ColorpickerView.superclass.call(this, data);
      this.radius = {
        outer: this.data.sprite.width * 3,
        inner: this.data.sprite.width * 3 - 20
      };
      x$ = this.hueRing = new HueRing(this.radius.outer, this.radius.inner);
      x$.paint();
      y$ = this.domElement;
      y$.width = this.data.sprite.width * 6;
      y$.height = this.data.sprite.height * 6;
    }
    prototype.update = function(){
      var center, x$, ctx, r, y$;
      center = {
        x: this.domElement.width / 2,
        y: this.domElement.height / 2
      };
      x$ = ctx = superclass.prototype.update.call(this);
      x$.drawImage(this.hueRing.domElement, 0, center.y - center.x);
      r = -Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(center.x + Math.cos(r) * this.radius.inner, center.y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(center.x + Math.cos(r) * this.radius.inner, center.y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(center.x + Math.cos(r) * this.radius.inner, center.y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(center.x + Math.cos(r) * this.radius.inner, center.y + Math.sin(r) * this.radius.inner);
      y$ = ctx;
      y$.fillStyle = 'red';
      y$.fill();
      return y$;
    };
    return ColorpickerView;
  }(View));
  views = [];
  selector = new SelectorView(data);
  $('#selector').append(selector.domElement);
  views.push(selector);
  painter = new PainterView(data);
  $('#painter').append(painter.domElement);
  views.push(painter);
  preview = new PreviewView(data);
  $('#previewer').append(preview.domElement);
  views.push(preview);
  colorpicker = new ColorpickerView(data);
  $('#colorpicker').append(colorpicker.domElement);
  views.push(colorpicker);
  imageManager.load(function(){
    var update;
    update = function(){
      var i$, ref$, len$, view;
      for (i$ = 0, len$ = (ref$ = views).length; i$ < len$; ++i$) {
        view = ref$[i$];
        view.update();
      }
      return requestAnimationFrame(update);
    };
    return requestAnimationFrame(update);
  });
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
