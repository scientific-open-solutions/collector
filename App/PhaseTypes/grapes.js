var editor_grape = grapesjs.init({
    allowScripts: 1,
    container: '#gjs',
    storageManager: false,
    style: '.txt-red{color: red}',
    plugins: ['gjs-blocks-basic'],
    pluginsOpts: {
        'gjs-blocks-basic': {}
    },
    panels: {
        defaults: [
          {
            id: 'commands',
            buttons: [
              // Other buttons you want to include...
            ],
          },
          {
            id: 'options',
            buttons: [
              {
                id: 'sw-visibility',
                active: true, // active by default
                className: 'fa fa-square-o',
                command: 'sw-visibility', // Built-in command
                context: 'sw-visibility', // For grouping context
                attributes: { title: 'View components' },
              },
              {
                id: 'fullscreen',
                className: 'fa fa-arrows-alt',
                command: 'fullscreen',
                attributes: { title: 'Fullscreen' },
                context: 'fullscreen',
              },
              {
                id: 'undo',
                className: 'fa fa-undo',
                command: 'undo',
                attributes: { title: 'Undo (CTRL/CMD + Z)' },
              },
              {
                id: 'redo',
                className: 'fa fa-repeat',
                command: 'redo',
                attributes: { title: 'Redo (CTRL/CMD + SHIFT + Z)' },
              },
            ],
          },
          {
            id: 'views',
            buttons: [
              {
                id: 'open-sm',
                className: 'fa fa-paint-brush',
                command: 'open-sm',
                active: true,
                attributes: { title: 'Open Style Manager' },
              },
              {
                id: 'open-layers',
                className: 'fa fa-bars',
                command: 'open-layers',
                attributes: { title: 'Open Layer Manager' },
              },
              {
                id: 'open-blocks',
                className: 'fa fa-th-large',
                command: 'open-blocks',
                attributes: { title: 'Open Blocks' },
              },
            ],
          }
        ]
      },
      styleManager: {
        sectors: [{
            name: 'General',
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
            properties: [{
              name: 'Alignment',
              property: 'float',
            }]
          },{
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
            properties: [{
              id: 'flex-width',
              type: 'integer',
              name: 'Width',
              property: 'width',
              units: ['px', '%'],
              defaults: 'auto',
              min: 0,
            }]
          },{
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow'],
            properties: [
              { name: 'Font', property: 'font-family'},
              { name: 'Weight', property: 'font-weight'},
              { name: 'Font color', property: 'color'},
              { name: 'Font size', property: 'font-size'},
              { name: 'Letter spacing', property: 'letter-spacing'},
              { name: 'Line height', property: 'line-height'},
              { name: 'Text shadow', property: 'text-shadow'}
            ],
          },{
            name: 'Decorations',
            open: false,
            buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background'],
            properties: [{
              type: 'slider',
              name: 'Opacity',
              property: 'opacity',
              defaults: 1,
              step: 0.01,
              max: 1,
              min:0,
            }]
          },{
            name: 'Extra',
            open: false,
            buildProps: ['transition', 'perspective', 'transform'],
            properties: [{
              name: 'Transition',
              property: 'transition',
            },{
              name: 'Transform',
              property: 'transform',
            }]
          }]
      },
});

// CUSTOM BLOCKS
var blockManager = editor_grape.BlockManager;

blockManager.add('section', {
    label: `<div style="text-align: center;">
                <i class="fa fa-square" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div><b>Section</b></div>
            </div>`,
    attributes: { class: 'gjs-block-section' },
    content: `
        <section>
            <h1>This is a simple title</h1>
            <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
        </section>`,
});

blockManager.add('text', {
    label: `<div style="text-align: center;">
                <i class="fa fa-font" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div>Text</div>
            </div>`,
    content: '<div data-gjs-type="text">Insert your text here</div>',
});

blockManager.add('image', {
    label: `<div style="text-align: center;">
                <i class="fa fa-image" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div>Image</div>
            </div>`,
    select: true,
    content: { type: 'image' },
    activate: true,
});


