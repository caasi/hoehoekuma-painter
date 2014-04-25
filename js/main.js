(function(){
  var data, a, x$, rgbFromHsv, stringFromRgb, ImageLoader, imageManager, View, SelectorView, PainterView, PreviewView, Canvas, HueRing, HSVTriangle, ColorpickerView, views, selector, painter, preview, colorpicker;
  data = {
    image: 'img/kuma.png',
    mask: void 8,
    sprite: {
      width: 24,
      height: 32
    },
    relations: [void 8, void 8, void 8, 1, void 8, void 8, void 8, 5, void 8, void 8, void 8, 9, void 8, void 8, void 8, 13, void 8]
  };
  a = Math.PI / 180;
  x$ = Math;
  x$.sqrt3 = Math.sqrt(3);
  x$.toRadian = function(it){
    return it * a;
  };
  x$.toDegree = function(it){
    return it / a;
  };
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
      results$.push(~~(0xff * (v + m)));
    }
    return results$;
  };
  stringFromRgb = function(it){
    return "rgb(" + it[0] + "," + it[1] + "," + it[2] + ")";
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
  Canvas = (function(){
    Canvas.displayName = 'Canvas';
    var prototype = Canvas.prototype, constructor = Canvas;
    function Canvas(){
      this.domElement = document.createElement('canvas');
      this.dirty = true;
    }
    prototype.hitTest = function(x, y){
      var ctx, imageData, i;
      if (!(0 <= x && x < this.domElement.width)) {
        return false;
      }
      if (!(0 <= y && y < this.domElement.height)) {
        return false;
      }
      ctx = this.domElement.getContext('2d');
      imageData = ctx.getImageData(0, 0, this.domElement.width, this.domElement.height);
      x = ~~x;
      y = ~~y;
      i = y * imageData.width + x;
      return imageData.data[i * 4 + 3] !== 0x00;
    };
    prototype.paint = function(){
      this.dirty = false;
      return this.domElement.getContext('2d');
    };
    return Canvas;
  }());
  HueRing = (function(superclass){
    var prototype = extend$((import$(HueRing, superclass).displayName = 'HueRing', HueRing), superclass).prototype, constructor = HueRing;
    function HueRing(outerRadius, innerRadius, rotation){
      this.outerRadius = outerRadius;
      this.innerRadius = innerRadius;
      this.rotation = rotation != null
        ? rotation
        : -Math.PI / 2;
      HueRing.superclass.call(this);
      this.debug = false;
    }
    prototype.hueFromPosition = function(x, y){
      var deg;
      deg = Math.atan2(y - this.outerRadius, x - this.outerRadius) - this.rotation;
      deg *= 180 / Math.PI;
      return (deg + 360) % 360;
    };
    prototype.paint = function(){
      var x$, center, ctx, imageData, i$, to$, i, x, y, rgb, y$;
      x$ = this.domElement;
      x$.width = this.outerRadius * 2;
      x$.height = this.outerRadius * 2;
      center = {
        x: this.outerRadius,
        y: this.outerRadius
      };
      ctx = superclass.prototype.paint.call(this);
      imageData = ctx.getImageData(0, 0, this.domElement.width, this.domElement.height);
      for (i$ = 0, to$ = this.domElement.width * this.domElement.height; i$ < to$; ++i$) {
        i = i$;
        x = ~~(i % this.domElement.width);
        y = ~~(i / this.domElement.width);
        rgb = rgbFromHsv(this.hueFromPosition(x, y), 1, 1);
        imageData.data[i * 4 + 0] = rgb[0];
        imageData.data[i * 4 + 1] = rgb[1];
        imageData.data[i * 4 + 2] = rgb[2];
        imageData.data[i * 4 + 3] = 0xff;
      }
      if (this.debug) {
        return ctx;
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
  }(Canvas));
  HSVTriangle = (function(superclass){
    var prototype = extend$((import$(HSVTriangle, superclass).displayName = 'HSVTriangle', HSVTriangle), superclass).prototype, constructor = HSVTriangle;
    function HSVTriangle(radius, rotation){
      this.radius = radius;
      this.rotation = rotation != null
        ? rotation
        : -Math.PI / 2;
      HSVTriangle.superclass.call(this);
      this.debug = false;
      this.hue = 0;
    }
    prototype.updateRotationMatrix = function(){
      var x$;
      this.matrix = mat2d.create();
      x$ = mat2d;
      x$.translate(this.matrix, this.matrix, [this.radius, this.radius]);
      x$.rotate(this.matrix, this.matrix, -this.rotation);
      x$.translate(this.matrix, this.matrix, [-this.radius, -this.radius]);
      return x$;
    };
    prototype.updateSaturationPoint = function(){
      var r;
      r = Math.PI * 4 / 3;
      return this.pointS = vec2.fromValues(this.radius + this.radius * Math.cos(r), this.radius + this.radius * Math.sin(r));
    };
    prototype.SVFromPosition = function(x, y){
      var p, t;
      p = vec2.fromValues(x, y);
      vec2.transformMat2d(p, p, this.matrix);
      vec2.subtract(p, p, this.pointS);
      t = Math.sqrt3 * p[1] + p[0];
      return [2 * p[0] / t, t / 3 / this.radius];
    };
    prototype.PositionFromSV = function(s, v){
      var t0, t1, p, m;
      t0 = v * this.radius;
      t1 = s / 2 * t0;
      p = vec2.fromValues(3 * t1, Math.sqrt3 * (t0 - t1));
      vec2.add(p, p, this.pointS);
      m = mat2d.create();
      m = mat2d.invert(m, this.matrix);
      vec2.transformMat2d(p, p, m);
      return p;
    };
    prototype.paint = function(){
      var x$, ctx, imageData, i$, to$, i, ref$, s, v, rgb, r, step, y$, z$;
      x$ = this.domElement;
      x$.width = 2 * this.radius;
      x$.height = 2 * this.radius;
      this.updateRotationMatrix();
      this.updateSaturationPoint();
      ctx = superclass.prototype.paint.call(this);
      imageData = ctx.getImageData(0, 0, this.domElement.width, this.domElement.height);
      for (i$ = 0, to$ = this.domElement.width * this.domElement.height; i$ < to$; ++i$) {
        i = i$;
        ref$ = this.SVFromPosition(~~(i % this.domElement.width), ~~(i / this.domElement.width)), s = ref$[0], v = ref$[1];
        rgb = rgbFromHsv(this.hue, s, v);
        imageData.data[i * 4 + 0] = rgb[0];
        imageData.data[i * 4 + 1] = rgb[1];
        imageData.data[i * 4 + 2] = rgb[2];
        imageData.data[i * 4 + 3] = 0xff;
      }
      ctx.putImageData(imageData, 0, 0);
      if (this.debug) {
        return ctx;
      }
      r = this.rotation;
      step = Math.PI * 2 / 3;
      y$ = ctx;
      y$.beginPath();
      y$.moveTo(this.radius + Math.cos(r) * this.radius, this.radius + Math.sin(r) * this.radius);
      for (i$ = 0; i$ < 3; ++i$) {
        i = i$;
        ctx.lineTo(this.radius + Math.cos(r) * this.radius, this.radius + Math.sin(r) * this.radius);
        r += step;
      }
      z$ = ctx;
      z$.save();
      z$.globalCompositeOperation = 'destination-in';
      z$.fillStyle = 'black';
      z$.fill();
      z$.restore();
      return z$;
    };
    return HSVTriangle;
  }(Canvas));
  ColorpickerView = (function(superclass){
    var prototype = extend$((import$(ColorpickerView, superclass).displayName = 'ColorpickerView', ColorpickerView), superclass).prototype, constructor = ColorpickerView;
    function ColorpickerView(data){
      var x$, y$, $doc, ring, triangle, z$, $canvas, this$ = this;
      ColorpickerView.superclass.call(this, data);
      this.ringWidth = 20;
      this.radius = {
        outer: this.data.sprite.width * 3,
        inner: this.data.sprite.width * 3 - this.ringWidth
      };
      this.hueRing = new HueRing(this.radius.outer, this.radius.inner);
      x$ = this.hsvTriangle = new HSVTriangle(this.radius.inner);
      x$.rotation = this.hueRing.rotation + Math.toRadian(this.hsvTriangle.hue);
      y$ = this.domElement;
      y$.width = this.data.sprite.width * 6;
      y$.height = this.data.sprite.height * 6;
      this.offsetY = (this.domElement.height - this.domElement.width) / 2;
      this.prev = {
        s: 0,
        v: 1
      };
      this.color = 'white';
      $doc = $(document);
      ring = {
        mousedown: function(e){
          var offset, x, y, x$;
          offset = $canvas.offset();
          x = e.pageX - offset.left;
          y = e.pageY - offset.top - this$.offsetY;
          if (this$.hueRing.hitTest(x, y)) {
            ring.mousemove(e);
            x$ = $doc;
            x$.mousemove(ring.mousemove);
            x$.mouseup(ring.mouseup);
            return x$;
          }
        },
        mousemove: function(e){
          var offset, x, y, hue, x$;
          offset = $canvas.offset();
          x = e.pageX - offset.left;
          y = e.pageY - offset.top - this$.offsetY;
          hue = this$.hueRing.hueFromPosition(x, y);
          x$ = this$.hsvTriangle = new HSVTriangle(this$.radius.inner);
          x$.hue = hue;
          x$.rotation = this$.hueRing.rotation + Math.toRadian(hue);
          x$.dirty = true;
          return this$.color = stringFromRgb(rgbFromHsv(hue, this$.prev.s, this$.prev.v));
        },
        mouseup: function(){
          var x$;
          x$ = $doc;
          x$.off('mousemove', ring.mousemove);
          x$.off('mouseup', ring.mouseup);
          return x$;
        }
      };
      triangle = {
        ratio: 255 / 256,
        mousedown: function(e){
          var offset, x, y, x$;
          offset = $canvas.offset();
          x = e.pageX - offset.left - this$.ringWidth;
          y = e.pageY - offset.top - this$.offsetY - this$.ringWidth;
          if (this$.hsvTriangle.hitTest(x, y)) {
            triangle.mousemove(e);
            x$ = $doc;
            x$.mousemove(triangle.mousemove);
            x$.mouseup(triangle.mouseup);
            return x$;
          }
        },
        approximate: function(x, y){
          var ref$, s, v, x$, r;
          ref$ = this$.hsvTriangle.SVFromPosition(x, y), s = ref$[0], v = ref$[1];
          if ((0 <= s && s < 1) && (0 <= v && v < 1)) {
            x$ = this$.prev;
            x$.s = s;
            x$.v = v;
            return this$.color = stringFromRgb(rgbFromHsv(this$.hsvTriangle.hue, s, v));
          } else {
            r = this$.hsvTriangle.radius;
            return triangle.approximate(r + (x - r) * triangle.ratio, r + (y - r) * triangle.ratio);
          }
        },
        mousemove: function(e){
          var offset, x, y;
          offset = $canvas.offset();
          x = e.pageX - offset.left - this$.ringWidth;
          y = e.pageY - offset.top - this$.offsetY - this$.ringWidth;
          return triangle.approximate(x, y);
        },
        mouseup: function(){
          var x$;
          x$ = $doc;
          x$.off('mousemove', triangle.mousemove);
          x$.off('mouseup', triangle.mouseup);
          return x$;
        }
      };
      z$ = $canvas = $(this.domElement);
      z$.mousedown(ring.mousedown);
      z$.mousedown(triangle.mousedown);
    }
    prototype.update = function(){
      var x$, ctx, rad, gap, r, x, y, y$, ref$, z$;
      if (this.hueRing.dirty) {
        this.hueRing.paint();
      }
      if (this.hsvTriangle.dirty) {
        this.hsvTriangle.paint();
      }
      x$ = ctx = superclass.prototype.update.call(this);
      x$.fillStyle = this.color;
      x$.fillRect(0, 0, this.domElement.width, this.domElement.height);
      x$.drawImage(this.hueRing.domElement, 0, this.offsetY);
      x$.drawImage(this.hsvTriangle.domElement, this.ringWidth, this.ringWidth + this.offsetY);
      rad = Math.toRadian(this.hsvTriangle.hue) + this.hueRing.rotation;
      gap = Math.toRadian(1);
      r = (this.hueRing.outerRadius + this.hueRing.innerRadius) / 2;
      x = this.hueRing.outerRadius + r * Math.cos(rad);
      y = this.offsetY + this.hueRing.outerRadius + r * Math.sin(rad);
      y$ = ctx;
      y$.beginPath();
      y$.arc(this.domElement.width / 2, this.domElement.height / 2, r, rad - gap, rad + gap);
      y$.strokeStyle = 'white';
      y$.lineWidth = this.ringWidth;
      y$.stroke();
      ref$ = this.hsvTriangle.PositionFromSV(this.prev.s, this.prev.v), x = ref$[0], y = ref$[1];
      z$ = ctx;
      z$.beginPath();
      z$.arc(x + this.ringWidth, y + this.offsetY + this.ringWidth, this.ringWidth / 4, 0, Math.PI * 2);
      z$.lineWidth = this.ringWidth / 10;
      z$.stroke();
      return z$;
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
