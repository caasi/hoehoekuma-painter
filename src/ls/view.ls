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

# lol fking global
DeusExMachina =
  index: 0
  color: [0xff 0xff 0xff]
  spritesheet: []

class SpriteSheet extends View
  (data) ->
    super data
    image = image-manager.get @data.image
    @domElement
      ..width = @data.sprite.width * 17
      ..height = @data.sprite.height
    ctx = @domElement.getContext \2d
      ..drawImage image, 0, 0
    for i, relation of @data.relations
      i = +i
      if relation is void
        DeusExMachina.spritesheet[i] =
          ctx.getImageData do
            i * @data.sprite.width
            0
            @data.sprite.width
            @data.sprite.height
      else
        DeusExMachina.spritesheet[i] = DeusExMachina.spritesheet[relation]
      DeusExMachina.image = @domElement
  update: ->
    ctx = super!
    for i, relation of @data.relations
      ctx.putImageData DeusExMachina.spritesheet[i], +i * @data.sprite.width, 0

class SelectorView extends View
  (data) ->
    super data
    @domElement
      ..width = @data.sprite.width * 17
      ..height = @data.sprite.height
    $e = $ @domElement
      ..click (e) ~>
        {left: x} = $e.offset!
        DeusExMachina.index = ~~((e.pageX - x) / @data.sprite.width)
  update: ->
    super!
      ..drawImage DeusExMachina.image, 0, 0
      ..globalCompositeOperation = \destination-over
      ..fillStyle = \#0f0
      ..fillRect do
        DeusExMachina.index * @data.sprite.width, 0
        @data.sprite.width, @data.sprite.height

class ScalableView extends View
  (data) ->
    super data
    @index = 0
    @scale = 1
  update: ->
    @domElement
      ..width = @data.sprite.width * @scale
      ..height = @data.sprite.height * @scale
    super!
      ..drawImage do
        DeusExMachina.image
        @index * @data.sprite.width, 0
        @data.sprite.width, @data.sprite.height
        0, 0
        @data.sprite.width * @scale, @data.sprite.height * @scale

class PainterView extends ScalableView
  (data) ->
    super data
    @scale = 17
    @x = 0
    @y = 0
    on-draw = (e) ~>
      color = DeusExMachina.color
      data = DeusExMachina.spritesheet[@index].data
      i = ~~(@y * @data.sprite.width + @x)
      data[i * 4 + 0] = color.0
      data[i * 4 + 1] = color.1
      data[i * 4 + 2] = color.2
      data[i * 4 + 3] = 0xff
    $e = $ @domElement
      ..mousedown (e) ->
        on-draw e
        $e
          ..mousemove on-draw
      ..mousemove (e) ~>
        {left: @x, top: @y} = $e.offset!
        @x = e.pageX - @x
        @y = e.pageY - @y
        @x = ~~(@x / @scale)
        @y = ~~(@y / @scale)
      ..mouseup ->
        $e.off \mousemove on-draw
  update: ->
    @index = DeusExMachina.index
    super!
      ..fillStyle = string-from-rgb DeusExMachina.color
      ..fillRect do
        @x * @scale, @y * @scale
        @scale, @scale

class PreviewView extends ScalableView
  (data) ->
    super data
    @scale = 6
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
