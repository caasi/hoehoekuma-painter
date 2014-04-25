class Canvas
  ->
    @domElement = document.createElement \canvas
    @dirty = true
  hitTest: (x, y) ->
    return false unless 0 <= x < @domElement.width
    return false unless 0 <= y < @domElement.height
    ctx = @domElement.getContext \2d
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    x = ~~x
    y = ~~y
    i = y * image-data.width + x
    image-data.data[i * 4 + 3] isnt 0x00
  paint: ->
    @dirty = false
    @domElement.getContext \2d

class HueRing extends Canvas
  (@outer-radius, @inner-radius, @rotation = - Math.PI / 2) ->
    super!
    @debug = off
  hueFromPosition: (x, y) ->
    deg = Math.atan2(y - @outer-radius, x - @outer-radius) - @rotation
    deg *= 180 / Math.PI
    (deg + 360) % 360
  paint: ->
    @domElement
      ..width = @outer-radius * 2
      ..height = @outer-radius * 2
    center =
      x: @outer-radius
      y: @outer-radius
    ##
    # draw hue gradient
    ##
    # here is another way to draw the wheel by using arc with a little trick:
    #   http://stackoverflow.com/questions/18265804/building-a-color-wheel-in-html5
    ctx = super!
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      x = ~~(i % @domElement.width)
      y = ~~(i / @domElement.width)
      rgb = rgb-from-hsv @hueFromPosition(x, y), 1, 1
      image-data.data[i * 4 + 0] = rgb.0
      image-data.data[i * 4 + 1] = rgb.1
      image-data.data[i * 4 + 2] = rgb.2
      image-data.data[i * 4 + 3] = 0xff
    return ctx if @debug
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

class HSVTriangle extends Canvas
  (@radius, @rotation = - Math.PI / 2) ->
    super!
    @debug = off
    @hue = 0
  updateRotationMatrix: ->
    @matrix = mat2d.create!
    mat2d
      ..translate @matrix, @matrix, [@radius, @radius]
      ..rotate    @matrix, @matrix, -@rotation
      ..translate @matrix, @matrix, [-@radius, -@radius]
  updateSaturationPoint: ->
    r = Math.PI * 4 / 3
    @point-s = vec2.fromValues @radius + @radius * Math.cos(r), @radius + @radius * Math.sin(r)
  # what a mess
  SVFromPosition: (x, y) ->
    # rotate
    p = vec2.fromValues x, y
    vec2.transformMat2d p, p, @matrix
    vec2.subtract p, p, @point-s
    # end of rotate
    t = Math.sqrt3 * p.1 + p.0
    s = 2 * p.0 / t
    v = t / 3 / @radius
    s = if s < 0 then 0 else if s >= 1 then 1 else s
    v = if v < 0 then 0 else if v >= 1 then 1 else v
    [s, v]
  positionFromSV: (s, v) ->
    t0 = v * @radius
    t1 = s / 2 * t0
    p = vec2.fromValues 3 * t1, Math.sqrt3 * (t0 - t1)
    #rotate
    vec2.add p, p, @point-s
    m = mat2d.create!
    m = mat2d.invert m, @matrix
    vec2.transformMat2d p, p, m
    p
  paint: ->
    @domElement
      ..width = 2 * @radius
      ..height = 2 * @radius
    @updateRotationMatrix!
    @updateSaturationPoint!
    ctx = super!
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      [s, v] = @SVFromPosition ~~(i % @domElement.width), ~~(i / @domElement.width)
      #continue unless 0 <= s < 1 and 0 <= v < 1
      rgb = rgb-from-hsv @hue, s, v
      image-data.data[i * 4 + 0] = rgb.0
      image-data.data[i * 4 + 1] = rgb.1
      image-data.data[i * 4 + 2] = rgb.2
      image-data.data[i * 4 + 3] = 0xff
    ctx.putImageData image-data, 0, 0
    return ctx if @debug
    # mask
    r = @rotation
    step = Math.PI * 2 / 3
    ctx
      ..beginPath!
      ..moveTo @radius + Math.cos(r) * @radius, @radius + Math.sin(r) * @radius
    for i from 0 til 3
      ctx.lineTo @radius + Math.cos(r) * @radius, @radius + Math.sin(r) * @radius
      r += step
    ctx
      ..save!
      ..globalCompositeOperation = \destination-in
      ..fillStyle = \black
      ..fill!
      ..restore!

class ColorpickerView extends View
  (data) ->
    super data
    @ring-width = 20
    @radius =
      outer: @data.sprite.width * 3
      inner: @data.sprite.width * 3 - @ring-width
    @hue-ring = new HueRing @radius.outer, @radius.inner
    @hsv-triangle = new HSVTriangle @radius.inner
      ..rotation = @hue-ring.rotation + Math.toRadian @hsv-triangle.hue
    @domElement
      ..width = @data.sprite.width * 6
      ..height = @data.sprite.height * 6
    @offset-y = (@domElement.height - @domElement.width) / 2
    @prev =
      s: 0
      v: 1
    @color = [0xff 0xff 0xff]
    # interaction
    $doc = $ document
    ring =
      mousedown: (e) ~>
        {left: x, top: y} = $canvas.offset!
        x = e.pageX - x
        y = e.pageY - y - @offset-y
        if @hue-ring.hitTest x, y
          ring.mousemove e
          $doc
            ..mousemove ring.mousemove
            ..mouseup   ring.mouseup
      mousemove: (e) ~>
        {left: x, top: y} = $canvas.offset!
        x = e.pageX - x
        y = e.pageY - y - @offset-y
        hue = @hue-ring.hueFromPosition x, y
        @hsv-triangle = new HSVTriangle @radius.inner
          ..hue = hue
          ..rotation = @hue-ring.rotation + Math.toRadian hue
          ..dirty = true
        @color = rgb-from-hsv hue, @prev.s, @prev.v
      mouseup: ~>
        $doc
          ..off \mousemove ring.mousemove
          ..off \mouseup   ring.mouseup
    triangle =
      ratio: 255 / 256
      mousedown: (e) ~>
        {left: x, top: y} = $canvas.offset!
        x = e.pageX - x - @ring-width
        y = e.pageY - y - @offset-y - @ring-width
        if @hsv-triangle.hitTest x, y
          triangle.mousemove e
          $doc
            ..mousemove triangle.mousemove
            ..mouseup   triangle.mouseup
      mousemove: (e) ~>
        {left: x, top: y} = $canvas.offset!
        x = e.pageX - x - @ring-width
        y = e.pageY - y - @offset-y - @ring-width
        [s, v] = @hsv-triangle.SVFromPosition x, y
        @prev <<< {s, v}
        @color = rgb-from-hsv @hsv-triangle.hue, s, v
      mouseup: ~>
        $doc
          ..off \mousemove triangle.mousemove
          ..off \mouseup   triangle.mouseup
    $canvas = $(@domElement)
      ..mousedown ring.mousedown
      ..mousedown triangle.mousedown
  update: ->
    @hue-ring.paint!     if @hue-ring.dirty
    @hsv-triangle.paint! if @hsv-triangle.dirty
    DeusExMachina.color = @color
    ctx = super!
      ..fillStyle = string-from-rgb @color
      ..fillRect 0, 0, @domElement.width, @domElement.height
      ..drawImage @hue-ring.domElement, 0, @offset-y
      ..drawImage @hsv-triangle.domElement, @ring-width, @ring-width + @offset-y
    rad = Math.toRadian(@hsv-triangle.hue) + @hue-ring.rotation
    gap = Math.toRadian 1
    r = (@hue-ring.outer-radius + @hue-ring.inner-radius) / 2
    x = @hue-ring.outer-radius + r * Math.cos rad
    y = @offset-y + @hue-ring.outer-radius + r * Math.sin rad
    ctx
      ..beginPath!
      ..arc @domElement.width / 2, @domElement.height / 2, r, rad - gap, rad + gap
      ..strokeStyle = \white
      ..lineWidth = @ring-width
      ..stroke!
    [x, y] = @hsv-triangle.positionFromSV @prev.s, @prev.v
    ctx
      ..beginPath!
      ..arc x + @ring-width, y + @offset-y + @ring-width, @ring-width / 4, 0, Math.PI * 2
      ..lineWidth = @ring-width / 10
      ..stroke!

