(function(){
  var data, a, x$, rgbFromHsv, stringFromRgb, ImageLoader, imageManager, View, SpriteSheet, SelectorView, ScalableView, PainterView, PreviewView, RecentColor, Canvas, HueRing, HSVTriangle, ColorpickerView;
  data = {
    image: 'img/kuma.png',
    mask: 'img/mask.png',
    sprite: {
      width: 24,
      height: 32
    },
    relations: [void 8, void 8, void 8, 1, void 8, void 8, void 8, 5, void 8, void 8, void 8, 9, void 8, void 8, void 8, 13, void 8],
    speed: 0.25,
    duration: 2,
    animations: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [16, 1]]
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
  imageManager = new ImageLoader([data.image, data.mask]);
  View = (function(superclass){
    var prototype = extend$((import$(View, superclass).displayName = 'View', View), superclass).prototype, constructor = View;
    function View(data, source){
      this.data = data;
      this.source = source;
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
  }(Monologue));
  SpriteSheet = (function(superclass){
    var prototype = extend$((import$(SpriteSheet, superclass).displayName = 'SpriteSheet', SpriteSheet), superclass).prototype, constructor = SpriteSheet;
    function SpriteSheet(data){
      var image, mask, x$, y$, z$, ctx, z1$, ctxMask, getImageData, i, ref$, relation, args;
      SpriteSheet.superclass.call(this, data);
      image = imageManager.get(this.data.image);
      mask = imageManager.get(this.data.mask);
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 17;
      x$.height = this.data.sprite.height;
      y$ = this.maskElement = document.createElement('canvas');
      y$.width = this.data.sprite.width * 17;
      y$.height = this.data.sprite.height;
      z$ = ctx = this.domElement.getContext('2d');
      z$.drawImage(image, 0, 0);
      z1$ = ctxMask = this.maskElement.getContext('2d');
      z1$.drawImage(mask, 0, 0);
      this.spritesheet = [];
      this.masksheet = [];
      getImageData = CanvasRenderingContext2D.prototype.getImageData;
      for (i in ref$ = this.data.relations) {
        relation = ref$[i];
        i = +i;
        if (relation === void 8) {
          args = [i * this.data.sprite.width, 0, this.data.sprite.width, this.data.sprite.height];
          this.spritesheet[i] = getImageData.apply(ctx, args);
          this.masksheet[i] = getImageData.apply(ctxMask, args);
        } else {
          this.spritesheet[i] = this.spritesheet[relation];
          this.masksheet[i] = this.masksheet[relation];
        }
      }
    }
    prototype.update = function(){
      var ctx, i, ref$, relation, results$ = [];
      ctx = superclass.prototype.update.call(this);
      for (i in ref$ = this.data.relations) {
        relation = ref$[i];
        results$.push(ctx.putImageData(this.spritesheet[i], +i * this.data.sprite.width, 0));
      }
      return results$;
    };
    prototype.paint = function(brush){
      var mask, i, color, data;
      mask = this.masksheet[brush.frame].data;
      i = ~~(brush.y * this.data.sprite.width + brush.x);
      if (mask[i * 4 + 3] !== 0x00) {
        color = rgbFromHsv(brush.color.h, brush.color.s, brush.color.v);
        data = this.spritesheet[brush.frame].data;
        data[i * 4 + 0] = color[0];
        data[i * 4 + 1] = color[1];
        data[i * 4 + 2] = color[2];
        return data[i * 4 + 3] = 0xff;
      }
    };
    return SpriteSheet;
  }(View));
  SelectorView = (function(superclass){
    var prototype = extend$((import$(SelectorView, superclass).displayName = 'SelectorView', SelectorView), superclass).prototype, constructor = SelectorView;
    function SelectorView(data, source){
      var x$, y$, $e, this$ = this;
      SelectorView.superclass.call(this, data, source);
      this.index = 0;
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 17;
      x$.height = this.data.sprite.height;
      y$ = $e = $(this.domElement);
      y$.click(function(e){
        var x;
        x = $e.offset().left;
        this$.index = ~~((e.pageX - x) / this$.data.sprite.width);
        return this$.emit('index.changed', this$.index);
      });
    }
    prototype.update = function(){
      var x$;
      x$ = superclass.prototype.update.call(this);
      x$.drawImage(this.source, 0, 0);
      x$.globalCompositeOperation = 'destination-over';
      x$.fillStyle = '#0f0';
      x$.fillRect(this.index * this.data.sprite.width, 0, this.data.sprite.width, this.data.sprite.height);
      return x$;
    };
    return SelectorView;
  }(View));
  ScalableView = (function(superclass){
    var prototype = extend$((import$(ScalableView, superclass).displayName = 'ScalableView', ScalableView), superclass).prototype, constructor = ScalableView;
    function ScalableView(data, source){
      ScalableView.superclass.call(this, data, source);
      this.index = 0;
      this.scale = 1;
      this.scaleChanged = false;
      this.bgElement = document.createElement('canvas');
    }
    prototype.update = function(){
      var x$, ctx, width, i$, to$, y, j$, to1$, x, color, y$, z$, z1$;
      if (this.scaleChanged) {
        this.scaleChanged = false;
        x$ = this.bgElement;
        x$.width = this.data.sprite.width * this.scale;
        x$.height = this.data.sprite.height * this.scale;
        ctx = this.bgElement.getContext('2d');
        width = this.scale !== 1 ? this.scale : 1;
        for (i$ = 0, to$ = this.bgElement.height / width; i$ < to$; ++i$) {
          y = i$;
          for (j$ = 0, to1$ = this.bgElement.width / width; j$ < to1$; ++j$) {
            x = j$;
            color = (x + y) % 2 === 0 ? '#999' : '#666';
            y$ = ctx;
            y$.fillStyle = color;
            y$.fillRect(x * width, y * width, width, width);
          }
        }
      }
      z$ = this.domElement;
      z$.width = this.data.sprite.width * this.scale;
      z$.height = this.data.sprite.height * this.scale;
      z1$ = superclass.prototype.update.call(this);
      z1$.drawImage(this.bgElement, 0, 0);
      z1$.drawImage(this.source, this.index * this.data.sprite.width, 0, this.data.sprite.width, this.data.sprite.height, 0, 0, this.data.sprite.width * this.scale, this.data.sprite.height * this.scale);
      return z1$;
    };
    return ScalableView;
  }(View));
  PainterView = (function(superclass){
    var prototype = extend$((import$(PainterView, superclass).displayName = 'PainterView', PainterView), superclass).prototype, constructor = PainterView;
    function PainterView(data, source){
      var onDraw, x$, $e, this$ = this;
      PainterView.superclass.call(this, data, source);
      this.scale = 17;
      this.scaleChanged = true;
      this.x = -1;
      this.y = -1;
      this.color = {
        h: 0,
        s: 0,
        v: 1
      };
      onDraw = function(e){
        return this$.emit('painted', {
          frame: this$.index,
          x: this$.x,
          y: this$.y,
          color: this$.color
        });
      };
      x$ = $e = $(this.domElement);
      x$.mousedown(function(e){
        onDraw(e);
        return $e.mousemove(onDraw);
      });
      x$.mouseup(function(){
        return $e.off('mousemove', onDraw);
      });
      $(document).mousemove(function(e){
        var ref$;
        ref$ = $e.offset(), this$.x = ref$.left, this$.y = ref$.top;
        this$.x = e.pageX - this$.x;
        this$.y = e.pageY - this$.y;
        this$.x = ~~(this$.x / this$.scale);
        return this$.y = ~~(this$.y / this$.scale);
      });
    }
    prototype.update = function(){
      var x$;
      x$ = superclass.prototype.update.call(this);
      x$.fillStyle = stringFromRgb(rgbFromHsv(this.color.h, this.color.s, this.color.v));
      x$.fillRect(this.x * this.scale, this.y * this.scale, this.scale, this.scale);
      return x$;
    };
    return PainterView;
  }(ScalableView));
  PreviewView = (function(superclass){
    var prototype = extend$((import$(PreviewView, superclass).displayName = 'PreviewView', PreviewView), superclass).prototype, constructor = PreviewView;
    function PreviewView(data, source){
      var this$ = this;
      PreviewView.superclass.call(this, data, source);
      this.scale = 6;
      this.scaleChanged = true;
      this.animation = 0;
      this.frame = 0;
      setInterval(function(){
        ++this$.animation;
        if (!(this$.animation < this$.data.animations.length)) {
          this$.animation = 0;
        }
        return this$.frame = 0;
      }, this.data.duration * 1000);
    }
    prototype.update = function(){
      var animation;
      animation = this.data.animations[this.animation];
      this.index = animation[~~this.frame];
      this.frame += this.data.speed;
      if (!(this.frame < animation.length)) {
        this.frame = 0;
      }
      return superclass.prototype.update.call(this);
    };
    return PreviewView;
  }(ScalableView));
  RecentColor = (function(superclass){
    var prototype = extend$((import$(RecentColor, superclass).displayName = 'RecentColor', RecentColor), superclass).prototype, constructor = RecentColor;
    function RecentColor(data, source){
      var x$, y$, $canvas, this$ = this;
      RecentColor.superclass.call(this, data, source);
      this.colors = [];
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 6;
      x$.height = this.data.sprite.height * 6;
      this.widget = {
        width: 3,
        height: 8
      };
      this.cell = {
        width: this.domElement.width / this.widget.width,
        height: this.domElement.height / this.widget.height
      };
      y$ = $canvas = $(this.domElement);
      y$.click(function(e){
        var ref$, x, y, i;
        ref$ = $canvas.offset(), x = ref$.left, y = ref$.top;
        x = e.pageX - x;
        y = e.pageY - y;
        x = ~~(x / this$.cell.width);
        y = ~~(y / this$.cell.height);
        i = y * this$.widget.width + x;
        if (i < this$.colors.length) {
          return this$.emit('color.changed', this$.colors[i]);
        }
      });
    }
    prototype.update = function(){
      var ctx, i$, to$, i, x, y, c, x$, results$ = [];
      ctx = superclass.prototype.update.call(this);
      for (i$ = 0, to$ = this.widget.width * this.widget.height; i$ < to$; ++i$) {
        i = i$;
        if (i < this.colors.length) {
          x = ~~(i % 3);
          y = ~~(i / 3);
          c = this.colors[i];
          x$ = ctx;
          x$.fillStyle = stringFromRgb(rgbFromHsv(c.h, c.s, c.v));
          x$.fillRect(x * this.cell.width, y * this.cell.height, this.cell.width, this.cell.height);
          results$.push(x$);
        }
      }
      return results$;
    };
    prototype.addColor = function(color){
      var i, c, i$, j, results$ = [];
      i = 0;
      while (i < this.colors.length) {
        c = this.colors[i];
        if (c.h === color.h && c.s === color.s && c.v === color.v) {
          break;
        }
        ++i;
      }
      if (i === this.colors.length) {
        this.colors.unshift(color);
        while (this.colors.length >= 16) {
          results$.push(this.colors.pop());
        }
        return results$;
      } else {
        for (i$ = i; i$ > 0; --i$) {
          j = i$;
          this.colors[j] = this.colors[j - 1];
        }
        return this.colors[0] = color;
      }
    };
    return RecentColor;
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
      var p, t, s, v;
      p = vec2.fromValues(x, y);
      vec2.transformMat2d(p, p, this.matrix);
      vec2.subtract(p, p, this.pointS);
      t = Math.sqrt3 * p[1] + p[0];
      s = 2 * p[0] / t;
      v = t / 3 / this.radius;
      s = s < 0
        ? 0
        : s >= 1 ? 1 : s;
      v = v < 0
        ? 0
        : v >= 1 ? 1 : v;
      return [s, v];
    };
    prototype.positionFromSV = function(s, v){
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
      this._color = {
        h: 0,
        s: 0,
        v: 1
      };
      this.color = this._color;
      $doc = $(document);
      ring = {
        mousedown: function(e){
          var ref$, x, y, x$;
          ref$ = $canvas.offset(), x = ref$.left, y = ref$.top;
          x = e.pageX - x;
          y = e.pageY - y - this$.offsetY;
          if (this$.hueRing.hitTest(x, y)) {
            ring.mousemove(e);
            x$ = $doc;
            x$.mousemove(ring.mousemove);
            x$.mouseup(ring.mouseup);
            return x$;
          }
        },
        mousemove: function(e){
          var ref$, x, y, hue;
          ref$ = $canvas.offset(), x = ref$.left, y = ref$.top;
          x = e.pageX - x;
          y = e.pageY - y - this$.offsetY;
          hue = this$.hueRing.hueFromPosition(x, y);
          this$.color = {
            h: hue,
            s: this$.color.s,
            v: this$.color.v
          };
          return this$.emit('color.changed', {
            h: this$.color.h,
            s: this$.color.s,
            v: this$.color.v
          });
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
          var ref$, x, y, x$;
          ref$ = $canvas.offset(), x = ref$.left, y = ref$.top;
          x = e.pageX - x - this$.ringWidth;
          y = e.pageY - y - this$.offsetY - this$.ringWidth;
          if (this$.hsvTriangle.hitTest(x, y)) {
            triangle.mousemove(e);
            x$ = $doc;
            x$.mousemove(triangle.mousemove);
            x$.mouseup(triangle.mouseup);
            return x$;
          }
        },
        mousemove: function(e){
          var ref$, x, y, s, v;
          ref$ = $canvas.offset(), x = ref$.left, y = ref$.top;
          x = e.pageX - x - this$.ringWidth;
          y = e.pageY - y - this$.offsetY - this$.ringWidth;
          ref$ = this$.hsvTriangle.SVFromPosition(x, y), s = ref$[0], v = ref$[1];
          this$.color = {
            h: this$.hsvTriangle.hue,
            s: s,
            v: v
          };
          return this$.emit('color.changed', {
            h: this$.color.h,
            s: this$.color.s,
            v: this$.color.v
          });
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
      x$.fillStyle = this._rgbString;
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
      ref$ = this.hsvTriangle.positionFromSV(this.color.s, this.color.v), x = ref$[0], y = ref$[1];
      z$ = ctx;
      z$.beginPath();
      z$.arc(x + this.ringWidth, y + this.offsetY + this.ringWidth, this.ringWidth / 4, 0, Math.PI * 2);
      z$.lineWidth = this.ringWidth / 10;
      z$.stroke();
      return z$;
    };
    Object.defineProperty(prototype, 'color', {
      get: function(){
        return this._color;
      },
      set: function(color){
        var x$;
        import$(this._color, color);
        this._rgbString = stringFromRgb(rgbFromHsv(this._color.h, this._color.s, this._color.v));
        x$ = this.hsvTriangle;
        x$.hue = this._color.h;
        x$.rotation = this.hueRing.rotation + Math.toRadian(this._color.h);
        x$.dirty = true;
      },
      configurable: true,
      enumerable: true
    });
    return ColorpickerView;
  }(View));
  imageManager.load(function(){
    var views, spritesheet, x$, selector, y$, painter, preview, z$, colorpicker, z1$, recentcolor, update;
    views = [];
    spritesheet = new SpriteSheet(data);
    x$ = selector = new SelectorView(data, spritesheet.domElement);
    x$.on('index.changed', function(index){
      return painter.index = index;
    });
    y$ = painter = new PainterView(data, spritesheet.domElement);
    y$.on('painted', function(data){
      spritesheet.paint(data);
      return recentcolor.addColor(data.color);
    });
    preview = new PreviewView(data, spritesheet.domElement);
    z$ = colorpicker = new ColorpickerView(data);
    z$.on('color.changed', function(color){
      return painter.color = color;
    });
    z1$ = recentcolor = new RecentColor(data);
    z1$.on('color.changed', function(color){
      painter.color = color;
      return colorpicker.color = color;
    });
    $('#selector').append(selector.domElement);
    $('#painter').append(painter.domElement);
    $('#previewer').append(preview.domElement);
    $('#colorpicker').append(colorpicker.domElement);
    $('#recentcolor').append(recentcolor.domElement);
    $('#save').click(function(){
      return Canvas2Image.saveAsPNG(spritesheet.domElement);
    });
    views.push(spritesheet, selector, painter, preview, colorpicker, recentcolor);
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
