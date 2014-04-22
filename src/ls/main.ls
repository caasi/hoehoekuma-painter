console.log data

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

class ColorpickerView extends View
  (data) ->
    super data
    @radius =
      outer: @data.sprite.width * 3
      inner: @data.sprite.width * 3 - 20
    @domElement
      ..width = @data.sprite.width * 6
      ..height = @data.sprite.height * 6
  update: ->
    x = @domElement.width / 2
    y = @domElement.height / 2
    ctx = super!
      ..beginPath!
      ..arc x, y, (@radius.outer + @radius.inner) / 2, 0, Math.PI * 2, false
      ..lineWidth = @radius.outer - @radius.inner
      ..stroke!
    r = -Math.PI / 2
    ctx.beginPath!
    ctx.moveTo x + Math.cos(r) * @radius.inner, y + Math.sin(r) * @radius.inner
    r += Math.PI * 2 / 3
    ctx.lineTo x + Math.cos(r) * @radius.inner, y + Math.sin(r) * @radius.inner
    r += Math.PI * 2 / 3
    ctx.lineTo x + Math.cos(r) * @radius.inner, y + Math.sin(r) * @radius.inner
    r += Math.PI * 2 / 3
    ctx.lineTo x + Math.cos(r) * @radius.inner, y + Math.sin(r) * @radius.inner
    ctx.fill!

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
