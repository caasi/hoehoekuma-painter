a = Math.PI / 180
Math
  ..sqrt3 = Math.sqrt 3
  ..toRadian = -> it * a
  ..toDegree = -> it / a

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
  for v in rgb => ~~(0xff * (v + m))

string-from-rgb = -> "rgb(#{it.0},#{it.1},#{it.2})"

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

image-manager = new ImageLoader [data.image, data.mask]

