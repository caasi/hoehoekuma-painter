class View extends Monologue
  (@data, @source) ->
    @domElement = document.createElement \canvas
  update: ->
    @domElement.getContext \2d
      ..mozImageSmoothingEnabled    = false
      ..webkitImageSmoothingEnabled = false
      ..msImageSmoothingEnabled     = false
      ..imageSmoothingEnabled       = false
      ..clearRect 0, 0, @domElement.width, @domElement.height

class SpriteSheet extends View
  (data) ->
    super data
    image = image-manager.get @data.image
    mask  = image-manager.get @data.mask
    @domElement
      ..width  = @data.sprite.width * 17
      ..height = @data.sprite.height
    @maskElement = document.createElement \canvas
      ..width  = @data.sprite.width * 17
      ..height = @data.sprite.height
    ctx = @domElement.getContext \2d
      ..drawImage image, 0, 0
    ctx-mask = @maskElement.getContext \2d
      ..drawImage mask, 0, 0
    @spritesheet = []
    @masksheet = []
    getImageData = CanvasRenderingContext2D::getImageData
    for i, relation of @data.relations
      i = +i
      if relation is void
        args =
          * i * @data.sprite.width
            0
            @data.sprite.width
            @data.sprite.height
        @spritesheet[i] = getImageData.apply ctx, args
        @masksheet[i]   = getImageData.apply ctx-mask, args
      else
        @spritesheet[i] = @spritesheet[relation]
        @masksheet[i]   = @masksheet[relation]
  update: ->
    ctx = super!
    for i, relation of @data.relations
      ctx.putImageData @spritesheet[i], +i * @data.sprite.width, 0
  paint: (brush) ->
    mask = @masksheet[brush.frame].data
    i = ~~(brush.y * @data.sprite.width + brush.x)
    if mask[i * 4 + 3] isnt 0x00
      data = @spritesheet[brush.frame].data
      data[i * 4 + 0] = brush.color.0
      data[i * 4 + 1] = brush.color.1
      data[i * 4 + 2] = brush.color.2
      data[i * 4 + 3] = 0xff

class SelectorView extends View
  (data, source) ->
    super data, source
    @index = 0
    @domElement
      ..width = @data.sprite.width * 17
      ..height = @data.sprite.height
    $e = $ @domElement
      ..click (e) ~>
        {left: x} = $e.offset!
        @index = ~~((e.pageX - x) / @data.sprite.width)
        @emit 'index.changed' @index
  update: ->
    super!
      ..drawImage @source, 0, 0
      ..globalCompositeOperation = \destination-over
      ..fillStyle = \#0f0
      ..fillRect do
        @index * @data.sprite.width, 0
        @data.sprite.width, @data.sprite.height

class ScalableView extends View
  (data, source) ->
    super data, source
    @index = 0
    @scale = 1
    @scale-changed = false
    @bgElement = document.createElement \canvas
  update: ->
    if @scale-changed then
      @scale-changed = false
      @bgElement
        ..width  = @data.sprite.width  * @scale
        ..height = @data.sprite.height * @scale
      ctx = @bgElement.getContext \2d
      width = if @scale isnt 1 then @scale else 1
      for y from 0 til @bgElement.height / width
        for x from 0 til @bgElement.width / width
          color = if (x + y) % 2 is 0 then \#999 else \#666
          ctx
            ..fillStyle = color
            ..fillRect x * width, y * width, width, width
    @domElement
      ..width  = @data.sprite.width  * @scale
      ..height = @data.sprite.height * @scale
    super!
      ..drawImage @bgElement, 0, 0
      ..drawImage do
        @source
        @index * @data.sprite.width, 0
        @data.sprite.width, @data.sprite.height
        0, 0
        @data.sprite.width * @scale, @data.sprite.height * @scale

class PainterView extends ScalableView
  (data, source) ->
    super data, source
    @scale = 17
    @scale-changed = true
    @x = -1
    @y = -1
    @color = [0xff 0xff 0xff]
    on-draw = (e) ~> @emit 'painted' frame: @index, x: @x, y: @y, color: @color
    $e = $ @domElement
      ..mousedown (e) ->
        on-draw e
        $e.mousemove on-draw
      ..mouseup ->
        $e.off \mousemove on-draw
    $ document .mousemove (e) ~>
      {left: @x, top: @y} = $e.offset!
      @x = e.pageX - @x
      @y = e.pageY - @y
      @x = ~~(@x / @scale)
      @y = ~~(@y / @scale)
  update: ->
    super!
      ..fillStyle = string-from-rgb @color
      ..fillRect do
        @x * @scale, @y * @scale
        @scale, @scale

class PreviewView extends ScalableView
  (data, source) ->
    super data, source
    @scale = 6
    @scale-changed = true
    @animation = 0
    @frame = 0
    setInterval ~>
      ++@animation
      unless @animation < @data.animations.length
        @animation = 0
      @frame = 0
    , @data.duration * 1000
  update: ->
    animation = @data.animations[@animation]
    @index = animation[~~@frame]
    @frame += @data.speed
    unless @frame < animation.length
      @frame = 0
    super!
