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
  (@radius) ->
    @hue = 0
    @domElement = document.createElement \canvas
  paint: ->
    @domElement
      ..width = 2 * @radius
      ..height = 2 * @radius
    r = Math.PI * 5 / 6
    saturation =
      x: @radius + @radius * Math.cos r
      y: @radius + @radius * Math.sin r
    ctx = @domElement.getContext \2d
    image-data = ctx.getImageData do
      0, 0
      @domElement.width, @domElement.height
    for i from 0 til @domElement.width * @domElement.height
      x = ~~(i % @domElement.width)
      y = ~~(i / @domElement.width)
      r = Math.PI / 3
      delta =
        x: x - saturation.x
        y: saturation.y - y
      rad = Math.atan2 delta.y, delta.x
      s = delta.y / delta.x * Math.cos Math.PI / 6
      v = x / Math.cos(rad) * Math.sin(rad + Math.PI / 3)
      v /= @radius * 3 / 2
      rgb = rgb-from-hsv @hue, s, v
      image-data.data[i * 4 + 0] = ~~rgb.0
      image-data.data[i * 4 + 1] = ~~rgb.1
      image-data.data[i * 4 + 2] = ~~rgb.2
      image-data.data[i * 4 + 3] = 0xff
    ctx.putImageData image-data, 0, 0
    r = - Math.PI / 2
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

