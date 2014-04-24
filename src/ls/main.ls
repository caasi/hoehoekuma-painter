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
