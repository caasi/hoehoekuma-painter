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

