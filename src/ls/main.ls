console.log data

##
# RGB from HSV
# http://aventures-logicielles.blogspot.tw/2010/11/playing-with-hsv-colors-and-html5.html
rgb-from-hsv = (h, s, v) ->
  h = (h + 360) % 360
  c = v * s
  h /= 60
  x = c * (1 - Math.abs((h % 2) - 1))
  m = v - c
  rgb = switch
  | h <  1 => [c, x, 0]
  | h <  2 => [x, c, 0]
  | h <  3 => [0, c, x]
  | h <  4 => [0, x, c]
  | h <  5 => [x, 0, c]
  | h <= 6 => [c, 0, x]
  for v in rgb => 0xff * (v + m)

string-from-rgb = -> "rgb(#{~~it.0},#{~~it.1},#{~~it.2})"

class ImageLoader
  (@paths) ->
    @images = {}
    @loaded = 0
  load: !(on-load) ->
    for path in @paths
      img = new Image
        ..src = path
        ..onload = ~>
          if ++@loaded is @paths.length
            on-load?!
      @images[path] = img
  get: (path) ->
    @images[path]

image-manager = new ImageLoader [data.image]

class View
  (@data) ->
    @domElement = document.createElement \canvas
  update: ->
    @domElement.getContext \2d
      ..mozImageSmoothingEnabled = false
      ..webkitImageSmoothingEnabled = false
      ..msImageSmoothingEnabled = false
      ..imageSmoothingEnabled = false
      ..clearRect 0, 0, @domElement.width, @domElement.height

class SelectorView extends View
  (data) ->
    super data
    @index = 0
    @domElement
      ..width = @data.sprite.width * 17
      ..height = @data.sprite.height
  update: ->
    super!drawImage image-manager.get(@data.image), 0, 0

class PainterView extends View
  (data) ->
    super data
    @index = 0
    @domElement
      ..width = @data.sprite.width * 17
      ..height = @data.sprite.height * 17
  update: ->
    super!drawImage do
      image-manager.get @data.image
      @index * @data.sprite.width, 0
      @data.sprite.width, @data.sprite.height
      0, 0
      @data.sprite.width * 17, @data.sprite.height * 17

class PreviewView extends View
  (data) ->
    super data
    @domElement
      ..width = @data.sprite.width * 6
      ..height = @data.sprite.height * 6
  update: ->
    super!drawImage do
      image-manager.get @data.image
      0, 0
      @data.sprite.width, @data.sprite.height
      0, 0
      @data.sprite.width * 6, @data.sprite.height * 6

class HueRing
  (@outer-radius, @inner-radius, @rotation = Math.PI / 2) ->
    @domElement = document.createElement \canvas
  paint: ->
    @domElement
      ..width = @outer-radius * 2
      ..height = @outer-radius * 2
    center =
      x: @outer-radius
      y: @outer-radius
    # draw hue gradient
    ctx = @domElement.getContext \2d
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      x = ~~(i % @domElement.width)
      y = ~~(i / @domElement.width)
      rad = @rotation + Math.atan2 y - center.y, x - center.x
      deg = rad * 180 / Math.PI
      rgb   = rgb-from-hsv deg, 1, 1
      image-data.data[i * 4 + 0] = ~~rgb.0
      image-data.data[i * 4 + 1] = ~~rgb.1
      image-data.data[i * 4 + 2] = ~~rgb.2
      image-data.data[i * 4 + 3] = 0xff
    ##
    # mask it to a ring
    ##
    # When stroking in Chrone,
    # globalCompositeOperation will not work properly.
    # please check:
    #   http://code.google.com/p/chromium/issues/detail?id=351178
    ctx
      ..putImageData image-data, 0, 0
      ..save!
      ..globalCompositeOperation = \destination-in
      ..fillStyle = \black
      ..beginPath!
      ..arc do
        center.x, center.y,
        @outer-radius,
        0, Math.PI * 2
      ..fill!
      ..globalCompositeOperation = \destination-out
      ..beginPath!
      ..arc do
        center.x, center.y,
        @inner-radius,
        0, Math.PI * 2
      ..fill!
      ..restore!

class HSVTriangle
  (@radius, @rotation = Math.PI / 2) ->
    @hue = 0
    @domElement = document.createElement \canvas
  paint: ->
    ctx = @domElement.getContext \2d
    r = -@rotation
    step = Math.PI * 2 / 3
    ctx
      ..beginPath!
      ..moveTo @radius + Math.cos(r) * @radius, @radius + Math.sin(r) * @radius
    for i from 0 til 3
      ctx.lineTo @radius + Math.cos(r) * @radius, @radius + Math.sin(r) * @radius
      r += step
    ctx
      ..fillStyle = string-from-rgb rgb-from-hsv @hue, 1, 1
      ..fill!

class ColorpickerView extends View
  (data) ->
    super data
    @radius =
      outer: @data.sprite.width * 3
      inner: @data.sprite.width * 3 - 20
    @hue-ring = new HueRing @radius.outer, @radius.inner
      ..paint!
    @hsv-triangle = new HSVTriangle @radius.inner
      ..paint!
    @domElement
      ..width = @data.sprite.width * 6
      ..height = @data.sprite.height * 6
  update: ->
    center =
      x: @domElement.width / 2
      y: @domElement.height / 2
    ring-width = @radius.outer - @radius.inner
    ctx = super!
      ..drawImage @hue-ring.domElement, 0, center.y - center.x
      ..drawImage @hsv-triangle.domElement, ring-width, ring-width + center.y - center.x

# main
views = []

selector = new SelectorView data
$ '#selector' .append selector.domElement
views.push selector

painter = new PainterView data
$ '#painter' .append painter.domElement
views.push painter

preview = new PreviewView data
$ '#previewer' .append preview.domElement
views.push preview

colorpicker = new ColorpickerView data
$ '#colorpicker' .append colorpicker.domElement
views.push colorpicker

image-manager.load ->
  update = ->
    for view in views
      view.update!
    requestAnimationFrame update
  requestAnimationFrame update
