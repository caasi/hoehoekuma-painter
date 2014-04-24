class Canvas
  ->
    @domElement = document.createElement \canvas
  hitTest: (x, y) ->
    ctx = @domElement.getContext \2d
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    i = y * @domElement.width + x
    0 <= i < image-data.data.length / 4 and image-data.data[i * 4 + 3] isnt 0x00
  paint: ->
    @domElement.getContext \2d

class HueRing extends Canvas
  (@outer-radius, @inner-radius, @rotation = - Math.PI / 2) ->
    super!
    @debug = off
  paint: ->
    @domElement
      ..width = @outer-radius * 2
      ..height = @outer-radius * 2
    center =
      x: @outer-radius
      y: @outer-radius
    # draw hue gradient
    ctx = super!
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      x = ~~(i % @domElement.width)
      y = ~~(i / @domElement.width)
      rad = - @rotation + Math.atan2 y - center.y, x - center.x
      deg = rad * 180 / Math.PI
      rgb   = rgb-from-hsv deg, 1, 1
      image-data.data[i * 4 + 0] = ~~rgb.0
      image-data.data[i * 4 + 1] = ~~rgb.1
      image-data.data[i * 4 + 2] = ~~rgb.2
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
  paint: ->
    @domElement
      ..width = 2 * @radius
      ..height = 2 * @radius
    m = mat2d.create!
    mat2d
      ..translate m, m, [@radius, @radius]
      ..rotate    m, m, -@rotation
      ..translate m, m, [-@radius, -@radius]
    r = Math.PI * 4 / 3
    saturation = vec2.fromValues @radius + @radius * Math.cos(r), @radius + @radius * Math.sin(r)
    ctx = super!
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      pos = vec2.fromValues ~~(i % @domElement.width), ~~(i / @domElement.width)
      vec2.transformMat2d pos, pos, m
      delta = vec2.create!
      vec2.subtract delta, pos, saturation
      rad = Math.PI / 2 - Math.atan2 delta.1, delta.0
      s = delta.0 / delta.1 * Math.cos Math.PI / 6
      v = delta.1 / Math.cos(rad) * Math.sin(rad + Math.PI / 3)
      v /= @radius * 3 / 2
      rgb = rgb-from-hsv @hue, s, v
      image-data.data[i * 4 + 0] = ~~rgb.0
      image-data.data[i * 4 + 1] = ~~rgb.1
      image-data.data[i * 4 + 2] = ~~rgb.2
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
    @radius =
      outer: @data.sprite.width * 3
      inner: @data.sprite.width * 3 - 20
    @hue-ring = new HueRing @radius.outer, @radius.inner
      ..paint!
    @hsv-triangle = new HSVTriangle @radius.inner
      ..rotation = @hue-ring.rotation + glMatrix.toRadian @hsv-triangle.hue
      ..paint!
    @domElement
      ..width = @data.sprite.width * 6
      ..height = @data.sprite.height * 6
    @offset-y = (@domElement.height - @domElement.width) / 2
    # interaction
    $doc = $ document
    ring =
      mousedown: (e) ~>
        offset = $canvas.offset!
        x = e.pageX - offset.left
        y = e.pageY - offset.top - @offset-y
        if @hue-ring.hitTest x, y
          ring.mousemove e
          $doc
            ..mousemove ring.mousemove
            ..mouseup   ring.mouseup
      mousemove: (e) ~>
        offset = $canvas.offset!
        x = e.pageX - offset.left
        y = e.pageY - offset.top - @offset-y
        r = @hue-ring.outer-radius
        deg = Math.atan2(y - r, x - r) - @hue-ring.rotation
        deg = deg * 180 / Math.PI
        @hsv-triangle = new HSVTriangle @radius.inner
          ..hue = (deg + 360) % 360
          ..rotation = @hue-ring.rotation + glMatrix.toRadian @hsv-triangle.hue
          ..paint!
      mouseup: ~>
        $doc
          ..off \mousemove ring.mousemove
          ..off \mouseup   ring.mouseup
    triangle =
      mousedown: (e) ~>
        ring-width = @radius.outer - @radius.inner
        offset = $canvas.offset!
        x = e.pageX - offset.left - ring-width
        y = e.pageY - offset.top - @offset-y - ring-width
        if @hsv-triangle.hitTest x, y
          console.log \hit
      mousemove: (e) ~>
        ...
      mouseup: ~>
        $doc
          ..off \mousemove triangle.mousemove
          ..off \mouseup   triangle.mouseup
    $canvas = $(@domElement)
      ..mousedown ring.mousedown
      ..mousedown triangle.mousedown
  update: ->
    ring-width = @radius.outer - @radius.inner
    ctx = super!
      ..drawImage @hue-ring.domElement, 0, @offset-y
      ..drawImage @hsv-triangle.domElement, ring-width, ring-width + @offset-y
    rad = glMatrix.toRadian(@hsv-triangle.hue) + @hue-ring.rotation
    r = (@hue-ring.outer-radius + @hue-ring.inner-radius) / 2
    x = @hue-ring.outer-radius + r * Math.cos rad
    y = @offset-y + @hue-ring.outer-radius + r * Math.sin rad
    ctx
      ..beginPath!
      ..arc x, y, ring-width / 4, 0, Math.PI * 2
      ..strokeStyle = \white
      ..lineWidth = ring-width / 10
      ..stroke!

