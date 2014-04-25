# main
selector = new SelectorView data
$ '#selector' .append selector.domElement

painter = new PainterView data
$ '#painter' .append painter.domElement

preview = new PreviewView data
$ '#previewer' .append preview.domElement

colorpicker = new ColorpickerView data
$ '#colorpicker' .append colorpicker.domElement

image-manager.load ->
  views = []
  spritesheet = new SpriteSheet data
  views.push do
    spritesheet
    selector
    painter
    preview
    colorpicker
  update = ->
    for view in views
      view.update!
    requestAnimationFrame update
  requestAnimationFrame update
