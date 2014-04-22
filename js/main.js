(function(){
  var data, ImageLoader, imageManager, View, SelectorView, PainterView, PreviewView, ColorpickerView, views, selector, painter, preview, colorpicker;
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
  ColorpickerView = (function(superclass){
    var prototype = extend$((import$(ColorpickerView, superclass).displayName = 'ColorpickerView', ColorpickerView), superclass).prototype, constructor = ColorpickerView;
    function ColorpickerView(data){
      var x$;
      ColorpickerView.superclass.call(this, data);
      this.radius = {
        outer: this.data.sprite.width * 3,
        inner: this.data.sprite.width * 3 - 20
      };
      x$ = this.domElement;
      x$.width = this.data.sprite.width * 6;
      x$.height = this.data.sprite.height * 6;
    }
    prototype.update = function(){
      var x, y, x$, ctx, r;
      x = this.domElement.width / 2;
      y = this.domElement.height / 2;
      x$ = ctx = superclass.prototype.update.call(this);
      x$.beginPath();
      x$.arc(x, y, (this.radius.outer + this.radius.inner) / 2, 0, Math.PI * 2, false);
      x$.lineWidth = this.radius.outer - this.radius.inner;
      x$.stroke();
      r = -Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(r) * this.radius.inner, y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(x + Math.cos(r) * this.radius.inner, y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(x + Math.cos(r) * this.radius.inner, y + Math.sin(r) * this.radius.inner);
      r += Math.PI * 2 / 3;
      ctx.lineTo(x + Math.cos(r) * this.radius.inner, y + Math.sin(r) * this.radius.inner);
      return ctx.fill();
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
