# main
image-manager.load ->
  views = []

  spritesheet = new SpriteSheet data
  selector = new SelectorView data, spritesheet.domElement
    ..on 'index.changed' (index) ->
      painter.index = index
  painter = new PainterView data, spritesheet.domElement
    ..on 'painted' (data) ->
      spritesheet.paint data
  preview = new PreviewView data, spritesheet.domElement
  colorpicker = new ColorpickerView data
    ..on 'color.changed' (color) ->
      painter.color = color

  $ '#selector'    .append selector.domElement
  $ '#painter'     .append painter.domElement
  $ '#previewer'   .append preview.domElement
  $ '#colorpicker' .append colorpicker.domElement

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
